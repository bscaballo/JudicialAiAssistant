import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function to convert file to base64 for Gemini
async function fileToGenerativePart(filePath: string, mimeType: string) {
  const fileData = fs.readFileSync(filePath);
  const base64Data = fileData.toString('base64');
  
  return {
    inlineData: {
      mimeType,
      data: base64Data
    }
  };
}

// New function to handle native PDF processing
export async function generateCaseInfoFromFile(filePath: string, fileType: string) {
  try {
    const parts: any[] = [];
    
    // If it's a PDF or text file, send it directly to Gemini
    if (fileType === 'application/pdf' || fileType === 'text/plain') {
      const filePart = await fileToGenerativePart(filePath, fileType);
      parts.push(filePart);
    }
    
    const prompt = `
    You are a legal document analyzer. I have uploaded a legal document for you to analyze.
    
    IMPORTANT: You must analyze the ACTUAL document content that I've uploaded. Do not make up or generate fake case information.
    
    Please extract the following information from the uploaded document and format it as JSON:
    {
      "caseName": "The full case name/title as it appears in the document (e.g., 'Smith v. Jones')",
      "caseNumber": "The case number as it appears in the document (e.g., '2024-CV-001')",
      "court": "The court name as it appears in the document (e.g., 'Superior Court of California')",
      "dateFiled": "The date filed in YYYY-MM-DD format as it appears in the document"
    }
    
    Instructions:
    - ONLY extract information that is actually present in the document
    - Look for case captions, headers, or titles that indicate the parties involved
    - Find case numbers, docket numbers, or filing numbers
    - Identify the court name or jurisdiction
    - Look for filing dates, service dates, or other relevant dates
    - If any information is not found in the document, set the value to null
    - Do not make up or generate fake information
    - Only return the JSON object, no additional text
    `;
    
    parts.push({ text: prompt });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent(parts);
    const responseText = response.response.text();
    
    // Log AI response for debugging
    console.log("AI Response (from file):", responseText);
    
    try {
      // Clean up the response text (remove markdown code blocks if present)
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Parse the JSON response
      const caseInfo = JSON.parse(cleanedResponse);
      
      // Validate and format the response
      return {
        caseName: caseInfo.caseName || null,
        caseNumber: caseInfo.caseNumber || null,
        court: caseInfo.court || null,
        dateFiled: caseInfo.dateFiled || null,
      };
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("AI Response:", responseText);
      
      // Return empty case info if parsing fails
      return {
        caseName: null,
        caseNumber: null,
        court: null,
        dateFiled: null,
      };
    }
  } catch (error) {
    console.error("Error extracting case info from file:", error);
    throw error;
  }
}

// Existing function for text-based extraction (kept as fallback)
export async function generateCaseInfo(textContent: string) {
  try {
    const prompt = `
    You are a legal document analyzer. Please carefully analyze the following legal document text and extract case information.
    
    IMPORTANT: You must analyze the ACTUAL document content provided below. Do not make up or generate fake case information.
    
    Document Text:
    ${textContent}
    
    Please extract the following information from the ACTUAL document text above and format it as JSON:
    {
      "caseName": "The full case name/title as it appears in the document (e.g., 'Smith v. Jones')",
      "caseNumber": "The case number as it appears in the document (e.g., '2024-CV-001')",
      "court": "The court name as it appears in the document (e.g., 'Superior Court of California')",
      "dateFiled": "The date filed in YYYY-MM-DD format as it appears in the document"
    }
    
    Instructions:
    - ONLY extract information that is actually present in the document text above
    - Look for case captions, headers, or titles that indicate the parties involved
    - Find case numbers, docket numbers, or filing numbers
    - Identify the court name or jurisdiction
    - Look for filing dates, service dates, or other relevant dates
    - If any information is not found in the document, set the value to null
    - Do not make up or generate fake information
    - Only return the JSON object, no additional text
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent(prompt);
    const responseText = response.response.text();
    
    // Log AI response for debugging
    console.log("AI Response:", responseText);
    
    try {
      // Clean up the response text (remove markdown code blocks if present)
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Parse the JSON response
      const caseInfo = JSON.parse(cleanedResponse);
      
      // Validate and format the response
      return {
        caseName: caseInfo.caseName || null,
        caseNumber: caseInfo.caseNumber || null,
        court: caseInfo.court || null,
        dateFiled: caseInfo.dateFiled || null,
      };
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("AI Response:", responseText);
      
      // Return empty case info if parsing fails
      return {
        caseName: null,
        caseNumber: null,
        court: null,
        dateFiled: null,
      };
    }
  } catch (error) {
    console.error("Error extracting case info:", error);
    throw error;
  }
}