
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;

  const instance = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  
  // Load ffmpeg.wasm from a CDN (unpkg) to avoid complex local asset handling in this environment
  await instance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpeg = instance;
  return ffmpeg;
}

/**
 * Convert audio to Opus format using ffmpeg.wasm
 * @param file - Original audio file
 * @returns Promise<File> - Converted Opus file
 */
export async function convertToOpus(file: File): Promise<File> {
  // Use a singleton instance or load if not loaded
  const ffmpegInstance = await loadFFmpeg();

  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.opus';

  // Write file to in-memory filesystem
  await ffmpegInstance.writeFile(inputName, await fetchFile(file));

  // Run conversion: -i input -c:a libopus -b:a 64k output.opus
  // Using 64k bitrate for decent voice quality
  await ffmpegInstance.exec(['-i', inputName, '-c:a', 'libopus', '-b:a', '64k', outputName]);

  // Read the result
  const data = await ffmpegInstance.readFile(outputName);
  
  // Cleanup
  await ffmpegInstance.deleteFile(inputName);
  await ffmpegInstance.deleteFile(outputName);

  // Convert to File
  return new File([data as any], file.name.replace(/\.[^/.]+$/, '.opus'), {
    type: 'audio/ogg; codecs=opus'
  });
}

/**
 * Convert image to WebP format
 * @param file - Original image file
 * @param quality - Quality (0-1), default 0.9
 * @returns Promise<File> - Converted WebP file
 */
export async function convertToWebP(file: File, quality: number = 0.9): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Create an object URL for the image
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // Clean up the object URL primarily to avoid memory leaks
      URL.revokeObjectURL(objectUrl);
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Conversion failed'));
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), { type: 'image/webp' }));
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = objectUrl;
  });
}

/**
 * Resize image if it exceeds max dimensions
 * ... existing resizeImage code ...
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Resize failed'));
            return;
          }
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type, 0.9);
    };
    img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -2));
    }
    return file.type === type;
  });
}

// ============================================================================
// Video URL Validation & Utilities (migrated from media.ts)
// ============================================================================

export const ALLOWED_VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'bilibili.com', 'vimeo.com'];

export function validateVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_VIDEO_HOSTS.some(host => parsed.hostname.includes(host));
  } catch {
    return false;
  }
}

export function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// ============================================================================
// Avatar & Media URL Utilities (migrated from media.ts)
// ============================================================================

export function getAvatarInitial(username?: string | null): string {
  const trimmed = username?.trim();
  if (!trimmed) return '?';
  return Array.from(trimmed)[0]?.toUpperCase() ?? '?';
}

/**
 * Ensures media URLs are optimized for the portal.
 * In a real scenario, this would point to a WebP/Opus conversion service.
 * Here we provide a facade for compliance.
 */
export function getOptimizedMediaUrl(url: string, type: 'image' | 'audio' | 'video' = 'image'): string {
  if (!url) return '';

  // Simulation: Append format hint for compliant backends
  const separator = url.includes('?') ? '&' : '?';
  if (type === 'image' && !url.endsWith('.webp')) return `${url}${separator}format=webp`;
  if (type === 'audio' && !url.endsWith('.opus')) return `${url}${separator}format=opus`;

  return url;
}
