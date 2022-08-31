// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Document.sol";
import "./User.sol";

contract DocumentShared {
    docDetails public doc;
    string aesEncryptedKey; //Encrypted using public key of sharedTo peer

    struct docDetails {
        address ownerRecordAddress;
        address sharedToRecordAddress;
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

    function setEncryptionKey(string memory _aesEncryptedKey) public {
        require(
            doc.ownerRecordAddress == msg.sender || doc.sharedToRecordAddress == msg.sender ,
            "Failed to set encryptedKey"
        );
        aesEncryptedKey = _aesEncryptedKey;
    }
}
