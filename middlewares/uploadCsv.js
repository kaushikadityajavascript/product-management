const multer = require("multer");

// Use memory storage so file is available in `req.file.buffer`
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
