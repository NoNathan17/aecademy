'use client';

import { DM_Sans } from 'next/font/google';
import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '700'] });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [queries, setQueries] = useState<string[]>([]);
  console.log(user?.emailAddresses[0]?.emailAddress)
  useEffect(() => {
    async function fetchQueries() {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch('http://localhost:9000/api/queries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: user?.emailAddresses[0]?.emailAddress
          })
        });

        const data = await response.json();
        console.log(data);
        setQueries(data);
      } catch (error) {
        console.error('Failed to fetch queries:', error);
      }
    }

    fetchQueries();
  }, [isLoaded, user]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[#AAB2C1] border-r flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <Image
              src="/aecademy (1).svg"
              alt="Logo"
              width={100}
              height={100}
            />
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="ml-2"
          >
            <Image
              src="/new.svg"
              alt="New Icon"
              width={24}
              height={24}
              className="ml-2"
            />
          </button>
        </div>

        <p className={`${dmSans.className} text-white text-sm font-bold mb-4`}>Queries</p>

        <nav className="flex flex-col gap-4">
          {queries.map((question, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-white text-sm hover:text-black cursor-pointer"
            >
              <span className="truncate">{question}</span>
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
