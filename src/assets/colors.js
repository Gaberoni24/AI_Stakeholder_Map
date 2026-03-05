export const CATEGORY_COLORS = {
  "ACADEMIC CENTERS & PROGRAMS":                              "#8c564b",
  "AFFECTED BUT UNDERREPRESENTED POPULATIONS (\"SLEEPING GIANTS\")": "#dbdb8d",
  "AI LABS & MAJOR TECH COMPANIES":                           "#d62728",
  "AI SAFETY & ALIGNMENT RESEARCH ORGANIZATIONS":             "#e377c2",
  "CIVIL SOCIETY, ADVOCACY & NONPROFITS":                     "#9467bd",
  "EXISTING MAPPING RESOURCES":                               "#393b79",
  "HEALTHCARE SECTOR":                                        "#bcbd22",
  "INDUSTRY GROUPS & TRADE ASSOCIATIONS":                     "#ff9896",
  "INTERNATIONAL GOVERNMENTS & REGULATORY BODIES":            "#ffbb78",
  "INTERNATIONAL MULTILATERAL ORGANIZATIONS":                 "#2ca02c",
  "INVESTORS & FUNDERS":                                      "#7f7f7f",
  "KEY INDIVIDUAL VOICES & THOUGHT LEADERS":                  "#f7b6d2",
  "LABOR & WORKER ORGANIZATIONS":                             "#c7c7c7",
  "MEDIA & INFORMATION ECOSYSTEM":                            "#17becf",
  "OFTEN-OVERLOOKED PLAYERS":                                 "#9edae5",
  "THINK TANKS & RESEARCH INSTITUTES":                        "#c5b0d5",
  "US FEDERAL GOVERNMENT - EXECUTIVE BRANCH":                 "#1f77b4",
  "US FEDERAL GOVERNMENT - LEGISLATIVE BRANCH":               "#aec7e8",
  "US STATE GOVERNMENTS":                                     "#ff7f0e",
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || "#999999";
}
