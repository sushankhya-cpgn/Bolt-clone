import { Box } from "@mui/material";
import { useState } from "react";
import {  type List as ListType, type ExpandedFolder, type Node, type List } from "../../type/ListType";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";



const List = ({ list, onFileSelect }:{list:List,onFileSelect:(file:Node)=>void}) => {
    const [expand, setExpand] = useState<ExpandedFolder>({});

    

    const handleToggle = (index:number)=>{
        setExpand((prev)=>({
            ...prev,
            [index]: !prev[index]
        }))
    }
   
  return (
    <Box >
      {list.map((node:Node, index:number) => (
        <Box key={index} sx={{ marginLeft: node.children ? 2 : 0, cursor: "pointer" , userSelect:"none", paddingY:0.5,   marginBottom:"4px" }}>
          <Box display={"flex"} justifyItems={"center"} 
          sx={{"&:hover":{backgroundColor:"azure", borderRadius:2}, paddingX:1, paddingY:0.5, display:"flex", gap:1, overflow:"scroll" }}
          alignItems={"center"}
          onClick={() => !node.isFolder ? onFileSelect(node) : handleToggle(index)} 
          >{(node.isFolder && <span>{expand[index]?<FaAngleDown/>:<FaAngleRight/>}</span>)} 
{node.name} </Box>
          {expand[index] && node.children && (
            <Box sx={{ marginLeft: 2 }}>
              <List list={node.children} onFileSelect={onFileSelect} />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};


function FileExplorer({data,onFileSelect}:{data:ListType,onFileSelect:(file:Node)=>void}){
    
    return(
    <Box padding={4} marginRight={2} border={'1px solid grey'} paddingRight={2} color={"GrayText"} fontWeight={"bold"} boxSizing={"border-box"} borderRadius={1} height={"100%"} width={"300px"} sx={{backgroundColor:"rgb(23, 23, 23)",overflow:"scroll"}} >
        <List list={data} onFileSelect={onFileSelect}/>
       </Box>


    );
}

export default FileExplorer;