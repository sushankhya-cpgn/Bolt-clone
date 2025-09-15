import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';

export  function useWebcontainer() {

   

    const [webcontainerInstance, setWebcontainerInstance] = useState<WebContainer | null>(null);
    const [output,setOutput] = useState([""]);
    async function initWebcontainer() {
    if (!webcontainerInstance) {
      
      try {
        const instance = await WebContainer.boot();
        setWebcontainerInstance(instance);
        console.log("WebContainer initialized:", instance);
        
        const runCommand = async(cmd:string,args:string[])=>{
        const process = await instance?.spawn(cmd,args);
        process?.output.pipeTo(new WritableStream({
          write: (chunk) => {
            setOutput((prevOutput)=>[...prevOutput,chunk])
          }
        }))
    }
        setOutput((prevOutput)=>[...prevOutput,"Booting"]);
        const process = await instance.spawn('node',['--version'])
      
        process.output.pipeTo(new WritableStream({
          write:(chunk)=>{
            console.log(`Process Output: ${chunk}`)
              setOutput((prevOutput)=>[...prevOutput,chunk]);
          }
        }));

        runCommand('echo',['Hello','World']);
        
      } catch (err) {
        console.error("Failed to boot WebContainer:", err);
      }
    }
  }

    useEffect(()=>{  
       initWebcontainer();

    },[])

    return {webcontainerInstance,output};
}


