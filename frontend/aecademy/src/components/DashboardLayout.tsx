'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
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
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <Image
          src="/aecademy.svg"
          alt="Slide preview"
          width={128}
          height={128}
          className="m-auto"
        />

        <nav className="flex flex-col gap-2 flex-grow">
          <Link href="/dashboard" className="text-gray-700 hover:text-black font-medium">
            + New Chat
          </Link>

          <div className="mt-6 text-gray-500 uppercase text-xs tracking-wider">
            My Chats
          </div>

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

      <main className="flex-1 bg-gray-100 p-8">
        {children}
      </main>
    </div>
  );
}
