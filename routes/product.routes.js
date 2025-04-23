const express = require("express");
const router = express.Router();
const multer = require("multer");
const { cloudinary, storage } = require("../config/cloudinary");
const upload = multer({ storage });
const productController = require("../controllers/product.controller");
const uploadCsv = require("../middlewares/uploadCsv");

router.post("/", upload.single("image"), productController.addController);

router.post(
  "/bulk-upload",
  uploadCsv.single("csvFile"),
  (req, res, next) => {
    console.log("Request file ===> ", req.file);
    req.csvData = req.file.buffer.toString("utf-8");
    next();
  },
  productController.bulkUpload
);

router.get("/export", productController.exportProductsToExcelController);
router.get("/", productController.getAllController);
router.get("/:id", productController.getByIdController);
router.delete("/:id", productController.deleteByIdController);

module.exports = router;
