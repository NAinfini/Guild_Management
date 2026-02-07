export const ALLOWED_VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'bilibili.com', 'vimeo.com'];

export async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Conversion failed');
      }, 'image/webp', 0.85);
    };
    img.onerror = reject;
  });
}

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