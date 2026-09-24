const mongoose=require("mongoose");
const studentSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        rollNo:{
            type:String,
            required:true,
            unique:true,
        },
        marks:{
            type:Number,
            required:true,
            min:0,
            max:100,
        },
    },{
        timestamps:true,
    }
);
module.exports=mongoose.model("Student",studentSchema);