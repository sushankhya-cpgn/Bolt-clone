import { FaDiscord, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import React, { type FC } from "react";
import { Box, Typography } from "@mui/material";

function Navbar({height=''}){
    const social_icon = [<FaDiscord/>,<FaLinkedin />, <FaSquareXTwitter/>];

    // return (
    //   <div className={`flex w-full justify-between  h-${height}`}>
    //     <div className='w-10 '><img src='logo-text.svg' alt='logo' className=' invert'></img></div>
    //     <div className=' flex w-28 gap-3 mr-3'>
    //       {social_icon.map((icon,index)=>(
    //         <div className='m-2 text-xl text-gray-400' key={index}>{icon}</div>
    //       ))}
    //     </div>
    //   </div>
    // );
    return(
      <Box display="flex" justifyContent="space-between" sx={{width:"100%",height:height,marginTop:2,padding:1}} >
        <Box sx={{width:"50px"}}><img src='logo-text.svg' className=" invert" alt='logo' ></img></Box>
        <Box display="flex" gap="10px" marginRight="3px" >
        {social_icon.map((icon,index)=>(
            <Box margin="2" color="grey" key={index} ><Typography variant="h5" >{icon}</Typography>
            </Box>
       ))}
        </Box>
      </Box>
    );
  }

export default Navbar;
  