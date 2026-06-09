import express from "express";
import multer from "multer";
import { checkATS } from "../controllers/atsController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/check",
  upload.fields([
    {
      name: "resume",
      maxCount: 1,
    },
    {
      name: "jobDescription",
      maxCount: 1,
    },
  ]),
  checkATS
);

export default router;