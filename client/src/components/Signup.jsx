import { useContext, useState } from "react";
import { EthereumContext } from "../context/Ethereum";

const Login = () => {
	const { connectWallet, currentAccount, loggedIn, signUpHandler } = useContext(EthereumContext);
	const [username, setUsername] = useState()
	return (
		<div className="container">
			<div>
				<label className="block text-gray-700 text-xl text-center font-bold mb-2" htmlFor="username">
					SignUp:
				</label>
			</div>
			<div className="p-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
					Enter username:
				</label>
				<input
					onChange={(e) => setUsername(e.target.value)}
					disabled={!currentAccount}
					className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight border-black"
					id="username" type="text"
					placeholder="Username"
				/>
			</div>
			<div className="flex justify-center items-center m-auto w-64">
				<button
					onClick={()=>signUpHandler(username)}
					disabled={!currentAccount} 
					type="button"
					className="mb-5 rounded-full text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium w-full  text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				>
					SignUp
				</button>
			</div>
		</div>
	);
}

export default Login;