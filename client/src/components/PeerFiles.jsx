import { useContext, useEffect, useState } from "react";
import { EthereumContext } from "../context/Ethereum";
import { verifyKeyPair } from "../utils/cryptography";
import noData from '../assets/noData.png'
import { ImageConfig } from "../utils/image";
import { ImDownload } from "react-icons/im";

function clearFileInput(ctrl) {
	try {
		ctrl.value = null;
	} catch (ex) { }
	if (ctrl.value) {
		ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
	}
}

const PeerFiles = () => {
	const { downloadFile, setPrivateKey, publicKey, getAllFilesSharedToClients, allFilesSharedToClient } = useContext(EthereumContext);
	const [displayList, setDisplayList] = useState(allFilesSharedToClient);
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
			setPrivateKey(null);
			clearFileInput(document.getElementById("Private_file"))
		}
	}

	const searchHandler = () => {
		setDisplayList(allFilesSharedToClient.filter((item) => {
			if (item["docName"].toLowerCase().includes(search.toLowerCase())) {
				return true;
			} else if (item["docType"].toLowerCase().includes(search.toLowerCase())) {
				return true;
			}
			return false;
		}));
	}
	useEffect(() => {
		getAllFilesSharedToClients().then().catch(err => console.error(err))
		setDisplayList(allFilesSharedToClient)
	}, [])

	useEffect(() => {
		setDisplayList(allFilesSharedToClient)
	}, [allFilesSharedToClient])

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
						<div className="text-center p-2 font-bold ">No Files to you</div>
					</div>
				)
			}
			{
				displayList.map((file, idx) => {
					return (
						<div key={idx} className="flex justify-between drop-file-preview__item">
							<div className="flex">
								<img src={ImageConfig[file.docName.split('.')[1]] || ImageConfig['default']} alt="" />
								<div className="drop-file-preview__item__info">
									<p>{file?.docName}</p>
									<span className="text-sm text-gray-400">{file?.docHash}</span>
								</div>
							</div>
							<div className="flex gap-5 items-center justify-center">
								<span className="cursor-pointer" ><ImDownload onClick={async() => await downloadFile(idx,1)} size={16} /></span>
							</div>
						</div>
					)
				})
			}
		</div>
	);
}

export default PeerFiles;