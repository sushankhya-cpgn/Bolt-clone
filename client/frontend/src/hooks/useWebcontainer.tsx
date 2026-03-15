import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';


// Global Variables
let wcInstance : WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let cachedServerUrl: string | null = null; // ← add this

export function useWebcontainer() {
  const [webcontainerInstance, setWebcontainerInstance] = useState<WebContainer | null>(null);
  const [output, setOutput] = useState([""]);
  const [serverUrl, setServerUrl] = useState<string | null>(cachedServerUrl); // ← rehydrates on remount

  const [isBooting, setIsBooting] = useState(false);
 

  const runCommand = async (cmd: string, args: string[]) => {
    
    // if (!webcontainerInstance) return;
    if(!wcInstance) return;

    const process = await wcInstance?.spawn(cmd, args);
    process?.output.pipeTo(new WritableStream({
      write: (chunk) => {
        const chunkStr = String(chunk)

        if (
    chunkStr.includes("added") ||
    chunkStr.includes("changed") ||
    chunkStr.includes("audited") ||
    chunkStr.includes("funding")
  ) {
    return 
  }
        // setOutput((prevOutput) => [...prevOutput, chunkStr])
        setOutput((prevOutput) => {
          const currOutput = [...prevOutput,chunkStr];
          return currOutput.length>500? currOutput.slice(-500) : currOutput;
        })


      }
    }))

    process.exit.then((code)=>{
      setOutput((prev)=>[...prev,`Process exited with code ${code}`]);
    })
    return process;
  }
  async function initWebcontainer() {

    if(wcInstance) {
      setWebcontainerInstance(wcInstance);
      return;
    }

    if(bootPromise){
      setIsBooting(true);
      const instance = await bootPromise;
      setWebcontainerInstance(instance);
      setIsBooting(false);
      return;
    }

    setIsBooting(true);
    bootPromise = WebContainer.boot();

    try{
      const instance = await bootPromise;
      wcInstance = instance;
      setWebcontainerInstance(instance);

      setOutput((prev)=>[...prev,"Booting"]);
      const process = await instance.spawn('node', ['--version'])

      process.output.pipeTo(new WritableStream({
          write: (chunk) => {
            console.log(`Process Output: ${chunk}`)
            setOutput((prevOutput) => [...prevOutput, chunk]);
          }
        }));
        instance.on("server-ready", (port, url) => {
          cachedServerUrl = url; // ← save outside React
          setOutput((prev) => [...prev, `Server ready at ${url}${port}`]);
          setServerUrl(url);
        })

      } catch (err) {
        console.error("Failed to boot WebContainer:", err);
      }
      finally {
        setIsBooting(false);
      }

    }

  useEffect(() => {
    initWebcontainer();

  }, [])


  return { webcontainerInstance, output, runCommand, serverUrl, isBooting };
}


