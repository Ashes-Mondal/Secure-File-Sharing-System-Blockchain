// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Record.sol";
import "./Ownable.sol";
import "./User.sol";
import "./DocumentShared.sol";

contract Document is Ownable {
    docDetails public doc;
    string public aesEncryptedKey;//Encrypted using public key of owner

    mapping(address => bool) private shared;
    mapping(address => address) private sharedDocLocation;
    address[] private shareRequest;

    struct docDetails {
        address owner;
        string docName;
        string docType;
        string docHash;
    }

    constructor(
        address _owner,
        string memory _docName,
        string memory _docHash,
        string memory _docType,
        string memory _aesEncryptedKey
    ) {
        doc = docDetails(_owner, _docName, _docType, _docHash);
        aesEncryptedKey = _aesEncryptedKey;
    }

    function getDocDetails() external view returns (docDetails memory) {
        return doc;
    }

    function getDocKey() external view returns (string memory) {
        return aesEncryptedKey;
    }

    function getSharedDocLocation(address _addr) public view returns (address) {
        require(shared[_addr], "Unauthorised, file is not shared");
        return sharedDocLocation[_addr];
    }

    function getShareRequestList()
        external
        view
        onlyOwner
        returns (address[] memory)
    {
        return shareRequest;
    }

    function unshareDoc(address _addr) public onlyOwner {
        require(shared[_addr], "Already the file is not been shared!");
        shared[_addr] = false;
    }

    function shareDoc(address _userRecAddr,string memory  _encryptedKey) external onlyOwner {
        DocumentShared newDocshared = new DocumentShared(doc.owner,_userRecAddr,doc.docName,doc.docHash,doc.docType,_encryptedKey);
        User usr = User(_userRecAddr);
        usr.addFileToSharedList(address(newDocshared));
        sharedDocLocation[_userRecAddr] = address(newDocshared);
    }
}
