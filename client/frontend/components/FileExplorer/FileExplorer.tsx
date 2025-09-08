import { Box } from "@mui/material";
import json from "./data.json";
import { useState } from "react";
import {  type List as ListType, type ExpandedFolder } from "../../type/ListType";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";


const List = ({ list }:ListType) => {
    const [expand, setExpand] = useState<ExpandedFolder>({});

    const handleToggle = (index:number)=>{
        setExpand((prev)=>({
            ...prev,
            [index]: !prev[index]
        }))
    }
  return (
    <Box>
      {list.map((node, index) => (
        <Box key={index} sx={{ marginLeft: node.children ? 2 : 0 }}>
          <Box>{(node.isFolder && <span onClick={()=>handleToggle(index)}>{expand[index]?<FaAngleDown/>:<FaAngleRight/>}</span>)} 
{node.name} </Box>
          {expand[index] && node.children && (
            <Box sx={{ marginLeft: 2 }}>
              <List list={node.children} />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};


function FileExplorer(){
    const [data] = useState(json);
    return(
    <Box padding={4}>
       <Box  color="white">
        <List list={data}/>
       </Box>
    </Box>

    );
}

export default FileExplorer;