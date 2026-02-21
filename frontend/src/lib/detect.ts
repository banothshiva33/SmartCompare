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

/**
 * Image Recognition for Product Search
 * Uses Google Vision API or similar service to identify products from images
 */
export async function recognizeProductFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    // Option 1: Google Vision API (requires GOOGLE_VISION_API_KEY)
    if (process.env.GOOGLE_VISION_API_KEY) {
      return await googleVisionSearch(imageBuffer);
    }

    // Option 2: Microsoft Computer Vision API
    if (process.env.AZURE_VISION_KEY) {
      return await azureVisionSearch(imageBuffer);
    }

    // Option 3: Fallback to a simple placeholder
    console.warn('⚠️ No vision API configured, using fallback');
    return 'Unknown Product';
  } catch (error) {
    console.error('Image recognition error:', error);
    throw new Error('Could not recognize product from image');
  }
}

async function googleVisionSearch(imageBuffer: Buffer): Promise<string> {
  try {
    const base64Image = imageBuffer.toString('base64');

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 5 },
                { type: 'TEXT_DETECTION' },
                { type: 'OBJECT_LOCALIZATION' },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // Extract the most relevant label
    if (data.responses?.[0]?.labelAnnotations?.length > 0) {
      return data.responses[0].labelAnnotations[0].description;
    }

    // Fallback to text detection
    if (data.responses?.[0]?.textAnnotations?.length > 0) {
      return data.responses[0].textAnnotations[0].description.split('\n')[0];
    }

    return 'Unknown Product';
  } catch (error) {
    console.error('Google Vision error:', error);
    throw error;
  }
}

async function azureVisionSearch(imageBuffer: Buffer): Promise<string> {
  try {
    const response = await fetch(
      `https://${process.env.AZURE_VISION_ENDPOINT}.cognitiveservices.azure.com/vision/v3.2/analyze?visualFeatures=Tags,Objects&language=en`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_VISION_KEY!,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer as any,
      }
    );

    const data = await response.json();

    // Extract product name from tags
    if (data.tags?.length > 0) {
      return data.tags[0].name;
    }

    // Fallback to objects
    if (data.objects?.length > 0) {
      return data.objects[0].objectProperty;
    }

    return 'Unknown Product';
  } catch (error) {
    console.error('Azure Vision error:', error);
    throw error;
  }
}
