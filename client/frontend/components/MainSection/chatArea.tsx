import React, { useState } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import { IoMdArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
// import axios from "axios";

function ChatArea() {
  const [chat, setChat] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending:", chat);
    if(chat.trim()){
      navigate('/builder',{state:{chat}});

    }
    setChat("");
  };

  return (
    <Box
      // className=" flex flex-col text-center px-4"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography variant="h3" sx={{ color: "whitesmoke" }}>
        What should we build today?
      </Typography>
      <Typography variant="subtitle1" sx={{ color: "gray", mt: 1 }}>
        Create stunning apps & websites by chatting with AI.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 4,
          width: "100%",
          maxWidth: 400,
          position: "relative",
        }}
      >
        <TextField
          label="Type your text..."
          multiline
          minRows={4}
          maxRows={12}
          fullWidth
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "rgb(38, 38, 38)",
              color: "white",
            },
            "& .MuiInputLabel-root": { color: "grey" },
          }}
        />

        {chat && (
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{
              position: "absolute",
              top:10,
              right: 12,
              borderRadius: 1,
              px: 2,
              width:10,
              height:30
             
            }}
            onClick={handleSubmit}
          >
            <IoMdArrowForward/>
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default ChatArea;
