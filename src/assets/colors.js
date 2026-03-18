export const CATEGORY_COLORS = {
  "ACADEMIC CENTERS & PROGRAMS":                              "#7c3aed",
  "AFFECTED BUT UNDERREPRESENTED POPULATIONS (\"SLEEPING GIANTS\")": "#b91c1c",
  "AI LABS & MAJOR TECH COMPANIES":                           "#dc2626",
  "AI SAFETY & ALIGNMENT RESEARCH ORGANIZATIONS":             "#e11d48",
  "CIVIL SOCIETY, ADVOCACY & NONPROFITS":                     "#c026d3",
  "EXISTING MAPPING RESOURCES":                               "#475569",
  "HEALTHCARE SECTOR":                                        "#16a34a",
  "INDUSTRY GROUPS & TRADE ASSOCIATIONS":                     "#ea580c",
  "INTERNATIONAL GOVERNMENTS & REGULATORY BODIES":            "#0891b2",
  "INTERNATIONAL MULTILATERAL ORGANIZATIONS":                 "#0d9488",
  "INVESTORS & FUNDERS":                                      "#737373",
  "KEY INDIVIDUAL VOICES & THOUGHT LEADERS":                  "#f97316",
  "LABOR & WORKER ORGANIZATIONS":                             "#ca8a04",
  "MEDIA & INFORMATION ECOSYSTEM":                            "#0284c7",
  "OFTEN-OVERLOOKED PLAYERS":                                 "#65a30d",
  "THINK TANKS & RESEARCH INSTITUTES":                        "#8b5cf6",
  "US FEDERAL GOVERNMENT - EXECUTIVE BRANCH":                 "#1e40af",
  "US FEDERAL GOVERNMENT - LEGISLATIVE BRANCH":               "#3b82f6",
  "US STATE GOVERNMENTS":                                     "#6366f1",
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || "#999999";
}
