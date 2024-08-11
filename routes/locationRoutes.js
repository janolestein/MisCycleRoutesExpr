//Routing for the Location API endpoints
const express = require("express");
const router = express.Router();
const {
    getAllLocations, 
    getLocationById, 
    addNewLocation, 
    updateLocation, 
    deleteLocation} = require("../controllers/locationController");

router.route("/")
    .get(getAllLocations)
    .post(addNewLocation); 

router.route("/:id")
    .get(getLocationById)
    .put(updateLocation) 
    .delete(deleteLocation);
    
module.exports = router;