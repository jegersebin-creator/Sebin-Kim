/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Creates a blank white Base64 image of specified dimensions.
 */
export const createBlankBase64Image = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL('image/jpeg', 0.95);
};

/**
 * Stitches multiple Base64 images vertically into a single image.
 */
export const stitchImagesVertically = async (base64Images: string[]): Promise<string> => {
  if (base64Images.length === 0) return '';

  // Load all images first to get dimensions
  const loadedImages = await Promise.all(
    base64Images.map((src) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    })
  );

  if (loadedImages.length === 0) return '';

  // Calculate dimensions (Assume all have same width as the first one for simplicity, or find max width)
  const maxWidth = Math.max(...loadedImages.map((img) => img.naturalWidth));
  const totalHeight = loadedImages.reduce((sum, img) => {
    // Scale height to match max width if aspect ratios differ
    const scale = maxWidth / img.naturalWidth;
    return sum + (img.naturalHeight * scale);
  }, 0);

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = maxWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Could not get canvas context");

  // Draw images
  let currentY = 0;
  for (const img of loadedImages) {
    const scale = maxWidth / img.naturalWidth;
    const drawHeight = img.naturalHeight * scale;
    ctx.drawImage(img, 0, currentY, maxWidth, drawHeight);
    currentY += drawHeight;
  }

  // Return base64 of stitched image (using high quality JPEG)
  return canvas.toDataURL('image/jpeg', 0.95);
};