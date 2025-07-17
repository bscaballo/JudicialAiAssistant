import { apiRequest } from "../lib/apiUtils";

const COURTLISTENER_BASE_URL = "https://www.courtlistener.com/api/rest/v4";

export interface CourtListenerCase {
  id: string;
  caseName: string;
  citation: string;
  court: string;
  dateFiled: string;
  snippet: string;
  url: string;
  judges: string[];
}

export interface CourtListenerSearchResult {
  count: number;
  results: CourtListenerCase[];
}

export async function searchCourtListener(
  query: string,
  jurisdiction?: string,
  courtLevel?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<CourtListenerSearchResult> {
  try {
    const searchParams = new URLSearchParams({
      q: query,
      type: "o", // opinions
      order_by: "score desc",
      stat_Precedential: "on", // only precedential opinions
    });

    // Add date filters if provided
    if (dateFrom) {
      searchParams.append("filed_after", dateFrom);
    }
    if (dateTo) {
      searchParams.append("filed_before", dateTo);
    }

    // Add jurisdiction filter
    if (jurisdiction && jurisdiction !== "all") {
      if (jurisdiction === "federal") {
        searchParams.append("court", "scotus,ca1,ca2,ca3,ca4,ca5,ca6,ca7,ca8,ca9,ca10,ca11,cadc,cafc");
      } else if (jurisdiction === "state") {
        // Add state court codes - this is a simplified example
        searchParams.append("court", "cal,ny,tx,fl"); // Major state courts
      }
    }

    // Add court level filter
    if (courtLevel && courtLevel !== "all") {
      if (courtLevel === "supreme") {
        searchParams.append("court", "scotus");
      } else if (courtLevel === "appeals") {
        searchParams.append("court", "ca1,ca2,ca3,ca4,ca5,ca6,ca7,ca8,ca9,ca10,ca11,cadc,cafc");
      }
    }

    const response = await fetch(`${COURTLISTENER_BASE_URL}/search/?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`CourtListener API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      count: data.count || 0,
      results: (data.results || []).map((result: any) => ({
        id: result.id,
        caseName: result.caseName || result.case_name || "Unknown Case",
        citation: result.citation?.join(", ") || "No citation",
        court: result.court || "Unknown Court",
        dateFiled: result.date_filed || "Unknown Date",
        snippet: result.snippet || "No snippet available",
        url: result.absolute_url || `https://www.courtlistener.com${result.url}`,
        judges: result.judges || [],
      })),
    };
  } catch (error) {
    console.error("Error searching CourtListener:", error);
    return {
      count: 0,
      results: [],
    };
  }
}

export async function getCaseDetails(caseId: string): Promise<CourtListenerCase | null> {
  try {
    const response = await fetch(`${COURTLISTENER_BASE_URL}/opinions/${caseId}/`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      id: data.id,
      caseName: data.case_name || "Unknown Case",
      citation: data.citation?.join(", ") || "No citation",
      court: data.court || "Unknown Court",
      dateFiled: data.date_filed || "Unknown Date",
      snippet: data.html_with_citations || data.plain_text || "No content available",
      url: data.absolute_url || `https://www.courtlistener.com${data.url}`,
      judges: data.judges || [],
    };
  } catch (error) {
    console.error("Error fetching case details:", error);
    return null;
  }
}