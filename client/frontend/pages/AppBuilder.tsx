import Navbar from "../components/Header/Navbar";
import OutlinedCard from "../components/Card/card"
import React, { useEffect, useState } from 'react';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Alert, AlertTitle, Box, ButtonGroup, Grid, TextareaAutosize } from "@mui/material";
import { IoMdArrowForward } from "react-icons/io";
import FileExplorer from "../components/FileExplorer/FileExplorer";
import { Editor } from "@monaco-editor/react";





function AppBuilder({ height = "100vh" }) {
  const [chatSubmitted, setChatSubmitted] = useState(false);

  // async function init() {
  //   const 
  // }

  // useEffect(() => {
  //   init();
  // }, []);

const card = (
  <React.Fragment>
    <CardContent >
    
        <Typography gutterBottom color="white" variant="body1">
            Build a todoApp
        </Typography>
          <Alert variant="filled" severity="warning"  sx={{color:'warning.main',borderRadius:'10px', bgcolor:'rgb(59, 49, 35)'}}>
          <Grid container spacing={2}>
            <Grid size={8}>
         
          <AlertTitle sx={{color:'warning.main', fontWeight:'bold'}}>Error</AlertTitle>
          <Typography  color="grey" variant="subtitle2">You cancelled this message</Typography>
        </Grid>
         <Grid size={4}>
            <Button  variant="contained" color="warning" size="small">Retry</Button>
        </Grid>
        </Grid>
        </Alert>
       
  </CardContent>
  </React.Fragment>
);
  function handleChatSubmit() {
    setChatSubmitted(true);
  }
  return (
    <Box display="flex" flexDirection="column" height={height} bgcolor='black'>
      <Navbar />

      {/* Main section */}
      <Box display="flex" height={height}  gap={4} mt={2}>
        {/* Left section */}
        <Box  display="flex"  flexDirection='column'  sx={{width:'40%'}}>
            <Box display="flex" justifyContent='end'>
          <OutlinedCard
            sx={{
              borderRadius: "8px",
              width: "340px",
              backgroundColor: "rgb(38, 38, 38)",
            }} card={card}
          >
          
          </OutlinedCard>
          </Box>
            <Box display="flex" sx={{height:'100%',width:'100%',margin:"12px"}} alignItems="end" >
      <Box sx={{position:"relative",width:"100%"}}>
     <TextareaAutosize
    minRows={4}
    maxRows={12}
    aria-label="maximum height"
    placeholder="Type your text..."
    defaultValue="Lorem ipsum dolor sit amet..."
    style={{
      width: '100%',      // ensures it fills the parent
      padding: '12px',     // optional for spacing
      boxSizing: 'border-box', // ensures padding doesn't break width
      borderRadius: '4px',
      backgroundColor: 'rgb(38, 38, 38)',
      color: 'white',
      border: '1px solid grey'
    }}
  />

  <Button  variant="contained" sx={{position:'absolute', right:4, top:4}} onClick={handleChatSubmit}><IoMdArrowForward/>
  </Button>
  </Box>
        </Box>

        </Box>
      
        {/* Middle section */}
        <Box  display="flex"  flexDirection="column"   bgcolor="rgb(23, 23, 23)" width="100%" borderRadius="10px">
          <Box display="flex" justifyContent="flex-start" padding={2}>
            <ButtonGroup>
              <Button >Code</Button>
              <Button>Preview</Button>
            </ButtonGroup>
          </Box>
          {chatSubmitted ?   <Box display={"flex"} height="100%" >
         <FileExplorer/>

        <Box sx={{ flex: 1, overflow: "hidden" }}>
  <Editor

    defaultLanguage="javascript"
    defaultValue="// some comment"
    theme="vs-dark"
    options={{ minimap: { enabled: false }, wordWrap: "on" }}
  />
</Box>

          </Box>
          : <Box display="flex" justifyContent="center" alignItems="center" height="100%" >
  <Typography variant="body1" sx={{ color: "gray" }}>
    Your code will appear here
  </Typography>
        
        </Box>}
        </Box>
      </Box>
    </Box>
  );
}
export default AppBuilder;