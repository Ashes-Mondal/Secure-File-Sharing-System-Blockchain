import React, { useEffect, useState } from "react";
import { ethers, ContractFactory } from "ethers";
import { URL, Record_Contract_Address } from '../../config.json'
import { abi as RecordABI } from '../../../smart_contracts/artifacts/contracts/Record.sol/Record.json'
import { abi as UserABI } from '../../../smart_contracts/artifacts/contracts/User.sol/User.json'
import { abi as DocABI, bytecode as DocBytecode } from '../../../smart_contracts/artifacts/contracts/Document.sol/Document.json'
import { abi as DocSharedABI } from '../../../smart_contracts/artifacts/contracts/DocumentShared.sol/DocumentShared.json'
import { decryptAES_key, decrypt_and_download, encryptAES_key, generateRSAKeyPair, savePrivateKey } from "../utils/cryptography";
import Ipfs from "../utils/ipfs";
import { joinUINT8arrays } from "../utils/joinUint8arrays";

const { ethereum } = window;

export const EthereumContext = React.createContext();

const getRecordContract = () => {
	// const provider = new ethers.providers.JsonRpcProvider(URL);
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner();
	const contract = new ethers.Contract(Record_Contract_Address, RecordABI, signer)
	return contract;
}

const getUserContract = (addr) => {
	// const provider = new ethers.providers.JsonRpcProvider(URL);
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner();
	const contract = new ethers.Contract(addr, UserABI, signer)
	return contract;
}

const getDocContract = (addr) => {
	// const provider = new ethers.providers.JsonRpcProvider(URL);
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner();
	const contract = new ethers.Contract(addr, DocABI, signer)
	return contract;
}

const getDocSharedContract = (addr) => {
	// const provider = new ethers.providers.JsonRpcProvider(URL);
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner();
	const contract = new ethers.Contract(addr, DocSharedABI, signer)
	return contract;
}

const deployDoc = async (ownerAddr, filename, ipfsHash, filetype, E_aeskey) => {
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner();
	const factory = new ContractFactory(DocABI, DocBytecode, signer);
	// If your contract requires constructor args, you can specify them here
	const contract = await factory.deploy(ownerAddr, filename, ipfsHash, filetype, E_aeskey);
	return contract;
}


export const EthereumProvider = ({ children }) => {
	const [currentAccount, setCurrentAccount] = useState("");
	const [userRecordAddress, setUserRecordAddress] = useState();
	const [loggedIn, setLoggedIn] = useState(false);
	const [privateKey, setPrivateKey] = useState();
	const [publicKey, setPublicKey] = useState();
	const [allFilesSharedByClient, setAllFilesSharedByClient] = useState([]);
	const [allFilesSharedToClient, setAllFilesSharedToClient] = useState([]);


	const checkIfWalletIsConnect = async () => {
		try {
			if (!ethereum) return alert("Please install MetaMask.");
			const accounts = await ethereum.request({ method: "eth_accounts" });
			if (accounts.length) {
				setCurrentAccount(accounts[0]);
				const record = getRecordContract();
				const isUserExist = await record.isUserExist();
				console.log("isUserExist", isUserExist)
				if (!isUserExist) {
					alert("Your account is not registered, Sign Up to continue.");
				} else {
					setLoggedIn(true);
					const userRecordAddress = await record.getUserRecord(accounts[0]);
					const user = getUserContract(userRecordAddress);
					const publicK = await user.getUserPubK();
					setPublicKey(publicK)
					const recAddress = await record.getUserRecord(accounts[0]);
					setUserRecordAddress(recAddress)
				}
			} else {
				console.log("No accounts found");
			}
		} catch (error) {
			console.error(error);
		}
	};

	//! CONNECT TO METAMASK WALLET
	const connectWallet = async () => {
		try {
			if (!ethereum) return alert("Please install MetaMask.");
			const accounts = await ethereum.request({ method: "eth_requestAccounts", });
			setCurrentAccount(accounts[0]);
			window.location.reload();
		} catch (error) {
			console.log(error);
			throw new Error("No ethereum object");
		}
	};

	//! SIGNUP HANDLER
	const signUpHandler = async (username) => {
		try {
			if (!ethereum) return alert("Please install MetaMask.");
			if (!username) return alert("Please fill the form");
			const [privateKey, publicKey] = await generateRSAKeyPair();

			const record = getRecordContract();
			const res = await record.signUp(username, publicKey);
			const transactionReceipt = await res.wait()
			const event = transactionReceipt.events.find(event => event.event === 'registered');
			const [accountAddress, userContractAddress] = event.args

			await savePrivateKey(currentAccount, privateKey)
			console.log("accountAddress:", accountAddress);
			console.log("userContractAddress:", userContractAddress);

			alert("Important Note: do not lose this private key,if lost cannot access your account forever!")
			window.location.reload();
		} catch (error) {
			console.error(error);
		}
	}

	//! UPLOAD FILE DETAILS TO BLOCKCHAIN 
	const addFileToBlockChain = async (ipfsHash, file, encryptedKey) => {
		const filename = file.name;
		console.log(filename, ipfsHash, file.type);

		const docContract = await deployDoc(userRecordAddress, filename, ipfsHash, file.type, encryptedKey)
		// console.log(docContract)

		const usr = getUserContract(userRecordAddress);
		await usr.shareFile(docContract.address)
	}

	//!GET ALL FILES SHARED BY THE CLIENT
	const getAllFilesSharedByClients = async () => {
		const usr = getUserContract(userRecordAddress);
		const res = await usr.getAllSharedFiles();
		let allFilesDetails = [];
		for (let i = 0; i < res?.length; i++) {
			if(res[i] == '0x0000000000000000000000000000000000000000')continue;
			let obj = {"docAddress":res[i]}
			const doc = getDocContract(res[i]);
			const docDetails = await doc.getDocDetails()
			const docEncryptedKey = await doc.getDocKey()
			obj.docHash = docDetails.docHash;
			obj.docName = docDetails.docName;
			obj.docType = docDetails.docType;
			obj.ownerRecord = docDetails.ownerRecordAddress;
			obj.account = docDetails.ownerAccountAddress;
			obj.encryptedkey = await docEncryptedKey
			allFilesDetails.push(obj);
		}
		setAllFilesSharedByClient(allFilesDetails);
	}

	//!GET ALL FILES SHARED TO THE Client
	const getAllFilesSharedToClients = async () => {
		const usr = getUserContract(userRecordAddress);
		const res = await usr.getAllSharedFilesByPeers();
		let allFilesDetails = [];
		for (let i = 0; i < res?.length; i++) {
			if(res[i] == '0x0000000000000000000000000000000000000000')continue;
			let obj = {"docAddress":res[i]}
			const doc = getDocSharedContract(res[i]);
			const docDetails = await doc.getDocDetails()
			const docEncryptedKey = await doc.getAesEncryptedKey()
			obj.docHash = docDetails.docHash;
			obj.docName = docDetails.docName;
			obj.docType = docDetails.docType;
			obj.ownerRecord = docDetails.owner;
			obj.shareedToRecord = docDetails.sharedTo;
			obj.encryptedkey = await docEncryptedKey
			allFilesDetails.push(obj);
		}
		setAllFilesSharedToClient(allFilesDetails);
	}


	//!DOWNLOAD FILE
	const downloadFile = async (idx,sharedWithPeer = 0) => {
		if (!privateKey) {
			alert("Provide private key to download");
			return;
		}
		const details = sharedWithPeer?allFilesSharedToClient[idx]:allFilesSharedByClient[idx];
		// console.log(details);
		const asyncITR = await Ipfs.cat(details['docHash'])

		let bufferArr = []
		for await (const itr of asyncITR) { bufferArr = [...bufferArr, itr] }
		decrypt_and_download(details["docName"], joinUINT8arrays(bufferArr), await decryptAES_key(privateKey, details["encryptedkey"]))
	}

	//!GET USER RECORD
	const getUserRecord = async (address)=>{
		const record = getRecordContract();
		const usrRecordAddress = await record.getUserRecord(address);
		const usrDetails = await getUserContract(usrRecordAddress) ;
		return await usrDetails.getUserDetails();
	}

	//!SHARE A FILE
	const shareTheFile = async(docAddress,peerAccountAddress)=>{
		if(!privateKey || privateKey.length == 0){
			alert("Give Private key to share the file")
			return;
		}
		const rec = getRecordContract();
		const peerRecordAddress = await rec.getUserRecord(peerAccountAddress);
		const usr = getUserContract(peerRecordAddress);
		const peerPublicKey = await usr.getUserPubK();
		const doc = getDocContract(docAddress);
		const encryptedKey =  encryptAES_key(peerPublicKey,await decryptAES_key(privateKey, await doc.getDocKey())) ;
		await doc.shareDoc(peerRecordAddress,encryptedKey);
	}

	//!UNSHARE THE FILE
	const unshareTheFile = async(docAddress,peerAccountAddress)=>{
		const doc = getDocContract(docAddress);
		const rec = getRecordContract();
		const peerRecordAddress = await rec.getUserRecord(peerAccountAddress);
		console.log(peerRecordAddress,docAddress)
		await doc.unshareDoc(peerRecordAddress);
	}

	//!GET ALL FILE USERS SHARED BY THE CLIENT
	const getAllFilesUsersSharedByClients = async () => {
		const usr = getUserContract(userRecordAddress);
		const res = await usr.getAllSharedFiles();
		let allFileUsersDetails = [];
		for (let i = 0; i < res?.length; i++) {
			if(res[i] == '0x0000000000000000000000000000000000000000')continue;
			let obj = {"docAddress":res[i]}
			const doc = getDocContract(res[i]);
			const docDetails = await doc.getDocDetails();
			obj.docHash = docDetails.docHash;
			obj.docName = docDetails.docName;
			obj.docType = docDetails.docType;
			obj.ownerRecord = docDetails.ownerRecordAddress;
			obj.account = docDetails.ownerAccountAddress;
			obj.sharedTo = []
			const docSharedTo = await doc.getSharedToList();
			if(docSharedTo.length === 0)continue;
			// console.log(obj,docSharedTo)
			for(let j = 0;j<docSharedTo.length;j++){
				if(docSharedTo[j] === '0x0000000000000000000000000000000000000000')continue;
				const sharedUsr = getUserContract(docSharedTo[j]);
				const sharedUsrDetails = await sharedUsr.getUserDetails();
				const peerAccountAddress = await sharedUsr.getOwner();
				obj.sharedTo.push({
					"name":sharedUsrDetails["name"],
					"peerAccountAddress":peerAccountAddress
				})
			}
			if(obj.sharedTo.length)
				allFileUsersDetails.push(obj);
		}
		return allFileUsersDetails;
	}

	useEffect(() => {
		checkIfWalletIsConnect();
	}, []);

	return (
		<EthereumContext.Provider
			value={{
				connectWallet,
				currentAccount,
				loggedIn,
				signUpHandler,
				privateKey,
				publicKey,
				setPrivateKey,
				addFileToBlockChain,
				getAllFilesSharedByClients,
				allFilesSharedByClient,
				downloadFile,
				getAllFilesSharedToClients,
				allFilesSharedToClient,
				getUserRecord,
				shareTheFile,
				unshareTheFile,
				getAllFilesUsersSharedByClients,
			}}
		>
			{children}
		</EthereumContext.Provider>
	);
};
