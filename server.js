import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";

import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js"; 
import uploadRoutes from "./routes/upload.routes.js";
import checkinRoutes from "./routes/checkin.routes.js";

app.use("/api/checkin", checkinRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes); 

const startServer = async () => {
  await connectDB();
  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
};

startServer();
