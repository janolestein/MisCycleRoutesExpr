//Exports the Mongoose MonogDB Schema for the User Data
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({ //does it need new?
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        required: [true, "Role is required"]
    },
    name: {
        type: String,
        required: [true, "Firstname is required"]
    },
},
{
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);