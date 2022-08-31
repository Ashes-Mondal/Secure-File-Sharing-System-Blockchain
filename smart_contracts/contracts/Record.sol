// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./User.sol";

contract Record {
    event registered(address indexed owner, address usrRecord);

    User[] public allUsers;
    mapping(address => address) userRecord;

    function signUp(string memory _name, string memory _pubK)
        public
        returns (address)
    {
        require(isUserExist() == false, "Already signed in!");

        User usr = new User(_name, _pubK,msg.sender);
        allUsers.push(usr);
        userRecord[msg.sender] = address(usr);
        emit registered(msg.sender, address(usr));
        return address(usr);
    }

    function getAllUsers() external view returns (User[] memory) {
        return allUsers;
    }

    function isUserExist() public view returns (bool) {
        return userRecord[msg.sender] != address(0);
    }

    function getUserRecord(address a) public view returns (address){
        require(userRecord[a] != address(0),"User does not exists in the record");
        return userRecord[a];
    }
}
