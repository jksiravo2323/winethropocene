export interface AtlasEntry {
  slug: string;
  title: string;
  place: string;
  country: string;
  lat: number;
  lon: number;
  category: string;
  subcategory?: string;
  status?: string;
  summary?: string;
  tags?: string[];
}

export function filterAtlas(
  entries: AtlasEntry[],
  category?: string,
  status?: string
): AtlasEntry[] {
  return entries.filter(e => {
    if (category && e.category !== category) return false;
    if (status && e.status !== status) return false;
    return true;
  });
}
