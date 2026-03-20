

import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express"
import Groq from "groq-sdk";
import { getSystemPrompt } from "../prompt";
const app = express();

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export const chatController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        console.log("Incoming body:", req.body);
        const prompts:{role:"user" | "assistant";content:string}[] = req.body.prompts || "";
        const response = await groq.chat.completions.create({
            messages:[
                {
                    role:"system",
                    content: getSystemPrompt()
                },
                 ...prompts,
         
            ],
            // model:"llama-3.3-70b-versatile",
            // model:"llama-3.1-8b-instant",
            model: "llama-3.3-70b-versatile",     // much better than 8b for code

            // model:"openai/gpt-oss-120b",
            temperature: 0.5,
            max_completion_tokens:32000,
            top_p:1,
            stream: false,
        })


        console.log("Prompt send from /chat is",  
                ...prompts  )

        // ← add this right after
console.log("FINISH REASON:", response?.choices[0]?.finish_reason);
console.log("RAW OUTPUT:", response?.choices[0]?.message?.content);
        res.status(200).json({message:response?.choices[0]?.message?.content ||""});
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error});
        next(error);
    }
}

