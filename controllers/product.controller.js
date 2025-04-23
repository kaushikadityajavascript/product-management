const catchAsync = require("../utils/catchAsync");
const productService = require("../services/product.service");
const { StatusCodes } = require("http-status-codes");
const { setSuccessResponse } = require("../utils/sendResponse");

const addController = catchAsync(async (req, res) => {
  const addNew = await productService.add(req.body, req);
  if (addNew) {
    setSuccessResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Product added successfully",
      addNew
    );
  }
});

const bulkUpload = catchAsync(async (req, res) => {
  const bulkUpload = await productService.bulkUploadProducts(req.file);
  if (bulkUpload) {
    setSuccessResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Products uploaded successfully",
      bulkUpload
    );
  }
});

const getAllController = catchAsync(async (req, res) => {
  const products = await productService.getAll(req.query);
  if (products) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "products fetched successfully",
      products
    );
  }
});

const getByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getById(id);
  if (product) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "product fetched successfully",
      product
    );
  }
});

const deleteByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedProduct = await productService.deleteOne(id);
  if (deletedProduct) {
    setSuccessResponse(
      res,
      StatusCodes.OK,
      true,
      "Product deleted successfully",
      deletedProduct
    );
  }
});

const exportProductsToExcelController = catchAsync(async (req, res) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");

  const { searchCategory } = req.query;

  await productService.exportProductsToExcel({ searchCategory }, res);
});

module.exports = {
  addController,
  bulkUpload,
  getAllController,
  getByIdController,
  deleteByIdController,
  exportProductsToExcelController,
};
