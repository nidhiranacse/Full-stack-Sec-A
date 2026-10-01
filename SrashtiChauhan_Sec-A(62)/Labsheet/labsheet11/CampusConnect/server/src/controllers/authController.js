const bcrypt=require("bcryptjs");
const jwt = require("jsonwebtoken");
const User=require("../models/User");


const registerUser=async(req,res)=> {
    try {
        const{name,email,password}=req.body;
        if(!name|| !email|| !password){
            return res.status(400).json({success:false,message:"Name, email and password are required",});

        }
        if(password.length<6){
            return res.status(400).json({success:false,message:"Password must be at least 6 characters long",});
        }
        const existingUser=await User.findOne({email:email.toLowerCase()});
        if(existingUser){
            return res.status(400).json({success:false,message:"User with this email already exists",});
        }
        const hashedPassword=await bcrypt.hash(password,10);

        const user=await User.create({
            name,
            email:email.toLowerCase(),
            password:hashedPassword,
            role:"student",
        });
        return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};

    


