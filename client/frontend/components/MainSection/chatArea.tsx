import { useState } from "react";
import React from "react";


function ChatArea(){
    const [chat, setChat] = useState('');
    // chat [sendChat,setSendChat] = useState(0);
    return(
        <div className='flex-1 flex flex-col text-center px-4'>
      <h1 className=' text-4xl text-white'>What should we build today?</h1>
        <p className='text-white text-sm mt-2'>Create stunning apps & websites by chatting with AI.</p>
        <div className=' w-full flex justify-center  mt-4'>
        <form
  onSubmit={(e) => {
    e.preventDefault();
    // Trigger build logic here
  }}
  className="text-center flex justify-center relative w-96"
>
  <textarea
    className="w-full p-4 h-30 text-white focus:outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-sm border-2 rounded-2xl"
    placeholder="Type your idea and we'll build it together."
    value={chat}
    onChange={(e) => setChat(e.target.value)}
  />
  {chat && (
    <button
      type="submit"
      className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-xl"
    >
      Build
    </button>
  )}
</form>
</div>

      </div>
    );
}

export default ChatArea;