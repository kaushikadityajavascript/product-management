const { UUIDV4 } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { Category } = require("../models");
const CustomError = require("../utils/customError");
const { StatusCodes } = require("http-status-codes");

const add = async (body) => {
  const { name } = body;
  const duplicateCategory = await Category.findOne({
    where: { name: name, is_deleted: false },
  });
  if (duplicateCategory) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Category already exists");
  }
  const categoryData = {
    name: name,
    uniqueId: `CAT-${uuidv4()}`,
  };

  const category = await Category.create(categoryData);
  if (!category) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Category not created");
  }
  return category;
};

const getAll = async () => {
  const categories = await Category.findAll({
    where: { is_deleted: false },
    attributes: {
      exclude: [
        "created_by",
        "updated_by",
        "deleted_by",
        "is_deleted",
        "created_at",
        "updated_at",
        "deleted_at",
      ],
    },
  });
  if (!categories) {
    throw new CustomError(StatusCodes.NOT_FOUND, "No categories found");
  }
  return categories;
};

const getById = async (id) => {
  const category = await Category.findOne({
    where: { id, is_deleted: false },
  });

  if (!category) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Category not found");
  }

  return category;
};

const deleteOne = async (id) => {
  const checkCategory = await Category.findOne({ where: { id } });
  if (!checkCategory) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Category not found");
  }
  if (checkCategory.is_deleted) {
    throw new CustomError(
      StatusCodes.BAD_REQUEST,
      "Category is already deleted"
    );
  }
  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
  };

  const updateDelete = await Category.update(paramsToUpdate, {
    where: { id },
  });
  if (!updateDelete) {
    throw new CustomError(
      StatusCodes.BAD_REQUEST,
      "Problem occured while deleting Category"
    );
  }
  return updateDelete;
};

module.exports = {
  add,
  deleteOne,
  getAll,
  getById,
};
