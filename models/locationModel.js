//Exports the Mongoose MonogDB Schema for the Location Data
const mongoose = require("mongoose");

const nestetLocationSchema = mongoose.Schema({
        lat: Number,
        lng: Number,
});


const locationSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required for the Location"]
    },
    desc: {
        type: String,
    },
    location: {
        type: nestetLocationSchema,
        required: [true, "Location is required as lat and lng coordinates"]
    },
    formatedAdress: {
        type: String,
    },
},
{
    timestamps: true,
});

module.exports = mongoose.model("Location", locationSchema);