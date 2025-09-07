// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockERC721 {
    string public name;
    string public symbol;

    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) private _balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor(string memory _n, string memory _s) {
        name = _n;
        symbol = _s;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address o = _ownerOf[tokenId];
        require(o != address(0), "NOT_MINTED");
        return o;
    }

    function balanceOf(address a) external view returns (uint256) {
        require(a != address(0), "ZERO_ADDR");
        return _balanceOf[a];
    }

    function mint(address to, uint256 tokenId) external {
        require(to != address(0), "ZERO_ADDR");
        require(_ownerOf[tokenId] == address(0), "ALREADY_MINTED");
        _ownerOf[tokenId] = to;
        _balanceOf[to] += 1;
        emit Transfer(address(0), to, tokenId);
    }
}
