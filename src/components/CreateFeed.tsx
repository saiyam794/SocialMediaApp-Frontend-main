'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCreateFeed } from '@/hooks/useFeed';
import { uploadAPI } from '@/services/api';
import ImageCropper from './ImageCropper';
import { useAuth } from '@/hooks/useAuth';
import { Image as ImageIcon, Smile, Video } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const CreateFeed: React.FC<{ onFeedCreated?: () => void }> = ({ onFeedCreated }) => {
  const { user } = useAuth();

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [croppingImage, setCroppingImage] = useState('');
  const { mutate: createFeed, isPending } = useCreateFeed();
  const queryClient = useQueryClient();
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setCroppingImage(src);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleCropComplete = async (blob: Blob) => {
    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

    try {
      const response = await uploadAPI.uploadImage(file);

      setImages((prev) => [...prev, response.url]);
      setPreviewImages((prev) => [...prev, response.url]);

      setShowCropper(false);
      setCroppingImage('');
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) return;

    createFeed(
  { content, images, imageLayout: 'grid' },
  {
    onSuccess: () => {
      setContent('');
      setImages([]);
      setPreviewImages([]);

      queryClient.invalidateQueries({
        queryKey: ['feeds'],
        exact: false,
      });
    },
  }
);

  };

  if (!user) return null;

  return (
    <>
      <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={44}
              height={44}
              className="rounded-full ring-2 ring-purple-400"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold">
              {user.name[0]}
            </div>
          )}

          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's popping, ${user.name.split(' ')[0]}? ✨`}
            className="flex-1 bg-white/70 rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        {previewImages.length > 0 && (
          <div className="my-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {previewImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <Image
                  src={img}
                  alt=""
                  width={200}
                  height={200}
                  className="rounded-xl object-cover aspect-square shadow"
                />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <hr className="my-4 border-white/40" />
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-pink-100 cursor-pointer">
              <ImageIcon className="text-green-500" />
              <span className="hidden sm:block font-semibold">Photo</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageSelect}
              />
            </label>

            <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-purple-100">
              <Video className="text-red-500" />
              <span className="hidden sm:block font-semibold">Video</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-yellow-100">
              <Smile className="text-yellow-500" />
              <span className="hidden sm:block font-semibold">Feeling</span>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2 rounded-full font-semibold text-white
              bg-gradient-to-r from-pink-500 to-indigo-500
              hover:opacity-90 disabled:opacity-50 transition"
          >
            {isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
      {showCropper && (
        <ImageCropper
          imageSrc={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setCroppingImage('');
          }}
        />
      )}
    </>
  );
};

export default CreateFeed;
