import { useContext, useEffect, useState } from "react";
import { EthereumContext } from "../context/Ethereum";
import { verifyKeyPair } from "../utils/cryptography";
import noData from '../assets/noData.png'
import { ImageConfig } from "../utils/image";
import { ImDownload } from "react-icons/im";
import { FaRegShareSquare } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";



function clearFileInput(ctrl) {
	try {
		ctrl.value = null;
	} catch (ex) { }
	if (ctrl.value) {
		ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
	}
}

const File = ({ file, idx }) => {
	const { downloadFile, getUserRecord, currentAccount, shareTheFile ,userRecordAddress} = useContext(EthereumContext);
	const [openModal, setOpenModal] = useState(false);
	const [address, setAddress] = useState("");
	const [error, setError] = useState("");
	const [username, setUsername] = useState("");

	const shareHandler = async() => {
		console.log(file, idx)
		try {
			await shareTheFile(file["docAddress"],address)
		} catch (error) {
			console.error(error);
		}

	}

	useEffect(() => {
		async function func() {
			try {
				const usrDetails = await getUserRecord(address);
				setUsername(`*Account Holder : ${usrDetails.name}`)
				setError("")
			} catch (error) {
				setUsername(``)
				setError("*User does not exists")
				console.error(error.message)
			}
		}
		if (address && address === currentAccount) {
			setUsername(``)
			setError("*Your address is not allowed")
		}
		else if (address)
			func();
	}, [address])
	return (
		<>
			<div key={idx} className="flex justify-between drop-file-preview__item">
				<div className="flex">
					<img src={ImageConfig[file.docName.split('.')[1]] || ImageConfig['default']} alt="" />
					<div className="drop-file-preview__item__info">
						<p>{file?.docName}</p>
						<span className="text-sm text-gray-400">{file?.docHash}</span>
					</div>
				</div>
				<div className="flex gap-5 items-center justify-center">
					<button className="cursor-pointer" onClick={() => {
						setError("")
						setUsername("")
						setOpenModal(!openModal)
					}}>
						{openModal ? <AiOutlineClose size={16} /> : <FaRegShareSquare size={16} />}
					</button>
					<span className="cursor-pointer" ><ImDownload onClick={() => downloadFile(idx)} size={16} /></span>
				</div>
			</div>
			{error.length > 0 ? (
				<div className="text-right px-5 text-xs text-rose-700 font-bold">
					{error}
				</div>
			) : null}
			{username.length > 0 ? (
				<div className="text-right px-5 text-xs text-green-700 font-bold">
					{username}
				</div>
			) : null}
			{openModal &&
				(
					<div className="px-4 pb-4">
						<label className="block text-gray-700 text-sm font-bold " htmlFor="address">
							Enter Account address:
						</label>
						<div className="flex justify-center items-center gap-1">
							<input type="text" onChange={(e) => setAddress(e.target.value)} className="shadow appearance-none border rounded w-full py-1 px-3 border-black" id="address" placeholder="address" />
							<button disabled={error.length > 0} type="button" onClick={shareHandler} className="m-auto text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
								Share
							</button>
						</div>
					</div>
				)
			}
		</>
	)
}

const Files = () => {
	const { setPrivateKey, publicKey, getAllFilesSharedByClients, allFilesSharedByClient } = useContext(EthereumContext);
	const [displayList, setDisplayList] = useState(allFilesSharedByClient);
	const [search, setSearch] = useState();


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

	const searchHandler = () => {
		setDisplayList(allFilesSharedByClient.filter((item) => {
			if (item["docName"].toLowerCase().includes(search.toLowerCase())) {
				return true;
			} else if (item["docType"].toLowerCase().includes(search.toLowerCase())) {
				return true;
			}
			return false;
		}));
	}
	useEffect(() => {
		getAllFilesSharedByClients().then().catch(err => console.error(err))
		setDisplayList(allFilesSharedByClient)
	}, [])

	useEffect(() => {
		setDisplayList(allFilesSharedByClient)
	}, [allFilesSharedByClient])

	return (
		<div className="container">
			<div className="p-4">
				<label className="block text-gray-700 text-sm font-bold" htmlFor="address">
					Private Key:
				</label>
				<input accept=".pem" onChange={onFileChange_privateKey} className="shadow appearance-none border rounded w-full py-2 px-3 border-black" id="Private_file" type="file" placeholder="file" />
			</div>
			<div className="p-4">
				<label className="block text-gray-700 text-sm font-bold " htmlFor="address">
					Search:
				</label>
				<div className="flex justify-center items-center gap-1">
					<input type="text" onChange={(e) => setSearch(e.target.value)} className="shadow appearance-none border rounded w-full py-1 px-3 border-black" id="search" placeholder="Search" />
					<button type="button" onClick={searchHandler} className="m-auto text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
						Search
					</button>
				</div>
			</div>
			{displayList.length === 0 &&
				(
					<div>
						<img src={noData} width={150} className="m-auto" />
						<div className="text-center p-2 font-bold ">No Files Uploaded</div>
					</div>
				)
			}
			{
				displayList.map((file, idx) => <File file={file} key={idx} idx={idx} />)
			}
		</div >
	);
}

export default Files;