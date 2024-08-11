const express = require("express");
const router = express.Router();
const {validateLogin} = require("../controllers/userController");

//route for POST on /usr calls the validateLogin Method
router.route("/").post(validateLogin);



module.exports = router;