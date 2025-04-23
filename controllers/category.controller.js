const catchAsync = require("../utils/catchAsync");
const categoryService = require("../services/category.service");
const { StatusCodes } = require("http-status-codes");
const { setSuccessResponse } = require("../utils/sendResponse");
const addController = catchAsync(async (req, res) => {
  const addNew = await categoryService.add(req.body);
  if (addNew) {
    setSuccessResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Category created successfully",
      addNew
    );
  }
});

const getAllController = catchAsync(async (req, res) => {
  const categories = await categoryService.getAll();
  if (categories) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "Category fetched successfully",
      categories
    );
  }
});

getByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.getById(id);
  if (category) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "category fetched successfully",
      category
    );
  }
});

deleteByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedCategory = await categoryService.deleteOne(id);
  if (deletedCategory) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "category deleted successfully",
      deletedCategory
    );
  }
});

module.exports = {
  addController,
  getAllController,
  getByIdController,
  deleteByIdController,
};
