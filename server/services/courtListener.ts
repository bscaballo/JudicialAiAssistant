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

export async function searchCourtListener(
  query: string,
  jurisdiction?: string,
  courtLevel?: string,
  dateFrom?: string,
  dateTo?: string,
  state?: string,
  federalCircuit?: string
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

    // Build court list based on filters
    let courtList: string[] = [];

    if (jurisdiction === "federal") {
      if (courtLevel === "supreme") {
        courtList.push(FEDERAL_COURT_MAPPINGS.supreme);
      } else if (courtLevel === "appeals" && federalCircuit) {
        const circuitCourt = FEDERAL_COURT_MAPPINGS.appeals[federalCircuit];
        if (circuitCourt) courtList.push(circuitCourt);
      } else if (courtLevel === "district") {
        courtList = courtList.concat(FEDERAL_COURT_MAPPINGS.district);
      } else if (!courtLevel || courtLevel === "all") {
        // Add all federal courts
        courtList.push(FEDERAL_COURT_MAPPINGS.supreme);
        courtList = courtList.concat(Object.values(FEDERAL_COURT_MAPPINGS.appeals));
        courtList = courtList.concat(FEDERAL_COURT_MAPPINGS.district);
      }
    } else if (jurisdiction === "state" && state) {
      const stateMapping = STATE_COURT_MAPPINGS[state.toLowerCase()];
      if (stateMapping) {
        if (courtLevel === "supreme") {
          courtList.push(stateMapping.supreme);
        } else if (courtLevel === "appeals") {
          courtList = courtList.concat(stateMapping.appeals);
        } else if (courtLevel === "trial") {
          courtList = courtList.concat(stateMapping.trial);
        } else {
          // Add all courts for the state
          courtList.push(stateMapping.supreme);
          courtList = courtList.concat(stateMapping.appeals);
          courtList = courtList.concat(stateMapping.trial);
        }
      }
    } else if (!jurisdiction || jurisdiction === "all") {
      // No specific filtering, search all courts
      // This will search without court restriction
    }

    // Apply court filter if we have specific courts
    if (courtList.length > 0) {
      searchParams.append("court", courtList.join(","));
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