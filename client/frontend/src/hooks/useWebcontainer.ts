import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';
import { useRef } from 'react';


export function useWebcontainer() {
  const [webcontainerInstance, setWebcontainerInstance] = useState<WebContainer | null>(null);
  const [output, setOutput] = useState([""]);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(false);
 

  const runCommand = async (cmd: string, args: string[]) => {
    if (!webcontainerInstance) return;


    const process = await webcontainerInstance?.spawn(cmd, args);
    process?.output.pipeTo(new WritableStream({
      write: (chunk) => {
        const chunkStr = String(chunk)
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

    if (webcontainerInstance || isBooting) return;
    setIsBooting(true);
    if (!webcontainerInstance) {
      try {
        const instance = await WebContainer.boot();
        setWebcontainerInstance(instance);
        console.log("WebContainer initialized:", instance);


        setOutput((prevOutput) => [...prevOutput, "Booting"]);
        const process = await instance.spawn('node', ['--version'])

        process.output.pipeTo(new WritableStream({
          write: (chunk) => {
            console.log(`Process Output: ${chunk}`)
            setOutput((prevOutput) => [...prevOutput, chunk]);
          }
        }));
        instance.on("server-ready", (port, url) => {
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
  }

  useEffect(() => {
    initWebcontainer();

    return () => {
      if (webcontainerInstance) {
        webcontainerInstance.teardown();
        setWebcontainerInstance(null);

      }
    }

  }, [])


  return { webcontainerInstance, output, runCommand, serverUrl, isBooting };
}


