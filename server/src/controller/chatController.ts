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
                }
            ],
            // model:"llama-3.3-70b-versatile",
            // model:"llama-3.1-8b-instant",
            model:"llama-3.3-70b-versatile",
            temperature: 0.5,
            max_completion_tokens:8000,
            top_p:1,
            stream: false,
        })

        res.status(200).json({message:response?.choices[0]?.message?.content ||""});
        console.log(response?.choices[0]?.message?.content);
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error});
        next(error);
    }
}


// export async function getGroqChatStream() {
//   return groq.chat.completions.create({
//     //
//     // Required parameters
//     //
//     messages: [
//       // Set an optional system message. This sets the behavior of the
//       // assistant and can be used to provide specific instructions for
//       // how it should behave throughout the conversation.
//       {
//         role: "system",
//         content: getSystemPrompt(),
//       },
//       // Set a user message for the assistant to respond to.
//       {
//         role: "user",
//         content: "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n"
//       },
//       {
//         role: "user",
//         content:
//           "Build full Todo app in nextjs.",
//       },
//       {
//         role: "user",
//         content:
//           "Build full Todo app in nextjs.",
//       },
//     ],

//     // The language model which will generate the completion.
//     model: "llama-3.3-70b-versatile",

//     //
//     // Optional parameters
//     //

//     // Controls randomness: lowering results in less random completions.
//     // As the temperature approaches zero, the model will become deterministic
//     // and repetitive.
//     temperature: 0.5,

//     // The maximum number of tokens to generate. Requests can use up to
//     // 2048 tokens shared between prompt and completion.
//     max_completion_tokens: 8000,

//     // Controls diversity via nucleus sampling: 0.5 means half of all
//     // likelihood-weighted options are considered.
//     top_p: 1,

//     // A stop sequence is a predefined or user-specified text string that
//     // signals an AI to stop generating content, ensuring its responses
//     // remain focused and concise. Examples include punctuation marks and
//     // markers like "[end]".
//     //
//     // For this example, we will use ", 6" so that the llm stops counting at 5.
//     // If multiple stop values are needed, an array of string may be passed,
//     // stop: [", 6", ", six", ", Six"]
//     // stop: ", 100",

//     // If set, partial message deltas will be sent.
//     stream: true,
//   });
// }

// main();