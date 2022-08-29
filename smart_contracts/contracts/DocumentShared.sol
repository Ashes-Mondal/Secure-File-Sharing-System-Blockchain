// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Document.sol";
import "./User.sol";

contract DocumentShared is Ownable {
    docDetails public doc;
    string aesEncryptedKey; //Encrypted using public key of sharedTo peer

    struct docDetails {
        address owner;
        address sharedTo;
        string docName;
        string docType;
        string docHash;
    }

    constructor(
        address _owner,
        address _sharedTo,
        string memory _docName,
        string memory _docHash,
        string memory _docType,
        string memory _aesEncryptedKey
    ) {
        doc = docDetails(_owner, _sharedTo, _docName, _docType, _docHash);
        aesEncryptedKey = _aesEncryptedKey;
    }

    function getDocDetails() external view returns (docDetails memory) {
        return doc;
    }

    function getAesEncryptedKey() external view returns (string memory) {
        return aesEncryptedKey;
    }
}
