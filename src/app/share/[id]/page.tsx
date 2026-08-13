import React from 'react';
import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import type { Metadata } from 'next';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for web crawlers/scrapers to support rich cards
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  const ogImageUrl = `${protocol}://${host}/shares/${id}.png`;

  return {
    title: "Hacker House Goa 2026 — Builder Card",
    description: "Built in Goa. Shipped for the world.",
    openGraph: {
      title: "Hacker House Goa 2026 — Builder Card",
      description: "Built in Goa. Shipped for the world.",
      images: [
        {
          url: ogImageUrl,
          width: 1080,
          height: 1620,
          alt: "Hacker House Goa 2026 Builder Card",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Hacker House Goa 2026 — Builder Card",
      description: "Built in Goa. Shipped for the world.",
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  
  // Verify the image file exists locally in our filesystem
  const sharesDir = path.join(process.cwd(), 'public', 'shares');
  const filePath = path.join(sharesDir, `${id}.png`);
  const fileExists = fs.existsSync(filePath);

  if (!fileExists) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <h1 className="text-xl font-mono font-bold uppercase mb-2 tracking-wider">
          Card Not Found
        </h1>
        <p className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest mb-6">
          The requested share ID does not exist or has expired.
        </p>
        <Link
          href="/"
          className="px-6 py-3.5 bg-neutral-900 text-white font-mono text-xs font-bold uppercase tracking-widest rounded border border-neutral-800 shadow-[4px_4px_0px_0px_rgba(255,90,54,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,90,54,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all font-bold cursor-pointer"
        >
          Create My Frame
        </Link>
      </div>
    );
  }

  const cardImageUrl = `/shares/${id}.png`;

  return (
    <div className="flex-1 w-full max-w-md mx-auto px-4 py-8 md:py-12 flex flex-col items-center gap-8 justify-center my-auto">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-200 text-[#e04f2f] rounded font-mono text-[9px] font-bold uppercase tracking-widest w-fit">
          🌴 Builder Card Verified
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
          Hacker House Goa 2026
        </h1>
        <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest font-bold">
          Built in Goa • Shipped for the world
        </p>
      </div>

      {/* Card Image Display */}
      <div className="relative w-full aspect-[2/3] bg-neutral-100 rounded border border-neutral-800 shadow-[8px_8px_0px_0px_rgba(18,18,18,1)] overflow-hidden">
        <img
          src={cardImageUrl}
          alt="Hacker House Goa 2026 Builder Card"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
        <a
          href={cardImageUrl}
          download="hacker-house-goa-2026.png"
          className="flex-1 py-3 bg-[#FF5A36] text-white border border-neutral-800 rounded font-mono text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(18,18,18,1)] hover:shadow-[1px_1px_0px_0px_rgba(18,18,18,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all text-center font-bold cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download Card
        </a>
        <Link
          href="/"
          className="flex-1 py-3 bg-neutral-900 text-white border border-neutral-800 rounded font-mono text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(18,18,18,1)] hover:shadow-[1px_1px_0px_0px_rgba(18,18,18,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all text-center font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Card
        </Link>
      </div>
    </div>
  );
}
