'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import PdfViewer from '@/components/PdfViewer';

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('University');

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleSelectLevel(level: string) {
    setSelectedLevel(level);
    setDropdownOpen(false);
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <div className="mb-8">
          <Image
            src="/book.svg"
            alt="Book icon"
            width={129}
            height={129}
            className="mx-auto mb-6"
          />

          <h1 className="text-4xl font-semibold">Welcome!</h1>
          <h2 className="text-2xl font-bold mt-2">What can I help you with?</h2>
          <p className="text-base font-light mt-4 max-w-md mx-auto">
            Begin by downloading a PDF of either slides or a textbook from a class you're struggling with or just need a refresher on.
          </p>
        </div>

        {/* Upload Bar */}
        <div className="flex items-center bg-gray-400/50 mt-8 px-4 py-2 rounded-full w-full max-w-2xl hover:bg-gray-400/60 transition">
          {/* Left: Paperclip */}
          <div className="flex items-center flex-grow cursor-pointer" onClick={handleUploadClick}>
            <Image src="/paperclip.svg" alt="Upload" width={20} height={20} className="mr-3" />
            <span className="text-white">
              {file ? file.name : "Upload PDF"}
            </span>
          </div>

          {/* Right: Send */}
          <button
            onClick={() => console.log('Process file here')}
            disabled={!file}
            className={`ml-4 p-2 rounded-full ${file ? "bg-[#2F334E]" : "bg-gray-300"} transition-all`}
          >
            <Image src="/send.svg" alt="Send" width={20} height={20} />
          </button>

          {/* Dropdown (Three Dots) */}
          <div className="relative ml-4">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-white text-2xl leading-none"
            >
              ⋯
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#AAB2C1] rounded-lg shadow-lg z-20 overflow-hidden">
                {["University", "High School", "Middle School", "Elementary"].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleSelectLevel(level)}
                    className={`block w-full px-4 py-2 text-center text-white transition-colors ${
                      selectedLevel === level ? 'font-bold' : 'font-normal'
                    } hover:bg-[#9AA1B1]`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Show PDF if selected */}
        {file && (
          <div className="mt-8 w-full max-w-4xl">
            <PdfViewer file={file} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
