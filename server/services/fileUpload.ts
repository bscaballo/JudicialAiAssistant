import fs from "fs";
import path from "path";
import { storage } from "../storage";

export async function processFileUpload(file: Express.Multer.File, userId: string, caseId?: number) {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file metadata to database
    const document = await storage.createDocument({
      userId,
      caseId: caseId || null,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      filePath: file.path,
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
    
    // For other file types, we would need additional libraries
    // For now, return a placeholder
    return `[File content extraction not implemented for ${fileType}]`;
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return `[Error extracting text from file]`;
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
