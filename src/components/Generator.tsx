'use client';

import React, { useState } from 'react';
import PhotoUploader from './PhotoUploader';
import CardCanvas from './CardCanvas';
import UserDetailsForm from './UserDetailsForm';
import DownloadShare from './DownloadShare';

export default function Generator() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('Aryan Dev');
  const [role, setRole] = useState('Full Stack Developer');
  const [builderTitle, setBuilderTitle] = useState('NIGHT SHIFT BUILDER');
  
  // Crop manipulation state
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  
  // Track rendered canvas reference for downloads/shares
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const handleOffsetChange = (x: number, y: number) => {
    setOffsetX(x);
    setOffsetY(y);
  };

  const handlePhotoSelected = (dataUrl: string) => {
    setPhoto(dataUrl);
    // Reset crop state on new upload for safety
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form Controls Column (Left on Desktop, Bottom on Mobile) */}
      <div className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1 w-full">
        {/* Step 1: Upload Photo */}
        <div className="flex flex-col gap-3 w-full bg-white border border-neutral-800 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)] p-5 rounded">
          <p className="font-mono text-xs font-bold text-neutral-800 uppercase tracking-widest border-b border-neutral-200 pb-2 mb-1">
            📷 Step 1: Upload Photo
          </p>
          <PhotoUploader onPhotoSelected={handlePhotoSelected} />
        </div>

        {/* Step 2: Customize Details */}
        <UserDetailsForm
          name={name}
          role={role}
          builderTitle={builderTitle}
          onNameChange={setName}
          onRoleChange={setRole}
          onBuilderTitleChange={setBuilderTitle}
        />

        {/* Step 3: Export */}
        <DownloadShare canvas={canvas} photoUploaded={!!photo} />
      </div>

      {/* Live Preview Column (Right on Desktop, Top on Mobile) */}
      <div className="lg:col-span-5 flex flex-col items-center order-1 lg:order-2 w-full lg:sticky lg:top-8">
        <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-3 block lg:hidden">
          ▼ Live Poster Preview
        </p>
        <CardCanvas
          photo={photo}
          name={name}
          role={role}
          builderTitle={builderTitle}
          zoom={zoom}
          offsetX={offsetX}
          offsetY={offsetY}
          onZoomChange={setZoom}
          onOffsetChange={handleOffsetChange}
          onCanvasRendered={setCanvas}
        />
      </div>
    </div>
  );
}
