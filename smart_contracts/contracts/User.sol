// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Ownable.sol";
import "./DocumentShared.sol";

contract User is Ownable {
    event publicKey(address indexed owner, string pubK);

    userDetails public user;
    address[] docSharedLocation;
    address[] docsSharedWithUser;
    mapping(address => sharedFile) docSharedByPeer; //mapping(sharedFileLocation => sharedFile)

    struct sharedFile {
        address fileOwnerRecordAddress;
        bool access;
    }

    struct userDetails {
        string name;
        string pubK;
    }

    constructor(
        string memory _name,
        string memory _pubK,
        address _owner
    ) Ownable(_owner) {
        user = userDetails(_name, _pubK);
        emit publicKey(_owner, _pubK);
    }

    function getUserDetails() external view returns (userDetails memory) {
        return user;
    }

    function getUserPubK() external view returns (string memory) {
        return user.pubK;
    }

    //Only owner can access these methods
    function updatePubK(string memory _pubK) public onlyOwner {
        user.pubK = _pubK;
    }

    function shareFile(address _docAddr) external onlyOwner {
        docSharedLocation.push(_docAddr);
    }

    function getAllSharedFiles()
        external
        view
        onlyOwner
        returns (address[] memory)
    {
        return docSharedLocation;
    }

    function getAllSharedFilesByPeers()
        external
        view
        onlyOwner
        returns (address[] memory)
    {
        return docsSharedWithUser;
    }

    //File Sharing methods <--- For Peers to access
    function addFileToSharedList(
        address _docAddr,
        address _docOwnerRecordAddress
    ) public {
        require(
            docSharedByPeer[_docAddr].fileOwnerRecordAddress == address(0),
            "Document already shared"
        );
        docsSharedWithUser.push(_docAddr);
        docSharedByPeer[_docAddr] = sharedFile(_docOwnerRecordAddress, true);
    }

    function addFileAccess(
        address _docAddr,
        address _docOwnerRecordAddress,
        string memory _peerEncryptedKey
    ) public {
        require(
            docSharedByPeer[_docAddr].fileOwnerRecordAddress != address(0),
            "No such document found"
        );
        require(
            _docOwnerRecordAddress ==
                docSharedByPeer[_docAddr].fileOwnerRecordAddress,
            "Invalid User,not allowed to access"
        );

        docSharedByPeer[_docAddr].access = true;
        bool flag = true;
        for (uint256 i = 0; i < docsSharedWithUser.length; i++) {
            if (docsSharedWithUser[i] == _docAddr) {
                flag = false;
                break;
            }
        }
        if (flag) {
            DocumentShared docShared = DocumentShared(_docAddr);
            docShared.setEncryptionKey(_peerEncryptedKey);
            bool flag2 = true;
            for (uint256 i = 0; i < docsSharedWithUser.length; i++) {
                if (docsSharedWithUser[i] == address(0)) {
                    docsSharedWithUser[i] = _docAddr;
                    flag2 = false;
                    break;
                }
            }
            if(flag2)
                docsSharedWithUser.push(_docAddr);
        }
    }

    function removeFileAccess(address _docAddr, address _docOwnerRecordAddress)
        public
    {
        require(
            docSharedByPeer[_docAddr].fileOwnerRecordAddress != address(0),
            "No such document found"
        );
        require(
            _docOwnerRecordAddress ==
                docSharedByPeer[_docAddr].fileOwnerRecordAddress,
            "Invalid User,not allowed to access"
        );
        for (uint256 i = 0; i < docsSharedWithUser.length; i++) {
            if (docsSharedWithUser[i] == _docAddr) {
                delete docsSharedWithUser[i];
                break;
            }
        }
        DocumentShared docShared = DocumentShared(_docAddr);
        docShared.setEncryptionKey("");
        docSharedByPeer[_docAddr].access = false;
    }
}
