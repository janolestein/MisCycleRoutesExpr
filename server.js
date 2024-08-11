//This is the script that gets started as the server, its the entrypoint for the backend
const express = require("express");
const doteenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler")
const connectDB = require("./config/dbConnection")
const path = ('path');


//Calls the function that connects to te Database
connectDB();
const app = express();
//Express middleware to parse json
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
//port is defined in the .env file
const port = process.env.PORT || 5000;

app.use(express.static("public"));

//Route for the location requests
app.use("/loc", require("./routes/locationRoutes"));

//route for the User requests
app.use("/user", require("./routes/userRoutes")); 
//Custom error handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on Port ${port}`);
});