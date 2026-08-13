'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { getRandomBuilderTitle } from '@/lib/titles';

interface UserDetailsFormProps {
  name: string;
  role: string;
  builderTitle: string;
  onNameChange: (name: string) => void;
  onRoleChange: (role: string) => void;
  onBuilderTitleChange: (title: string) => void;
}

const QUICK_ROLES = [
  'Full Stack Developer',
  'AI Engineer',
  'Frontend Developer',
  'ML Builder',
  'Product Designer',
  'Creative Technologist'
];

export default function UserDetailsForm({
  name,
  role,
  builderTitle,
  onNameChange,
  onRoleChange,
  onBuilderTitleChange,
}: UserDetailsFormProps) {
  
  const handleGenerateTitle = () => {
    const nextTitle = getRandomBuilderTitle(builderTitle);
    onBuilderTitleChange(nextTitle);
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-white border border-neutral-800 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)] p-5 rounded">
      <p className="font-mono text-xs font-bold text-neutral-800 uppercase tracking-widest border-b border-neutral-200 pb-2">
        📝 Identity Details
      </p>

      {/* Name Input */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Aryan Dev"
          maxLength={24}
          className="w-full px-3 py-2 border border-neutral-800 rounded font-sans text-sm focus:outline-none focus:ring-1 focus:ring-neutral-800 bg-neutral-50/50"
        />
      </div>

      {/* Role / Stack Input */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
          Role / Stack
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          placeholder="Full Stack Developer"
          maxLength={30}
          className="w-full px-3 py-2 border border-neutral-800 rounded font-sans text-sm focus:outline-none focus:ring-1 focus:ring-neutral-800 bg-neutral-50/50 mb-1"
        />
        
        {/* Quick select tags */}
        <div className="flex flex-wrap gap-1">
          {QUICK_ROLES.map((qr) => (
            <button
              key={qr}
              type="button"
              onClick={() => onRoleChange(qr)}
              className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider transition-colors ${
                role.toLowerCase() === qr.toLowerCase()
                  ? 'bg-neutral-800 text-white border-neutral-800 font-bold'
                  : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {qr}
            </button>
          ))}
        </div>
      </div>

      {/* Builder Title Input */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
          Builder Title
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={builderTitle}
            onChange={(e) => onBuilderTitleChange(e.target.value)}
            placeholder="NIGHT SHIFT BUILDER"
            maxLength={24}
            className="flex-1 px-3 py-2 border border-neutral-800 rounded font-sans text-sm focus:outline-none focus:ring-1 focus:ring-neutral-800 bg-neutral-50/50"
          />
          <button
            type="button"
            onClick={handleGenerateTitle}
            className="px-3 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
            title="Generate Random Title"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-800" />
          </button>
        </div>
      </div>
    </div>
  );
}
