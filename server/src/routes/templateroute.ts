import express from "express";
import { templateController } from "../controller/templateController.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Requested URL ${req.originalUrl}, Time ${new Date().toISOString()}`);
  next();
});

router.post("/", templateController);

export default router;
