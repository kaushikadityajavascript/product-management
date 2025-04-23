const CustomError = require("../utils/customError");
const { Category, Product } = require("../models");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const BATCH_SIZE = 5;
const { Op, fn, col, where, literal, Model } = require("sequelize");
const ExcelJS = require("exceljs");

const add = async (body, req) => {
  const { name, price, categoryId } = body;
  const categoryExists = await Category.findOne({
    where: { id: categoryId, is_deleted: false },
  });

  if (!categoryExists) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Category not found");
  }
  const imageUrl = req?.file?.path || null;
  const productData = {
    name,
    price,
    image: imageUrl,
    uniqueId: `PROD-${uuidv4()}`,
    categoryId,
  };

  const product = await Product.create(productData);

  if (!product) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Product not created");
  }

  return product;
};

const bulkUploadProducts = async (file) => {
  if (!file) throw new CustomError(400, "CSV file not found in request");

  console.log("🚀 ~ bulkUploadProducts ~ file:", file);

  const results = [];
  const stream = Readable.from(file.buffer);

  return new Promise((resolve, reject) => {
    const startTime = Date.now(); //
    let batchCount = 0;
    stream
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        let batch = [];

        try {
          for (let i = 0; i < results.length; i++) {
            const productData = {
              name: results[i].name,
              categoryId: results[i].categoryId,
              price: parseFloat(results[i].price),
              image_url: results[i].image_url || null,
              uniqueId: `PROD-${uuidv4()}`,
              //   createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
              //   updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            };

            batch.push(productData);

            if (batch.length >= BATCH_SIZE || i === results.length - 1) {
              try {
                const dbStart = Date.now();
                await Product.bulkCreate(batch);
                const dbTime = Date.now() - dbStart;
                batchCount++;
                console.log(
                  `✅ Batch ${batchCount} inserted in ${dbTime}ms with ${batch.length} products`
                );
                batch = [];
              } catch (error) {
                console.error("Insert error:", error);
                return reject(new CustomError(500, "Database insertion error"));
              }
            }
          }

          const totalTime = Date.now() - startTime;
          console.log(
            `🎉 Upload complete: ${batchCount} batches processed in ${totalTime}ms`
          );
          resolve("Products uploaded successfully");
        } catch (error) {
          console.error("CSV processing error:", error);
          reject(new CustomError(500, "CSV processing failed"));
        }
      })
      .on("error", (err) => {
        console.error("Stream read error:", err);
        reject(new CustomError(500, "Error reading CSV buffer"));
      });
  });
};

const getAll = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const sort = query.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";
  const search = query.search?.trim().toLowerCase() || "";
  const categoryId = query.categoryId || null;

  const offset = (page - 1) * limit;

  const whereClause = {
    is_deleted: false,
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  const searchCondition = search
    ? {
        [Op.or]: [
          {
            name: { [Op.like]: `%${search.toLowerCase()}%` },
          },
          {
            "$Category.name$": {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }
    : {};

  const products = await Product.findAndCountAll({
    where: {
      ...whereClause,
      ...searchCondition,
    },
    include: [
      {
        model: Category,
        attributes: ["id", "name"],
        required: true,
      },
    ],
    limit: limit,
    offset: +offset,
    order: [["price", sort]],
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

  if (!products) {
    throw new CustomError(StatusCodes.NOT_FOUND, "No products found");
  }

  return {
    total: products.count,
    page: +page,
    limit: +limit,
    data: products.rows,
  };
};

const getById = async (id) => {
  const product = await Product.findOne({
    where: { id, is_deleted: false },
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
    include: [
      {
        model: Category,
        attributes: ["id", "name"],
      },
    ],
  });

  if (!product) {
    throw new CustomError(StatusCodes.NOT_FOUND, "product not found");
  }

  return product;
};

const deleteOne = async (id) => {
  const checkProduct = await Product.findOne({ where: { id } });
  if (!checkProduct) {
    throw new CustomError(StatusCodes.NOT_FOUND, "product not found");
  }
  if (checkProduct.is_deleted) {
    throw new CustomError(
      StatusCodes.BAD_REQUEST,
      "Product is already deleted"
    );
  }
  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
  };

  const updateDelete = await Product.update(paramsToUpdate, {
    where: { id },
  });
  if (!updateDelete) {
    throw new CustomError(
      StatusCodes.BAD_REQUEST,
      "Problem occured while deleting product"
    );
  }
  return updateDelete;
};

const exportProductsToExcel = async (params, res) => {
  const { searchCategory } = params;

  const include = [
    {
      model: Category,
      attributes: ["name"],
      where: searchCategory ? { name: searchCategory } : undefined,
      required: false,
    },
  ];

  const products = await Product.findAll({
    where: { is_deleted: false },
    include,
  });

  if (!products || products.length === 0) {
    res.status(404).send("No product data available for export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Products");

  worksheet.columns = [
    { header: "Product Name", key: "name" },
    { header: "Unique ID", key: "uniqueId" },
    { header: "Price", key: "price" },
    { header: "Image URL", key: "image" },
    { header: "Category", key: "category" },
  ];

  for (const product of products) {
    worksheet.addRow({
      name: product.name,
      uniqueId: product.uniqueId,
      price: product.price,
      image: product.image || "",
      category: product.Category?.name || "N/A",
    });
  }

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  add,
  bulkUploadProducts,
  getAll,
  getById,
  deleteOne,
  exportProductsToExcel,
};
