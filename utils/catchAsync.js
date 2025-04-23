const { StatusCodes } = require("http-status-codes");
const { setSuccessResponse } = require("./sendResponse");

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log(err);
    setSuccessResponse(
      res,
      err.status || StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      err.errorMessage || "Something went wrong"
    );
  });
};

module.exports = catchAsync;
