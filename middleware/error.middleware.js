/**
 * Global error handling middleware
 */

export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  return res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

/**
 * Async error wrapper to catch promise rejections
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = "APIError";
  }
}

export default { errorHandler, asyncHandler, APIError };
