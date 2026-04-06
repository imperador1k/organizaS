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

    const { imageDataUrl, userId, fileName } = await request.json();

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

    const uploadOptions: any = {
      folder: 'organizas/uploads',
      overwrite: true,
      resource_type: 'auto',
    };

    if (fileName) {
      const nameParts = fileName.split('.');
      const ext = nameParts.length > 1 ? nameParts.pop() : '';
      const baseName = nameParts.join('.').replace(/[^a-zA-Z0-9-]/g, '_');
      
      uploadOptions.public_id = `${baseName}_${Date.now()}`;
      
      // Cloudinary drops extensions for "raw" files unless they are in the public_id.
      // We append it for non-images to ensure Word viewers and PDF viewers can recognize the file type.
      if (ext && !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())) {
        uploadOptions.public_id += `.${ext}`;
      }
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageDataUrl, uploadOptions);

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
export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || !url.includes('res.cloudinary.com')) {
      return NextResponse.json({ success: true, message: 'Not a Cloudinary URL, skipping' });
    }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
    }

    const cloudinary = (await import('cloudinary')).v2;
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    let resourceType = 'image';
    if (url.includes('/raw/upload/')) resourceType = 'raw';
    if (url.includes('/video/upload/')) resourceType = 'video';

    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });

    let pathAfterUpload = urlParts[1];
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, ''); // Remove version if present e.g. v170412345/

    let publicId = pathAfterUpload;
    if (resourceType === 'image' || resourceType === 'video') {
      const lastDotIndex = publicId.lastIndexOf('.');
      if (lastDotIndex > -1) {
        publicId = publicId.substring(0, lastDotIndex);
      }
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    return NextResponse.json({ success: true, publicId });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
