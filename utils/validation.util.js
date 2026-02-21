/**
 * Input validation utilities for API endpoints
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 6 characters
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== "";
};

export const validateCSVRow = (row) => {
  const { name, email, studentId } = row;
  
  if (!validateRequired(name) || !name.trim()) {
    return { valid: false, error: "Name is required" };
  }
  
  if (!validateRequired(email) || !validateEmail(email)) {
    return { valid: false, error: "Valid email is required" };
  }
  
  if (!validateRequired(studentId) || !studentId.trim()) {
    return { valid: false, error: "Student ID is required" };
  }
  
  return { valid: true };
};

export const validateEventData = (data) => {
  const { name, location, startTime } = data;
  
  if (!validateRequired(name) || !name.trim()) {
    return { valid: false, error: "Event name is required" };
  }
  
  if (!validateRequired(location) || !location.trim()) {
    return { valid: false, error: "Event location is required" };
  }
  
  if (!validateRequired(startTime)) {
    return { valid: false, error: "Event start time is required" };
  }
  
  const startTimeDate = new Date(startTime);
  if (isNaN(startTimeDate.getTime())) {
    return { valid: false, error: "Invalid start time format" };
  }
  
  return { valid: true };
};

export const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, "");
};

export const sanitizeEmail = (email) => {
  return email.trim().toLowerCase();
};

export default {
  validateEmail,
  validatePassword,
  validateRequired,
  validateCSVRow,
  validateEventData,
  sanitizeString,
  sanitizeEmail
};
