// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Ownable {
    address public owner;

    mapping(address => bool) admins;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(isOwner(), "Access Denied");
        _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }
}
