'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import DashboardLayout from '@/components/DashboardLayout';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useUser();

  const [file, setFile] = useState<File | null>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [ideasReady, setIdeasReady] = useState(false);
  const [quizReady, setQuizReady] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('University');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level);
    setDropdownOpen(false);
  };

  const uploadPDF = async (file: File, gradeLevel: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('grade_level', gradeLevel);

    const res = await fetch('http://localhost:8000/upload-pdf/', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to upload PDF');

    const data = await res.json();
    return data.upload_id;
  };

  const fetchIdeas = (uploadId: string) => {
    const intervalId = setInterval(async () => {
      const res = await fetch(`http://localhost:8000/get-key-ideas/${uploadId}`);
      console.log("Polling ideas...", res.status);

      if (res.ok) {
        const result = await res.json();
        if (result.key_ideas) {
          setIdeas(result.key_ideas);
          setIdeasReady(true);
          clearInterval(intervalId);
        }
      } else if (res.status !== 202) {
        console.error('Failed to fetch ideas');
        clearInterval(intervalId);
      }
    }, 3000);
  };

  const fetchQuiz = (uploadId: string) => {
    const intervalId = setInterval(async () => {
      const res = await fetch(`http://localhost:8000/get-quiz/${uploadId}`);
      console.log("Polling quiz...", res.status);

      if (res.ok) {
        const result = await res.json();
        if (result.quiz) {
          setQuiz(result.quiz);
          setQuizReady(true);
          clearInterval(intervalId);
        }
      } else if (res.status !== 202) {
        console.error('Failed to fetch quiz');
        clearInterval(intervalId);
      }
    }, 3000);
  };

  const sendDataToBackend = async (filename: any, email: any, ideas: any, quiz: any) => {
    const payload = { filename, email, ideas, quiz };
    console.log('📤 Sending this to backend:', payload);

    const res = await fetch('http://localhost:9000/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to send data to backend');
    console.log('✅ Data successfully sent to backend!');
  };

  useEffect(() => {
    if (ideasReady && quizReady) {
      console.log('✅ Ideas and Quiz ready!');
      setLoading(false);

      if (file && user) {
        sendDataToBackend(
          file.name,
          user.emailAddresses[0]?.emailAddress ?? '',
          ideas,
          quiz
        );
      }
    }
  }, [ideasReady, quizReady]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setIdeas([]);
    setQuiz([]);
    setIdeasReady(false);
    setQuizReady(false);

    try {
      const uploadId = await uploadPDF(file, selectedLevel);
      fetchIdeas(uploadId);
      fetchQuiz(uploadId);
    } catch (err) {
      console.error(err);
      alert('Something went wrong while uploading the PDF.');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        {ideas.length === 0 && (
          <>
            <div className="mb-8">
              <Image
                src="/book.svg"
                alt="Book Icon"
                width={129}
                height={129}
                className="mx-auto mb-6"
              />
              <h1 className="text-4xl font-semibold">Welcome!</h1>
              <h2 className="text-2xl font-bold mt-2">What can I help you with?</h2>
              <p className="text-base font-light mt-4 max-w-md mx-auto">
                Begin by uploading a PDF of slides or a textbook.
              </p>
            </div>

            <div className="flex items-center bg-gray-400/50 mt-4 px-4 py-2 rounded-full w-full max-w-2xl hover:bg-gray-400/60 transition-transform duration-300">
              <div
                className="flex items-center flex-grow cursor-pointer"
                onClick={handleUploadClick}
              >
                <Image src="/paperclip.svg" alt="Upload" width={20} height={20} className="mr-3" />
                <span className="text-white">{file ? file.name : 'Upload PDF'}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!file}
                className={`ml-4 p-2 rounded-full ${
                  file ? 'bg-[#2F334E]' : 'bg-gray-300'
                } transition-all hover:cursor-pointer`}
              >
                <Image src="/send.svg" alt="Send" width={20} height={20} />
              </button>

              <div ref={dropdownRef} className="relative ml-4">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-white text-2xl leading-none"
                >
                  ⋯
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-[#AAB2C1] rounded-lg shadow-lg z-20 overflow-hidden">
                    {['University', 'High School', 'Middle School', 'Elementary'].map((level) => (
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

        {ideas.length > 0 && (
          <div className="mt-16 max-w-4xl">
            <h2 className="text-4xl font-bold mb-6 text-center">Key Concepts to Focus On ✨</h2>
            <div className="prose prose-lg max-w-none">
              {ideas.map((idea, idx) => (
                <div key={idx} className="mb-8">
                  <ReactMarkdown>{idea}</ReactMarkdown>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && quiz.length > 0 && (
          <div className="mt-8 w-full max-w-4xl text-left bg-gray-100 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-amber-400">Raw Quiz Data</h2>
            <pre className="whitespace-pre-wrap text-sm text-pink-400">{quiz}</pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
