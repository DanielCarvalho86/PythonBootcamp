export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Parses pt-BR formatted numbers ("8.500" = 8500, "107,45" = 107.45): "."
 * is a thousands separator, "," is the decimal separator.
 */
export function parseNumber(raw: string): number {
  const cleaned = raw.replace(/\./g, "").replace(",", ".");
  return Number(cleaned);
}

/**
 * Parses free-text duration expressions used in the spec's examples:
 * "1h15", "1h 15min", "75 minutos", "1 hora e 15 minutos", "45 min".
 */
export function parseDurationMinutes(text: string): number | null {
  const t = normalize(text);

  const hMin = t.match(/(\d+)\s*h\s*(\d{1,2})?\s*(?:min)?/);
  if (hMin) {
    const hours = Number(hMin[1]);
    const minutes = hMin[2] ? Number(hMin[2]) : 0;
    return hours * 60 + minutes;
  }

  const horaEMinuto = t.match(/(\d+)\s*horas?(?:\s*e\s*(\d+)\s*minutos?)?/);
  if (horaEMinuto) {
    const hours = Number(horaEMinuto[1]);
    const minutes = horaEMinuto[2] ? Number(horaEMinuto[2]) : 0;
    return hours * 60 + minutes;
  }

  const minutosOnly = t.match(/(\d+)\s*(?:minutos|minutes|min)\b/);
  if (minutosOnly) {
    return Number(minutosOnly[1]);
  }

  return null;
}

export function parseCalories(text: string): number | null {
  const t = normalize(text);
  const match = t.match(/(\d[\d.,]*)\s*(?:kcal|calorias|cal)\b/);
  if (!match) return null;
  return parseNumber(match[1]);
}
