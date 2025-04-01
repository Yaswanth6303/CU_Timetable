const express = require("express");
const router = express.Router();
const multer = require("multer");
const homeController = require("../controllers/home_controller");
const fileController = require("../controllers/file_controller");
const { login } = require("../controllers/auth_controller");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/excel",
      "application/x-excel",
      "application/x-msexcel",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only CSV and Excel files are allowed"));
    }
    cb(null, true);
  },
});

router.get("/", homeController.home);
router.post("/upload", upload.single("file"), fileController.upload);
router.get("/view/:id", fileController.view);
router.get("/delete/:id", fileController.delete);
router.get("/mark-for-deletion/:id", fileController.markForDeletion);
router.post("/apply-changes", express.json(), fileController.applyChanges);
router.post(
  "/update-sheet-visibility/:id",
  express.json(),
  fileController.updateSheetVisibility
);
router.post("/login", login);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res
      .status(400)
      .json({ error: "File upload error: " + error.message });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

module.exports = router;
