import { useContext } from "react";
import { useEffect, useState } from "react"
import { FaUpload } from "react-icons/fa";
import { FaSistrix } from "react-icons/fa";
import SignUp from "./components/Signup";
import Search from "./components/Search";
import Upload from "./components/Uploads";
import { EthereumContext } from "./context/Ethereum";

const App = () => {
  const [tab, setTab] = useState(0)//{0:'uploads',1:'search'}
  const { connectWallet, currentAccount, loggedIn } = useContext(EthereumContext);

  return (
    <div className="app">
      <h1 className=" text-center text-2xl font-bold underline text-white">
        Secure File Sharing DAPP
      </h1>
      {!currentAccount &&
        (
          <div className="flex justify-center items-center ">
            <button onClick={connectWallet} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Connect to Wallet
            </button>
          </div>

        )
      }
      <main className="main">
        {loggedIn &&
          (
            <div className="flex gap-2 tab_container">
              <div className={`${tab == 0 ? "bg-indigo-500 underline" : ""}`} onClick={() => setTab(0)}>
                <FaUpload size={16} />
                Upload
              </div>
              <div className={`${tab == 1 ? "bg-indigo-500 underline" : ""}`} onClick={() => setTab(1)}>
                <FaSistrix size={16} />
                Search
              </div>
            </div>
          )
        }
        {!loggedIn && <SignUp />}
        {loggedIn && tab == 0 ? <Upload /> : null}
        {loggedIn && tab == 1 ? <Search /> : null}
      </main>
    </div>
  )
}

export default App
