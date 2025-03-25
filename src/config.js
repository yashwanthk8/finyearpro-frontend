// Configuration file for environment variables
// In production, you should use proper environment management

// Gemini API Key
// Replace with your actual API key from Google AI Studio: https://aistudio.google.com/
export const GEMINI_API_KEY = "AIzaSyAmNKXKfaMtoaVCLcFfp-_4jR2tImLGzEU";

// Feature flags
export const FEATURES = {
  enableGeminiIntegration: true,  // Toggle to enable/disable Gemini API integration
};

// API settings
export const API_CONFIG = {
  geminiModel: "gemini-2.0-flash",  // Using the gemini-2.0-flash model 
  maxTokens: 2048,                  // Reduced max tokens for free tier
  apiVersion: "v1",                 // API version (v1 is the current stable version)
  maxRequestsPerDay: 45,            // Slightly below free tier limit for safety
  retryDelay: 60000,                // 60 seconds (1 minute) retry delay
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