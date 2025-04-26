'use client';
import { DM_Sans } from 'next/font/google';
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '700'] });
import { useEffect, useState } from "react";
import Image from 'next/image';

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
          alt="Slide preview"
          width={128}
          height={128}
          className="m-auto"
        />
        <nav className="flex flex-col gap-2 flex-grow">
          <p className={`${dmSans.className}  text-2xl`}>
            Queries
          </p>
          {queries.map((query, index) => (
            <div
              key={index}
              className="text-gray-700 hover:text-black cursor-default"
            >
              {query}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 bg-[#2F334E] p-8">
      <Image
          src="/group 9.svg"
          alt="Slide preview"
          width={514}
          height={514}
          className="m-auto pt-40"
        />
        {children}
      </main>
    </div>
  );
}
