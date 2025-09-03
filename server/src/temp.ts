import Groq from "groq-sdk";
import { getSystemPrompt } from "./prompt";

require("dotenv").config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export async function main() {
    try{
        const stream = await getGroqChatStream();
        for await (const chunk of stream) {
          // Print the completion returned by the LLM.
          process.stdout.write(chunk.choices[0]?.delta?.content || "");
        }
    }
    catch(error){
        console.error("Error streaming response:", error);
    }
 
}

export async function getGroqChatStream() {
  return groq.chat.completions.create({
    //
    // Required parameters
    //
    messages: [
      // Set an optional system message. This sets the behavior of the
      // assistant and can be used to provide specific instructions for
      // how it should behave throughout the conversation.
      {
        role: "system",
        content: getSystemPrompt(),
      },
      // Set a user message for the assistant to respond to.
      {
        role: "user",
        content: "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n"
      },
      {
        role: "user",
        content:
          "Build full Todo app in nextjs.",
      },
      {
        role: "user",
        content:
          "Build full Todo app in nextjs.",
      },
    ],

    // The language model which will generate the completion.
    model: "llama-3.3-70b-versatile",

    //
    // Optional parameters
    //

    // Controls randomness: lowering results in less random completions.
    // As the temperature approaches zero, the model will become deterministic
    // and repetitive.
    temperature: 0.5,

    // The maximum number of tokens to generate. Requests can use up to
    // 2048 tokens shared between prompt and completion.
    max_completion_tokens: 8000,

    // Controls diversity via nucleus sampling: 0.5 means half of all
    // likelihood-weighted options are considered.
    top_p: 1,

    // A stop sequence is a predefined or user-specified text string that
    // signals an AI to stop generating content, ensuring its responses
    // remain focused and concise. Examples include punctuation marks and
    // markers like "[end]".
    //
    // For this example, we will use ", 6" so that the llm stops counting at 5.
    // If multiple stop values are needed, an array of string may be passed,
    // stop: [", 6", ", six", ", Six"]
    // stop: ", 100",

    // If set, partial message deltas will be sent.
    stream: true,
  });
}

main();

// import { GoogleGenAI } from "@google/genai";
// require("dotenv").config();

// if (!process.env.GEMINI_API_KEY) {
//   throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
// }

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// async function main() {
//   const response = await ai.models.generateContentStream({
//     model: "gemini-2.5-flash",
//     contents: [
//       {
//         role: "system",
//         parts: [{
//           text: "You are an expert React developer. Your task is to provide a single, complete, and runnable React application for a todo list. The application should include all necessary HTML, CSS (using Tailwind CSS for styling), and JavaScript in a single .jsx file. The main component must be named App and exported as the default."
//         }]
//       },
//       {
//         role: "user",
//         parts: [{ text: "Build a todo app in react" }]
//       }
//     ]
    
    
//   });

//   for await (const chunk of response) {
//     console.log(chunk.text);
//   }
// }

// main();


// import { ChatOpenAI } from "@langchain/openai";
// import { HumanMessage, SystemMessage } from "@langchain/core/messages";
// import { getSystemPrompt } from "./prompt";

// // Wrapper for OpenRouter
// function ChatOpenRouter(opts: { modelName: string; apiKey: string }) {
//   return new ChatOpenAI({
//     model: opts.modelName,
//     apiKey: opts.apiKey,
//     streaming:true,
//     configuration: {
//       baseURL: "https://openrouter.ai/api/v1",
//     },
//   });
// }

// async function run() {
//   try {
//     const apiKey = process.env.OPEN_ROUTER_API_KEY;
//     if (!apiKey) {
//       throw new Error("OPEN_ROUTER_API_KEY is not set in environment variables");
//     }

//     const llm = ChatOpenRouter({
//       apiKey,
//       modelName: "deepseek/deepseek-chat",
//     });

//     // Use stream instead of invoke for streaming output
//     const stream = await llm.stream([
//       new SystemMessage(getSystemPrompt()),
//       new HumanMessage(
//         "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n"
//       ),
//       new HumanMessage("Create a todo app"),
//     ]);

//     let fullResponse = "";
//     for await (const chunk of stream) {
//       fullResponse += chunk.content;
//       process.stdout.write(chunk.content.toString()); // Stream output to console
//     }

//     // Optionally, save the response to a file for further use
//     const fs = require("fs");
//     fs.writeFileSync("TodoApp.jsx", fullResponse);
//     console.log("\nTodo app code saved to TodoApp.jsx");
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("Error generating Todo app:", error.message);
//     } else {
//       console.error("Error generating Todo app:", error);
//     }
//   }
// }

// run();
