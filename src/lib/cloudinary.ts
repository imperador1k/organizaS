import { isNativeApp } from '@/lib/tauri-bridge';

/**
 * WHY absolute URL: In native apps (Tauri or Capacitor SSG mode), there's no local Next.js
 * server to handle /api/upload. We route uploads to the deployed Vercel endpoint.
 */
const UPLOAD_API_URL = '/api/upload';
const REMOTE_UPLOAD_API_URL = process.env.NEXT_PUBLIC_UPLOAD_API_URL || 'https://organizas.vercel.app/api/upload';

export function getUploadUrl(): string {
  return isNativeApp() ? REMOTE_UPLOAD_API_URL : UPLOAD_API_URL;
}

// Helper function to upload image to Cloudinary via API route
export const uploadImageToCloudinary = async (imageDataUrl: string, userId: string): Promise<string> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Upload function can only be called from client side');
    }

    const response = await fetch(getUploadUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDataUrl,
        userId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    // Return the original data URL as fallback
    return imageDataUrl;
  }
};

// Helper function to delete image from Cloudinary (not implemented yet)
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  // For now, we'll skip deletion to avoid complexity
  // Cloudinary has automatic cleanup for unused images
  console.log('Image deletion not implemented yet:', publicId);
};
