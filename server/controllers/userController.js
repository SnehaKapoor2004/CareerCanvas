 import User from "../models/User.js";
 import bcrypt from "bcryptjs";
 import jwt from "jsonwebtoken";
 import Resume from "../models/Resume.js";


const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET, 
    { expiresIn: "7d" }
  );
};

 // post: /api.users/register
 // controller for user register
export const registerUser = async (req, res) => {
try {
    const { name, email, password } = req.body;
    // check if user already exists
    if(!name || !email || !password){
        return res.status(400).json({message: "Missing fields are required"});
    }

    //check if user already exists
    const user = await User.findOne({email})
    if(user){
        return res.status(400).json({message: "User already exists"});
    }

    // create new user
    const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
    });
      await newUser.save();

    // return sucess message
    const token = generateToken(newUser._id)
    newUser.password = undefined;

    return res.status(201).json({
        message: "User registered successfully", token , user: newUser})
} catch (error) {
    return res.status(400).json({message: error.message});
}
}

 // post: /api.users/login
 // controller for user login

 export const loginUser = async (req, res) => {
try {
    const { email, password } = req.body;
    
    //check if user already exists
    const user = await User.findOne({email})
    if(!user){
        return res.status(400).json({message: "Invalid email or password"});
    }
   // check if password is correct

   if(!user.comparePassword(password)){
    return res.status(400).json({message: "Invalid email or password"});
   }

   // return sucess message
    const token = generateToken(user._id)
    user.password = undefined;
    return res.status(200).json({
        message: "User logged in successfully", token , user})
} catch (error) {
    return res.status(400).json({message: error.message});
}
}

// controller for getting user by id
// get: /api/users/data
 export const getUserById = async (req, res) => {
try {
    const userId = req.userId;
    
    // check if user exists
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message: "User not found"});
    }

    // return user 
    user.password = undefined;
    return res.status(200).json({user});
} catch (error) {
    return res.status(400).json({message: error.message});
}
}

// controller for getting all users
// get: /api/users/resumes
 export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;
        
        // return user resumes
        const resumes=await Resume.find({userId});
        return res.status(200).json({resumes});
    } catch (error) {
         return res.status(400).json({message: error.message});
    }
 }

