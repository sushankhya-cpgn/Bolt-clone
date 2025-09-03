import Navbar from "../components/Header/Navbar";
import ChatArea from "../components/MainSection/chatArea";
import React from "react";

function ChatPage(){
    return (
        <div className=' flex flex-col p-4 h-screen  bg-slate-800'>
          <Navbar/>
          <ChatArea/>
        </div>
      )
}

export default ChatPage;