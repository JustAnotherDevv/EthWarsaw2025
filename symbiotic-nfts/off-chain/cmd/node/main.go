package main

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"sum/internal/utils"

	"github.com/ethereum/go-ethereum" 
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/go-errors/errors"
	"github.com/spf13/cobra"
	v1 "github.com/symbioticfi/relay/api/client/v1"

	"sum/internal/contracts"
)

const (
	TaskCreated uint8 = iota
	TaskResponded
	TaskExpired
	TaskNotFound
)

// NFT standards
// todo - support erc20s
const (
	StdERC721  = uint8(0)
	StdERC1155 = uint8(1)
)

type config struct {
	relayApiURL       string
	evmRpcURLs        []string
	contractAddresses []string 
	privateKey        string
	logLevel          string
	nftRpcMap string
}

var cfg config

var (
	relayClient  *v1.SymbioticClient
	appClients   map[int64]*ethclient.Client      
	nftClients   map[uint64]*ethclient.Client         
	nftContracts map[int64]*contracts.NftOwnershipTask 
	lastBlocks   map[int64]uint64                     
	tasks        map[common.Hash]TaskState            
	nftRPCs      map[uint64]string                   
)

type TaskState struct {
	ChainID        int64
	TaskID         common.Hash
	Req            contracts.NftOwnershipTaskRequest
	Payload        []byte
	SigEpoch       int64
	SigRequestHash string
	AggProof       []byte
	Statuses       map[int64]uint8 
}

func main() {
	slog.Info("Running NFT ownership verify off-chain client", "args", os.Args)

	if err := run(); err != nil && !errors.Is(err, context.Canceled) {
		slog.Error("Error executing command", "error", err)
		os.Exit(1)
	}
	slog.Info("NFT ownership client exited")
}

func run() error {
	rootCmd.PersistentFlags().StringVarP(&cfg.relayApiURL, "relay-api-url", "r", "", "Relay API URL (gRPC)")
	rootCmd.PersistentFlags().StringSliceVarP(&cfg.evmRpcURLs, "evm-rpc-urls", "e", []string{}, "EVM RPC URLs for app chains (comma-separated)")
	rootCmd.PersistentFlags().StringSliceVarP(&cfg.contractAddresses, "contract-addresses", "a", []string{}, "NftOwnershipTask contract addresses (comma-separated; must align with --evm-rpc-urls)")
	rootCmd.PersistentFlags().StringVarP(&cfg.privateKey, "private-key", "p", "", "Task response private key (hex, no 0x)")
	rootCmd.PersistentFlags().StringVarP(&cfg.logLevel, "log-level", "l", "info", "Log level: debug|info|warn|error")
	rootCmd.PersistentFlags().StringVar(&cfg.nftRpcMap, "nft-rpc-map", "", "NFT chain RPC map: '1=https://...,11155111=https://...,31337=http://127.0.0.1:8545'")

	if err := rootCmd.MarkPersistentFlagRequired("relay-api-url"); err != nil {
		return errors.Errorf("failed to mark relay-api-url as required: %w", err)
	}
	if err := rootCmd.MarkPersistentFlagRequired("evm-rpc-urls"); err != nil {
		return errors.Errorf("failed to mark evm-rpc-urls as required: %w", err)
	}
	if err := rootCmd.MarkPersistentFlagRequired("contract-addresses"); err != nil {
		return errors.Errorf("failed to mark contract-addresses as required: %w", err)
	}
	if err := rootCmd.MarkPersistentFlagRequired("private-key"); err != nil {
		return errors.Errorf("failed to mark private-key as required: %w", err)
	}

	return rootCmd.Execute()
}

var rootCmd = &cobra.Command{
	Use:           "nft-verify-node",
	SilenceUsage:  true,
	SilenceErrors: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		switch cfg.logLevel {
		case "debug":
			slog.SetLogLoggerLevel(slog.LevelDebug)
		case "info":
			slog.SetLogLoggerLevel(slog.LevelInfo)
		case "warn":
			slog.SetLogLoggerLevel(slog.LevelWarn)
		case "error":
			slog.SetLogLoggerLevel(slog.LevelError)
		}

		ctx := signalContext(context.Background())

		conn, err := utils.GetGRPCConnection(cfg.relayApiURL)
		if err != nil {
			return errors.Errorf("failed to create relay client: %w", err)
		}
		relayClient = v1.NewSymbioticClient(conn)

		if len(cfg.evmRpcURLs) == 0 {
			return errors.Errorf("no app chain RPC URLs provided")
		}
		if len(cfg.contractAddresses) != len(cfg.evmRpcURLs) {
			return errors.Errorf("mismatched lengths: evm-rpc-urls=%d, contract-addresses=%d", len(cfg.evmRpcURLs), len(cfg.contractAddresses))
		}

		nftRPCs = parseRPCMap(cfg.nftRpcMap)
		appClients = make(map[int64]*ethclient.Client)
		nftContracts = make(map[int64]*contracts.NftOwnershipTask)
		nftClients = make(map[uint64]*ethclient.Client)
		tasks = make(map[common.Hash]TaskState)
		lastBlocks = make(map[int64]uint64)

		for i, evmRpcURL := range cfg.evmRpcURLs {
			appCli, err := ethclient.DialContext(ctx, evmRpcURL)
			if err != nil {
				return errors.Errorf("failed to connect to app RPC '%s': %w", evmRpcURL, err)
			}
			chainID, err := appCli.ChainID(ctx)
			if err != nil {
				return errors.Errorf("failed to get chain ID from '%s': %w", evmRpcURL, err)
			}
			addr := common.HexToAddress(cfg.contractAddresses[i])
			nc, err := contracts.NewNftOwnershipTask(addr, appCli)
			if err != nil {
				return errors.Errorf("failed to bind NftOwnershipTask at %s on chain %d: %w", addr.Hex(), chainID, err)
			}
			appClients[chainID.Int64()] = appCli
			nftContracts[chainID.Int64()] = nc
			slog.Info("bound app contract", "chainID", chainID, "address", addr.Hex())
		}

		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				for chainID, appCli := range appClients {
					endBlock, err := appCli.BlockByNumber(ctx, nil)
					if err != nil {
						return errors.Errorf("failed to get latest block: %w", err)
					}
					end := endBlock.NumberU64()
					start := lastBlocks[chainID]

					slog.DebugContext(ctx, "Fetching TaskCreated events", "chainID", chainID, "fromBlock", start, "toBlock", end)

					iter, err := nftContracts[chainID].FilterTaskCreated(&bind.FilterOpts{
						Context: ctx,
						Start:   start,
						End:     &end,
					}, [][32]byte{})
					if err != nil {
						return errors.Errorf("failed to filter TaskCreated events: %w", err)
					}

					lastBlocks[chainID] = end + 1

					if err := processNewTasks(ctx, chainID, iter); err != nil {
						slog.Error("Error processing new task events", "err", err)
					}
				}
				if err := fetchResults(ctx); err != nil {
					slog.Error("Error fetching results", "err", err)
				}
			case <-ctx.Done():
				return nil
			}
		}
	},
}

func fetchResults(ctx context.Context) error {
	for taskID, state := range tasks {
		for chainID := range nftContracts {
			if state.Statuses[chainID] == TaskResponded {
				continue
			}
			status, err := nftContracts[chainID].GetTaskStatus(&bind.CallOpts{Context: ctx}, taskID)
			if err != nil {
				return err
			}
			state.Statuses[chainID] = status
		}
		slog.InfoContext(ctx, "Task statuses", "taskID", taskID, "statuses", state.Statuses)

		allNotFoundOrExpired := true
		allResponded := true
		for _, status := range state.Statuses {
			if status != TaskNotFound && status != TaskExpired {
				allNotFoundOrExpired = false
			}
			if status != TaskResponded {
				allResponded = false
			}
		}
		if allNotFoundOrExpired || allResponded {
			delete(tasks, taskID)
			continue
		}

		if state.AggProof == nil {
			resp, err := relayClient.GetAggregationProof(ctx, &v1.GetAggregationProofRequest{
				RequestHash: state.SigRequestHash,
			})
			if err != nil {
				continue
			}
			state.AggProof = resp.AggregationProof.Proof
			slog.InfoContext(ctx, "Got aggregation proof", "taskID", taskID, "proof", hexutil.Encode(resp.AggregationProof.Proof))
		}

		tasks[taskID] = state

		if err := processProof(ctx, taskID); err != nil {
			slog.Error("Error processing proof", "taskID", taskID, "err", err)
		}
	}
	return nil
}

func processProof(ctx context.Context, taskID common.Hash) error {
	pk, err := crypto.HexToECDSA(cfg.privateKey)
	if err != nil {
		return errors.Errorf("failed to parse private key: %w", err)
	}

	st := tasks[taskID]
	for chainID, status := range st.Statuses {
		if status == TaskResponded {
			continue
		}
		txOpts, err := bind.NewKeyedTransactorWithChainID(pk, big.NewInt(chainID))
		if err != nil {
			return errors.Errorf("failed to create transactor: %w", err)
		}
		txOpts.Context = ctx

		tx, err := nftContracts[chainID].RespondTask(txOpts, taskID, st.Payload, big.NewInt(st.SigEpoch), st.AggProof)
		if err != nil {
			return errors.Errorf("failed to respond task: %w", err)
		}

		slog.InfoContext(ctx, "Submitted response tx", "taskID", taskID, "tx", tx.Hash().String(), "gas", tx.Gas())
	}
	return nil
}

func processNewTasks(ctx context.Context, appChainID int64, iter *contracts.NftOwnershipTaskTaskCreatedIterator) error {
	for iter.Next() {
		evt := iter.Event

		status, err := nftContracts[appChainID].GetTaskStatus(&bind.CallOpts{Context: ctx}, evt.TaskId)
		if err != nil {
			return err
		}
		if status != TaskCreated {
			continue
		}

		req := evt.Req
		slog.InfoContext(ctx, "Received new task",
			"taskID", evt.TaskId,
			"chainId", req.ChainId,
			"collection", req.Collection,
			"tokenId", req.TokenId,
			"owner", req.Owner,
			"checkedBlock", req.CheckedBlock,
			"standard", req.Standard,
		)

		isOwner, ownerAtBlock, observedBlock, err := verifyOwnership(ctx, req)
		if err != nil {
			slog.Error("verifyOwnership failed", "err", err)
			continue
		}
		slog.InfoContext(ctx, "Ownership verification",
			"isOwner", isOwner,
			"ownerAtBlock", ownerAtBlock.Hex(),
			"observedBlock", observedBlock,
		)

		boolT, _ := abi.NewType("bool", "", nil)
		addrT, _ := abi.NewType("address", "", nil)
		u64T, _ := abi.NewType("uint64", "", nil)
		payloadArgs := abi.Arguments{{Type: boolT}, {Type: addrT}, {Type: u64T}}
		payload, err := payloadArgs.Pack(isOwner, ownerAtBlock, observedBlock)
		if err != nil {
			return err
		}

		bytes32T, _ := abi.NewType("bytes32", "", nil)
		bytesT, _ := abi.NewType("bytes", "", nil)
		msgArgs := abi.Arguments{{Type: bytes32T}, {Type: bytesT}}
		msg, err := msgArgs.Pack(evt.TaskId, payload)
		if err != nil {
			return err
		}
		slog.InfoContext(ctx, "Message to sign", "msg", hexutil.Encode(msg))

		suggestedEpoch, err := relayClient.GetSuggestedEpoch(ctx, &v1.GetSuggestedEpochRequest{})
		if err != nil {
			return err
		}
		signResp, err := relayClient.SignMessage(ctx, &v1.SignMessageRequest{
			KeyTag:        15,
			Message:       msg,
			RequiredEpoch: &suggestedEpoch.Epoch,
		})
		if err != nil {
			return err
		}

		tasks[evt.TaskId] = TaskState{
			ChainID:        appChainID,
			TaskID:         evt.TaskId,
			Req:            req,
			Payload:        payload,
			SigEpoch:       int64(signResp.Epoch),
			SigRequestHash: signResp.RequestHash,
			AggProof:       nil,
			Statuses:       map[int64]uint8{},
		}

		slog.InfoContext(ctx, "Signed message", "taskID", evt.TaskId, "epoch", signResp.Epoch, "requestHash", signResp.RequestHash)
	}
	return nil
}

func verifyOwnership(ctx context.Context, req contracts.NftOwnershipTaskRequest) (bool, common.Address, uint64, error) {
	targetChainID := req.ChainId.Uint64()

	cli, err := getNFTClient(ctx, targetChainID)
	if err != nil {
		return false, common.Address{}, 0, err
	}

	var blockNum *big.Int
	if req.CheckedBlock != 0 {
		blockNum = new(big.Int).SetUint64(req.CheckedBlock)
	}

	switch req.Standard {
	case StdERC721:
		owner, observed, err := erc721OwnerOf(ctx, cli, req.Collection, req.TokenId, blockNum)
		if err != nil {
			return false, common.Address{}, observed, nil
		}
		return strings.EqualFold(owner.Hex(), req.Owner.Hex()), owner, observed, nil

	case StdERC1155:
		ok, observed, err := erc1155HasBalance(ctx, cli, req.Collection, req.Owner, req.TokenId, blockNum)
		if err != nil {
			return false, common.Address{}, observed, nil
		}
		return ok, req.Owner, observed, nil

	default:
		return false, common.Address{}, 0, fmt.Errorf("unknown standard %d", req.Standard)
	}
}

func erc721OwnerOf(ctx context.Context, cli *ethclient.Client, collection common.Address, tokenId *big.Int, block *big.Int) (common.Address, uint64, error) {
	const abiJSON = `[{"name":"ownerOf","type":"function","stateMutability":"view","inputs":[{"name":"tokenId","type":"uint256"}],"outputs":[{"name":"owner","type":"address"}]}]`
	pa, err := abi.JSON(strings.NewReader(abiJSON))
	if err != nil {
		return common.Address{}, 0, err
	}
	data, err := pa.Pack("ownerOf", tokenId)
	if err != nil {
		return common.Address{}, 0, err
	}
	out, err := cli.CallContract(ctx, ethereum.CallMsg{To: &collection, Data: data}, block)
	if err != nil {
		return common.Address{}, 0, err
	}
	var outVals []interface{}
	if err := pa.UnpackIntoInterface(&outVals, "ownerOf", out); err != nil {
		return common.Address{}, 0, err
	}
	owner := outVals[0].(common.Address)

	var observed uint64
	if block != nil {
		observed = block.Uint64()
	} else {
		h, err := cli.HeaderByNumber(ctx, nil)
		if err != nil {
			return common.Address{}, 0, err
		}
		observed = h.Number.Uint64()
	}
	return owner, observed, nil
}

func erc1155HasBalance(ctx context.Context, cli *ethclient.Client, collection, owner common.Address, tokenId *big.Int, block *big.Int) (bool, uint64, error) {
	const abiJSON = `[{"name":"balanceOf","type":"function","stateMutability":"view","inputs":[{"name":"account","type":"address"},{"name":"id","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]}]`
	pa, err := abi.JSON(strings.NewReader(abiJSON))
	if err != nil {
		return false, 0, err
	}
	data, err := pa.Pack("balanceOf", owner, tokenId)
	if err != nil {
		return false, 0, err
	}
	out, err := cli.CallContract(ctx, ethereum.CallMsg{To: &collection, Data: data}, block)
	if err != nil {
		return false, 0, err
	}
	var outVals []interface{}
	if err := pa.UnpackIntoInterface(&outVals, "balanceOf", out); err != nil {
		return false, 0, err
	}
	bal := outVals[0].(*big.Int)

	var observed uint64
	if block != nil {
		observed = block.Uint64()
	} else {
		h, err := cli.HeaderByNumber(ctx, nil)
		if err != nil {
			return false, 0, err
		}
		observed = h.Number.Uint64()
	}
	return bal.Cmp(big.NewInt(0)) > 0, observed, nil
}

func getNFTClient(ctx context.Context, chainID uint64) (*ethclient.Client, error) {
	if c, ok := appClients[int64(chainID)]; ok {
		return c, nil
	}
	if c, ok := nftClients[chainID]; ok {
		return c, nil
	}
	url, ok := nftRPCs[chainID]
	if !ok || strings.TrimSpace(url) == "" {
		return nil, fmt.Errorf("no RPC configured for NFT chainId=%d (set --nft-rpc-map)", chainID)
	}
	cli, err := ethclient.DialContext(ctx, url)
	if err != nil {
		return nil, err
	}
	nftClients[chainID] = cli
	return cli, nil
}

func parseRPCMap(s string) map[uint64]string {
	m := make(map[uint64]string)
	if strings.TrimSpace(s) == "" {
		return m
	}
	parts := strings.Split(s, ",")
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		kv := strings.SplitN(p, "=", 2)
		if len(kv) != 2 {
			continue
		}
		cid := strings.TrimSpace(kv[0])
		url := strings.TrimSpace(kv[1])
		if cid == "" || url == "" {
			continue
		}
		bi, ok := new(big.Int).SetString(cid, 10)
		if !ok {
			continue
		}
		m[bi.Uint64()] = url
	}
	return m
}

func signalContext(ctx context.Context) context.Context {
	cnCtx, cancel := context.WithCancel(ctx)
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		sig := <-c
		slog.WarnContext(ctx, "Received signal", "signal", sig)
		cancel()
	}()
	return cnCtx
}
