import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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