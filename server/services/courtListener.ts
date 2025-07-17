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
  status?: string;
  citeCount?: number;
  docketNumber?: string;
}

export interface CourtListenerSearchResult {
  count: number;
  results: CourtListenerCase[];
}

// Court mappings for states and federal circuits
const STATE_COURT_MAPPINGS: { [key: string]: { supreme: string; appeals: string[]; trial: string[] } } = {
  nm: {
    supreme: "nmcoa", // New Mexico Supreme Court
    appeals: ["nmapp"], // New Mexico Court of Appeals
    trial: ["nm"] // New Mexico District Courts
  },
  tx: {
    supreme: "tex", // Texas Supreme Court
    appeals: ["texapp1", "texapp2", "texapp3", "texapp4", "texapp5", "texapp6", "texapp7", "texapp8", "texapp9", "texapp10", "texapp11", "texapp12", "texapp13", "texapp14"],
    trial: ["txd"]
  },
  az: {
    supreme: "ariz", // Arizona Supreme Court
    appeals: ["arizctapp"], // Arizona Court of Appeals
    trial: ["azd"]
  },
  ca: {
    supreme: "cal", // California Supreme Court
    appeals: ["calctapp1", "calctapp2", "calctapp3", "calctapp4", "calctapp5", "calctapp6"],
    trial: ["casd", "cand", "cacd", "caed"]
  },
  ny: {
    supreme: "ny", // New York Court of Appeals (highest court)
    appeals: ["nyappterm1", "nyappterm2", "nyappdiv1", "nyappdiv2", "nyappdiv3", "nyappdiv4"],
    trial: ["nyd"]
  },
  fl: {
    supreme: "fla", // Florida Supreme Court
    appeals: ["flaapp1", "flaapp2", "flaapp3", "flaapp4", "flaapp5"],
    trial: ["fld"]
  },
  co: {
    supreme: "colo", // Colorado Supreme Court
    appeals: ["coloctapp"], // Colorado Court of Appeals
    trial: ["cod"]
  },
  nv: {
    supreme: "nev", // Nevada Supreme Court
    appeals: [], // Nevada has no intermediate appellate court
    trial: ["nvd"]
  },
  ut: {
    supreme: "utah", // Utah Supreme Court
    appeals: ["utahctapp"], // Utah Court of Appeals
    trial: ["utd"]
  },
  ok: {
    supreme: "okla", // Oklahoma Supreme Court
    appeals: ["oklacrimapp", "oklacivapp"], // Criminal and Civil Appeals
    trial: ["okd"]
  }
};

const FEDERAL_COURT_MAPPINGS = {
  supreme: "scotus",
  appeals: {
    "1st": "ca1",
    "2nd": "ca2",
    "3rd": "ca3",
    "4th": "ca4",
    "5th": "ca5",
    "6th": "ca6",
    "7th": "ca7",
    "8th": "ca8",
    "9th": "ca9",
    "10th": "ca10",
    "11th": "ca11",
    "dc": "cadc",
    "federal": "cafc"
  },
  district: ["dcd", "ded", "fld", "gad", "ilnd", "ilsd", "innd", "insd", "mad", "mdd", "mied", "miwd", "mnd", "mod", "mtd", "ndd", "ned", "nhd", "njd", "nmd", "nvd", "nyd", "nyed", "nynd", "nysd", "nywd", "ohnd", "ohsd", "okd", "ord", "pad", "paed", "pamd", "pawd", "rid", "scd", "sdd", "tnd", "txed", "txnd", "txsd", "txwd", "utd", "vad", "vtd", "wad", "waed", "wawd", "wdd", "wvnd", "wvsd", "wyd"]
};

export interface SearchFilters {
  jurisdiction?: string;
  courtLevel?: string;
  state?: string;
  federalCircuit?: string;
  dateFrom?: string;
  dateTo?: string;
  searchType?: "all" | "caseName" | "docketNumber" | "citation";
  status?: string;
}

export async function searchCourtListener(
  query: string,
  jurisdiction?: string,
  courtLevel?: string,
  dateFrom?: string,
  dateTo?: string,
  state?: string,
  federalCircuit?: string,
  searchType?: string,
  status?: string
): Promise<CourtListenerSearchResult> {
  try {
    // Build advanced query with field-specific searches
    let enhancedQuery = query;
    
    // Add field-specific search if specified
    if (searchType && searchType !== "all") {
      switch (searchType) {
        case "caseName":
          enhancedQuery = `caseName:(${query})`;
          break;
        case "docketNumber":
          enhancedQuery = `docketNumber:(${query})`;
          break;
        case "citation":
          enhancedQuery = `citation:(${query})`;
          break;
      }
    }
    
    let courtIds: string[] = [];

    // Build court list based on filters
    if (jurisdiction === "federal") {
      if (courtLevel === "supreme") {
        courtIds.push(FEDERAL_COURT_MAPPINGS.supreme);
      } else if (courtLevel === "appeals") {
        if (federalCircuit) {
          const circuitCourt = FEDERAL_COURT_MAPPINGS.appeals[federalCircuit];
          if (circuitCourt) courtIds.push(circuitCourt);
        } else {
          // All federal appeals courts
          courtIds = courtIds.concat(Object.values(FEDERAL_COURT_MAPPINGS.appeals));
        }
      } else if (courtLevel === "district") {
        courtIds = courtIds.concat(FEDERAL_COURT_MAPPINGS.district);
      } else if (!courtLevel || courtLevel === "all") {
        // All federal courts
        if (!federalCircuit) {
          courtIds.push(FEDERAL_COURT_MAPPINGS.supreme);
          courtIds = courtIds.concat(Object.values(FEDERAL_COURT_MAPPINGS.appeals));
          courtIds = courtIds.concat(FEDERAL_COURT_MAPPINGS.district);
        } else {
          // Specific circuit - include supreme, circuit appeals, and district courts in that circuit
          courtIds.push(FEDERAL_COURT_MAPPINGS.supreme);
          const circuitCourt = FEDERAL_COURT_MAPPINGS.appeals[federalCircuit];
          if (circuitCourt) courtIds.push(circuitCourt);
          // Add district courts for the circuit (simplified - in production you'd map districts to circuits)
        }
      }
    } else if (jurisdiction === "state" && state) {
      const stateMapping = STATE_COURT_MAPPINGS[state.toLowerCase()];
      if (stateMapping) {
        if (courtLevel === "supreme") {
          courtIds.push(stateMapping.supreme);
        } else if (courtLevel === "appeals") {
          courtIds = courtIds.concat(stateMapping.appeals);
        } else if (courtLevel === "trial") {
          courtIds = courtIds.concat(stateMapping.trial);
        } else {
          // All courts for the state
          courtIds.push(stateMapping.supreme);
          courtIds = courtIds.concat(stateMapping.appeals);
          courtIds = courtIds.concat(stateMapping.trial);
        }
      }
    }

    // Add court_id field search to the query if we have specific courts
    if (courtIds.length > 0) {
      const courtQuery = courtIds.map(id => `court_id:${id}`).join(" OR ");
      // Only wrap original query in parentheses if it's not already a field search
      if (searchType && searchType !== "all") {
        enhancedQuery = `${enhancedQuery} AND (${courtQuery})`;
      } else {
        enhancedQuery = `(${query}) AND (${courtQuery})`;
      }
    }

    // Add status filter if provided
    if (status && status !== "all") {
      enhancedQuery += ` AND status:${status}`;
    }

    // Add date range to query if provided
    if (dateFrom || dateTo) {
      const fromDate = dateFrom || "1800-01-01";
      const toDate = dateTo || new Date().toISOString().split('T')[0];
      enhancedQuery += ` AND dateFiled:[${fromDate} TO ${toDate}]`;
    }

    const searchParams = new URLSearchParams({
      q: enhancedQuery,
      type: "o", // opinions
      order_by: "-dateFiled", // Most recent first
    });

    const response = await fetch(`${COURTLISTENER_BASE_URL}/search/?${searchParams}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CourtListener API error: ${response.status}`, errorText);
      throw new Error(`CourtListener API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      count: data.count || 0,
      results: (data.results || []).map((result: any) => ({
        id: result.id,
        caseName: result.caseName || result.caseNameFull || result.case_name || "Unknown Case",
        citation: Array.isArray(result.citation) ? result.citation.join(", ") : (result.citation || "No citation"),
        court: result.court || result.court_citation_string || "Unknown Court",
        dateFiled: result.dateFiled || result.date_filed || "Unknown Date",
        snippet: result.snippet || result.text || "No snippet available",
        url: result.absolute_url || `https://www.courtlistener.com${result.frontendUrl || result.url}`,
        judges: result.panel_names || result.judges || [],
        status: result.status || "unknown",
        citeCount: result.citeCount || 0,
        docketNumber: result.docketNumber || "",
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

// Export court mappings for use in UI
export const AVAILABLE_STATES = Object.keys(STATE_COURT_MAPPINGS).map(key => ({
  value: key,
  label: key.toUpperCase()
}));

export const AVAILABLE_FEDERAL_CIRCUITS = Object.keys(FEDERAL_COURT_MAPPINGS.appeals).map(key => ({
  value: key,
  label: key === "dc" ? "D.C. Circuit" : key === "federal" ? "Federal Circuit" : `${key} Circuit`
}))

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