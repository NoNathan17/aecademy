'use client';

import { DM_Sans } from 'next/font/google';
import { useEffect, useState } from "react";
import Image from 'next/image';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '700'] });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [queries, setQueries] = useState<string[]>([]);

  useEffect(() => {
    async function fetchQueries() {
      try {
        const response = await fetch('/api/queries');
        const data = await response.json();
        setQueries(data);
      } catch (error) {
        console.error('Failed to fetch queries:', error);
      }
    }

    fetchQueries();
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[#AAB2C1] border-r flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8">
          <Image
            src="/aecademy (1).svg"
            alt="Logo"
            width={100}
            height={100}
          />
          <Image
            src="/new.svg"
            alt="New Icon"
            width={24}
            height={24}
            className="ml-2"
          />
        </div>

        <p className={`${dmSans.className} text-white text-sm font-bold mb-4`}>Queries</p>

        <nav className="flex flex-col gap-4">
          {queries.map((query, index) => (
            <div key={index} className="flex items-center gap-2 text-white text-sm hover:text-black cursor-pointer">
              <span className="truncate">{query}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 relative bg-[#2F334E] overflow-hidden">
        <div className="absolute inset-0 flex justify-center pt-8 pointer-events-none overflow-hidden">
            <div className="w-[889px] h-[889px] bg-white opacity-20 rounded-full blur-[400px]"></div>
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
