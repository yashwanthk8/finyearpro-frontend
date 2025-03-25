import * as XLSX from 'xlsx';
import { fileConfig } from '../config';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

/**
 * Parse file content based on file type
 * @param {File} file - The file to parse
 * @returns {Promise<string>} - The parsed content as string
 */
export const parseFileContent = async (file) => {
  try {
    const { type, name } = file;
    const extension = name.split('.').pop().toLowerCase();
    
    // Text files
    if (type === 'text/plain' || extension === 'txt') {
      return await parseTextFile(file);
    }
    
    // CSV files
    if (type === 'text/csv' || extension === 'csv') {
      return await parseCSVFile(file);
    }
    
    // JSON files
    if (type === 'application/json' || extension === 'json') {
      return await parseJSONFile(file);
    }
    
    // Excel files
    if (type.includes('spreadsheetml') || ['xlsx', 'xls'].includes(extension)) {
      return await parseExcelFile(file);
    }
    
    // PDF files - text extraction using PDF.js
    if (type === 'application/pdf' || extension === 'pdf') {
      return await parsePDFFile(file);
    }
    
    throw new Error(`Unsupported file type: ${type}`);
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error;
  }
};

/**
 * Parse a text file
 */
const parseTextFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      resolve(truncateContent(content));
    };
    reader.onerror = (e) => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
};

/**
 * Parse a CSV file
 */
const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // For simple CSV, just return the raw text
        resolve(truncateContent(content));
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};

/**
 * Parse a JSON file
 */
const parseJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsed = JSON.parse(content);
        // Convert to formatted string
        const formattedJson = JSON.stringify(parsed, null, 2);
        resolve(truncateContent(formattedJson));
      } catch (error) {
        reject(new Error('Failed to parse JSON file: Invalid JSON format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read JSON file'));
    reader.readAsText(file);
  });
};

/**
 * Parse an Excel file
 */
const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Convert all sheets to CSV format
        let result = [];
        workbook.SheetNames.forEach(sheet => {
          const worksheet = workbook.Sheets[sheet];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          result.push(`Sheet: ${sheet}\n${csv}`);
        });
        
        resolve(truncateContent(result.join('\n\n')));
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error('Failed to parse Excel file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse a PDF file using PDF.js
 */
const parsePDFFile = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const numPages = pdf.numPages;
    
    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Process text items with better formatting
      const pageText = textContent.items
        .map(item => {
          // Handle line breaks and spaces
          if (item.hasEOL) {
            return item.str + '\n';
          }
          return item.str + ' ';
        })
        .join('')
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      // Add page number and content
      fullText += `Page ${i}:\n${pageText}\n\n`;
      
      // Add a separator between pages
      if (i < numPages) {
        fullText += '---\n\n';
      }
    }
    
    // Add metadata
    const metadata = await pdf.getMetadata().catch(() => ({}));
    const metadataText = [
      `Title: ${metadata?.info?.Title || 'Not specified'}`,
      `Author: ${metadata?.info?.Author || 'Not specified'}`,
      `Subject: ${metadata?.info?.Subject || 'Not specified'}`,
      `Keywords: ${metadata?.info?.Keywords || 'Not specified'}`,
      `Total Pages: ${numPages}`,
      `File Size: ${(file.size / 1024).toFixed(2)} KB`
    ].join('\n');
    
    return truncateContent(`PDF Metadata:\n${metadataText}\n\nContent:\n${fullText}`);
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file: ' + error.message);
  }
};

/**
 * Truncate content if it exceeds the configured maximum length
 */
const truncateContent = (content) => {
  const maxLength = fileConfig.maxContentLength;
  if (content.length > maxLength) {
    return content.substring(0, maxLength) + 
      `\n\n[Content truncated due to size limitations. Original size: ${content.length} characters]`;
  }
  return content;
};