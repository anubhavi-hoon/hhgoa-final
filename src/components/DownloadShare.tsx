'use client';

import React, { useState } from 'react';
import { Download, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { downloadCanvas } from '@/lib/renderer';
import { uploadSharedCard, getTwitterShareLink } from '@/lib/share';

interface DownloadShareProps {
  canvas: HTMLCanvasElement | null;
  photoUploaded: boolean;
}

export default function DownloadShare({ canvas, photoUploaded }: DownloadShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  const handleDownload = () => {
    if (!canvas) return;
    // Download the card with a clean, descriptive filename
    downloadCanvas(canvas, 'hacker-house-goa-2026.png');
  };

  const handleShareToX = async () => {
    if (!canvas) return;
    setIsSharing(true);
    try {
      let id = shareId;
      // If we haven't uploaded it to the local share storage yet, do it now
      if (!id) {
        const dataUrl = canvas.toDataURL('image/png');
        id = await uploadSharedCard(dataUrl);
        setShareId(id);
      }
      
      const shareUrl = getTwitterShareLink(id);
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      alert('Failed to generate sharing preview. Opening default share window.');
      // Fallback intent without URL
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          'Just built my Goa frame 🌴💻\nReady to build, ship and hack at Hacker House Goa 2026.\n#FrameInGoa'
        )}`,
        '_blank'
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!canvas) return;
    setIsCopying(true);
    try {
      let id = shareId;
      if (!id) {
        const dataUrl = canvas.toDataURL('image/png');
        id = await uploadSharedCard(dataUrl);
        setShareId(id);
      }
      
      const url = `${window.location.origin}/share/${id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to copy link.');
    } finally {
      setIsCopying(false);
    }
  };

  const isDisabled = !photoUploaded || !canvas;

  return (
    <div className="flex flex-col gap-3 w-full bg-white border border-neutral-800 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)] p-5 rounded">
      <p className="font-mono text-xs font-bold text-neutral-800 uppercase tracking-widest border-b border-neutral-200 pb-2 mb-1">
        🚀 Export & Share
      </p>

      {/* Primary Download Button */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleDownload}
        className={`w-full py-3 border border-neutral-800 rounded font-mono text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(18,18,18,1)] active:shadow-[1px_1px_0px_0px_rgba(18,18,18,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all ${
          isDisabled
            ? 'bg-neutral-100 text-neutral-400 border-neutral-300 shadow-none cursor-not-allowed transform-none'
            : 'bg-[#FF5A36] text-white hover:bg-[#e04f2f] cursor-pointer'
        }`}
      >
        <Download className="w-4 h-4" />
        Download Card
      </button>

      {/* Share Actions Grid */}
      <div className="grid grid-cols-2 gap-2 mt-1.5">
        {/* Share to X Button */}
        <button
          type="button"
          disabled={isDisabled || isSharing}
          onClick={handleShareToX}
          className={`py-2 px-3 border border-neutral-800 rounded font-mono text-xs font-bold flex items-center justify-center gap-1.5 uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(18,18,18,1)] active:shadow-[0px_0px_0px_0px_rgba(18,18,18,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all ${
            isDisabled
              ? 'bg-neutral-50 text-neutral-400 border-neutral-200 shadow-none cursor-not-allowed transform-none'
              : 'bg-[#121212] text-white hover:bg-neutral-800 cursor-pointer'
          }`}
        >
          {isSharing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          )}
          {isSharing ? 'Uploading...' : 'Share to X'}
        </button>

        {/* Copy Link Button */}
        <button
          type="button"
          disabled={isDisabled || isCopying}
          onClick={handleCopyLink}
          className={`py-2 px-3 border border-neutral-800 rounded font-mono text-xs font-bold flex items-center justify-center gap-1.5 uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(18,18,18,1)] active:shadow-[0px_0px_0px_0px_rgba(18,18,18,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all ${
            isDisabled
              ? 'bg-neutral-50 text-neutral-400 border-neutral-200 shadow-none cursor-not-allowed transform-none'
              : 'bg-white text-neutral-800 hover:bg-neutral-50 cursor-pointer'
          }`}
        >
          {isCopying ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : copied ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <LinkIcon className="w-3.5 h-3.5" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {!photoUploaded && (
        <p className="text-[9px] text-neutral-500 font-mono text-center uppercase tracking-wider mt-1">
          * Upload a photo to activate download & sharing
        </p>
      )}
    </div>
  );
}
