import express from "express";
import path from "path";
import cors from "cors";
import "dotenv/config";
import connectDb from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import atsRoutes from "./routes/atsRoutes.js";




const app = express();
const PORT = process.env.PORT || 3000;


await connectDb();

app.use(express.json());
app.use(cors());

// serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// database connection

app.get("/", (req, res) => {
  res.send("Server is running");
});
app.use('/api/users', userRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ai', aiRouter);
app.use('/api/ats', atsRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
