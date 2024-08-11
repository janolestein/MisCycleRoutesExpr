//custom Error handler for some status Codes
const {constants} = require("../constants");

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            res.json({title: "Validation failed", message: err.message, stackTrace: err.stackTrace});
            break;
        case constants.UNAUTHORIZED:
            res.json({title: "Unauthorized", message: err.message, stackTrace: err.stackTrace});
            break;
        case constants.FORBIDDEN:
            res.json({title: "Forbidden", message: err.message, stackTrace: err.stackTrace});
            break;
        case constants.NOT_FOUND:
            res.json({title: "Not found", message: err.message, stackTrace: err.stackTrace});
            break;
        case constants.SERVER_EROOR:
            res.json({title: "Server Error", message: err.message, stackTrace: err.stackTrace});
            break;
        default:
            console.log("No Error");
            break;
    }
    
};

module.exports = errorHandler;