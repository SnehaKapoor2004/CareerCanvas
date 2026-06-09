import express from 'express';
import { registerUser, getUserResumes, loginUser, getUserById } from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserById);
userRouter.get('/resumes', protect, getUserResumes);

export default userRouter;
