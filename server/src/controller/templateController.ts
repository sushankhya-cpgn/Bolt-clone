// import express, { Request, Response, NextFunction } from "express";
// import Groq from "groq-sdk";
// import dotenv from "dotenv";
// import {BASE_PROMPT} from "../prompt";
// import {basePrompt as reactbaseprompt} from "../../defaults/react";
// import {basePrompt as nodebaseprompt} from "../../defaults/node"


// dotenv.config();

// const app = express();

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// export const templateController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     console.log("BODY:", req.body);

//     const prompt = req.body.prompt;
//     console.log(prompt);

//     const response = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content:
//             "Return either 'node' or 'react' based on what you think this project should be. Return 'react' for frontend applications and 'node' for backend applications. If unsure, decide best fit based on the prompt. Only return one word: 'node' or 'react' and donot return any other thing",
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//       // model: "llama-3.3-70b-versatile",
//         model: "openai/gpt-oss-120b",
//       // model:"llama-3.1-8b-instant",
//       temperature: 0,
//       max_completion_tokens: 10,
//       top_p: 1,
//     });

//     const answer = response.choices[0]?.message?.content?.trim();
//     console.log(answer)
    
//     if(answer === 'react'){
//         res.json({prompts:[BASE_PROMPT,reactbaseprompt]})
//     }
//     else if(answer === 'node'){
//         res.json({prompts:[nodebaseprompt]})

//     }
//     else{
//       console.log("Invalid access attempt with answer:", answer);
//         res.status(403).json({message: "You cannot access this"})
//     }
//   } catch (error) {
//     console.log("ssfs")
//     next(error);
//   }
// };
import express, { Request, Response, NextFunction } from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import {BASE_PROMPT} from "../prompt";
import {basePrompt as reactbaseprompt} from "../../defaults/react";
import {basePrompt as nodebaseprompt} from "../../defaults/node"


dotenv.config();

const app = express();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export const templateController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("BODY:", req.body);

    const prompt = req.body.prompt;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Return either 'node' or 'react' based on what you think this project should be. Return 'react' for frontend applications and 'node' for backend applications. If unsure, decide best fit based on the prompt. Only return one word: 'node' or 'react' and donot return any other thing",
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
   
      temperature: 0,
      max_completion_tokens: 10,
      top_p: 1,
    });

    const answer = response.choices[0]?.message?.content?.trim();
    if(answer === 'react'){
        res.json({prompts:[BASE_PROMPT,reactbaseprompt]})
    }
    else if(answer === 'node'){
        res.json({prompts:[nodebaseprompt]})

    }
    else{
      console.log("Invalid access attempt with answer:", answer);
        res.status(403).json({message: "You cannot access this"})
    }
  } catch (error) {
    console.log("ssfs")
    next(error);
  }
};