import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function performLegalResearchWithOpenAI(
  query: string, 
  filters: any,
  courtListenerResults: any
) {
  try {
    // Prepare case law context from CourtListener
    const caseContext = courtListenerResults.results.slice(0, 10).map((caseItem: any) => 
      `Case: ${caseItem.caseName}\nCitation: ${caseItem.citation}\nCourt: ${caseItem.court}\nDate: ${caseItem.dateFiled}\nSnippet: ${caseItem.snippet}\nURL: ${caseItem.url}`
    ).join('\n\n');

    // Build the prompt with emphasis on using only real cases
    const prompt = `You are a legal research assistant analyzing actual case law data. Your role is to provide accurate legal analysis based ONLY on the real cases provided.

Query: ${query}

Filters Applied:
- Jurisdiction: ${filters.jurisdiction === 'all' ? 'All' : filters.jurisdiction || 'All'}
${filters.jurisdiction === 'state' && filters.state ? `- State: ${filters.state.toUpperCase()}` : ''}
${filters.jurisdiction === 'federal' && filters.federalCircuit ? `- Federal Circuit: ${filters.federalCircuit}` : ''}
- Court Level: ${filters.courtLevel === 'all' ? 'All' : filters.courtLevel || 'All'}
- Date Range: ${filters.dateFrom || 'All time'} to ${filters.dateTo || 'All time'}

IMPORTANT INSTRUCTIONS:
1. You MUST ONLY cite and analyze the actual cases provided below
2. DO NOT make up or hallucinate any case names, citations, or holdings
3. If the provided cases are not sufficient, explicitly state this limitation
4. All case citations must exactly match those provided in the data below

ACTUAL CASE LAW FROM COURTLISTENER:
${caseContext}

Based ONLY on the actual cases above, provide a comprehensive legal research report that includes:

1. **Case Law Analysis**: Analyze ONLY the actual cases found above, explaining their relevance to the query
2. **Key Legal Principles**: Extract and explain the main legal principles from these specific cases
3. **Precedential Value**: Explain the precedential value of these actual cases
4. **Limitations**: Clearly state any limitations in the available case law
5. **Practical Applications**: How these specific cases apply to current legal practice
6. **Additional Research Recommendations**: Suggest further avenues for research if the available cases are insufficient

Format the response as a structured legal research report with proper citations.
Use ONLY the exact case names, citations, and courts from the data provided above.
If you need to reference legal principles not found in the provided cases, clearly indicate this as "general legal principle" rather than citing a specific case.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a precise legal research assistant. You must ONLY cite actual cases provided in the context. Never make up case names or citations. If information is limited, explicitly state this."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 2000,
    });

    return {
      results: response.choices[0].message.content || "Failed to perform legal research",
      query,
      filters,
      courtListenerResults,
      searchedAt: new Date().toISOString(),
      model: "gpt-4o",
      provider: "openai"
    };
  } catch (error) {
    console.error("Error performing legal research with OpenAI:", error);
    throw error;
  }
}

export async function generateCaseBriefWithOpenAI(
  caseDetails: any,
  documents: any[]
) {
  try {
    // Process documents and extract text content
    const documentContext = documents.map((doc, index) => {
      return `Document ${index + 1}: ${doc.fileName}\nContent: ${doc.textContent || 'No text extracted'}`;
    }).join('\n\n');

    const prompt = `You are a judicial assistant helping to create a comprehensive case brief based on actual documents.

Case Details:
- Case Name: ${caseDetails.caseName}
- Case Number: ${caseDetails.caseNumber}
- Court: ${caseDetails.court}
- Date Filed: ${caseDetails.dateFiled}

DOCUMENT CONTENT:
${documentContext}

Based on the actual documents provided, generate a comprehensive case brief that includes:

1. Case Summary
2. Key Legal Issues
3. Relevant Facts (extracted from the documents)
4. Legal Precedents (only if explicitly mentioned in the documents)
5. Procedural History
6. Recommended Actions

IMPORTANT: Base your analysis ONLY on the information contained in the provided documents. Do not invent or assume facts not present in the documents.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a precise judicial assistant. Analyze only the information provided in the documents. Do not make assumptions or add information not present in the source material."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return {
      summary: response.choices[0].message.content || "Failed to generate case brief",
      caseDetails,
      generatedAt: new Date().toISOString(),
      model: "gpt-4o",
      provider: "openai"
    };
  } catch (error) {
    console.error("Error generating case brief with OpenAI:", error);
    throw error;
  }
}

export async function exploreCaseLawWithOpenAI(
  topic: string, 
  jurisdiction: string, 
  dateRange: any
) {
  try {
    const prompt = `You are a judicial research assistant providing accurate information about case law.

Topic: ${topic}
Jurisdiction: ${jurisdiction}
Date Range: ${dateRange.from} to ${dateRange.to}

Please provide information about case law in this area. For any cases you mention:
1. Clearly indicate if you're referring to well-known landmark cases
2. Include proper citations where available
3. If you're discussing general legal principles without specific cases, clearly state this
4. Focus on accurate, verifiable information

Include:
1. Landmark cases in this area (with proper citations)
2. General legal principles and trends
3. Common issues and considerations
4. Practical applications for judges
5. Areas requiring further research

Be explicit about the source and certainty of your information.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a careful legal researcher. When discussing cases, be clear about whether you're citing specific cases or discussing general principles. Avoid making up case names or citations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    return {
      exploration: response.choices[0].message.content || "Failed to explore case law",
      topic,
      jurisdiction,
      dateRange,
      exploredAt: new Date().toISOString(),
      model: "gpt-4o",
      provider: "openai"
    };
  } catch (error) {
    console.error("Error exploring case law with OpenAI:", error);
    throw error;
  }
}