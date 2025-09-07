// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package contracts

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// NftOwnershipTaskRequest is an auto generated low-level Go binding around an user-defined struct.
type NftOwnershipTaskRequest struct {
	ChainId      *big.Int
	Collection   common.Address
	TokenId      *big.Int
	Owner        common.Address
	CheckedBlock uint64
	Standard     uint8
	Nonce        *big.Int
	CreatedAt    *big.Int
}

// NftOwnershipTaskResponse is an auto generated low-level Go binding around an user-defined struct.
type NftOwnershipTaskResponse struct {
	AnsweredAt    *big.Int
	IsOwner       bool
	OwnerAtBlock  common.Address
	ObservedBlock uint64
}

// NftOwnershipTaskMetaData contains all meta data concerning the NftOwnershipTask contract.
var NftOwnershipTaskMetaData = &bind.MetaData{
	ABI: "[{\"type\":\"constructor\",\"inputs\":[{\"name\":\"_settlement\",\"type\":\"address\",\"internalType\":\"address\"}],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"TASK_EXPIRY\",\"inputs\":[],\"outputs\":[{\"name\":\"\",\"type\":\"uint32\",\"internalType\":\"uint32\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"createTask\",\"inputs\":[{\"name\":\"chainId\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"collection\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"tokenId\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"owner\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"checkedBlock\",\"type\":\"uint64\",\"internalType\":\"uint64\"},{\"name\":\"standard\",\"type\":\"uint8\",\"internalType\":\"enumNftOwnershipTask.Standard\"}],\"outputs\":[{\"name\":\"taskId\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"getTaskStatus\",\"inputs\":[{\"name\":\"taskId\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"\",\"type\":\"uint8\",\"internalType\":\"enumNftOwnershipTask.TaskStatus\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"nonce\",\"inputs\":[],\"outputs\":[{\"name\":\"\",\"type\":\"uint256\",\"internalType\":\"uint256\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"respondTask\",\"inputs\":[{\"name\":\"taskId\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"payload\",\"type\":\"bytes\",\"internalType\":\"bytes\"},{\"name\":\"epoch\",\"type\":\"uint48\",\"internalType\":\"uint48\"},{\"name\":\"proof\",\"type\":\"bytes\",\"internalType\":\"bytes\"}],\"outputs\":[],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"responses\",\"inputs\":[{\"name\":\"\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"answeredAt\",\"type\":\"uint48\",\"internalType\":\"uint48\"},{\"name\":\"isOwner\",\"type\":\"bool\",\"internalType\":\"bool\"},{\"name\":\"ownerAtBlock\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"observedBlock\",\"type\":\"uint64\",\"internalType\":\"uint64\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"settlement\",\"inputs\":[],\"outputs\":[{\"name\":\"\",\"type\":\"address\",\"internalType\":\"contractISettlement\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"tasks\",\"inputs\":[{\"name\":\"\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"chainId\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"collection\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"tokenId\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"owner\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"checkedBlock\",\"type\":\"uint64\",\"internalType\":\"uint64\"},{\"name\":\"standard\",\"type\":\"uint8\",\"internalType\":\"enumNftOwnershipTask.Standard\"},{\"name\":\"nonce\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"createdAt\",\"type\":\"uint48\",\"internalType\":\"uint48\"}],\"stateMutability\":\"view\"},{\"type\":\"event\",\"name\":\"CreateTask\",\"inputs\":[{\"name\":\"taskId\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"req\",\"type\":\"tuple\",\"indexed\":false,\"internalType\":\"structNftOwnershipTask.Request\",\"components\":[{\"name\":\"chainId\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"collection\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"tokenId\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"owner\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"checkedBlock\",\"type\":\"uint64\",\"internalType\":\"uint64\"},{\"name\":\"standard\",\"type\":\"uint8\",\"internalType\":\"enumNftOwnershipTask.Standard\"},{\"name\":\"nonce\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"createdAt\",\"type\":\"uint48\",\"internalType\":\"uint48\"}]}],\"anonymous\":false},{\"type\":\"event\",\"name\":\"RespondTask\",\"inputs\":[{\"name\":\"taskId\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"response\",\"type\":\"tuple\",\"indexed\":false,\"internalType\":\"structNftOwnershipTask.Response\",\"components\":[{\"name\":\"answeredAt\",\"type\":\"uint48\",\"internalType\":\"uint48\"},{\"name\":\"isOwner\",\"type\":\"bool\",\"internalType\":\"bool\"},{\"name\":\"ownerAtBlock\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"observedBlock\",\"type\":\"uint64\",\"internalType\":\"uint64\"}]}],\"anonymous\":false},{\"type\":\"event\",\"name\":\"TaskCreated\",\"inputs\":[{\"name\":\"taskId\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"req\",\"type\":\"tuple\",\"indexed\":false,\"internalType\":\"structNftOwnershipTask.Request\",\"components\":[{\"name\":\"chainId\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"collection\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"tokenId\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"owner\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"checkedBlock\",\"type\":\"uint64\",\"internalType\":\"uint64\"},{\"name\":\"standard\",\"type\":\"uint8\",\"internalType\":\"enumNftOwnershipTask.Standard\"},{\"name\":\"nonce\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"createdAt\",\"type\":\"uint48\",\"internalType\":\"uint48\"}]}],\"anonymous\":false},{\"type\":\"error\",\"name\":\"AlreadyResponded\",\"inputs\":[]},{\"type\":\"error\",\"name\":\"InvalidQuorumSignature\",\"inputs\":[]},{\"type\":\"error\",\"name\":\"InvalidVerifyingEpoch\",\"inputs\":[]}]",
}

// NftOwnershipTaskABI is the input ABI used to generate the binding from.
// Deprecated: Use NftOwnershipTaskMetaData.ABI instead.
var NftOwnershipTaskABI = NftOwnershipTaskMetaData.ABI

// NftOwnershipTask is an auto generated Go binding around an Ethereum contract.
type NftOwnershipTask struct {
	NftOwnershipTaskCaller     // Read-only binding to the contract
	NftOwnershipTaskTransactor // Write-only binding to the contract
	NftOwnershipTaskFilterer   // Log filterer for contract events
}

// NftOwnershipTaskCaller is an auto generated read-only Go binding around an Ethereum contract.
type NftOwnershipTaskCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// NftOwnershipTaskTransactor is an auto generated write-only Go binding around an Ethereum contract.
type NftOwnershipTaskTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// NftOwnershipTaskFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type NftOwnershipTaskFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// NftOwnershipTaskSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type NftOwnershipTaskSession struct {
	Contract     *NftOwnershipTask // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// NftOwnershipTaskCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type NftOwnershipTaskCallerSession struct {
	Contract *NftOwnershipTaskCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts           // Call options to use throughout this session
}

// NftOwnershipTaskTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type NftOwnershipTaskTransactorSession struct {
	Contract     *NftOwnershipTaskTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts           // Transaction auth options to use throughout this session
}

// NftOwnershipTaskRaw is an auto generated low-level Go binding around an Ethereum contract.
type NftOwnershipTaskRaw struct {
	Contract *NftOwnershipTask // Generic contract binding to access the raw methods on
}

// NftOwnershipTaskCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type NftOwnershipTaskCallerRaw struct {
	Contract *NftOwnershipTaskCaller // Generic read-only contract binding to access the raw methods on
}

// NftOwnershipTaskTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type NftOwnershipTaskTransactorRaw struct {
	Contract *NftOwnershipTaskTransactor // Generic write-only contract binding to access the raw methods on
}

// NewNftOwnershipTask creates a new instance of NftOwnershipTask, bound to a specific deployed contract.
func NewNftOwnershipTask(address common.Address, backend bind.ContractBackend) (*NftOwnershipTask, error) {
	contract, err := bindNftOwnershipTask(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &NftOwnershipTask{NftOwnershipTaskCaller: NftOwnershipTaskCaller{contract: contract}, NftOwnershipTaskTransactor: NftOwnershipTaskTransactor{contract: contract}, NftOwnershipTaskFilterer: NftOwnershipTaskFilterer{contract: contract}}, nil
}

// NewNftOwnershipTaskCaller creates a new read-only instance of NftOwnershipTask, bound to a specific deployed contract.
func NewNftOwnershipTaskCaller(address common.Address, caller bind.ContractCaller) (*NftOwnershipTaskCaller, error) {
	contract, err := bindNftOwnershipTask(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &NftOwnershipTaskCaller{contract: contract}, nil
}

// NewNftOwnershipTaskTransactor creates a new write-only instance of NftOwnershipTask, bound to a specific deployed contract.
func NewNftOwnershipTaskTransactor(address common.Address, transactor bind.ContractTransactor) (*NftOwnershipTaskTransactor, error) {
	contract, err := bindNftOwnershipTask(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &NftOwnershipTaskTransactor{contract: contract}, nil
}

// NewNftOwnershipTaskFilterer creates a new log filterer instance of NftOwnershipTask, bound to a specific deployed contract.
func NewNftOwnershipTaskFilterer(address common.Address, filterer bind.ContractFilterer) (*NftOwnershipTaskFilterer, error) {
	contract, err := bindNftOwnershipTask(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &NftOwnershipTaskFilterer{contract: contract}, nil
}

// bindNftOwnershipTask binds a generic wrapper to an already deployed contract.
func bindNftOwnershipTask(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := NftOwnershipTaskMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_NftOwnershipTask *NftOwnershipTaskRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _NftOwnershipTask.Contract.NftOwnershipTaskCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_NftOwnershipTask *NftOwnershipTaskRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _NftOwnershipTask.Contract.NftOwnershipTaskTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_NftOwnershipTask *NftOwnershipTaskRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _NftOwnershipTask.Contract.NftOwnershipTaskTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_NftOwnershipTask *NftOwnershipTaskCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _NftOwnershipTask.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_NftOwnershipTask *NftOwnershipTaskTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _NftOwnershipTask.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_NftOwnershipTask *NftOwnershipTaskTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _NftOwnershipTask.Contract.contract.Transact(opts, method, params...)
}

// TASKEXPIRY is a free data retrieval call binding the contract method 0x240697b6.
//
// Solidity: function TASK_EXPIRY() view returns(uint32)
func (_NftOwnershipTask *NftOwnershipTaskCaller) TASKEXPIRY(opts *bind.CallOpts) (uint32, error) {
	var out []interface{}
	err := _NftOwnershipTask.contract.Call(opts, &out, "TASK_EXPIRY")

	if err != nil {
		return *new(uint32), err
	}

	out0 := *abi.ConvertType(out[0], new(uint32)).(*uint32)

	return out0, err

}

// TASKEXPIRY is a free data retrieval call binding the contract method 0x240697b6.
//
// Solidity: function TASK_EXPIRY() view returns(uint32)
func (_NftOwnershipTask *NftOwnershipTaskSession) TASKEXPIRY() (uint32, error) {
	return _NftOwnershipTask.Contract.TASKEXPIRY(&_NftOwnershipTask.CallOpts)
}

// TASKEXPIRY is a free data retrieval call binding the contract method 0x240697b6.
//
// Solidity: function TASK_EXPIRY() view returns(uint32)
func (_NftOwnershipTask *NftOwnershipTaskCallerSession) TASKEXPIRY() (uint32, error) {
	return _NftOwnershipTask.Contract.TASKEXPIRY(&_NftOwnershipTask.CallOpts)
}

// GetTaskStatus is a free data retrieval call binding the contract method 0x2bf6cc79.
//
// Solidity: function getTaskStatus(bytes32 taskId) view returns(uint8)
func (_NftOwnershipTask *NftOwnershipTaskCaller) GetTaskStatus(opts *bind.CallOpts, taskId [32]byte) (uint8, error) {
	var out []interface{}
	err := _NftOwnershipTask.contract.Call(opts, &out, "getTaskStatus", taskId)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetTaskStatus is a free data retrieval call binding the contract method 0x2bf6cc79.
//
// Solidity: function getTaskStatus(bytes32 taskId) view returns(uint8)
func (_NftOwnershipTask *NftOwnershipTaskSession) GetTaskStatus(taskId [32]byte) (uint8, error) {
	return _NftOwnershipTask.Contract.GetTaskStatus(&_NftOwnershipTask.CallOpts, taskId)
}

// GetTaskStatus is a free data retrieval call binding the contract method 0x2bf6cc79.
//
// Solidity: function getTaskStatus(bytes32 taskId) view returns(uint8)
func (_NftOwnershipTask *NftOwnershipTaskCallerSession) GetTaskStatus(taskId [32]byte) (uint8, error) {
	return _NftOwnershipTask.Contract.GetTaskStatus(&_NftOwnershipTask.CallOpts, taskId)
}

// Nonce is a free data retrieval call binding the contract method 0xaffed0e0.
//
// Solidity: function nonce() view returns(uint256)
func (_NftOwnershipTask *NftOwnershipTaskCaller) Nonce(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _NftOwnershipTask.contract.Call(opts, &out, "nonce")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// Nonce is a free data retrieval call binding the contract method 0xaffed0e0.
//
// Solidity: function nonce() view returns(uint256)
func (_NftOwnershipTask *NftOwnershipTaskSession) Nonce() (*big.Int, error) {
	return _NftOwnershipTask.Contract.Nonce(&_NftOwnershipTask.CallOpts)
}

// Nonce is a free data retrieval call binding the contract method 0xaffed0e0.
//
// Solidity: function nonce() view returns(uint256)
func (_NftOwnershipTask *NftOwnershipTaskCallerSession) Nonce() (*big.Int, error) {
	return _NftOwnershipTask.Contract.Nonce(&_NftOwnershipTask.CallOpts)
}

// Responses is a free data retrieval call binding the contract method 0x72164a6c.
//
// Solidity: function responses(bytes32 ) view returns(uint48 answeredAt, bool isOwner, address ownerAtBlock, uint64 observedBlock)
func (_NftOwnershipTask *NftOwnershipTaskCaller) Responses(opts *bind.CallOpts, arg0 [32]byte) (struct {
	AnsweredAt    *big.Int
	IsOwner       bool
	OwnerAtBlock  common.Address
	ObservedBlock uint64
}, error) {
	var out []interface{}
	err := _NftOwnershipTask.contract.Call(opts, &out, "responses", arg0)

	outstruct := new(struct {
		AnsweredAt    *big.Int
		IsOwner       bool
		OwnerAtBlock  common.Address
		ObservedBlock uint64
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.AnsweredAt = *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	outstruct.IsOwner = *abi.ConvertType(out[1], new(bool)).(*bool)
	outstruct.OwnerAtBlock = *abi.ConvertType(out[2], new(common.Address)).(*common.Address)
	outstruct.ObservedBlock = *abi.ConvertType(out[3], new(uint64)).(*uint64)

	return *outstruct, err

}

// Responses is a free data retrieval call binding the contract method 0x72164a6c.
//
// Solidity: function responses(bytes32 ) view returns(uint48 answeredAt, bool isOwner, address ownerAtBlock, uint64 observedBlock)
func (_NftOwnershipTask *NftOwnershipTaskSession) Responses(arg0 [32]byte) (struct {
	AnsweredAt    *big.Int
	IsOwner       bool
	OwnerAtBlock  common.Address
	ObservedBlock uint64
}, error) {
	return _NftOwnershipTask.Contract.Responses(&_NftOwnershipTask.CallOpts, arg0)
}

// Responses is a free data retrieval call binding the contract method 0x72164a6c.
//
// Solidity: function responses(bytes32 ) view returns(uint48 answeredAt, bool isOwner, address ownerAtBlock, uint64 observedBlock)
func (_NftOwnershipTask *NftOwnershipTaskCallerSession) Responses(arg0 [32]byte) (struct {
	AnsweredAt    *big.Int
	IsOwner       bool
	OwnerAtBlock  common.Address
	ObservedBlock uint64
}, error) {
	return _NftOwnershipTask.Contract.Responses(&_NftOwnershipTask.CallOpts, arg0)
}

// Settlement is a free data retrieval call binding the contract method 0x51160630.
//
// Solidity: function settlement() view returns(address)
func (_NftOwnershipTask *NftOwnershipTaskCaller) Settlement(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _NftOwnershipTask.contract.Call(opts, &out, "settlement")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Settlement is a free data retrieval call binding the contract method 0x51160630.
//
// Solidity: function settlement() view returns(address)
func (_NftOwnershipTask *NftOwnershipTaskSession) Settlement() (common.Address, error) {
	return _NftOwnershipTask.Contract.Settlement(&_NftOwnershipTask.CallOpts)
}

// Settlement is a free data retrieval call binding the contract method 0x51160630.
//
// Solidity: function settlement() view returns(address)
func (_NftOwnershipTask *NftOwnershipTaskCallerSession) Settlement() (common.Address, error) {
	return _NftOwnershipTask.Contract.Settlement(&_NftOwnershipTask.CallOpts)
}

// Tasks is a free data retrieval call binding the contract method 0xe579f500.
//
// Solidity: function tasks(bytes32 ) view returns(uint256 chainId, address collection, uint256 tokenId, address owner, uint64 checkedBlock, uint8 standard, uint256 nonce, uint48 createdAt)
func (_NftOwnershipTask *NftOwnershipTaskCaller) Tasks(opts *bind.CallOpts, arg0 [32]byte) (struct {
	ChainId      *big.Int
	Collection   common.Address
	TokenId      *big.Int
	Owner        common.Address
	CheckedBlock uint64
	Standard     uint8
	Nonce        *big.Int
	CreatedAt    *big.Int
}, error) {
	var out []interface{}
	err := _NftOwnershipTask.contract.Call(opts, &out, "tasks", arg0)

	outstruct := new(struct {
		ChainId      *big.Int
		Collection   common.Address
		TokenId      *big.Int
		Owner        common.Address
		CheckedBlock uint64
		Standard     uint8
		Nonce        *big.Int
		CreatedAt    *big.Int
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.ChainId = *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	outstruct.Collection = *abi.ConvertType(out[1], new(common.Address)).(*common.Address)
	outstruct.TokenId = *abi.ConvertType(out[2], new(*big.Int)).(**big.Int)
	outstruct.Owner = *abi.ConvertType(out[3], new(common.Address)).(*common.Address)
	outstruct.CheckedBlock = *abi.ConvertType(out[4], new(uint64)).(*uint64)
	outstruct.Standard = *abi.ConvertType(out[5], new(uint8)).(*uint8)
	outstruct.Nonce = *abi.ConvertType(out[6], new(*big.Int)).(**big.Int)
	outstruct.CreatedAt = *abi.ConvertType(out[7], new(*big.Int)).(**big.Int)

	return *outstruct, err

}

// Tasks is a free data retrieval call binding the contract method 0xe579f500.
//
// Solidity: function tasks(bytes32 ) view returns(uint256 chainId, address collection, uint256 tokenId, address owner, uint64 checkedBlock, uint8 standard, uint256 nonce, uint48 createdAt)
func (_NftOwnershipTask *NftOwnershipTaskSession) Tasks(arg0 [32]byte) (struct {
	ChainId      *big.Int
	Collection   common.Address
	TokenId      *big.Int
	Owner        common.Address
	CheckedBlock uint64
	Standard     uint8
	Nonce        *big.Int
	CreatedAt    *big.Int
}, error) {
	return _NftOwnershipTask.Contract.Tasks(&_NftOwnershipTask.CallOpts, arg0)
}

// Tasks is a free data retrieval call binding the contract method 0xe579f500.
//
// Solidity: function tasks(bytes32 ) view returns(uint256 chainId, address collection, uint256 tokenId, address owner, uint64 checkedBlock, uint8 standard, uint256 nonce, uint48 createdAt)
func (_NftOwnershipTask *NftOwnershipTaskCallerSession) Tasks(arg0 [32]byte) (struct {
	ChainId      *big.Int
	Collection   common.Address
	TokenId      *big.Int
	Owner        common.Address
	CheckedBlock uint64
	Standard     uint8
	Nonce        *big.Int
	CreatedAt    *big.Int
}, error) {
	return _NftOwnershipTask.Contract.Tasks(&_NftOwnershipTask.CallOpts, arg0)
}

// CreateTask is a paid mutator transaction binding the contract method 0x4017c17f.
//
// Solidity: function createTask(uint256 chainId, address collection, uint256 tokenId, address owner, uint64 checkedBlock, uint8 standard) returns(bytes32 taskId)
func (_NftOwnershipTask *NftOwnershipTaskTransactor) CreateTask(opts *bind.TransactOpts, chainId *big.Int, collection common.Address, tokenId *big.Int, owner common.Address, checkedBlock uint64, standard uint8) (*types.Transaction, error) {
	return _NftOwnershipTask.contract.Transact(opts, "createTask", chainId, collection, tokenId, owner, checkedBlock, standard)
}

// CreateTask is a paid mutator transaction binding the contract method 0x4017c17f.
//
// Solidity: function createTask(uint256 chainId, address collection, uint256 tokenId, address owner, uint64 checkedBlock, uint8 standard) returns(bytes32 taskId)
func (_NftOwnershipTask *NftOwnershipTaskSession) CreateTask(chainId *big.Int, collection common.Address, tokenId *big.Int, owner common.Address, checkedBlock uint64, standard uint8) (*types.Transaction, error) {
	return _NftOwnershipTask.Contract.CreateTask(&_NftOwnershipTask.TransactOpts, chainId, collection, tokenId, owner, checkedBlock, standard)
}

// CreateTask is a paid mutator transaction binding the contract method 0x4017c17f.
//
// Solidity: function createTask(uint256 chainId, address collection, uint256 tokenId, address owner, uint64 checkedBlock, uint8 standard) returns(bytes32 taskId)
func (_NftOwnershipTask *NftOwnershipTaskTransactorSession) CreateTask(chainId *big.Int, collection common.Address, tokenId *big.Int, owner common.Address, checkedBlock uint64, standard uint8) (*types.Transaction, error) {
	return _NftOwnershipTask.Contract.CreateTask(&_NftOwnershipTask.TransactOpts, chainId, collection, tokenId, owner, checkedBlock, standard)
}

// RespondTask is a paid mutator transaction binding the contract method 0xc2ea2bf3.
//
// Solidity: function respondTask(bytes32 taskId, bytes payload, uint48 epoch, bytes proof) returns()
func (_NftOwnershipTask *NftOwnershipTaskTransactor) RespondTask(opts *bind.TransactOpts, taskId [32]byte, payload []byte, epoch *big.Int, proof []byte) (*types.Transaction, error) {
	return _NftOwnershipTask.contract.Transact(opts, "respondTask", taskId, payload, epoch, proof)
}

// RespondTask is a paid mutator transaction binding the contract method 0xc2ea2bf3.
//
// Solidity: function respondTask(bytes32 taskId, bytes payload, uint48 epoch, bytes proof) returns()
func (_NftOwnershipTask *NftOwnershipTaskSession) RespondTask(taskId [32]byte, payload []byte, epoch *big.Int, proof []byte) (*types.Transaction, error) {
	return _NftOwnershipTask.Contract.RespondTask(&_NftOwnershipTask.TransactOpts, taskId, payload, epoch, proof)
}

// RespondTask is a paid mutator transaction binding the contract method 0xc2ea2bf3.
//
// Solidity: function respondTask(bytes32 taskId, bytes payload, uint48 epoch, bytes proof) returns()
func (_NftOwnershipTask *NftOwnershipTaskTransactorSession) RespondTask(taskId [32]byte, payload []byte, epoch *big.Int, proof []byte) (*types.Transaction, error) {
	return _NftOwnershipTask.Contract.RespondTask(&_NftOwnershipTask.TransactOpts, taskId, payload, epoch, proof)
}

// NftOwnershipTaskCreateTaskIterator is returned from FilterCreateTask and is used to iterate over the raw logs and unpacked data for CreateTask events raised by the NftOwnershipTask contract.
type NftOwnershipTaskCreateTaskIterator struct {
	Event *NftOwnershipTaskCreateTask // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *NftOwnershipTaskCreateTaskIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(NftOwnershipTaskCreateTask)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(NftOwnershipTaskCreateTask)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *NftOwnershipTaskCreateTaskIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *NftOwnershipTaskCreateTaskIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// NftOwnershipTaskCreateTask represents a CreateTask event raised by the NftOwnershipTask contract.
type NftOwnershipTaskCreateTask struct {
	TaskId [32]byte
	Req    NftOwnershipTaskRequest
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterCreateTask is a free log retrieval operation binding the contract event 0x313874bd5b1cda73bb443bd62cf625061ba13ebe53f553359ff50ce05cacc5a8.
//
// Solidity: event CreateTask(bytes32 indexed taskId, (uint256,address,uint256,address,uint64,uint8,uint256,uint48) req)
func (_NftOwnershipTask *NftOwnershipTaskFilterer) FilterCreateTask(opts *bind.FilterOpts, taskId [][32]byte) (*NftOwnershipTaskCreateTaskIterator, error) {

	var taskIdRule []interface{}
	for _, taskIdItem := range taskId {
		taskIdRule = append(taskIdRule, taskIdItem)
	}

	logs, sub, err := _NftOwnershipTask.contract.FilterLogs(opts, "CreateTask", taskIdRule)
	if err != nil {
		return nil, err
	}
	return &NftOwnershipTaskCreateTaskIterator{contract: _NftOwnershipTask.contract, event: "CreateTask", logs: logs, sub: sub}, nil
}

// WatchCreateTask is a free log subscription operation binding the contract event 0x313874bd5b1cda73bb443bd62cf625061ba13ebe53f553359ff50ce05cacc5a8.
//
// Solidity: event CreateTask(bytes32 indexed taskId, (uint256,address,uint256,address,uint64,uint8,uint256,uint48) req)
func (_NftOwnershipTask *NftOwnershipTaskFilterer) WatchCreateTask(opts *bind.WatchOpts, sink chan<- *NftOwnershipTaskCreateTask, taskId [][32]byte) (event.Subscription, error) {

	var taskIdRule []interface{}
	for _, taskIdItem := range taskId {
		taskIdRule = append(taskIdRule, taskIdItem)
	}

	logs, sub, err := _NftOwnershipTask.contract.WatchLogs(opts, "CreateTask", taskIdRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(NftOwnershipTaskCreateTask)
				if err := _NftOwnershipTask.contract.UnpackLog(event, "CreateTask", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseCreateTask is a log parse operation binding the contract event 0x313874bd5b1cda73bb443bd62cf625061ba13ebe53f553359ff50ce05cacc5a8.
//
// Solidity: event CreateTask(bytes32 indexed taskId, (uint256,address,uint256,address,uint64,uint8,uint256,uint48) req)
func (_NftOwnershipTask *NftOwnershipTaskFilterer) ParseCreateTask(log types.Log) (*NftOwnershipTaskCreateTask, error) {
	event := new(NftOwnershipTaskCreateTask)
	if err := _NftOwnershipTask.contract.UnpackLog(event, "CreateTask", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// NftOwnershipTaskRespondTaskIterator is returned from FilterRespondTask and is used to iterate over the raw logs and unpacked data for RespondTask events raised by the NftOwnershipTask contract.
type NftOwnershipTaskRespondTaskIterator struct {
	Event *NftOwnershipTaskRespondTask // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *NftOwnershipTaskRespondTaskIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(NftOwnershipTaskRespondTask)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(NftOwnershipTaskRespondTask)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *NftOwnershipTaskRespondTaskIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *NftOwnershipTaskRespondTaskIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// NftOwnershipTaskRespondTask represents a RespondTask event raised by the NftOwnershipTask contract.
type NftOwnershipTaskRespondTask struct {
	TaskId   [32]byte
	Response NftOwnershipTaskResponse
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterRespondTask is a free log retrieval operation binding the contract event 0x0bf426223476d58f384d98805bf2570c769b82ec6e2ccda8886bbf5e3c09f98e.
//
// Solidity: event RespondTask(bytes32 indexed taskId, (uint48,bool,address,uint64) response)
func (_NftOwnershipTask *NftOwnershipTaskFilterer) FilterRespondTask(opts *bind.FilterOpts, taskId [][32]byte) (*NftOwnershipTaskRespondTaskIterator, error) {

	var taskIdRule []interface{}
	for _, taskIdItem := range taskId {
		taskIdRule = append(taskIdRule, taskIdItem)
	}

	logs, sub, err := _NftOwnershipTask.contract.FilterLogs(opts, "RespondTask", taskIdRule)
	if err != nil {
		return nil, err
	}
	return &NftOwnershipTaskRespondTaskIterator{contract: _NftOwnershipTask.contract, event: "RespondTask", logs: logs, sub: sub}, nil
}

// WatchRespondTask is a free log subscription operation binding the contract event 0x0bf426223476d58f384d98805bf2570c769b82ec6e2ccda8886bbf5e3c09f98e.
//
// Solidity: event RespondTask(bytes32 indexed taskId, (uint48,bool,address,uint64) response)
func (_NftOwnershipTask *NftOwnershipTaskFilterer) WatchRespondTask(opts *bind.WatchOpts, sink chan<- *NftOwnershipTaskRespondTask, taskId [][32]byte) (event.Subscription, error) {

	var taskIdRule []interface{}
	for _, taskIdItem := range taskId {
		taskIdRule = append(taskIdRule, taskIdItem)
	}

	logs, sub, err := _NftOwnershipTask.contract.WatchLogs(opts, "RespondTask", taskIdRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(NftOwnershipTaskRespondTask)
				if err := _NftOwnershipTask.contract.UnpackLog(event, "RespondTask", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseRespondTask is a log parse operation binding the contract event 0x0bf426223476d58f384d98805bf2570c769b82ec6e2ccda8886bbf5e3c09f98e.
//
// Solidity: event RespondTask(bytes32 indexed taskId, (uint48,bool,address,uint64) response)
func (_NftOwnershipTask *NftOwnershipTaskFilterer) ParseRespondTask(log types.Log) (*NftOwnershipTaskRespondTask, error) {
	event := new(NftOwnershipTaskRespondTask)
	if err := _NftOwnershipTask.contract.UnpackLog(event, "RespondTask", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// NftOwnershipTaskTaskCreatedIterator is returned from FilterTaskCreated and is used to iterate over the raw logs and unpacked data for TaskCreated events raised by the NftOwnershipTask contract.
type NftOwnershipTaskTaskCreatedIterator struct {
	Event *NftOwnershipTaskTaskCreated // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *NftOwnershipTaskTaskCreatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(NftOwnershipTaskTaskCreated)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(NftOwnershipTaskTaskCreated)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *NftOwnershipTaskTaskCreatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *NftOwnershipTaskTaskCreatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// NftOwnershipTaskTaskCreated represents a TaskCreated event raised by the NftOwnershipTask contract.
type NftOwnershipTaskTaskCreated struct {
	TaskId [32]byte
	Req    NftOwnershipTaskRequest
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterTaskCreated is a free log retrieval operation binding the contract event 0x7a37329df301808b8ac3daca67b67243924444f5a64e02bb10a901c69579d63f.
//
// Solidity: event TaskCreated(bytes32 indexed taskId, (uint256,address,uint256,address,uint64,uint8,uint256,uint48) req)
func (_NftOwnershipTask *NftOwnershipTaskFilterer) FilterTaskCreated(opts *bind.FilterOpts, taskId [][32]byte) (*NftOwnershipTaskTaskCreatedIterator, error) {

	var taskIdRule []interface{}
	for _, taskIdItem := range taskId {
		taskIdRule = append(taskIdRule, taskIdItem)
	}

	logs, sub, err := _NftOwnershipTask.contract.FilterLogs(opts, "TaskCreated", taskIdRule)
	if err != nil {
		return nil, err
	}
	return &NftOwnershipTaskTaskCreatedIterator{contract: _NftOwnershipTask.contract, event: "TaskCreated", logs: logs, sub: sub}, nil
}

// WatchTaskCreated is a free log subscription operation binding the contract event 0x7a37329df301808b8ac3daca67b67243924444f5a64e02bb10a901c69579d63f.
//
// Solidity: event TaskCreated(bytes32 indexed taskId, (uint256,address,uint256,address,uint64,uint8,uint256,uint48) req)
func (_NftOwnershipTask *NftOwnershipTaskFilterer) WatchTaskCreated(opts *bind.WatchOpts, sink chan<- *NftOwnershipTaskTaskCreated, taskId [][32]byte) (event.Subscription, error) {

	var taskIdRule []interface{}
	for _, taskIdItem := range taskId {
		taskIdRule = append(taskIdRule, taskIdItem)
	}

	logs, sub, err := _NftOwnershipTask.contract.WatchLogs(opts, "TaskCreated", taskIdRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(NftOwnershipTaskTaskCreated)
				if err := _NftOwnershipTask.contract.UnpackLog(event, "TaskCreated", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseTaskCreated is a log parse operation binding the contract event 0x7a37329df301808b8ac3daca67b67243924444f5a64e02bb10a901c69579d63f.
//
// Solidity: event TaskCreated(bytes32 indexed taskId, (uint256,address,uint256,address,uint64,uint8,uint256,uint48) req)
func (_NftOwnershipTask *NftOwnershipTaskFilterer) ParseTaskCreated(log types.Log) (*NftOwnershipTaskTaskCreated, error) {
	event := new(NftOwnershipTaskTaskCreated)
	if err := _NftOwnershipTask.contract.UnpackLog(event, "TaskCreated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
