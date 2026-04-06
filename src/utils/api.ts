import type { AwardData } from "../types";

export async function fetchAwardData(year: string, award: string): Promise<AwardData> {
  const response = await fetch(`/data/${year}_${award}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${year} ${award}`);
  }
  return response.json();
}