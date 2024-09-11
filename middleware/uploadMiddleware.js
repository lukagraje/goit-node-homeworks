const path = require("path");
const multer = require("multer");
const { v4: uuidV4 } = require("uuid");

const tempDir = path.join(__dirname, "../tmp");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("Uploading to:", tempDir); // Log destination path
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      console.log("Uploading file:", file.originalname); // Log file name
      cb(null, `${uuidV4()}${file.originalname}`);
    },
});

const extensionWhiteList = [".jpg", ".jpeg", ".png", ".gif"];
const mimetypeWhiteList = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

const uploadMiddleware = multer({
  storage,
  fileFilter: async (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    if (
      !extensionWhiteList.includes(extension) ||
      !mimetypeWhiteList.includes(mimetype)
    ) {
      return cb(null, false);
    }
    return cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

module.exports = uploadMiddleware;
