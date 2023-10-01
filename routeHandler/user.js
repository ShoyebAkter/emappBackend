const mongoose=require("mongoose");
const express=require("express");

const userSchema=new mongoose.Schema({
    name: String,
    city:String,
    role:String
})
module.exports=mongoose.model("users",userSchema)