// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {NftOwnershipTask} from "../src/NftOwnershipTask.sol";

contract CreateNftOwnershipTask is Script {
    function run() external {
        uint256 pk        = vm.envUint("PRIVATE_KEY");
        address taskAddr  = vm.envAddress("NFT_TASK");
        address coll      = vm.envAddress("NFT_COLLECTION");
        address owner     = vm.envAddress("NFT_OWNER");
        uint256 tokenId   = vm.envUint("TOKEN_ID");

        uint256 stdRaw     = vm.envOr("STANDARD", uint256(0));
        uint8 standard     = uint8(stdRaw);

        uint256 chkRaw     = vm.envOr("CHECKED_BLOCK", uint256(block.number)); 
        uint64 checked     = uint64(chkRaw);

        vm.startBroadcast(pk);

        NftOwnershipTask task = NftOwnershipTask(taskAddr);

        bytes32 taskId = task.createTask(
            block.chainid,
            coll,
            tokenId,
            owner,
            checked,
            NftOwnershipTask.Standard(standard)
        );

        console2.log("Created task on NftOwnershipTask:", taskAddr);
        console2.log("chainId:", block.chainid);
        console2.log("collection:", coll);
        console2.log("tokenId:", tokenId);
        console2.log("owner:", owner);
        console2.log("checkedBlock:", checked);
        console2.log("standard:", standard);
        console2.log("TaskID:");
        console2.logBytes32(taskId);

        vm.stopBroadcast();
    }
}
