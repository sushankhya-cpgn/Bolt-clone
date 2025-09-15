import Navbar from "../components/Header/Navbar";
import OutlinedCard from "../components/Card/card"
import React, { useEffect, useState } from 'react';
import parseStepFromXML from "../utils/parseStepFromXML"
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Alert, AlertTitle, Box, ButtonGroup, Grid, TextareaAutosize } from "@mui/material";
import { IoMdArrowForward } from "react-icons/io";
import FileExplorer from "../components/FileExplorer/FileExplorer";
import convertToTree from "../utils/fileTreeConverter";
import { Editor } from "@monaco-editor/react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import type { List, Node } from "../type/ListType";
import {StepType, type Step } from "../type/StepType";
import { useWebcontainer } from "../src/hooks/useWebcontainer";



const API_URL = 'http://localhost:8000';


function AppBuilder({ height = "100vh" }) {
  const location = useLocation();
  const [chatSubmitted, setChatSubmitted] = useState(false);
  const {prompt} = location.state || {};
  const [template, setTemplate] = useState([]);
  const [selectedFile, setSelectedFile] = useState<Node|null>(null);
  // const [output, setOutput] = useState<string>("");
  const[data,setData] = useState([{}]);
  const[errroMsg,setErrorMsg] = useState("");
  console.log("Prompt:", prompt);

  const [steps,setSteps] = useState([{}]);
  const {webcontainer,output} = useWebcontainer();
  // Step 1: Send the prompt to the backend and get the template

//   async function runSelectedFile() {
  
// }

 async function init() {
  try {
    // 1. First request → /template
    const response = await axios.post(`${API_URL}/template`, {
      prompt
    });

    const newtemplate = response.data?.prompts || [];
    setTemplate(newtemplate);
    console.log("Template:", newtemplate);

    // const generated_steps = parseStepFromXML(newtemplate[1] || "");
    // setSteps(generated_steps.map((step: Step) => ({ ...step, status: "completed" })));

    // 2. Second request → /chat
    const response2 = await axios.post(`${API_URL}/chat`, {
      prompts: [...newtemplate, prompt]
    });

    console.log("Response from /chat:", response2.data);
    const generated_steps = parseStepFromXML(response2.data.message || "");
    setSteps(generated_steps.map((step: Step) => ({ ...step, status: "completed" })));

    const editor_data = convertToTree(generated_steps || []);
    setData(editor_data);
//     const files = {
//   'package.json': {
//     file: {
//       contents: `
//         {
//           "name": "vite-starter",
//           "private": true,
//           "version": "0.0.0",
//           "type": "module",
//           "scripts": {
//             "dev": "vite",
//             "build": "vite build",
//             "preview": "vite preview"
//           },
//           "devDependencies": {
//             "vite": "^4.0.4"
//           }
//         }`,
//     },
//   },
//   'index.html': {
//     file: {
//       contents: `
//         <!DOCTYPE html>
//         <html lang="en">
//           <head>
//             <meta charset="UTF-8" />
//             <link rel="icon" type="image/svg+xml" href="/vite.svg" />
//             <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//             <title>Vite App</title>
//           </head>
//           <body>
//             <div id="app"></div>
//             <script type="module" src="/src/main.js"></script>
//           </body>
//         </html>`,
//     },
//   },
// };
  // await webcontainer?.mount(files);
    
  //   console.log("Editor Data:", editor_data);
    

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      setErrorMsg(error.response?.data?.message || "An error occurred while processing your request.");
    } else {
      console.error("Unexpected error:", error);
    }
  }
  finally{
    setChatSubmitted(true);
  }
}

  useEffect(() => {
    init();
  
  }, []);

const card = (
  <React.Fragment>
    <CardContent>
    
        
        <Typography gutterBottom color="white" variant="body1">
            {prompt}
        </Typography>
      
         { errroMsg && <Alert variant="filled" severity="warning"  sx={{color:'warning.main',borderRadius:'10px', bgcolor:'rgb(59, 49, 35)'}}>
          <Grid container spacing={2}>
            <Grid size={8}>
         
          <AlertTitle sx={{color:'warning.main', fontWeight:'bold'}}>Error</AlertTitle>
          <Typography  color="grey" variant="subtitle2">{errroMsg}</Typography>
        </Grid>
         <Grid size={4}>
            <Button  variant="contained" color="warning" size="small">Retry</Button>
        </Grid>
        </Grid>
        </Alert>}
       
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
          {!errroMsg && <Typography variant="body1" color="white" marginLeft={2} marginTop={2} paddingX={2} paddingBottom={2} >
          Steps to be followed:
          {steps.length === 0 ? <span> Loading...</span>: steps.map((step:any) => (
            <li key={step.id}>{step.type} {step.title}</li>
          )) }
        </Typography>}
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
              <Button >Preview</Button>
            </ButtonGroup>
          </Box>
          {chatSubmitted ?   
        <Box display={"flex"} height="100%" >
         <FileExplorer data={data} onFileSelect={setSelectedFile}/>

        <Box sx={{ flex: 1, overflow: "hidden" }}>
          
  <Editor
    defaultLanguage="javascript"
    defaultValue="// some comment"
    value={selectedFile?.content || ""}
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
        <Box height={"30%"} padding={1}>
          <Box color={"white"} bgcolor={"black"} height={"100%"} border={1} padding={2} >
              {output.map((cmd)=>(
                <Typography>{cmd}</Typography>
        ))}
          </Box>
        </Box>
        </Box>
      </Box>
    </Box>
  );
}
export default AppBuilder;

