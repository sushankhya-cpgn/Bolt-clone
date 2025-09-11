import Groq from "groq-sdk";
import { getSystemPrompt } from "./prompt";
import express from "express";
import templateRoute from "./routes/templateroute";
import chatRoute from "./routes/chatroute";
import cors from "cors"

require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json()); 
app.use(cors()) 

// const corsOptions = {
//   origin: 'http://localhost:5173',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }


app.use('/template',templateRoute);
app.use('/chat', chatRoute);


app.listen(PORT,()=>{
  console.log(`Server Started at port ${PORT}`);
})

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });



