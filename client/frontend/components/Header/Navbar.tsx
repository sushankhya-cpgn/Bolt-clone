import { FaDiscord, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { Box, Typography } from "@mui/material";

function Navbar({height=''}){
    const social_icon = [<FaDiscord/>,<FaLinkedin />, <FaSquareXTwitter/>];

    return(
      <Box display="flex" justifyContent="space-between" sx={{width:"100%",height:height,padding:2}} >
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
  