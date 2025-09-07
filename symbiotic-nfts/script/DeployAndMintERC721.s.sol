// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {MockERC721} from "../src/MockERC721.sol";

contract DeployAndMintERC721 is Script {
    function run() external {
        uint256 pk       = vm.envUint("PRIVATE_KEY");
        address owner    = vm.envAddress("NFT_OWNER");
        uint256 tokenId  = vm.envUint("TOKEN_ID");

        address maybeExisting = vm.envOr("NFT_COLLECTION_ADDR", address(0));
        string memory name_   = vm.envOr("NFT_NAME", string("TestNFT"));
        string memory sym_    = vm.envOr("NFT_SYMBOL", string("TNFT"));

        vm.startBroadcast(pk);

        address nftAddr;
        if (maybeExisting != address(0)) {
            nftAddr = maybeExisting;
            console2.log("Using existing ERC721:", nftAddr);
        } else {
            MockERC721 nft = new MockERC721(name_, sym_);
            nftAddr = address(nft);
            console2.log("Deployed MockERC721 at:", nftAddr);
        }

        (bool ok, ) = nftAddr.call(abi.encodeWithSignature("mint(address,uint256)", owner, tokenId));
        require(ok, "mint failed");

        console2.log("Minted token", tokenId, "to", owner);
        console2.log("Mint block:", block.number);
        console2.log("NFT_COLLECTION:", nftAddr);

        vm.stopBroadcast();
    }
}
