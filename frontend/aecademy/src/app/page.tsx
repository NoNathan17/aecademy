import { DM_Sans } from 'next/font/google';
import Image from 'next/image';
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '700'] });

export default function Home() {
  return (
    <div className="bg-[#2F334E] w-screen h-screen bg-no-repeat bg-cover bg-center"
    style={{ backgroundImage: "url('/Group 5.svg')"}}>
      <main className="w-screen h-screen">

        <div className=" text-center flex flex-col" style={{ paddingTop: '25vh' }}>
          <p className={`${dmSans.className} font-bold text-5xl m-5`}>aecademy</p>
          <p className={`${dmSans.className}  text-2xl`}>Taking your education to the next level.</p>
          <button
            className={`${dmSans.className} mt-5 text-2xl rounded-lg bg-white text-[#2F334E] py-1 px-6 self-center transition-all duration-300 hover:bg-gray-300 hover:scale-110`}
          >
            Start
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
