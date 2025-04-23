const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { route } = require("./user.routes");

router.post("/", categoryController.addController);
router.get("/", categoryController.getAllController);
router.get("/:id", categoryController.getByIdController);
router.delete("/:id", categoryController.deleteByIdController);

module.exports = router;
