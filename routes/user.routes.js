const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/", userController.addController);
router.get("/", userController.getAllController);
router.get("/:id", userController.getByIdController);
router.put("/:id", userController.updateController);
router.delete("/:id", userController.deleteByIdController);

module.exports = router;
