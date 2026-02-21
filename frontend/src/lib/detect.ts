export function isUrl(input: string) {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

export function extractAmazonASIN(url: string) {
  const match = url.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/);
  return match ? match[2] : null;
}
