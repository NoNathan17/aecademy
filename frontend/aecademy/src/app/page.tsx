import { DM_Sans } from 'next/font/google';
import Image from 'next/image';
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
        <div className="flex gap-4 pr-10">
          <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonBox: "w-15 h-15",
                userButtonTrigger: "p-0"
              },
            }}
          />
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <button className="bg-[#2F334E] border border-white text-white px-4 py-2 rounded hover:scale-110">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton>
              <button className="bg-white text-[#2F334E] px-4 py-2 rounded hover:bg-gray-300 hover:scale-110">
                Register
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </header>



        <div className=" text-center flex flex-col" style={{ paddingTop: '25vh' }}>
          <p className={`${dmSans.className} font-bold text-5xl m-5`}>aecademy</p>
          <p className={`${dmSans.className}  text-2xl`}>Taking your education to the next level.</p>
          <button
            className={`${dmSans.className} mt-5 text-1xl rounded-lg bg-white text-[#2F334E] py-1 px-6 self-center transition-all duration-300 hover:bg-gray-300 hover:scale-110`}
          >
            Start Here
          </button>


        </div>
        <div>
          <Image
          src="/Group 7.svg"
          alt="Slide preview"
          width={1028}
          height={1028}
          className="fixed bottom-0 left-1/2 -translate-x-1/2"
          />
          
        </div>
      </main>
    </div>
  );
}
