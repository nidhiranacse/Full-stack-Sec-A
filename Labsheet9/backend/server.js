const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
require("dotenv").config();

const studentRoutes=require("./routes/studentRoutes");

const app=express();
app.use(cors());
app.use(express.json());
app.use("/students",studentRoutes);
mongoose
    .connect(process.env.MONGO_URI)
    .then(
        ()=>{
            console.log("MongoDB connected");
            app.listen(5000,()=>{
                console.log("Server running on http://localhost:5000");
            });
        }
    ).catch((error)=>{
        console.log("MongoDB connection failed:",error);
    });