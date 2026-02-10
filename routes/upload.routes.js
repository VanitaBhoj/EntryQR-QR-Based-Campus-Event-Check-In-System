import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { uploadParticipantsCSV } from "../controllers/upload.controller.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/participants/:eventId",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("file"),
  uploadParticipantsCSV
);

export default router;
