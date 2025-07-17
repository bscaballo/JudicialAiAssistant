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

    // Extract text content from the file
    const textContent = await extractTextFromFile(file.path, file.mimetype);

    // Save file metadata and text content to database
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
    if (fileType === 'text/plain') {
      return fs.readFileSync(filePath, 'utf-8');
    }
    
    if (fileType === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(pdfBuffer);
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
