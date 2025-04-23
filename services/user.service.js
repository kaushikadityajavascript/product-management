const bcrypt = require("bcryptjs");
const { User } = require("../models");
const CustomError = require("../utils/customError");
const { StatusCodes } = require("http-status-codes");
const add = async (body) => {
  const { email, password } = body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = {
    email: email,
    password: hashedPassword,
  };
  const user = await User.create(userData);
  if (!user) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "User not created");
  }
  return user;
};

const getAll = async () => {
  const users = await User.findAll({
    attributes: {
      exclude: ["password", "created_by", "updated_by", "deleted_by"],
    },
  });
  if (!users) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Users not found");
  }
  return users;
};

const getById = async (id) => {
  const user = await User.findOne({
    where: { id: id },
    attributes: {
      exclude: ["password", "created_by", "updated_by", "deleted_by"],
    },
  });
  if (!user) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
  }
  return user;
};

const update = async (id, body) => {
  const { email, password } = body;

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  await User.update(
    {
      ...(email && { email }),
      ...(password && { password: hashedPassword }),
    },
    {
      where: { id },
    }
  );
  return await getById(id, User);
};

const deleteOne = async (id) => {
  const checkUser = await User.findOne({ where: { id } });
  if (!checkUser) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (checkUser.is_deleted) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "User is already deleted");
  }
  const paramsToUpdate = {
    is_deleted: true,
    // deleted_by: id,
    deleted_at: new Date(),
  };

  const updateDelete = await User.update(paramsToUpdate, {
    where: { id },
  });
  if (!updateDelete) {
    throw new CustomError(
      StatusCodes.BAD_REQUEST,
      "Problem occured while deleting User"
    );
  }
  return updateDelete;
};

module.exports = {
  add,
  getAll,
  getById,
  update,
  deleteOne,
};
