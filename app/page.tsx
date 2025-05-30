import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ReviewMarquee } from "@/components/custom/ReviewMarquee"; // Make sure the path is correct

import { Linkedin, Mail, Globe } from "lucide-react";

// top shine
import { ArrowRight } from "lucide-react";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { TS2 } from "@/components/custom/TS2";

export default function Home() {
  return (
    <div className="light-mode">
      <Navbar />

      {/* Hero */}
      <div className="h-[70vh] flex items-center justify-center">
        
        <MaxWidthWrapper className="mt-20 flex flex-col items-center justify-center text-center sm:mt-24">
          <div className="mx-auto mb-10 flex max-w-fit items-center justify-center space-x-2 overflow-hidden px-7 py-2 transition-all">
            
            <AnimatedGradientText
              style={
                {
                  '--text-spacing': '0px',
                } as React.CSSProperties
              }
              className="hover:scale-110 transition-all duration-300 ease-in-out"
            >
        🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
        <span
          className={cn(
            `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
          )}
        >
          Try TIMELITH Today
        </span>
        <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
      </AnimatedGradientText>              
           
          </div>

          <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
            <span className="text-blue-600">Automate</span> Your <br />{" "}
            Institute Scheduling
          </h1>

          <p className="mt-10 max-w-prose text-lg text-zinc-400 sm:text-2xl">
            The Timelith Scheduler is a specialized tool created to improve the
            scheduling process for institutions
          </p>
          
          {/* <Link
            className={cn(
              buttonVariants({
                size: "lg",
                className: "mt-10",
              }),
              "text-lg"
            )}
            href={"/dashboard"}
          >
            Start Exploring
          </Link> */}
          <div className="mt-10">
            <Link href={"/dashboard"}>
            <InteractiveHoverButton>Start Exploring</InteractiveHoverButton>
            </Link>
          </div>
          
        </MaxWidthWrapper>
      </div>

      {/* Value Prop */}
      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#0a95ff] to-[#95f2fa] opacity-30 sm:left-[calc(50%-20rem)] sm:w-[72.1875rem] sm:translate-y-8"
            />
          </div>

          <div>
          <div className="mx-auto flex max-w-6xl justify-center px-6 lg:px-8 min-h-screen">
  <div className="mt-8 flow-root sm:mt-16">
    <div className="-m-2 w-fit rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
      <video
        src="/hero-video.mp4"
        className="w-full h-full object-cover rounded-md bg-special shadow-2xl ring-1 ring-gray-900/10 md:p-8"
        autoPlay
        loop
        muted
      >
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</div>

          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative right-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] translate-x-1/3 rotate-[30deg] bg-gradient-to-tr from-[#0a95ff] to-[#95f2fa] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem] sm:translate-y-8"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <MaxWidthWrapper>
        <div className="mx-auto mt-20 flex max-w-5xl flex-col gap-20 sm:mt-40 sm:gap-40 ">
          {/* Intro */}
          <div>
            <div className="mb-6 px-6 lg:px-8">
              <div className="mx-auto max-w-2xl sm:text-center">
                <h2 className="mt-2 text-4xl font-bold text-primary sm:text-5xl">
                  Generate Your First Timetable in <span className="text-blue-600">Seconds</span>
                </h2>
                <p className="mt-4 text-lg text-primary">
                  Improving your efficiency and saving your time has never been easier than with
                  TIMELITH.
                </p>
              </div>
            </div>
            {/* steps */}

            <ol className="my-2 space-y-4 pt-2 md:flex md:space-x-6 md:space-y-0 md:px-8">
              <li className="md:flex-1">
                <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-blue-600">
                    Step 1
                  </span>
                  <span className="text-xl font-semibold">
                    Sign up for a <span className="text-blue-600">Free</span> Account
                  </span>
                  {/* <span className="mt-2 text-zinc-700">
                Either starting out with a free plan or choose our{" "}
                <Link
                  href="/pricing"
                  className="text-blue-700 underline underline-offset-2"
                >
                  pro plan
                </Link>
                .
              </span> */}
                </div>
              </li>
              <li className="md:flex-1">
                <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-blue-600">
                    Step 2
                  </span>
                  <span className="text-xl font-semibold">
                  Enters <span className="text-blue-600">Essential Scheduling</span> Information into the System
                  {/* {" "}
                    <span className="text-blue-600">Scenario</span> */}
                  </span>
                </div>
              </li>
              <li className="md:flex-1">
                <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-blue-600">
                    Step 3
                  </span>
                  <span className="text-xl font-semibold">
                  Generates <span className="text-blue-600">Conflict-Free</span> Timetables
                  </span>
                  {/* <span className="mt-2 text-zinc-700">
                
              </span> */}
                </div>
              </li>
            </ol>
          </div>

          {/* Scenarios */}
          <div>
            <div className="mb-6 px-6 lg:px-8">
              <div className="mx-auto max-w-2xl sm:text-center">
                <h2 className="mt-2 text-4xl font-bold text-gray-900 sm:text-5xl">
                  Why to <span className="text-blue-600">Choose Us</span> 
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  We utilize the latest technologies to provide you with the best
                </p>
              </div>
            </div>
            {/* steps */}

            <div className="flex items-center justify-center">
              <div className="flex flex-col gap-12 md:flex-row">
                <Card className="flex flex-col items-center justify-center gap-4 p-8 md:flex-1">
                  <CardTitle className="text-center text-3xl">Advanced Scheduling</CardTitle>
                  <CardDescription className="mb-3 text-center text-lg">
                  Handles complex scheduling scenarios with ease, ensuring efficiency and accuracy.
                  </CardDescription>
                  <Image
                    src="/1.webp"
                    alt="cafe scenario"
                    width={240}
                    height={240}
                    quality={100}
                  />
                </Card>
                <Card className="flex flex-col items-center justify-center gap-4 p-8 md:flex-1">
                  <CardTitle className="text-center text-3xl">Rule-Based System</CardTitle>
                  <CardDescription className="mb-3 text-center text-lg">
                  Adapts to your unique requirements for planning, making it
                  easy to manage changes and exceptions.
                  </CardDescription>
                  <Image
                    src="/2.webp"
                    alt="cafe scenario"
                    width={240}
                    height={240}
                    quality={100}
                  />
                </Card>

                <Card className="flex flex-col items-center justify-center gap-4 p-8 md:flex-1">
                  <CardTitle className="text-center text-3xl">Meet Minimum Criterion</CardTitle>
                  <CardDescription className="mb-3 text-center text-lg">
                  Alerts you to potential conflicts and suggests alternatives for a smooth planning experience.
                  </CardDescription>
                  <Image
                    src="/3.webp"
                    alt="cafe scenario"
                    width={240}
                    height={240}
                    quality={100}
                  />
                </Card>
              </div>
            </div>
            <div className="mb-6 px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <p className="mt-4 text-lg text-gray-600">and many more...</p>
              </div>
            </div>
          </div>

          {/* team section */}
          <div>
      
      <TS2 />
    </div>

          {/* Feedback */}
          <div>
            <div className="mb-6 px-6 lg:px-8">
              <div className="mx-auto max-w-2xl sm:text-center">
                <h2 className="mt-2 text-4xl font-bold text-primary sm:text-5xl">
                  <span className="text-blue-600">Feedback</span> We Received
                </h2>
                <p className="mt-4 text-lg text-primary">
                  What are people saying about us
                </p>
                
              </div>
              <div className="mt-10">
              <ReviewMarquee />
              </div>
              
            </div>
            {/* steps */}

            {/* <div>
              <div className="mx-auto flex max-w-6xl justify-center px-6 lg:px-8">
                <div className="flow-root">
                  <div className="-m-2 w-fit rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10  lg:-m-4 lg:rounded-2xl lg:p-4">
                    <Image
                      width={2556}
                      height={1436}
                      quality={100}
                      src="/tweet_collage.png"
                      alt="Header image"
                      className="rounded-md bg-white p-2 shadow-2xl ring-1 ring-gray-900/10 md:p-8"
                    />
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </MaxWidthWrapper>

      <Footer />
    </div>
  );
}
