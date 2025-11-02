import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary not configured' },
        { status: 500 }
      );
    }

    const { imageDataUrl, userId } = await request.json();

    if (!imageDataUrl || !userId) {
      return NextResponse.json(
        { error: 'Missing imageDataUrl or userId' },
        { status: 400 }
      );
    }

    // Check if image is too large (5MB limit)
    const sizeInBytes = (imageDataUrl.length * 0.75);
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    if (sizeInMB > 5) {
      return NextResponse.json(
        { error: 'Image too large. Please compress the image first.' },
        { status: 413 }
      );
    }

    // Dynamic import to avoid build issues
    const { v2: cloudinary } = await import('cloudinary');
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageDataUrl, {
      public_id: `avatars/${userId}`,
      folder: 'organizas/avatars',
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url 
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}