
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit2, RotateCw, LogOut } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from "@/lib/canvas-preview";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAppData, useAuth } from "@/context/AppDataContext";
import { useLogoutCleanup } from '@/hooks/use-logout-cleanup';
import { useRouter } from 'next/navigation';
import { updateProfile } from "firebase/auth";


export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const { toast } = useToast();
  const { performLogout } = useLogoutCleanup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const { user, userProfile, logout, updateUserProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState("/placeholder-user.png");

  useEffect(() => {
    if (userProfile) {
        console.log('UserProfile loaded:', userProfile);
        setName(userProfile.displayName || '');
        setAvatar(userProfile.photoURL || "/placeholder-user.png");
    }
  }, [userProfile]);

  // Debug: Log when user changes
  useEffect(() => {
    console.log('User changed:', user);
    console.log('UserProfile changed:', userProfile);
  }, [user, userProfile]);

  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }


  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(event.target.files[0]);
      setIsCropModalOpen(true);
      event.target.value = '';
    }
  };

  const handleCropConfirm = async () => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      await canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        1,
        rotation,
      )
      const newAvatarDataUrl = previewCanvasRef.current.toDataURL('image/png');
      setAvatar(newAvatarDataUrl);
      setIsCropModalOpen(false);
      setImgSrc('');
    }
  };

  // Helper function to compress image
  const compressImage = (file: File, maxSizeKB: number = 100): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions (max 300x300 for smaller size)
          const maxWidth = 300;
          const maxHeight = 300;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels until we get under maxSizeKB
          let quality = 0.6; // Start with lower quality
          const tryCompress = () => {
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const sizeKB = (dataUrl.length * 0.75) / 1024; // Approximate size
            
            console.log(`Trying quality ${quality}, size: ${sizeKB.toFixed(1)}KB`);
            
            if (sizeKB <= maxSizeKB || quality <= 0.1) {
              console.log(`Final compressed size: ${sizeKB.toFixed(1)}KB`);
              resolve(dataUrl);
            } else {
              quality -= 0.1;
              if (quality < 0.1) {
                // If still too big, use the smallest size
                const finalDataUrl = canvas.toDataURL('image/jpeg', 0.1);
                console.log(`Using minimum quality, final size: ${((finalDataUrl.length * 0.75) / 1024).toFixed(1)}KB`);
                resolve(finalDataUrl);
              } else {
                tryCompress();
              }
            }
          };
          
          tryCompress();
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "Please log in to save your profile.",
      });
      return;
    }
    
    try {
        console.log('Saving profile with data:', { name, avatar });
        console.log('Current userProfile:', userProfile);

        const profileDataToUpdate: { displayName?: string, photoURL?: string } = {};

        // Always update name if it's different or empty
        if (name && name !== userProfile?.displayName) {
            profileDataToUpdate.displayName = name;
        }

        // Always update avatar if it's different
        if (avatar && avatar !== userProfile?.photoURL) {
            // If it's a data URL, compress it first
            if (avatar.startsWith('data:image/')) {
              try {
                console.log('Compressing image...');
                // Convert data URL to File, then compress
                const response = await fetch(avatar);
                const blob = await response.blob();
                const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                const compressedAvatar = await compressImage(file, 50); // 50KB max for better compression
                console.log('Compression completed');
                profileDataToUpdate.photoURL = compressedAvatar;
              } catch (error) {
                console.error('Error compressing image:', error);
                // Skip photo update if compression fails
                console.log('Skipping photo update due to compression error');
              }
            } else {
              profileDataToUpdate.photoURL = avatar;
            }
        }

        console.log('Profile data to update:', profileDataToUpdate);

        if (Object.keys(profileDataToUpdate).length > 0) {
            await updateUserProfile(profileDataToUpdate);
            toast({
              title: "Profile Saved",
              description: "Your profile has been updated successfully.",
            });
        } else {
            toast({
              title: "No Changes",
              description: "No changes were made to your profile.",
            });
        }

    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "An error occurred while saving your profile. Please try again.",
        });
    }
  };
  
  const handleLogout = async () => {
    try {
        const result = await performLogout();
        if (result.success) {
            router.push('/login');
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out and all data has been cleared.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Logout Failed",
                description: result.error || "An error occurred while logging out. Please try again.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Logout Failed",
            description: "An error occurred while logging out. Please try again.",
        });
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Settings</h1>
        
        <div className="grid gap-8">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This is how others will see you on the site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Avatar</Label>
                    <div className="relative w-24 h-24 group">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={avatar} alt="User Avatar" />
                            <AvatarFallback>{userProfile?.displayName?.[0].toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Edit2 className="h-6 w-6 text-white" />
                        </button>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userProfile?.email || ''} disabled />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave}>Save</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your app.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Theme</Label>
                   <div className="flex gap-2">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>Light</Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>Dark</Button>
                   </div>
                </div>
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage account settings and log out.</CardDescription>
                </CardHeader>
                <CardContent>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full sm:w-auto">
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will log you out of your account. You will need to sign in again to access your data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>

       <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop your new avatar</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                minWidth={100}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setRotation(r => r + 90)}
            >
              <RotateCw className="h-4 w-4" />
              <span className="sr-only">Rotate 90 degrees</span>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCropConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <canvas
        ref={previewCanvasRef}
        className="absolute w-0 h-0"
      />
    </AppLayout>
  );
}
