import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, API_CONFIG, fileConfig } from "../config";

// Initialize the Gemini API with the correct API version
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY, {
  apiVersion: API_CONFIG.apiVersion
});

// Track API usage
let requestCount = 0;
let lastRequestTime = Date.now();

/**
 * Check if we've hit the rate limit
 */
function checkRateLimit() { 
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  // If we've made too many requests, wait for the retry delay
  if (requestCount >= API_CONFIG.maxRequestsPerDay) {
    const waitTime = API_CONFIG.retryDelay - timeSinceLastRequest;
    if (waitTime > 0) {
      throw new Error(`Rate limit reached. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`);
    }
    // Reset counter if enough time has passed
    requestCount = 0;
  }
  
  lastRequestTime = now;
  requestCount++;
}

/**
 * Get a response from Gemini based on the document content and user question
 * 
 * @param {string} fileContent - The content of the uploaded document
 * @param {string} question - The user's question about the document
 * @param {string} fileName - Name of the file for context
 * @returns {Promise<string>} - The AI-generated response
 */
export async function getGeminiResponse(fileContent, question, fileName) {
  try {
    // Check rate limits before making the request
    checkRateLimit();
    
    // For very large files, consider truncating content
    const truncatedContent = fileContent.length > fileConfig.maxContentLength 
      ? fileContent.substring(0, fileConfig.maxContentLength) + "... [content truncated due to length]"
      : fileContent;
    
    // Create a model instance with the correct model name
    const model = genAI.getGenerativeModel({ model: API_CONFIG.geminiModel });
    
    // Construct the prompt with document context
    const prompt = `
      You are a helpful document assistant. You've been given the following document to analyze:
      
      File name: ${fileName}
      
      Document content:
      ${truncatedContent}
      
      Please answer the following question about this document:
      ${question}
      
      Provide a concise, accurate response based only on the document content.
      If the answer is not in the document, say that you cannot find the information in the document.
    `;
    
    // Generate content with safety settings
    const generationConfig = {
      maxOutputTokens: API_CONFIG.maxTokens,
      temperature: 0.4, // Lower temperature for more factual responses
    };
    
    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });
    
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Handle rate limit errors specifically
    if (error.message.includes("429") || error.message.includes("quota")) {
      return `You've reached the daily limit for free API calls. Please wait ${Math.ceil(API_CONFIG.retryDelay / 1000)} seconds before trying again.`;
    }
    
    return `Sorry, I encountered an error while analyzing your document: ${error.message}. Please make sure you have a valid Gemini API key configured.`;
  }
}

/**
 * Determine if a file's content can be processed by Gemini
 * 
 * @param {File} file - The uploaded file
 * @returns {boolean} - Whether the file can be processed
 */
export function isProcessableFile(file) {
  // Check file size
  if (file.size > fileConfig.maxSizeBytes) {
    return false;
  }
  
  const { type, name } = file;
  const extension = name.split('.').pop().toLowerCase();
  
  // Check by MIME type
  if (fileConfig.supportedTypes.some(supportedType => type.includes(supportedType))) {
    return true;
  }
  
  // Check by extension for cases where MIME type might not be reliable
  return fileConfig.supportedExtensions.includes(extension);
} 