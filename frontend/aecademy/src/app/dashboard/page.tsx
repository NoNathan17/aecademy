'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import ReactMarkdown from 'react-markdown';
import PdfViewer from '@/components/PdfViewer';

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('University');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [keyIdeas, setKeyIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  async function handlePDF(file: File, gradeLevel: string) {
    const formData = new FormData()
    formData.append("file", file);
    formData.append("grade_level", gradeLevel);

    const response = await fetch('http://localhost:8000/upload-pdf/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload PDF')
    }

    const data = await response.json()
    return data.upload_id;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
      {keyIdeas.length === 0 && (
          <>
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
            onClick={async () => {
              if (!file) return;
              setLoading(true);
              setKeyIdeas([]);
              try {
                const uploadId = await handlePDF(file, selectedLevel);
                // Start polling every 3 seconds
                const intervalId = setInterval(async () => {
                  try {
                    const res = await fetch(`http://localhost:8000/get-key-ideas/${uploadId}`);
                    if (res.ok) {
                      const result = await res.json();
                      if (result.key_ideas) {
                        setKeyIdeas(result.key_ideas);
                        clearInterval(intervalId);
                        setLoading(false);
                      }
                    } else if (res.status !== 202) {
                      throw new Error('Failed to get key ideas');
                    }
                  } catch (error) {
                    console.error(error);
                    clearInterval(intervalId);
                    setLoading(false);
                  }
                }, 3000);

              } catch (error) {
                console.error(error);
                alert('Something went wrong uploading the PDF.');
                setLoading(false);
              }
            }}
            disabled={!file}
            className={`ml-4 p-2 rounded-full ${file ? "bg-[#2F334E]" : "bg-gray-300"} transition-all hover:cursor-pointer`}
          >
            <Image src="/send.svg" alt="Send" width={20} height={20} />
          </button>

          {/* Dropdown */}
          <div ref={dropdownRef} className="relative ml-4">
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
      </>
      )}

      {loading && <p className="mt-8 text-xl animate-pulse">Processing your file... ⏳</p>}

      {!loading && keyIdeas.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Key Concepts to Focus On ✨</h2>
          <div className="prose prose-lg max-w-none">
            {keyIdeas.map((idea, idx) => (
              <div key={idx} className="mb-8">
              <ReactMarkdown>
                {idea}
              </ReactMarkdown>
            </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
}
