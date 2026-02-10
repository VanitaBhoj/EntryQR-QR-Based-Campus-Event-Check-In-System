import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ FIX

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    console.log("AUTH USER:", req.user);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("TOKEN RECEIVED:", token);

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
