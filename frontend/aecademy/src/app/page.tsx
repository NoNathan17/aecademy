import { DM_Sans } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '700'] });
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="bg-[#2F334E] w-screen h-screen bg-no-repeat bg-cover bg-center"
    style={{ backgroundImage: "url('/Group 5.svg')"}}>

      <main className="w-screen h-screen">      
      <header className="flex items-center pt-12 px-10">
        <div className="flex-grow flex justify-start pl-10">
          <Image
            src="/aecademy.svg"
            alt="Slide preview"
            width={128}
            height={128}
            className=""
          />
        </div>
        <div className="flex gap-8 pr-10">
          <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-20 h-20",   
                avatarImage: "w-20 h-20", 
                userButtonTrigger: "p-0"
              },
            }}
          />
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <button className="border border-white text-white px-4 py-2 rounded transition-transform duration-300 hover:cursor-pointer">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton>
              <button className="border border-white text-white px-4 py-2 rounded transition-transform duration-300 hover:cursor-pointer">
                Register
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </header>

      <div>
        <div className="text-center flex flex-col mt-48">
          <p className={`${dmSans.className} font-bold text-7xl m-5`}>aecademy</p>
          <p className={`${dmSans.className}  text-3xl`}>Taking your education to the next level.</p>
          <Link href="/dashboard">
            <button
              className={`${dmSans.className} mt-5 text-2xl rounded-lg bg-white text-[#2F334E] py-1 px-6 transition-transform duration-300 hover:scale-105 hover:cursor-pointer`}
            >
              Start Here
            </button>
          </Link>
        </div>
      </div>
        <footer>
          <Image
          src="/Group 7.svg"
          alt="Slide preview"
          width={1200}
          height={1200}
          className="fixed bottom-0 left-1/2 -translate-x-1/2"
          />
          
        </footer>
      </main>
    </div>
  );
}
