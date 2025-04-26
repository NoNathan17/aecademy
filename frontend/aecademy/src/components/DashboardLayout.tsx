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
      <aside className="w-64 bg-[#AAB2C1] border-r p-4 flex flex-col">
        <Image
          src="/aecademy (1).svg"
          alt="Logo"
          width={128}
          height={128}
          className="m-auto"
        />
        <nav className="flex flex-col gap-2 flex-grow">
          <p className={`${dmSans.className} text-2xl`}>Queries</p>
          {queries.map((query, index) => (
            <div key={index} className="text-gray-700 hover:text-black cursor-default">
              {query}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 relative bg-[#2F334E] overflow-hidden">
        <div className="absolute inset-0 flex justify-center pt-8 pointer-events-none overflow-hidden">
            <div className="w-[889px] h-[889px] bg-white opacity-20 rounded-full blur-[400px]"></div>
        </div>

        <div className="relative z-10 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
