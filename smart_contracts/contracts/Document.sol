// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Ownable.sol";
import "./User.sol";
import "./DocumentShared.sol";

contract Document is Ownable(msg.sender) {
    docDetails public doc;
    string public aesEncryptedKey; //Encrypted using public key of owner

    address[] docSharedTo;//Stores sharedPeerRecordAddress
    mapping(address => docSharedDetails) sharing; //mapping(sharedPeerRecordAddress => docSharedDetails)

    struct docSharedDetails {
        address location;
        bool access;
    }

    struct docDetails {
        address ownerAccountAddress;
        address ownerRecordAddress;
        string docName;
        string docType;
        string docHash;
    }

    constructor(
        address ownerRecordAddress,
        string memory _docName,
        string memory _docHash,
        string memory _docType,
        string memory _aesEncryptedKey
    ) {
        doc = docDetails(
            msg.sender,
            ownerRecordAddress,
            _docName,
            _docType,
            _docHash
        );
        aesEncryptedKey = _aesEncryptedKey;
    }

    function getDocDetails() external view returns (docDetails memory) {
        return doc;
    }

    function getDocKey() external view onlyOwner returns (string memory) {
        return aesEncryptedKey;
    }

    function getSharedToList() external view onlyOwner returns(address[] memory){
        return docSharedTo;
    }

    function doesPeerHasAccessRight(address _peerRecAddress) external view onlyOwner returns(bool){
        return sharing[_peerRecAddress].access;
    }

    //Sharing methods
    function getSharedDocLocation(address _userRecAddr)
        external
        view
        returns (address)
    {
        require(
            sharing[_userRecAddr].location != address(0) &&
                sharing[_userRecAddr].access,
            "Unauthorised, file is not shared"
        );
        return sharing[_userRecAddr].location;
    }

    function unshareDoc(address _userRecAddr) public onlyOwner {
        require(
            sharing[_userRecAddr].location != address(0),
            "Already the file is not been shared!"
        );
        User usr = User(_userRecAddr);
        usr.removeFileAccess(
            sharing[_userRecAddr].location,
            doc.ownerRecordAddress
        );
        sharing[_userRecAddr].access = false;
        for (uint256 i = 0; i < docSharedTo.length; i++) {
            if (docSharedTo[i] == _userRecAddr) {
                delete docSharedTo[i];
                break;
            }
        }
    }

    function shareDoc(address _userRecAddr, string memory _encryptedKey)
        external
        onlyOwner
    {
        User usr = User(_userRecAddr);
        if (sharing[_userRecAddr].location == address(0)) {
            DocumentShared newDocshared = new DocumentShared(
                doc.ownerRecordAddress,
                _userRecAddr,
                doc.docName,
                doc.docHash,
                doc.docType,
                _encryptedKey
            );
            sharing[_userRecAddr] = docSharedDetails(
                address(newDocshared),
                true
            );
            usr.addFileToSharedList(
                address(newDocshared),
                doc.ownerRecordAddress
            );
        } else {
            require(sharing[_userRecAddr].access == false,"Already access given");
            usr.addFileAccess(
                sharing[_userRecAddr].location,
                doc.ownerRecordAddress,
                _encryptedKey
            );
        }
        docSharedTo.push(_userRecAddr);
    }
}
