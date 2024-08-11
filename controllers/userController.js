//exports the Method to validate a User
const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const { parse } = require("dotenv");
const mongoose = require("mongoose");


const validateLogin = asyncHandler(async (req, res) => {
    const body = req.body;
    const user = await userModel.findOne({username: body.username}).exec();
    console.log("Body", body);
    console.log("User", user);

    if(!user){
        res.status(400).send("User not found");
        throw new Error("User not found");
    }
    else if(body.password !== user.password){
        res.status(401).send("Invalid credentials");
        throw new Error("Invalid credentials");
    }
        console.log("Login successful");
        const { username, role, name } = user;
        console.log("username", username);
        console.log("role", role);
        console.log("name", name);
        res.status(200).json({username, role, name});

});




module.exports = {validateLogin};