import express from "express";
import {chatController} from "../controller/chatController"

const router = express.Router();

router.use((req,res,next)=>{
    console.log(`Requested url  ${req.originalUrl}, Time ${new Date().toISOString()} `);
    next();
})

router.post("/",chatController);

export default router;