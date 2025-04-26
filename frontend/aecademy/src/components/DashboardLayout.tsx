import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <div className="text-2xl font-bold mb-8">aecademy</div>

        <nav className="flex flex-col gap-2 flex-grow">
          <Link href="/dashboard" className="text-gray-700 hover:text-black font-medium">
            + New Chat
          </Link>

          <div className="mt-6 text-gray-500 uppercase text-xs tracking-wider">My Chats</div>

          <Link href="/dashboard/queries" className="text-gray-700 hover:text-black">
            Query #1
          </Link>
          <Link href="/dashboard/queries" className="text-gray-700 hover:text-black">
            Query #2
          </Link>
        </nav>

        <div className="pt-4 border-t">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      <main className="flex-1 bg-gray-100 p-8">
        {children}
      </main>
    </div>
  );
}
