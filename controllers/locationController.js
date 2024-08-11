//exports all the Methods for the Location API endpoints (CRUD operations for the locations)
const asyncHandler = require("express-async-handler");
const locationModel = require("../models/locationModel");
const { parse } = require("dotenv");
const mongoose = require("mongoose");

  
const getAllLocations = asyncHandler(async (req, res) => {
    const locations = await locationModel.find();
    res.status(200).json(locations);
});


const getLocationById = asyncHandler(async (req, res) => {
    console.log(req.params.id);
    const loc = await locationModel.findById(req.params.id);
    if(!loc){
        res.status(404);
        throw new Error("Location not found");
    } else {
        res.status(200).json(loc);
    }
    
});


const addNewLocation = asyncHandler(async (req, res) => {
    const body = req.body;
    console.log(body);
    const title = body.title;
    console.log(body.title);
    const desc = body.desc;
    console.log(body.desc);
    const locationParam = body.location;
    console.log(body.location);
    const formatedAdress = body.formatedAdress;

    if(!locationParam || !title){
        res.status(400);
        throw new Error("No Location or Title send");
    }
    const locToAdd = new locationModel({title: title, desc: desc, location: locationParam, formatedAdress: formatedAdress});
    console.log("test");
    console.log(locToAdd);
    await locationModel.create(locToAdd);
    res.status(201).json(locToAdd);
});


const updateLocation = asyncHandler(async (req, res) => {
    const loc = await locationModel.findById(req.params.id);
    if(!loc){
        res.status(404);
        throw new Error("Location to update not found");
    }
    const updatedLocation = await locationModel.findByIdAndUpdate(req.params.id, req.body, {new: true});

    res.status(200).json(updatedLocation);
});


const deleteLocation = asyncHandler(async (req, res) => {
    const loc = await locationModel.findById(req.params.id);
    console.log(loc);
    if(!loc){
        res.status(404);
        throw new Error("Location to delete not found");
    }
    console.log(req.params.id);
    await locationModel.deleteOne({ _id: req.params.id });
    console.log("after delete");
    res.status(200).json(loc);
});


module.exports = {
    getAllLocations, 
    getLocationById, 
    addNewLocation, 
    updateLocation, 
    deleteLocation};