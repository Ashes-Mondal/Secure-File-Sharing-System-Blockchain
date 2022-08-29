import React, { useEffect, useState } from "react";
import { ethers, ContractFactory } from "ethers";
import { URL, Record_Contract_Address } from '../../config.json'
import { abi as RecordABI } from '../../../smart_contracts/artifacts/contracts/Record.sol/Record.json'
import { abi as UserABI } from '../../../smart_contracts/artifacts/contracts/User.sol/User.json'
import { abi as DocABI, bytecode as DocBytecode } from '../../../smart_contracts/artifacts/contracts/Document.sol/Document.json'
import { decryptAES_key, decrypt_and_download, generateRSAKeyPair, savePrivateKey } from "../utils/cryptography";
import Ipfs from "../utils/ipfs";
import { joinUINT8arrays } from "../utils/joinUint8arrays";
import { saveAs } from 'file-saver';
import CryptoJS from "crypto-js";
import { encode } from "base64-arraybuffer";



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

const deployDoc = async(ownerAddr, filename, ipfsHash, filetype, E_aeskey) => {
	const provider = new ethers.providers.Web3Provider(ethereum)
	const signer = provider.getSigner();
	const factory = new ContractFactory(DocABI, DocBytecode,signer);
	// If your contract requires constructor args, you can specify them here
	const contract = await factory.deploy(ownerAddr, filename, ipfsHash, filetype, E_aeskey);

	console.log(contract.address);
	console.log(contract.deployTransaction);
	return contract;
}


export const EthereumProvider = ({ children }) => {
	const [currentAccount, setCurrentAccount] = useState("");
	const [loggedIn, setLoggedIn] = useState(false);
	const [privateKey, setPrivateKey] = useState();
	const [publicKey, setPublicKey] = useState();
//0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
//QmZ1qChEVyWxgNdnazesKwM3swtqBgF2txuoJvAubPHPaz
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

					const doc = getDocContract('0x1ACcBD355245AbA93CE46D33ab1D0152CE33Fd00')
					const details = await doc.getDocDetails()
					const E_key = await doc.getDocKey()
					console.log(details);
					const asyncITR = await Ipfs.cat(details['docHash'])

					let bufferArr = []
					for await (const itr of asyncITR) { bufferArr = [...bufferArr, itr] }
					decrypt_and_download(details["docName"],joinUINT8arrays(bufferArr) ,await decryptAES_key(privateKey,E_key))
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
	const addFileToBlockChain = async (ipfsHash, file,encryptedKey) => {
		const filename = file.name;
		console.log(filename, ipfsHash, file.type);

		const docContract = await deployDoc(currentAccount,filename,ipfsHash,file.type,encryptedKey)
		console.log(docContract)

		const usr = getUserContract(currentAccount);
		await usr.shareFile(docContract.address)
	}

	useEffect(() => {
		checkIfWalletIsConnect();
	}, [privateKey]);

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
				addFileToBlockChain
			}}
		>
			{children}
		</EthereumContext.Provider>
	);
};
