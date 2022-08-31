import rbjs from "random-bytes-js/lib";
import { useContext, useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { FaUpload } from "react-icons/fa";
import { EthereumContext } from "../context/Ethereum";
import { decryptAES_key, decrypt_and_download, encryptAES_key, generateAESKey, verifyKeyPair } from "../utils/cryptography";
import { ImageConfig } from '../utils/image';
import CryptoJS from "crypto-js";
import { decode } from "base64-arraybuffer";
import Ipfs from "../utils/ipfs.js";
import { saveAs } from "file-saver";

const formatBytes = (bytes, decimals = 2) => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function clearFileInput(ctrl) {
	try {
		ctrl.value = null;
	} catch (ex) { }
	if (ctrl.value) {
		ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
	}
}


const Upload = () => {
	const { currentAccount, privateKey, setPrivateKey, publicKey,addFileToBlockChain } = useContext(EthereumContext);
	const [file, setFile] = useState(null);
	const [buffer, setBuffer] = useState(null);
	const [aesKey, setAESKey] = useState();

	const fileRemove = () => {
		setFile(null);
	}

	const onFileChange = async (e) => {
		const newFile = e.target.files[0];
		if (newFile) {
			try {
				const key = await generateAESKey();
				var reader = new FileReader();
				reader.onload = () => {
					var wordArray = CryptoJS.lib.WordArray.create(reader.result);           // Convert: ArrayBuffer -> WordArray
					var encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();        // Encryption: I: WordArray -> O: -> Base64 encoded string (OpenSSL-format)

					const arraybuffer = decode(encrypted);
					setBuffer(arraybuffer)
					setAESKey(key)
					console.log(arraybuffer,key)
				};
				reader.readAsArrayBuffer(newFile);
				setFile(newFile)
			} catch (error) {
				console.error(error)
			}

		}
	}

	const onFileChange_privateKey = async (e) => {
		const newFile = e.target.files[0];
		const privatK = await newFile.text();
		const ans = await verifyKeyPair(privatK, publicKey);
		if (ans) {
			setPrivateKey(privatK);
		}
		else {
			alert("Invalid private key.")
			clearFileInput(document.getElementById("Private_file"))
		}
	}

	const onUpload = async () => {
		try {
			if (!buffer && !aesKey) {
				alert("Reupload file correctly!")
				return;
			}
			const encryptedKey = await encryptAES_key(publicKey,aesKey);
			const {path} = await Ipfs.add(buffer)
			console.log("ipfsHash:", path)
			await addFileToBlockChain(path,file,encryptedKey)
			setFile(null);
			setBuffer(null);
			setAESKey(null);
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div className="container">
			<div className="p-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
					Your Account Address:
				</label>
				<input disabled value={currentAccount} className="shadow appearance-none border rounded w-full py-2 px-3 border-black" id="address" type="text" placeholder="Address" />
			</div>
			{/* <div className="p-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
					Private Key:
				</label>
				<input accept=".pem" onChange={onFileChange_privateKey} className="shadow appearance-none border rounded w-full py-2 px-3 border-black" id="Private_file" type="file" placeholder="file" />
			</div> */}

			{!file &&
				(
					<div className="flex mb-4 justify-center">
						<div className="m-4 flex items-center justify-center w-full">
							<label
								className=" cursor-pointer flex flex-col w-full h-32 border-4 border-blue-200 border-dashed hover:bg-gray-100 hover:border-gray-300">
								<div className="flex flex-col items-center justify-center pt-7">
									<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
										fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
									</svg>
									<p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
										Attach a file</p>
								</div>
								<input type="file" id="Attached_file" className="opacity-0" onChange={onFileChange} />
							</label>
						</div>
					</div>
				)
			}

			{
				file && (
					<div className="flex justify-between drop-file-preview__item">
						<div className="flex">
							<img src={ImageConfig[file.type.split('/')[1]] || ImageConfig['default']} alt="" />
							<div className="drop-file-preview__item__info">
								<p>{file?.name}</p>
								<span className="text-sm text-gray-400">{formatBytes(file?.size)}</span>
							</div>
						</div>
						<div className="flex gap-5 items-center justify-center">
							<span className="cursor-pointer" onClick={onUpload}><FaUpload size={16} /></span>
							<span className="cursor-pointer" onClick={fileRemove}><AiOutlineCloseCircle size={16} /></span>
						</div>
					</div>
				)
			}
		</div>);
}

export default Upload;