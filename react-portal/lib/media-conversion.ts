/**
 * Media Conversion Utilities
 * Client-side conversion for images and audio
 */

/**
 * Convert image to WebP format
 * @param file - Original image file
 * @param quality - Quality (0-1), default 0.9
 * @returns Promise<File> - Converted WebP file
 */
export async function convertToWebP(file: File, quality: number = 0.9): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Conversion failed'));
            return;
          }

          // Create new File from blob
          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '.webp'),
            { type: 'image/webp' }
          );

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert audio to Opus format using Web Audio API
 * Note: This is a placeholder - actual Opus encoding requires a library like opus-recorder
 * For now, we'll just validate and pass through
 * 
 * TODO: Implement actual Opus encoding with opus-recorder or similar library
 */
export async function convertToOpus(file: File): Promise<File> {
  // For now, just validate it's an audio file
  if (!file.type.startsWith('audio/')) {
    throw new Error('File is not an audio file');
  }

  // TODO: Implement actual Opus conversion
  // This would require:
  // 1. Decode audio using Web Audio API
  // 2. Encode to Opus using opus-recorder or similar
  // 3. Return new File with opus data

  console.warn('Opus conversion not yet implemented, returning original file');
  return file;
}

/**
 * Resize image if it exceeds max dimensions
 * @param file - Original image file
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Promise<File> - Resized image
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Resize failed'));
            return;
          }

          const resizedFile = new File([blob], file.name, { type: file.type });
          resolve(resizedFile);
        },
        file.type,
        0.9
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB
 * @returns boolean
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate file type
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns boolean
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -2));
    }
    return file.type === type;
  });
}
