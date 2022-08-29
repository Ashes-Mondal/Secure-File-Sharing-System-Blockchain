// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Ownable.sol";

contract User is Ownable {
    event publicKey(address indexed owner, string pubK);

    userDetails public user;
    address[] docSharedLocation;
    address[] docsSharedWithUser;
    mapping(address => sharedFile) docSharedByPeer;

    struct sharedFile {
        address owner;
        bool access;
    }

    struct userDetails {
        string name;
        string pubK;
    }

    constructor(string memory _name, string memory _pubK) {
        user = userDetails(_name, _pubK);
        emit publicKey(msg.sender, _pubK);
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
    function addFileToSharedList(address _docAddr) public {
        require(
            docSharedByPeer[_docAddr].owner == address(0),
            "Document already shared"
        );
        docsSharedWithUser.push(_docAddr);
        docSharedByPeer[_docAddr] = sharedFile(msg.sender, true);
    }

    function addFileAccess(address _docAddr) public {
        require(
            docSharedByPeer[_docAddr].owner != address(0),
            "No such document found"
        );
        require(
            msg.sender == docSharedByPeer[_docAddr].owner,
            "Invalid User,not allowed to access"
        );
        
        docSharedByPeer[_docAddr].access = true;
        bool flag = true;
        for(uint256 i = 0;i<docsSharedWithUser.length;i++){
            if(docsSharedWithUser[i] == _docAddr ){
                flag = false;
                break;
            }
        }
        if(flag)
        docsSharedWithUser.push(_docAddr);
    }

    function removeFileAccess(address _docAddr) public {
        require(
            docSharedByPeer[_docAddr].owner != address(0),
            "No such document found"
        );
        require(
            msg.sender == docSharedByPeer[_docAddr].owner,
            "Invalid User,not allowed to access"
        );
        for(uint256 i = 0;i<docsSharedWithUser.length;i++){
            if(docsSharedWithUser[i] == _docAddr ){
                delete docsSharedWithUser[i];
                break;
            }
        }
        docSharedByPeer[_docAddr].access = false;
    }
}
