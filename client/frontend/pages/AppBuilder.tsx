import Navbar from "../components/Header/Navbar";
import OutlinedCard from "../components/Card/card"
import React, { useEffect, useRef, useState } from 'react';
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
import { StepType, type Step } from "../type/StepType";
import { useWebcontainer } from "../src/hooks/useWebcontainer";
import { type FileSystemTree } from "@webcontainer/api";



const API_URL = 'http://localhost:8000';

function convertToFileSystemTree(data: any[]): FileSystemTree {
  const tree: FileSystemTree = {};

  data.forEach((item) => {
    if (item.isFolder) {
      // Handle folders
      tree[item.name] = {
        directory: convertToFileSystemTree(item.children || []),
      };
    } else {
      // Handle files
      tree[item.name] = {
        file: {
          contents: item.content || '',
        },
      };
    }
  });

  return tree;
}


function AppBuilder({ height = "100vh" }) {
  const location = useLocation();
  const [chatSubmitted, setChatSubmitted] = useState(false);
  const { prompt } = location.state || {};
  const [template, setTemplate] = useState([]);
  const [selectedFile, setSelectedFile] = useState<Node | null>(null);
  const [command, setCommand] = useState("");
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const terminalRef = useRef<HTMLDivElement|null>(null);
  const [conversation, setConversation] = useState<string[]>([])
  const [data, setData] = useState([{}]);
  const [errroMsg, setErrorMsg] = useState("");
  const [followupPrompt,setFollowupPrompt] = useState<string>("");
  console.log("Prompt:", prompt);

  const [steps, setSteps] = useState([{}]);
  const { webcontainerInstance, output, runCommand, serverUrl, isBooting } = useWebcontainer();


  

  function handleRun() {
    if (!command.trim()) {
      return;
    }

    const cmd = command.split(' ')[0];
    const args = command.split(' ').slice(1);

    runCommand(cmd, args);
    console.log(cmd, args);
  }



  async function init() {
    if (isBooting || !webcontainerInstance) {
      console.log("Waiting for webcontainer to initialize");
      return;
    }
    try {
      // Test WebContainer command
      await runCommand('echo', ['Hello', 'World']);

      // 1. First request → /template
      const response = await axios.post(`${API_URL}/template`, { prompt });
      const newTemplate = response.data?.prompts || [];
      setTemplate(newTemplate);
      console.log('Template:', newTemplate);

      // 2. Second request → /chat
      const response2 = await axios.post(`${API_URL}/chat`, {
        prompts: [...newTemplate, prompt],
      });
      console.log('Response from /chat:', response2.data);
      setConversation([...newTemplate, prompt, response2.data.message]);
      const generatedSteps = parseStepFromXML(response2.data.message || '');
      setSteps(generatedSteps.map((step: Step) => ({ ...step, status: 'completed' })));

      // 3. Convert editor_data to FileSystemTree and mount to WebContainer
      const editorData = convertToTree(generatedSteps || []);
      setData(editorData);

      const fileSystemTree = convertToFileSystemTree(editorData);
      console.log('Conversion to suitable format for webcontainers to preview in an iframe: ', fileSystemTree);

      if (webcontainerInstance) {
        await webcontainerInstance.mount(fileSystemTree);

        console.log('Files mounted to WebContainer:', fileSystemTree);
        console.log('Files mounted to WebContainer:', fileSystemTree);

        setChatSubmitted(true);

        // 4. Install dependencies and start the server
        const installProcess = await runCommand('npm', ['install']);
        await installProcess?.exit;
        console.log('Dependencies installed');
        await runCommand('npm', ['run', 'dev']);
        console.log('Server started');
      } else {
        console.error('WebContainer instance is not available');
        setErrorMsg('WebContainer instance is not initialized.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        setErrorMsg(error.response?.data?.message || 'An error occurred while processing your request.');
      } else {
        console.error('Unexpected error:', error);
        setErrorMsg('An unexpected error occurred.');
      }
    }
  }



  
  // useEffect(() => {
    
  //     init();
   

  // }, []);

  useEffect(()=>{
    if(!terminalRef.current) return;
    const logsContainer = terminalRef.current.children[0];
    logsContainer.scrollTop = logsContainer.scrollHeight;
  },[output])

  useEffect(() => {
    if (webcontainerInstance && !isBooting) {
      init();
    }

  }, [webcontainerInstance, isBooting]);


  const card = (
    <React.Fragment>
      <CardContent>


        <Typography gutterBottom color="white" variant="body1">
          {prompt}
        </Typography>

        {errroMsg && <Alert variant="filled" severity="warning" sx={{ color: 'warning.main', borderRadius: '10px', bgcolor: 'rgb(59, 49, 35)' }}>
          <Grid container spacing={2}>
            <Grid size={8}>

              <AlertTitle sx={{ color: 'warning.main', fontWeight: 'bold' }}>Error</AlertTitle>
              <Typography color="grey" variant="subtitle2">{errroMsg}</Typography>
            </Grid>
            <Grid size={4}>
              <Button variant="contained" color="warning" size="small">Retry</Button>
            </Grid>
          </Grid>
        </Alert>}

      </CardContent>

    </React.Fragment>
  );
  async function handleChatSubmit(usermessage: string) {

    try {
      const updatedMessage = [...conversation, usermessage];

      // Request to /chat endpoint
      const response = await axios.post(`${API_URL}/chat`, {
        prompts: updatedMessage
      });

      const generatedSteps = parseStepFromXML(response.data.message);
      setSteps(generatedSteps.map((step: Step) => ({ ...step, status: 'completed' })));

      const editorData = convertToTree(generatedSteps || []);
      setData(editorData);

      const fileSystemTree = convertToFileSystemTree(editorData);
      console.log('Conversion to suitable format for webcontainers to preview in an iframe: ', fileSystemTree);

      if (webcontainerInstance) {
        await webcontainerInstance.mount(fileSystemTree);

        console.log('Files mounted to WebContainer:', fileSystemTree);
        console.log('Files mounted to WebContainer:', fileSystemTree);

        // 4. Install dependencies and start the server
        const installProcess = await runCommand('npm', ['install']);
        await installProcess?.exit;
        console.log('Dependencies installed');
        await runCommand('npm', ['run', 'dev']);
        console.log('Server started');
      } else {
        console.error('WebContainer instance is not available');
        setErrorMsg('WebContainer instance is not initialized.');
      }
    }
    // setChatSubmitted(true);

    catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        setErrorMsg(error.response?.data?.message || 'An error occurred while processing your request.');
      } else {
        console.error('Unexpected error:', error);
        setErrorMsg('An unexpected error occurred.');
      }
    } finally {
      setChatSubmitted(true);
    }


  }


  return (
    <Box display="flex" flexDirection="column" height={height} bgcolor='black'>
      <Navbar />

      {/* Main section */}
      <Box display="flex" height={height} gap={4} mt={2}>
        {/* Left section */}
        <Box display="flex" flexDirection='column' sx={{ width: '40%' }}>
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
            {steps.length === 0 ? <span> Loading...</span> : steps.map((step: any) => (
              <li key={step.id}>{step.type} {step.title}</li>
            ))}
          </Typography>}
          <Box display="flex" sx={{ height: '100%', width: '100%', margin: "12px" }} alignItems="end" >
            <Box sx={{ position: "relative", width: "100%" }}>
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
                value={followupPrompt}
                onChange={(e)=>setFollowupPrompt(e.target.value)}
              />

              <Button variant="contained" sx={{ position: 'absolute', right: 4, top: 4 }} onClick={()=>handleChatSubmit(followupPrompt)}><IoMdArrowForward />
              </Button>
            </Box>
          </Box>

        </Box>

        {/* Middle section */}
        <Box display="flex" flexDirection="column" bgcolor="rgb(23, 23, 23)" width="100%" height="100%" borderRadius="10px">
          <Box display="flex" justifyContent="flex-start" padding={2}>
            <ButtonGroup>
              <Button
                variant={activeTab === 'code' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('code')}
              >
                Code
              </Button>
              <Button
                variant={activeTab === 'preview' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </Button>
            </ButtonGroup>
          </Box>

          {chatSubmitted ? (
            <Box display="flex" flex={1} overflow="hidden">
              {activeTab === 'code' ? (
                <>
                  <FileExplorer data={data} onFileSelect={setSelectedFile} />
                  <Box sx={{ flex: 1, overflow: "hidden" }}>
                    <Editor
                      defaultLanguage="javascript"
                      value={selectedFile?.content || ""}
                      theme="vs-dark"
                      options={{ minimap: { enabled: false }, wordWrap: "on" }}
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  {serverUrl ? (
                    <iframe
                      title="Preview"
                      src={serverUrl}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                      <Typography variant="body1" sx={{ color: "gray", p: 2 }}>
                        {isBooting ? "Booting WebContainer..." : "Starting server..."}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <Typography variant="body1" sx={{ color: "gray" }}>
                Your code will appear here
              </Typography>
            </Box>
          )}

<Box sx={{ height: "30%", padding: 1 }}>
  <Box
    color="white"
    bgcolor="black"
    border={1}
    padding={2}
    sx={{
      height: "100%",
      overflowY: "scroll",   // vertical scrolling
      overflowX: "hidden", // prevent sideways scrolling
      fontFamily: "monospace",
      fontSize: "0.85rem",
    }}
    display="flex"
    flexDirection="column"

    ref={terminalRef}
  >
    <Box sx={{display:"flex", flexDirection:"column"}}>{output.map((cmd, index) => (
      <Typography
        key={index}
        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {cmd}
      </Typography>
    ))}</Box>
    

    <input
      type="text"
      placeholder="Type your command"
      className="bg-transparent outline-none text-green-900"
      onChange={(e) => setCommand(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleRun()}
      style={{
        width: "100%",
        color: "lightgreen",
        background: "transparent",
        border: "none",
        outline: "none",
      }}
    />
  </Box>
</Box>
        </Box>
      </Box>
    </Box>
  );
}
export default AppBuilder;

