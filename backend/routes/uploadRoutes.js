const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const imageUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const resumeUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);

    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

router.post("/image", (req, res) => {
  imageUpload.single("image")(req, res, (error) => {
    if (error) {
      return res
        .status(400)
        .json({ message: error.message || "Upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image selected" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return res
      .status(201)
      .json({ message: "Image uploaded successfully", url: fileUrl });
  });
});

router.post("/resume", (req, res) => {
  resumeUpload.single("resume")(req, res, (error) => {
    if (error) {
      return res
        .status(400)
        .json({ message: error.message || "Upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No resume selected" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return res
      .status(201)
      .json({ message: "Resume uploaded successfully", url: fileUrl });
  });
});

module.exports = router;
