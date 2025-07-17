import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "../storage";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateCaseBrief(documentIds: number[], caseDetails: any) {
  try {
    // Get document content
    const documents = await Promise.all(
      documentIds.map(id => storage.getDocumentById(id))
    );
    
    const documentContent = documents
      .filter(doc => doc)
      .map(doc => {
        if (doc!.fileType === 'text/plain') {
          return fs.readFileSync(doc!.filePath, 'utf-8');
        }
        return `[${doc!.fileName}] - Content extraction not implemented for ${doc!.fileType}`;
      })
      .join('\n\n');

    const prompt = `
    You are a judicial assistant helping to create a comprehensive case brief. 
    
    Case Details:
    - Case Name: ${caseDetails.caseName}
    - Case Number: ${caseDetails.caseNumber}
    - Court: ${caseDetails.court}
    - Date Filed: ${caseDetails.dateFiled}
    
    Document Content:
    ${documentContent}
    
    Please generate a comprehensive case brief that includes:
    1. Case Summary
    2. Key Legal Issues
    3. Relevant Facts
    4. Legal Precedents (if applicable)
    5. Procedural History
    6. Recommended Actions
    
    Format the response as a professional legal brief.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);

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
    // First, search CourtListener for actual case law
    const { searchCourtListener } = await import("./courtListener");
    const courtListenerResults = await searchCourtListener(
      query,
      filters.jurisdiction,
      filters.courtLevel,
      filters.dateFrom,
      filters.dateTo
    );

    // Prepare case law context for Gemini
    const caseContext = courtListenerResults.results.slice(0, 10).map(caseItem => 
      `Case: ${caseItem.caseName}\nCitation: ${caseItem.citation}\nCourt: ${caseItem.court}\nDate: ${caseItem.dateFiled}\nSnippet: ${caseItem.snippet}\nURL: ${caseItem.url}`
    ).join('\n\n');

    const prompt = `
    You are a legal research assistant with access to real case law data. Please research the following legal query and provide comprehensive results.
    
    Query: ${query}
    
    Filters Applied:
    - Jurisdiction: ${filters.jurisdiction === 'all' ? 'All' : filters.jurisdiction || 'All'}
    - Court Level: ${filters.courtLevel === 'all' ? 'All' : filters.courtLevel || 'All'}
    - Date Range: ${filters.dateFrom || 'All time'} to ${filters.dateTo || 'All time'}
    
    ACTUAL CASE LAW FOUND:
    ${caseContext}
    
    Please provide a comprehensive legal research report that includes:
    1. **Case Law Analysis**: Analyze the actual cases found above, explaining their relevance to the query
    2. **Key Legal Principles**: Extract and explain the main legal principles from these cases
    3. **Precedential Value**: Explain the precedential value of these cases
    4. **Practical Applications**: How these cases apply to current legal practice
    5. **Additional Research Recommendations**: Suggest further avenues for research
    
    Format the response as a structured legal research report with proper citations.
    Use the actual case names, citations, and courts from the data provided above.
    `;

    // Use Gemini 2.5 Pro for enhanced results
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro"
    });
    
    const response = await model.generateContent(prompt);

    return {
      results: response.response.text() || "Failed to perform legal research",
      query,
      filters,
      courtListenerResults,
      searchedAt: new Date().toISOString(),
      groundingMetadata: response.response.candidates?.[0]?.groundingMetadata || null,
    };
  } catch (error) {
    console.error("Error performing legal research:", error);
    throw error;
  }
}

export async function exploreCaseLaw(topic: string, jurisdiction: string, dateRange: any) {
  try {
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    // Get document content
    const documents = await Promise.all(
      documentIds.map(id => storage.getDocumentById(id))
    );
    
    const documentContent = documents
      .filter(doc => doc)
      .map(doc => {
        if (doc!.fileType === 'text/plain') {
          return fs.readFileSync(doc!.filePath, 'utf-8');
        }
        return `[${doc!.fileName}] - Content extraction not implemented for ${doc!.fileType}`;
      })
      .join('\n\n');

    const prompt = `
    You are a judicial evidence analysis assistant. Please analyze the following evidence documents.
    
    Analysis Type: ${analysisType}
    
    Evidence Documents:
    ${documentContent}
    
    Please provide:
    1. Evidence categorization and classification
    2. Relevance assessment
    3. Admissibility considerations
    4. Potential challenges or objections
    5. Probative value analysis
    6. Recommendations for judicial consideration
    
    Format the response as a professional evidence analysis report.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
