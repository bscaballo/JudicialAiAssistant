import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function generateCaseInfo(textContent: string) {
  try {
    const prompt = `
    You are a legal document analyzer. Please extract case information from the following legal document text.
    
    Document Text:
    ${textContent}
    
    Please extract the following information and format it as JSON:
    {
      "caseName": "The full case name/title (e.g., 'Smith v. Jones')",
      "caseNumber": "The case number (e.g., '2024-CV-001')",
      "court": "The court name (e.g., 'Superior Court of California')",
      "dateFiled": "The date filed in YYYY-MM-DD format"
    }
    
    Instructions:
    - Look for case captions, headers, or titles that indicate the parties involved
    - Find case numbers, docket numbers, or filing numbers
    - Identify the court name or jurisdiction
    - Look for filing dates, service dates, or other relevant dates
    - If any information is not found, set the value to null
    - Only return the JSON object, no additional text
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent(prompt);
    const responseText = response.response.text();
    
    try {
      // Parse the JSON response
      const caseInfo = JSON.parse(responseText);
      
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