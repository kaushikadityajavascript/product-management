const catchAsync = require("../utils/catchAsync");
const userService = require("../services/user.service");
const { StatusCodes } = require("http-status-codes");
const { setSuccessResponse } = require("../utils/sendResponse");
const addController = catchAsync(async (req, res) => {
  const addNew = await userService.add(req.body);
  if (addNew) {
    setSuccessResponse(
      res,
      StatusCodes.CREATED,
      true,
      "User created successfully",
      addNew
    );
  }
});

const getAllController = catchAsync(async (req, res) => {
  const users = await userService.getAll();
  if (users) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "Users fetched successfully",
      users
    );
  }
});

getByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getById(id);
  if (user) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "User fetched successfully",
      user
    );
  }
});

const updateController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedUser = await userService.update(id, req.body);
  if (updatedUser) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "User updated successfully",
      updatedUser
    );
  }
});

deleteByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedUser = await userService.deleteOne(id);
  if (deletedUser) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "User deleted successfully",
      deletedUser
    );
  }
});

module.exports = {
  addController,
  getAllController,
  getByIdController,
  updateController,
  deleteByIdController,
};
