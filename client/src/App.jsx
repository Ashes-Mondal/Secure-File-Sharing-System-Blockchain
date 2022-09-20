import { useContext } from "react";
import { useEffect, useState } from "react"
import { FaUpload } from "react-icons/fa";
import { FaSistrix } from "react-icons/fa";
import { AiOutlineFileText } from "react-icons/ai";
import SignUp from "./components/Signup";
import Search from "./components/Search";
import Upload from "./components/Uploads";
import File from "./components/Files";
import SharedList from "./components/SharedList";
import { EthereumContext } from "./context/Ethereum";
import { BsPeopleFill } from "react-icons/bs";
import PeerFiles from "./components/PeerFiles";
import { RiShareForward2Fill } from "react-icons/ri";

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
                <AiOutlineFileText size={16} />
                My files
              </div>
              <div className={`${tab == 2 ? "bg-indigo-500 underline" : ""}`} onClick={() => setTab(2)}>
                <BsPeopleFill size={16} />
                Shared with me
              </div>
              <div className={`${tab == 3 ? "bg-indigo-500 underline" : ""}`} onClick={() => setTab(3)}>
                <RiShareForward2Fill size={20} />
                Shared by me
              </div>
              {/* <div className={`${tab == 4 ? "bg-indigo-500 underline" : ""}`} onClick={() => setTab(4)}>
                <FaSistrix size={16} />
                Search
              </div> */}
            </div>
          )
        }
        {!loggedIn && <SignUp />}
        {loggedIn && tab == 0 ? <Upload /> : null}
        {loggedIn && tab == 1 ? <File /> : null}
        {loggedIn && tab == 2 ? <PeerFiles /> : null}
        {loggedIn && tab == 3 ? <SharedList /> : null}
        {/* {loggedIn && tab == 4 ? <Search /> : null} */}
      </main>
    </div>
  )
}

export default App
