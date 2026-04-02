import multer from "multer";
import path from "path";

// carpeta uploads
const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });