// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ISettlement} from "@symbioticfi/relay-contracts/interfaces/modules/settlement/ISettlement.sol";

contract NftOwnershipTask {
    error AlreadyResponded();
    error InvalidQuorumSignature();
    error InvalidVerifyingEpoch();

    enum TaskStatus {
        CREATED,
        RESPONDED,
        EXPIRED,
        NOT_FOUND
    }

    enum Standard {
        ERC721,
        ERC1155
    }

    struct Request {
        uint256 chainId;       
        address collection;    
        uint256 tokenId;      
        address owner;        
        uint64  checkedBlock; 
        Standard standard;     
        uint256 nonce;       
        uint48  createdAt;     
    }

    struct Response {
        uint48  answeredAt;
        bool    isOwner;
        address ownerAtBlock;  
        uint64  observedBlock; 
    }

    event CreateTask(bytes32 indexed taskId, Request req);
    event TaskCreated(bytes32 indexed taskId, Request req);

    event RespondTask(bytes32 indexed taskId, Response response);

    uint32 public constant TASK_EXPIRY = 12000;

    ISettlement public settlement;
    uint256 public nonce;

    mapping(bytes32 => Request) public tasks;
    mapping(bytes32 => Response) public responses;

    constructor(address _settlement) {
        settlement = ISettlement(_settlement);
    }

    function getTaskStatus(bytes32 taskId) public view returns (TaskStatus) {
        if (responses[taskId].answeredAt > 0) {
            return TaskStatus.RESPONDED;
        }
        if (tasks[taskId].createdAt == 0) {
            return TaskStatus.NOT_FOUND;
        }
        if (block.timestamp > tasks[taskId].createdAt + TASK_EXPIRY) {
            return TaskStatus.EXPIRED;
        }
        return TaskStatus.CREATED;
    }

    function createTask(
        uint256 chainId,
        address collection,
        uint256 tokenId,
        address owner,
        uint64  checkedBlock,
        Standard standard
    ) public returns (bytes32 taskId) {
        uint256 nonce_ = nonce++;
        Request memory req = Request({
            chainId: chainId,
            collection: collection,
            tokenId: tokenId,
            owner: owner,
            checkedBlock: checkedBlock,
            standard: standard,
            nonce: nonce_,
            createdAt: uint48(block.timestamp)
        });

        taskId = keccak256(
            abi.encode(block.chainid, chainId, collection, tokenId, owner, checkedBlock, standard, nonce_)
        );

        tasks[taskId] = req;

        emit CreateTask(taskId, req);
        emit TaskCreated(taskId, req);
    }

    /**
     * @notice Store an attested result after settlement verification.
     * The off-chain node signs `abi.encode(taskId, payload)` where
     * `payload = abi.encode(bool isOwner, address ownerAtBlock, uint64 observedBlock)`.
     */
    function respondTask(bytes32 taskId, bytes calldata payload, uint48 epoch, bytes calldata proof) public {
        if (responses[taskId].answeredAt > 0) {
            revert AlreadyResponded();
        }

        uint48 nextEpochCaptureTimestamp = settlement.getCaptureTimestampFromValSetHeaderAt(epoch + 1);
        if (nextEpochCaptureTimestamp > 0 && block.timestamp >= nextEpochCaptureTimestamp + TASK_EXPIRY) {
            revert InvalidVerifyingEpoch();
        }

        bytes32 msgHash = keccak256(abi.encode(taskId, payload));
        bool ok = settlement.verifyQuorumSigAt(
            abi.encode(msgHash),
            settlement.getRequiredKeyTagFromValSetHeaderAt(epoch),
            settlement.getQuorumThresholdFromValSetHeaderAt(epoch),
            proof,
            epoch,
            new bytes(0)
        );
        if (!ok) {
            revert InvalidQuorumSignature();
        }

        (bool isOwner, address ownerAtBlock, uint64 observedBlock) =
            abi.decode(payload, (bool, address, uint64));

        Response memory resp = Response({
            answeredAt: uint48(block.timestamp),
            isOwner: isOwner,
            ownerAtBlock: ownerAtBlock,
            observedBlock: observedBlock
        });

        responses[taskId] = resp;

        emit RespondTask(taskId, resp);
    }
}
