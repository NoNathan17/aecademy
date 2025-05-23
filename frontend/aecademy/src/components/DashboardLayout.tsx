'use client';

import { DM_Sans } from 'next/font/google';
import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '700'] });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [queries, setQueries] = useState<string[]>([]);
  const [fetchedData, setFetchedData] = useState<any>(null); // <-- New state to store fetched query data

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
        console.log('Fetched queries:', data);
        setQueries(data);
      } catch (error) {
        console.error('Failed to fetch queries:', error);
      }
    }

    fetchQueries();
  }, [isLoaded, user]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gradient-to-br from-gray-500 to bg-gray-400 flex flex-col p-6">
        <div className="flex justify-between items-center gap-2 mb-8">
          <Link href="/">
            <Image
              src="/aecademy (1).svg"
              alt="Logo"
              width={135}
              height={135}
              className="hover:cursor-pointer"
            />
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="ml-2"
          >
            <Image
              src="/new.svg"
              alt="New Icon"
              width={28}
              height={28}
              className="hover:cursor-pointer"
            />
          </button>
        </div>

        <p className={`${dmSans.className} text-white text-2xl text-center font-bold mb-4`}>Queries</p>

        <nav className="flex flex-col gap-4">
          {queries?.map((question, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-white text-sm text-center hover:text-gray-200 cursor-pointer"
              onClick={async () => {
                try {
                  const response = await fetch(`http://localhost:9000/api/query/${question}`, {
                    method: 'GET',
                  });
                  const data = await response.json();
                  console.log('Fetched instance:', data);
                  setFetchedData(data);  // <-- Save the fetched data here
                } catch (error) {
                  console.error('Error fetching instance:', error);
                }
              }}
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

        <div className="relative z-10 p-8">
        {/* If fetchedData exists, show it. Otherwise, show children */}
        {fetchedData ? (
          <div className="text-white">
            {/* Title */}
            <h2 className="text-3xl font-bold mb-12">{fetchedData.question}</h2>

            {/* Key Ideas */}
            {fetchedData.keyIdeas && fetchedData.keyIdeas.length > 0 && (
              <div className="mb-12">
                <h3 className="text-4xl font-bold text-left mb-10">Key Concepts ✨</h3>
                <ul className="list-disc list-inside space-y-3 text-base text-left">
                  {fetchedData.keyIdeas.map((idea: string, idx: number) => (
                  <ReactMarkdown
                    components={{
                      h3: ({ node, ...props }) => (
                        <h3 className="text-3xl font-bold mt-10 mb-4 text-left" {...props} />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 className="text-2xl font-semibold mt-6 mb-2 text-left" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="text-base mt-4 mb-4 text-left" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-2" {...props} />
                      ),
                    }}
                  >
                    {idea}
                  </ReactMarkdown>
                  ))}
                </ul>
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
              components={{
                h3: ({ node, ...props }) => (
                  <h3 className="text-3xl font-bold mt-10 mb-4 text-left" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-2xl font-semibold mt-6 mb-2 text-left" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-base mb-4 text-left" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="mb-2" {...props} />
                ),
              }}
            >
                {fetchedData.quiz}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
      </main>
    </div>
  );
}
