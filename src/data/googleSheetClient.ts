/**
 * M1: Google Sheet fetching
 * Fetches published CSV tabs from Google Sheets
 */

import { SheetData } from "../types"

export async function fetchGoogleSheet(sheetUrl: string): Promise<string> {
  // sheetUrl should be the full CSV export URL from "Publish to web"
  // e.g., https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0

  try {
    const response = await fetch(sheetUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`)
    }
    return await response.text()
  } catch (error) {
    throw new Error(
      `Could not fetch Google Sheet. Check URL and "Publish to web" setting. ${error}`
    )
  }
}

export async function fetchAllSheets(
  twentyPercentUrl: string,
  tenPercentUrl: string,
  ridersUrl?: string
): Promise<{ twentyPercent: string; tenPercent: string; riders: string }> {
  const [twentyPercent, tenPercent, riders] = await Promise.all([
    fetchGoogleSheet(twentyPercentUrl),
    fetchGoogleSheet(tenPercentUrl),
    ridersUrl ? fetchGoogleSheet(ridersUrl).catch(() => '') : Promise.resolve(''),
  ])

  return { twentyPercent, tenPercent, riders }
}
