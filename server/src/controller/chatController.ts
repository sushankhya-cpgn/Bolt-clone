

import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express"
import Groq from "groq-sdk";
import { getSystemPrompt } from "../prompt";
const app = express();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

dotenv.config();

export const chatController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        console.log("Incoming body:", req.body);
        const prompts = req.body.prompts.join(',') || "";
        const response = await groq.chat.completions.create({
            messages:[
                {
                    role:"system",
                    content: getSystemPrompt()
                },
                {
                    role:"user",
                    content: prompts
                },
                {
                    role:"user",
                    content:"Create index.html also with all other necessary files give in the prompt"
                },
                
            ],
            // model:"llama-3.3-70b-versatile",
            model:"llama-3.1-8b-instant",
            // model:"openai/gpt-oss-120b",
            temperature: 0.5,
            max_completion_tokens:8000,
            top_p:1,
            stream: false,
        })

        res.status(200).json({message:response?.choices[0]?.message?.content ||""});
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error});
        next(error);
    }
}

