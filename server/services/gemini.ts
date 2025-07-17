import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "../storage";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to upload file to Gemini
async function uploadFileToGemini(filePath: string, mimeType: string, displayName: string) {
  try {
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');
    
    // For now, we'll use inline data. In production, you might want to use the File API for larger files
    return {
      inlineData: {
        mimeType,
        data: base64Data
      }
    };
  } catch (error) {
    console.error(`Error uploading file ${filePath}:`, error);
    throw error;
  }
}

export async function generateCaseBrief(documentIds: number[], caseDetails: any) {
  try {
    // Check if OpenAI is configured
    const useOpenAI = process.env.OPENAI_API_KEY ? true : false;
    // Get documents from database
    const documents = await Promise.all(
      documentIds.map(id => storage.getDocumentById(id))
    );
    
    // Filter out any null documents
    const validDocuments = documents.filter(doc => doc);
    
    // Prepare parts for Gemini - include both files and text prompt
    const parts: any[] = [];
    
    // Upload each document to Gemini
    for (const doc of validDocuments) {
      if (doc!.fileType === 'application/pdf' || doc!.fileType === 'text/plain') {
        try {
          const filePart = await uploadFileToGemini(
            doc!.filePath,
            doc!.fileType,
            doc!.fileName
          );
          parts.push(filePart);
        } catch (error) {
          console.error(`Failed to upload file ${doc!.fileName}:`, error);
          // If file upload fails, fall back to text content if available
          if (doc!.textContent) {
            parts.push({
              text: `[${doc!.fileName}]:\n${doc!.textContent}`
            });
          }
        }
      } else if (doc!.textContent) {
        // For non-PDF/text files, use text content if available
        parts.push({
          text: `[${doc!.fileName}]:\n${doc!.textContent}`
        });
      }
    }
    
    // Add the text prompt
    const prompt = `
    You are a judicial assistant helping to create a comprehensive case brief. 
    
    Case Details:
    - Case Name: ${caseDetails.caseName}
    - Case Number: ${caseDetails.caseNumber}
    - Court: ${caseDetails.court}
    - Date Filed: ${caseDetails.dateFiled}
    
    I have uploaded ${validDocuments.length} document(s) for you to analyze. Please review all the documents and generate a comprehensive case brief that includes:
    
    1. Case Summary
    2. Key Legal Issues
    3. Relevant Facts
    4. Legal Precedents (if applicable)
    5. Procedural History
    6. Recommended Actions
    
    Format the response as a professional legal brief.
    `;
    
    // If OpenAI is configured, use it for better accuracy
    if (useOpenAI) {
      const { generateCaseBriefWithOpenAI } = await import("./openai");
      return await generateCaseBriefWithOpenAI(caseDetails, validDocuments);
    }
    
    parts.push({ text: prompt });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent(parts);

    return {
      summary: response.response.text() || "Failed to generate case brief",
      caseDetails,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating case brief:", error);
    throw error;
  }
}

export async function performLegalResearch(query: string, filters: any) {
  try {
    // Check if OpenAI is configured
    const useOpenAI = process.env.OPENAI_API_KEY ? true : false;
    
    // First, search CourtListener for actual case law
    const { searchCourtListener } = await import("./courtListener");
    const courtListenerResults = await searchCourtListener(
      query,
      filters.jurisdiction,
      filters.courtLevel,
      filters.dateFrom,
      filters.dateTo,
      filters.state,
      filters.federalCircuit,
      filters.searchType,
      filters.status
    );
    
    // If OpenAI is configured, use it for better accuracy
    if (useOpenAI) {
      const { performLegalResearchWithOpenAI } = await import("./openai");
      return await performLegalResearchWithOpenAI(query, filters, courtListenerResults);
    }

    // Prepare case law context for Gemini
    const caseContext = courtListenerResults.results.slice(0, 10).map(caseItem => 
      `Case: ${caseItem.caseName}\nCitation: ${caseItem.citation}\nCourt: ${caseItem.court}\nDate: ${caseItem.dateFiled}\nSnippet: ${caseItem.snippet}\nURL: ${caseItem.url}`
    ).join('\n\n');

    // Build search query for Google grounding
    let groundingQuery = query;
    if (filters.jurisdiction === 'state' && filters.state) {
      groundingQuery += ` ${filters.state.toUpperCase()} state law`;
    }
    if (filters.jurisdiction === 'federal' && filters.federalCircuit) {
      groundingQuery += ` ${filters.federalCircuit} circuit court`;
    }
    if (filters.courtLevel && filters.courtLevel !== 'all') {
      groundingQuery += ` ${filters.courtLevel} court`;
    }
    groundingQuery += " legal precedent case law analysis";

    const prompt = `
    You are a legal research assistant with access to real case law data. Please research the following legal query and provide comprehensive results.
    
    Query: ${query}
    
    Filters Applied:
    - Jurisdiction: ${filters.jurisdiction === 'all' ? 'All' : filters.jurisdiction || 'All'}
    ${filters.jurisdiction === 'state' && filters.state ? `- State: ${filters.state.toUpperCase()}` : ''}
    ${filters.jurisdiction === 'federal' && filters.federalCircuit ? `- Federal Circuit: ${filters.federalCircuit}` : ''}
    - Court Level: ${filters.courtLevel === 'all' ? 'All' : filters.courtLevel || 'All'}
    - Date Range: ${filters.dateFrom || 'All time'} to ${filters.dateTo || 'All time'}
    
    ACTUAL CASE LAW FOUND FROM COURTLISTENER:
    ${caseContext}
    
    Using both the actual case law above and additional legal research, provide a comprehensive legal research report that includes:
    1. **Case Law Analysis**: Analyze the actual cases found above, explaining their relevance to the query
    2. **Key Legal Principles**: Extract and explain the main legal principles from these cases
    3. **Precedential Value**: Explain the precedential value of these cases
    4. **Recent Developments**: Include any recent legal developments or trends found through research
    5. **Practical Applications**: How these cases apply to current legal practice
    6. **Additional Research Recommendations**: Suggest further avenues for research
    
    Format the response as a structured legal research report with proper citations.
    Use the actual case names, citations, and courts from the data provided above.
    `;

    // Use Gemini 2.5 Pro with Google Search grounding
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    });
    
    // Configure the grounding tool
    const groundingTool = {
      google_search: {}
    };
    
    // Build generation config with grounding
    const config = {
      tools: [groundingTool],
      generationConfig: {
        temperature: 1.0, // Recommended for grounding
      }
    };
    
    const response = await model.generateContent(
      prompt + `\n\nWhen searching, focus on: "${groundingQuery}"`,
      config
    );

    const result = response.response;
    const text = result.text();
    
    // Extract grounding metadata if available
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata || null;

    return {
      results: text || "Failed to perform legal research",
      query,
      filters,
      courtListenerResults,
      searchedAt: new Date().toISOString(),
      groundingMetadata: groundingMetadata,
      webSearchQueries: groundingMetadata?.webSearchQueries || [],
      groundingChunks: groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    console.error("Error performing legal research:", error);
    throw error;
  }
}

export async function exploreCaseLaw(topic: string, jurisdiction: string, dateRange: any) {
  try {
    // Check if OpenAI is configured
    const useOpenAI = process.env.OPENAI_API_KEY ? true : false;
    
    // If OpenAI is configured, use it for better accuracy
    if (useOpenAI) {
      const { exploreCaseLawWithOpenAI } = await import("./openai");
      return await exploreCaseLawWithOpenAI(topic, jurisdiction, dateRange);
    }
    
    const prompt = `
    You are a judicial research assistant. Please explore case law related to the following topic.
    
    Topic: ${topic}
    Jurisdiction: ${jurisdiction}
    Date Range: ${dateRange.from} to ${dateRange.to}
    
    Please provide:
    1. Landmark cases in this area
    2. Recent developments and trends
    3. Circuit splits or conflicting decisions
    4. Key legal principles and holdings
    5. Practical applications for judges
    
    Format the response as a comprehensive case law analysis.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent(prompt);

    return {
      analysis: response.response.text() || "Failed to explore case law",
      topic,
      jurisdiction,
      dateRange,
      exploredAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error exploring case law:", error);
    throw error;
  }
}

export async function analyzeEvidence(documentIds: number[], analysisType: string) {
  try {
    // Get documents from database
    const documents = await Promise.all(
      documentIds.map(id => storage.getDocumentById(id))
    );
    
    // Filter out any null documents
    const validDocuments = documents.filter(doc => doc);
    
    // Prepare parts for Gemini
    const parts: any[] = [];
    
    // Upload each document to Gemini
    for (const doc of validDocuments) {
      if (doc!.fileType === 'application/pdf' || doc!.fileType === 'text/plain') {
        try {
          const filePart = await uploadFileToGemini(
            doc!.filePath,
            doc!.fileType,
            doc!.fileName
          );
          parts.push(filePart);
        } catch (error) {
          console.error(`Failed to upload file ${doc!.fileName}:`, error);
          // If file upload fails, fall back to text content if available
          if (doc!.textContent) {
            parts.push({
              text: `[${doc!.fileName}]:\n${doc!.textContent}`
            });
          }
        }
      } else if (doc!.textContent) {
        // For non-PDF/text files, use text content if available
        parts.push({
          text: `[${doc!.fileName}]:\n${doc!.textContent}`
        });
      }
    }

    const prompt = `
    You are a judicial evidence analysis assistant. I have uploaded ${validDocuments.length} evidence document(s) for you to analyze.
    
    Analysis Type: ${analysisType}
    
    Please provide:
    1. Evidence categorization and classification
    2. Relevance assessment
    3. Admissibility considerations
    4. Potential challenges or objections
    5. Probative value analysis
    6. Recommendations for judicial consideration
    
    Format the response as a professional evidence analysis report.
    `;
    
    parts.push({ text: prompt });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent(parts);

    return {
      analysis: response.response.text() || "Failed to analyze evidence",
      analysisType,
      documentCount: documentIds.length,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error analyzing evidence:", error);
    throw error;
  }
}

export async function generateOrder(orderType: string, caseDetails: any, rulingDetails: string) {
  try {
    const prompt = `
    You are a judicial assistant helping to draft a formal court order.
    
    Order Type: ${orderType}
    Case Details:
    - Case Name: ${caseDetails.caseName}
    - Case Number: ${caseDetails.caseNumber}
    - Court: ${caseDetails.court}
    
    Ruling Details:
    ${rulingDetails}
    
    Please generate a formal court order that includes:
    1. Proper legal heading and case style
    2. Introduction and background
    3. Findings of fact
    4. Conclusions of law
    5. Order provisions
    6. Signature block
    
    Format the response as a professional court order ready for judicial signature.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent(prompt);

    return {
      content: response.response.text() || "Failed to generate order",
      orderType,
      caseDetails,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating order:", error);
    throw error;
  }
}

export async function generateJuryInstructions(caseDetails: any, charges: string, specificPoints: string) {
  try {
    const prompt = `
    You are a judicial assistant helping to draft jury instructions.
    
    Case Details:
    - Case Name: ${caseDetails.caseName}
    - Case Number: ${caseDetails.caseNumber}
    
    Charges: ${charges}
    Specific Points to Cover: ${specificPoints}
    
    Please generate comprehensive jury instructions that include:
    1. General instructions about jury duties
    2. Burden of proof explanation
    3. Elements of each charge
    4. Relevant legal definitions
    5. Specific instructions for this case
    6. Verdict form instructions
    
    Format the response as professional jury instructions suitable for court use.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent(prompt);

    return {
      instructions: response.response.text() || "Failed to generate jury instructions",
      caseDetails,
      charges,
      specificPoints,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating jury instructions:", error);
    throw error;
  }
}

export async function coachOralArgument(caseDetails: any, argumentsText: string, practiceMode: string) {
  try {
    const prompt = `
    You are an oral argument coach for judges helping to prepare for courtroom proceedings.
    
    Case Details:
    - Case Name: ${caseDetails.caseName}
    - Case Number: ${caseDetails.caseNumber}
    
    Arguments to be presented: ${argumentsText}
    Practice Mode: ${practiceMode}
    
    Please provide:
    1. Key questions to ask attorneys
    2. Potential areas of inquiry
    3. Legal precedents to reference
    4. Procedural considerations
    5. Time management suggestions
    6. Common pitfalls to avoid
    
    Format the response as a comprehensive oral argument preparation guide.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent(prompt);

    return {
      coaching: response.response.text() || "Failed to provide oral argument coaching",
      caseDetails,
      argumentsText,
      practiceMode,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error coaching oral argument:", error);
    throw error;
  }
}
