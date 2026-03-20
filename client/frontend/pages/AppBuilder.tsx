import Navbar from "../components/Header/Navbar";
import OutlinedCard from "../components/Card/card";
import React, { useEffect, useRef, useState } from "react";
import parseStepFromXML from "../utils/parseStepFromXML";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  Alert,
  AlertTitle,
  Box,
  ButtonGroup,
  Grid,
  TextareaAutosize,
} from "@mui/material";
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

const API_URL = "http://localhost:8000";

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
          contents: item.content || "",
        },
      };
    }
  });

  return tree;
}

function AppBuilder({ height = "100vh" }) {
  const location = useLocation();
  const [chatSubmitted, setChatSubmitted] = useState(false);
  const { initialprompt } = location.state || {};
  const [prompt, setPrompt] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [template, setTemplate] = useState([]);
  const [history, setHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<Node | null>(null);
  const [command, setCommand] = useState("");
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [previousPackageInstalled, setPreviousPackageInstalled] = useState("");
  const [data, setData] = useState([{}]);
  const [errroMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  console.log("Prompt:", prompt);

  const [steps, setSteps] = useState([{}]);
  const { webcontainerInstance, output, runCommand, serverUrl, isBooting } =
    useWebcontainer();

  function handleRun() {
    if (!command.trim()) {
      return;
    }

    const cmd = command.split(" ")[0];
    const args = command.split(" ").slice(1);

    runCommand(cmd, args);
    console.log(cmd, args);
    setCommand("");
    inputRef.current?.focus();
  }

  async function init(currentPrompt = prompt) {
    if (isBooting || !webcontainerInstance || hasInitialized) {
      console.log("Waiting for webcontainer to initialize");
      return;
    }
    setHasInitialized(true);
    try {
      // Test WebContainer command
      await runCommand("echo", ["Hello", "World"]);

      // 1. First request → /template
      const response = await axios.post(`${API_URL}/template`, {
        prompt: currentPrompt,
      });
      const newTemplate = response.data?.prompts || [];
      setTemplate(newTemplate);
      console.log("Template:", newTemplate);

      const initialMessages: { role: "user" | "assistant"; content: string }[] =
        [
          ...newTemplate.map((t: string) => ({
            role: "user" as const,
            content: t,
          })),
          {
            role: "user",
            content:
              currentPrompt +
              "Create index.html and all other necessary config files including package.json, vite.config.ts, tailwind.config.js, postcss.config.js, and tsconfig files.",
          },
        ];

      // 2. Second request → /chat
      const response2 = await axios.post(`${API_URL}/chat`, {
        prompts: initialMessages,
      });
      console.log("Initial message is", initialMessages);
      console.log("Response from /chat:", response2.data);

      const generatedSteps = parseStepFromXML(response2.data.message || "");
      setSteps(
        generatedSteps.map((step: Step) => ({ ...step, status: "completed" })),
      );

      // 3. Convert editor_data to FileSystemTree and mount to WebContainer
      const editorData = convertToTree(generatedSteps || []);
      setData(editorData);

      const fileSystemTree = convertToFileSystemTree(editorData);
      console.log(
        "Conversion to suitable format for webcontainers to preview in an iframe: ",
        fileSystemTree,
      );

      // const minimalFileSystemTree = {
      //   'package.json': {
      //     file: {
      //       contents: `{
      //         "name": "todo-app",
      //         "private": true,
      //         "version": "0.0.0",
      //         "type": "module",
      //         "scripts": {
      //           "dev": "vite",
      //           "build": "vite build",
      //           "lint": "eslint .",
      //           "preview": "vite preview"
      //         },
      //         "dependencies": {
      //           "lucide-react": "^0.344.0",
      //           "react": "^18.3.1",
      //           "react-dom": "^18.3.1"
      //         },
      //         "devDependencies": {
      //           "@eslint/js": "^9.9.1",
      //           "@types/react": "^18.3.5",
      //           "@types/react-dom": "^18.3.0",
      //           "@vitejs/plugin-react": "^4.3.1",
      //           "autoprefixer": "^10.4.18",
      //           "eslint": "^9.9.1",
      //           "eslint-plugin-react-hooks": "^5.1.0-rc.0",
      //           "globals": "^15.9.0",
      //           "postcss": "^8.4.35",
      //           "tailwindcss": "^3.4.1",
      //           "typescript": "^5.5.3",
      //           "typescript-eslint": "^8.3.0",
      //           "vite": "^5.4.2"
      //         }
      //       }`,
      //     },
      //   },
      //   'vite.config.ts': {
      //     file: {
      //       contents: `
      //         import { defineConfig } from 'vite';
      //         import react from '@vitejs/plugin-react';

      //         export default defineConfig({
      //           plugins: [react()],
      //           server: {
      //             port: 5173,
      //           },
      //           optimizeDeps: {
      //             exclude: ['lucide-react'],
      //           },
      //         });
      //       `,
      //     },
      //   },
      //   'index.html': {
      //     file: {
      //       contents: `
      //         <!DOCTYPE html>
      //         <html lang="en">
      //           <head>
      //             <meta charset="UTF-8" />
      //             <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      //             <title>Todo App</title>
      //           </head>
      //           <body>
      //             <div id="root"></div>
      //             <script type="module" src="/src/main.tsx"></script>
      //           </body>
      //         </html>
      //       `,
      //     },
      //   },
      //   'postcss.config.js': {
      //     file: {
      //       contents: `
      //         export default {
      //           plugins: {
      //             tailwindcss: {},
      //             autoprefixer: {},
      //           },
      //         };
      //       `,
      //     },
      //   },
      //   'tailwind.config.js': {
      //     file: {
      //       contents: `
      //         /** @type {import('tailwindcss').Config} */
      //         export default {
      //           content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      //           theme: {
      //             extend: {
      //               colors: {
      //                 primary: '#3498db',
      //                 secondary: '#2ecc71',
      //                 background: '#f1c40f',
      //                 text: '#2c3e50',
      //               },
      //             },
      //           },
      //           plugins: [],
      //         };
      //       `,
      //     },
      //   },
      //   'tsconfig.json': {
      //     file: {
      //       contents: `
      //         {
      //           "files": [],
      //           "references": [
      //             { "path": "./tsconfig.app.json" },
      //             { "path": "./tsconfig.node.json" }
      //           ]
      //         }
      //       `,
      //     },
      //   },
      //   'tsconfig.app.json': {
      //     file: {
      //       contents: `
      //         {
      //           "compilerOptions": {
      //             "target": "ES2020",
      //             "useDefineForClassFields": true,
      //             "lib": ["ES2020", "DOM", "DOM.Iterable"],
      //             "module": "ESNext",
      //             "skipLibCheck": true,
      //             "moduleResolution": "bundler",
      //             "allowImportingTsExtensions": true,
      //             "isolatedModules": true,
      //             "moduleDetection": "force",
      //             "noEmit": true,
      //             "jsx": "react-jsx",
      //             "strict": true,
      //             "noUnusedLocals": true,
      //             "noUnusedParameters": true,
      //             "noFallthroughCasesInSwitch": true
      //           },
      //           "include": ["src"]
      //         }
      //       `,
      //     },
      //   },
      //   'tsconfig.node.json': {
      //     file: {
      //       contents: `
      //         {
      //           "compilerOptions": {
      //             "target": "ES2022",
      //             "lib": ["ES2023"],
      //             "module": "ESNext",
      //             "skipLibCheck": true,
      //             "moduleResolution": "bundler",
      //             "allowImportingTsExtensions": true,
      //             "isolatedModules": true,
      //             "moduleDetection": "force",
      //             "noEmit": true,
      //             "strict": true,
      //             "noUnusedLocals": true,
      //             "noUnusedParameters": true,
      //             "noFallthroughCasesInSwitch": true
      //           },
      //           "include": ["vite.config.ts"]
      //         }
      //       `,
      //     },
      //   },
      //   'src': {
      //     directory: {
      //       'main.tsx': {
      //         file: {
      //           contents: `
      //             import { StrictMode } from 'react';
      //             import { createRoot } from 'react-dom/client';
      //             import App from './App.tsx';
      //             import './index.css';

      //             createRoot(document.getElementById('root')!).render(
      //               <StrictMode>
      //                 <App />
      //               </StrictMode>
      //             );
      //           `,
      //         },
      //       },
      //       'App.tsx': {
      //         file: {
      //           contents: `
      //             import React from 'react';
      //             import { useReducer } from 'react';

      //             interface TodoItem {
      //               id: number;
      //               text: string;
      //               completed: boolean;
      //             }

      //             interface TodoState {
      //               items: TodoItem[];
      //             }

      //             const reducer = (state: TodoState, action: any) => {
      //               switch (action.type) {
      //                 case 'ADD_ITEM':
      //                   return { ...state, items: [...state.items, action.payload] };
      //                 case 'REMOVE_ITEM':
      //                   return {
      //                     ...state,
      //                     items: state.items.filter((item) => item.id !== action.payload),
      //                   };
      //                 case 'TOGGLE_ITEM':
      //                   return {
      //                     ...state,
      //                     items: state.items.map((item) => {
      //                       if (item.id === action.payload) {
      //                         return { ...item, completed: !item.completed };
      //                       }
      //                       return item;
      //                     }),
      //                   };
      //                 default:
      //                   return state;
      //               }
      //             };

      //             const initialState: TodoState = { items: [] };

      //             const App = () => {
      //               const [state, dispatch] = useReducer(reducer, initialState);

      //               const handleAddItem = (text: string) => {
      //                 dispatch({ type: 'ADD_ITEM', payload: { id: Date.now(), text, completed: false } });
      //               };

      //               const handleRemoveItem = (id: number) => {
      //                 dispatch({ type: 'REMOVE_ITEM', payload: id });
      //               };

      //               const handleToggleItem = (id: number) => {
      //                 dispatch({ type: 'TOGGLE_ITEM', payload: id });
      //               };

      //               return (
      //                 <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      //                   <div className="bg-white rounded shadow-md p-4 w-1/2">
      //                     <h1 className="text-2xl font-bold mb-4">Todo App</h1>
      //                     <ul className="list-none mb-4">
      //                       {state.items.map((item) => (
      //                         <li key={item.id} className="mb-2">
      //                           <span
      //                             className={\`mr-2 \${item.completed ? 'line-through' : 'text-gray-600'}\`}
      //                           >
      //                             {item.text}
      //                           </span>
      //                           <button
      //                             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-2"
      //                             onClick={() => handleToggleItem(item.id)}
      //                           >

      //                           </button>
      //                           <button
      //                             className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
      //                             onClick={() => handleRemoveItem(item.id)}
      //                           >

      //                           </button>
      //                         </li>
      //                       ))}
      //                     </ul>
      //                     <input
      //                       type="text"
      //                       className="w-full p-2 mb-4 border border-gray-400 rounded"
      //                       placeholder="Add new item"
      //                       onKeyPress={(e) => {
      //                         if (e.key === 'Enter') {
      //                           handleAddItem(e.target.value);
      //                           e.target.value = '';
      //                         }
      //                       }}
      //                     />
      //                   </div>
      //                 </div>
      //               );
      //             };

      //             export default App;
      //           `,
      //         },
      //       },
      //       'index.css': {
      //         file: {
      //           contents: `
      //             @tailwind base;
      //             @tailwind components;
      //             @tailwind utilities;
      //           `,
      //         },
      //       },
      //     },
      //   },
      // };
      if (webcontainerInstance) {
        await webcontainerInstance.mount(fileSystemTree);
        // await webcontainerInstance.mount(minimalFileSystemTree);

        console.log("Files mounted to WebContainer:", fileSystemTree);

        // 4. Install dependencies and start the server
        const installProcess = await runCommand("npm", ["install"]);
        await installProcess?.exit;
        console.log(fileSystemTree);
        console.log("Dependencies installed");
        await runCommand("npm", ["run", "dev"]);
        setPreviousPackageInstalled(
          fileSystemTree["package.json"]?.file?.contents || "",
        );
        // setllmMessage([response2.data.message]); // For history
        setHistory([
          { role: "user", content: currentPrompt },
          { role: "assistant", content: response2.data.message },
        ]);
        console.log("Server started");
      } else {
        console.error("WebContainer instance is not available");
        setErrorMsg("WebContainer instance is not initialized.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        setErrorMsg(
          error.response?.data?.message ||
            "An error occurred while processing your request.",
        );
      } else {
        console.error("Unexpected error:", error);
        setErrorMsg("An unexpected error occurred.");
      }
    } finally {
      setChatSubmitted(true);
    }
  }

  // async function handleFollowUp(history: string[]) {
  //   // 2. Second request → /chat
  //   const response2 = await axios.post(`${API_URL}/chat`, {
  //     prompts: history,
  //   });
  //   console.log("Response from /chat:", response2.data);

  //   const generatedSteps = parseStepFromXML(response2.data.message || "");
  //   setSteps(
  //     generatedSteps.map((step: Step) => ({ ...step, status: "completed" })),
  //   );

  //   // 3. Convert editor_data to FileSystemTree and mount to WebContainer
  //   const editorData = convertToTree(generatedSteps || []);
  //   setData(editorData);

  //   const fileSystemTree = convertToFileSystemTree(editorData);
  //   console.log(
  //     "Conversion to suitable format for webcontainers to preview in an iframe: ",
  //     fileSystemTree,
  //   );
  //   if (webcontainerInstance) {
  //     await webcontainerInstance.mount(fileSystemTree);
  //     const newPackage = fileSystemTree["package.json"]?.file?.contents;
  //     if (newPackage !== previousPackageInstalled) {
  //       const installProcess = await runCommand("npm", ["install"]);
  //       setPreviousPackageInstalled(newPackage || "");
  //       await installProcess?.exit;
  //     }
  //     // await runCommand("npm", ["run", "dev"]);
  //   }
  // }

  async function handleFollowUp(
    history: { role: "user" | "assistant"; content: string }[],
  ) {
    try {
      const response2 = await axios.post(`${API_URL}/chat`, {
        prompts: history,
      });

      const generatedSteps = parseStepFromXML(response2.data.message || "");
      setSteps(
        generatedSteps.map((step: Step) => ({ ...step, status: "completed" })),
      );

      const editorData = convertToTree(generatedSteps || []);
      setData(editorData);

      const fileSystemTree = convertToFileSystemTree(editorData);

      if (webcontainerInstance) {
        await webcontainerInstance.mount(fileSystemTree);
        const newPackage = fileSystemTree["package.json"]?.file?.contents;
        if (newPackage !== previousPackageInstalled) {
          const installProcess = await runCommand("npm", ["install"]);
          setPreviousPackageInstalled(newPackage || "");
          await installProcess?.exit;
        }
      }

      // ✅ Append the assistant reply to history so next follow-up has full context
      setHistory((prev) => [
        ...prev,
        { role: "assistant" as const, content: response2.data.message },
      ]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(
          error.response?.data?.message || "Follow-up request failed.",
        );
      } else {
        setErrorMsg("An unexpected error occurred.");
      }
    }
  }

  useEffect(() => {
    if (initialprompt) {
      setPrompt(initialprompt);
    }
  }, [initialprompt]);



  useEffect(() => {
    if (!terminalRef.current) return;
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [output]);

  useEffect(() => {
    if (webcontainerInstance && !isBooting && prompt && !hasInitialized) {
      init(prompt);
    }
  }, [webcontainerInstance, isBooting, prompt, hasInitialized]);

  const card = (
    <React.Fragment>
      <CardContent>
        <Typography gutterBottom color="white" variant="body1">
          {prompt}
        </Typography>

        {errroMsg && (
          <Alert
            variant="filled"
            severity="warning"
            sx={{
              color: "warning.main",
              borderRadius: "10px",
              bgcolor: "rgb(59, 49, 35)",
            }}
          >
            <Grid container spacing={2}>
              <Grid size={8}>
                <AlertTitle sx={{ color: "warning.main", fontWeight: "bold" }}>
                  Error
                </AlertTitle>
                <Typography color="grey" variant="subtitle2">
                  {errroMsg}
                </Typography>
              </Grid>
              <Grid size={4}>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={handleRetry}
                >
                  Retry
                </Button>
              </Grid>
            </Grid>
          </Alert>
        )}
      </CardContent>
    </React.Fragment>
  );

  function handleRetry() {
    console.log("Retry...");
  }

  async function handleChatSubmit() {
    if (!chatInput.trim()) return;

    const newPrompt = chatInput;

    setChatInput("");

    const updatedHistory = [
      ...history,
      { role: "user" as const, content: newPrompt },
    ];

    console.log(updatedHistory);
    setHistory(updatedHistory);

    await handleFollowUp(updatedHistory);
  }

  return (
    <Box display="flex" flexDirection="column" height={height} bgcolor="black">
      <Navbar />

      {/* Main section */}
      <Box display="flex" flex={1} gap={4} mt={2} minHeight={0}>
        {" "}
        {/* Left section */}
        <Box display="flex" flexDirection="column" sx={{ width: "40%" }}>
          <Box display="flex" justifyContent="end">
            <OutlinedCard
              sx={{
                borderRadius: "8px",
                width: "340px",
                backgroundColor: "rgb(38, 38, 38)",
              }}
              card={card}
            ></OutlinedCard>
          </Box>
          {!errroMsg && (
            <Typography
              variant="body1"
              color="white"
              marginLeft={2}
              marginTop={2}
              paddingX={2}
              paddingBottom={2}
            >
              Steps to be followed:
              {steps.length === 0 ? (
                <span> Loading...</span>
              ) : (
                steps.map((step: any) => (
                  <li key={step.id}>
                    {step.type} {step.title}
                  </li>
                ))
              )}
            </Typography>
          )}
          <Box
            display="flex"
            sx={{ height: "100%", width: "100%", margin: "12px" }}
            alignItems="end"
          >
            <Box sx={{ position: "relative", width: "100%" }}>
              <TextareaAutosize
                minRows={4}
                maxRows={12}
                aria-label="maximum height"
                placeholder="Type your text..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                defaultValue="Lorem ipsum dolor sit amet..."
                style={{
                  width: "100%", // ensures it fills the parent
                  padding: "12px", // optional for spacing
                  boxSizing: "border-box", // ensures padding doesn't break width
                  borderRadius: "4px",
                  backgroundColor: "rgb(38, 38, 38)",
                  color: "white",
                  border: "1px solid grey",
                  paddingRight: "100px",
                }}
              />

              <Button
                variant="contained"
                sx={{ position: "absolute", right: 4, top: 4 }}
                onClick={handleChatSubmit}
              >
                <IoMdArrowForward />
              </Button>
            </Box>
          </Box>
        </Box>
        {/* Middle section */}
        <Box
          display="flex"
          flexDirection="column"
          bgcolor="rgb(23, 23, 23)"
          width="100%"
          minHeight={0}
          flex={1}
          borderRadius="10px"
          overflow="hidden"
        >
          <Box display="flex" justifyContent="flex-start" padding={2}>
            <ButtonGroup>
              <Button
                variant={activeTab === "code" ? "contained" : "outlined"}
                onClick={() => setActiveTab("code")}
              >
                Code
              </Button>
              <Button
                variant={activeTab === "preview" ? "contained" : "outlined"}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </Button>
            </ButtonGroup>
          </Box>

          {chatSubmitted ? (
            <Box display="flex" flex={1} overflow="hidden">
              {activeTab === "code" ? (
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
                <Box sx={{ flex: 1, overflow: "hidden" }}>
                  {serverUrl ? (
                    <iframe
                      title="Preview"
                      src={serverUrl}
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  ) : (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      flex={1}
                    >
                      <Typography variant="body1" sx={{ color: "gray", p: 2 }}>
                        {isBooting
                          ? "Booting WebContainer..."
                          : "Starting server..."}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <Typography variant="body1" sx={{ color: "gray" }}>
                Your code will appear here
              </Typography>
            </Box>
          )}

          <Box sx={{ height: "30%", padding: 1, minHeight: 0 }}>
            <Box
              color="white"
              bgcolor="black"
              border={1}
              padding={2}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                boxSizing: "border-box",
              }}
            >
              {/* Scrollable output area */}
              <Box
                ref={terminalRef}
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  minHeight: 0, 
                }}
              >
                {output.map((cmd, index) => (
                  <Typography
                    key={index}
                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {cmd}
                  </Typography>
                ))}
              </Box>

              {/* Pinned command input at bottom */}
              <TextareaAutosize
                placeholder="Type your command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); 
                    handleRun();
                  }
                }}
                style={{
                  width: "100%",
                  flexShrink: 0,
                  color: "lightgreen",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                }}
                ref={inputRef}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
export default AppBuilder;
