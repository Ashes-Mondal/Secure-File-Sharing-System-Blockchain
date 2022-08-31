import { useContext, useEffect, useState } from "react";
import { EthereumContext } from "../context/Ethereum";
import { ImageConfig } from "../utils/image";
import { AiFillCaretDown } from "react-icons/ai";
import { AiOutlineClose } from "react-icons/ai";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import noData from '../assets/noData.png'

const User = ({ user, docAddress }) => {
	const { unshareTheFile } = useContext(EthereumContext);
	return (
		<div className="flex justify-between usr-preview__item bg-yellow-100">
			<div className="flex">
				<div className="drop-file-preview__item__info">
					<p><span className="font-bold">Name: </span>{user["name"]}</p>
					<span className="text-sm text-gray-400">
						<span className="font-bold">Account: </span>
						{user["peerAccountAddress"]}
					</span>
				</div>
			</div>
			<div className="flex gap-5 items-center justify-center">
				<span className="cursor-pointer" onClick={async () => await unshareTheFile(docAddress, user["peerAccountAddress"])}><IoMdRemoveCircleOutline size={16} /> </span>
			</div>
		</div>
	)
}

const File = ({ file }) => {
	const [open, setOpen] = useState(false)
	return (
		<>
			<div className="flex justify-between drop-file-preview__item">
				<div className="flex">
					<img src={ImageConfig[file.docName.split('.')[1]] || ImageConfig['default']} alt="" />
					<div className="drop-file-preview__item__info">
						<p>{file?.docName}</p>
						<span className="text-sm text-gray-400">{file?.docHash}</span>
					</div>
				</div>
				<div className="flex gap-5 items-center justify-center">
					<span className="cursor-pointer" onClick={() => setOpen(!open)}>{open ? <AiOutlineClose size={16} /> : <AiFillCaretDown size={16} />}</span>
				</div>
			</div>
			{
				open && file["sharedTo"].map((usr, idx) => <User key={idx} user={usr} docAddress={file["docAddress"]} />)
			}
		</>
	)
}

const SharedList = () => {
	const { getAllFilesUsersSharedByClients } = useContext(EthereumContext);
	const [list, setList] = useState([]);

	useEffect(() => {
		getAllFilesUsersSharedByClients().then(resp => {
			setList(resp);
			console.log(resp);
		})
			.catch(error => console.error(error))
	}, [])

	return (
		<div className="container">
			{
				list.length === 0 &&
				(
					<div>
						<img src={noData} width={150} className="m-auto" />
						<div className="text-center p-2 font-bold ">No Files Shared</div>
					</div>
				)
			}
			{
				list.map((details, idx) => <File key={idx} file={details} />)
			}
		</div>
	);
}

export default SharedList;