/**
 * Image compression and optimization utility for mobile & desktop uploads.
 * Ensures images from gallery/camera/studio are compressed to safe base64 sizes
 * preventing LocalStorage quota overflow and ensuring instant rendering.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export const optimizeImageFile = (
  file: File,
  options: OptimizeImageOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.85,
      mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    } = options;

    // If already SVG or tiny file (< 30KB), read directly
    if (file.type === 'image/svg+xml' || (file.size < 35000 && file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // For JPEGs, fill white background if transparency exists
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        // Fallback to raw data url if canvas fails
        resolve(event.target?.result as string);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

import { supabase } from './supabase';

export const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const uploadOptimizedImage = async (dataUrl: string, folder: string = 'images'): Promise<string> => {
  if (!dataUrl.startsWith('data:')) return dataUrl; // Already a URL
  try {
    const blob = dataURLtoBlob(dataUrl);
    const ext = blob.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;
    
    const { data, error } = await supabase.storage.from('wed-assets').upload(fileName, blob, {
      contentType: blob.type,
      cacheControl: '31536000',
      upsert: true
    });

    if (error) {
      console.warn('Supabase storage upload failed, falling back to base64:', error.message);
      return dataUrl; // Fallback
    }

    const { data: publicUrlData } = supabase.storage.from('wed-assets').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Error during image upload, falling back to base64:', err);
    return dataUrl; // Fallback
  }
};
