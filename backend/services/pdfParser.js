const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from a PDF file path.
 * @param {string} filePath - Absolute path to the uploaded PDF.
 * @returns {Promise<string>} - Extracted text content.
 */
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

module.exports = { extractTextFromPDF };
