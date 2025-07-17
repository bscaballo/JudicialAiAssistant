import fs from "fs";
import path from "path";
import { storage } from "../storage";
import pdfParse from "pdf-parse";

export async function processFileUpload(file: Express.Multer.File, userId: string, caseId?: number) {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Try to extract text content, but don't fail if it doesn't work
    // Since Gemini can handle PDFs natively, text extraction is optional
    let textContent = '';
    try {
      textContent = await extractTextFromFile(file.path, file.mimetype);
    } catch (error) {
      console.warn(`Text extraction failed for ${file.originalname}, but file can still be processed by Gemini:`, error);
      textContent = ''; // Empty text content is fine since Gemini will read the PDF directly
    }

    // Save file metadata to database - file path is most important for Gemini
    const document = await storage.createDocument({
      userId,
      caseId: caseId || null,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      filePath: file.path,
      textContent,
    });

    return document;
  } catch (error) {
    console.error("Error processing file upload:", error);
    throw error;
  }
}

export async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  try {
    console.log(`Extracting text from file: ${filePath}, type: ${fileType}`);
    
    if (fileType === 'text/plain') {
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`Text file content length: ${content.length}`);
      return content;
    }
    
    if (fileType === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(filePath);
      console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);
      
      const data = await pdfParse(pdfBuffer);
      console.log(`PDF parsed successfully. Text length: ${data.text.length}`);
      console.log(`PDF text preview: "${data.text.substring(0, 200)}"`);
      
      if (!data.text || data.text.trim().length === 0) {
        console.warn("PDF text extraction returned empty content");
        return `[PDF appears to be empty or contains only images/scanned content]`;
      }
      
      return data.text;
    }
    
    // For other file types like Word documents, we could add more parsers
    // For now, return a message indicating the file type is not supported
    return `[Text extraction not supported for ${fileType}]`;
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return `[Error extracting text from file: ${error.message}]`;
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
