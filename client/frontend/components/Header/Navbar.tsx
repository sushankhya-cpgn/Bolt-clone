import { FaDiscord, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import React, { type FC } from "react";

function Navbar({height=''}){
    const social_icon = [<FaDiscord/>,<FaLinkedin />, <FaSquareXTwitter/>];

    return (
      <div className={`flex w-full justify-between  h-${height}`}>
        <div className='w-10 '><img src='logo-text.svg' alt='logo' className=' invert'></img></div>
        <div className=' flex w-28 gap-3 mr-3'>
          {social_icon.map((icon,index)=>(
            <div className='m-2 text-xl text-gray-400' key={index}>{icon}</div>
          ))}
        </div>
      </div>
    );
  }

export default Navbar;
  