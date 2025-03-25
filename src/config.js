// Configuration file for environment variables
// In production, you should use proper environment management

// Gemini API Key
// Replace with your actual API key from Google AI Studio: https://aistudio.google.com/
export const GEMINI_API_KEY = "AIzaSyByzc8RoM701gfWAfvX1_yNOOWWqWzTYFU";

// Feature flags
export const FEATURES = {
  enableGeminiIntegration: true,  // Toggle to enable/disable Gemini API integration
};

// API settings
export const API_CONFIG = {
  geminiModel: "gemini-1.5-pro",  // Updated to use gemini-1.5-pro
  maxTokens: 4096,                // Maximum tokens for gemini response
  apiVersion: "v1",               // API version (v1 is current stable version)
};

// File processing settings
export const fileConfig = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB max file size
  maxContentLength: 30000,        // Max characters to send to Gemini API
  supportedTypes: [
    // Text files
    'text/plain',
    // CSV files
    'text/csv',
    // JSON files
    'application/json',
    // Excel files
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // PDF files
    'application/pdf',
  ],
  supportedExtensions: ['txt', 'csv', 'json', 'xls', 'xlsx', 'pdf'],
}; 