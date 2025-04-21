
export interface Country {
  code: string;
  name: string;
  color: string;
}

export const countries: Country[] = [
  { code: "CI", name: "Côte d'Ivoire", color: "#F77F00" },
  { code: "SN", name: "Sénégal", color: "#00853F" },
  { code: "FR", name: "France", color: "#0055A4" },
  { code: "BJ", name: "Bénin", color: "#E90000" },
  { code: "TG", name: "Togo", color: "#006B3F" },
  { code: "ML", name: "Mali", color: "#14B53A" },
  { code: "BF", name: "Burkina Faso", color: "#EF2B2D" },
  { code: "NE", name: "Niger", color: "#E05206" },
  { code: "GH", name: "Ghana", color: "#006B3F" },
  { code: "NG", name: "Nigeria", color: "#008751" },
  { code: "CM", name: "Cameroun", color: "#007A5E" },
  { code: "GA", name: "Gabon", color: "#3A75C4" },
  { code: "CG", name: "Congo", color: "#FCD116" },
  { code: "CD", name: "République démocratique du Congo", color: "#007FFF" },
  { code: "CA", name: "Canada", color: "#FF0000" },
  { code: "US", name: "États-Unis", color: "#3C3B6E" },
  { code: "UK", name: "Royaume-Uni", color: "#012169" },
  { code: "DE", name: "Allemagne", color: "#DD0000" },
  { code: "ES", name: "Espagne", color: "#AA151B" },
  { code: "IT", name: "Italie", color: "#008C45" },
  { code: "PT", name: "Portugal", color: "#006600" },
  { code: "BE", name: "Belgique", color: "#F31830" },
  { code: "CH", name: "Suisse", color: "#FF0000" },
  { code: "MA", name: "Maroc", color: "#C1272D" },
  { code: "DZ", name: "Algérie", color: "#006633" },
  { code: "TN", name: "Tunisie", color: "#E70013" },
  { code: "EG", name: "Égypte", color: "#C8102E" },
  { code: "ZA", name: "Afrique du Sud", color: "#007A4D" },
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(country => country.code === code);
}

export function getCountryByName(name: string): Country | undefined {
  return countries.find(country => country.name.toLowerCase() === name.toLowerCase());
}
