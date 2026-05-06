export function normalize(url: string): string {
  if (url.includes('youtube')) {
    const id = url.split("v=")[1];
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return url;
}