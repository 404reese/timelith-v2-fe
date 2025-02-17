"use client";

import Image from "next/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Link from "next/link";
import { Globe } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { TfiLinkedin } from "react-icons/tfi"; //need to center

// Founders Data
const foundersData = [
  {
    name: "Riddhesh Chaudhary",
    title: "Frontend & DevOps",
    image: "/rid.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/riddheshchaudhary",
      github: "https://github.com/404reese",
      website: "https://riddhesh.vercel.app",
    },
    email: "rid@company.com",
  },
  {
    name: "Arpit Balmiki",
    title: "Backend & Cloud",
    image: "/mj.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/arpit-balmiki-b247b0290/",
      github: "https://github.com/ace19wre",
      website: "mailto:arpitbalmiki@gmail.com",
    },
    email: "mj@company.com",
  },
];

// Icon mapping
const IconMap = {
  github: FaGithub,
  linkedin: TfiLinkedin,
  website: Globe,
};

interface Founder {
  name: string;
  title: string;
  image: string;
  socials: {
    github: string;
    linkedin: string;

    website: string;
  };
  email: string;
}

// Reusable Founder Card Component
function FounderCard({ founder }: { founder: Founder }) {
  return (
    
   
    <CardContainer className="inter-var">
      <CardBody className="bg-transparent relative group/card 
        shadow-2xl shadow-black/[0.1] 
        border-primary/10 w-[20rem] h-auto 
        rounded-xl p-6 border flex flex-col items-center 
        transition-all duration-300 
        hover:scale-[1.02] 
        ">
        <CardItem translateZ="100" className="w-full mb-4">
          <Image
            src={founder.image}
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl 
            group-hover/card:shadow-lg  // Reduced shadow
            transition-all duration-300"
            alt={founder.name}
          />
        </CardItem>
        
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-primary/80 text-center w-full"
        >
          {founder.name}
        </CardItem>
        
        <CardItem
          as="p"
          translateZ="60"
          className="text-primary/40 text-sm max-w-sm mt-2 text-center w-full"
        >
          {founder.title}
        </CardItem>
        
        {/* Social Links */}
        <div className="w-full mt-4 flex justify-center items-center space-x-4">
          {Object.entries(founder.socials).map(([platform, url]) => {
            const Icon = IconMap[platform as keyof typeof IconMap];
            
            return (
              <Link
                key={platform}
                href={url}
                target="_blank"
                className="text-primary/40 hover:text-blue-500 
                hover:scale-100 
                transition-all duration-300 
                ">
                <Icon className="w-6 h-6" />
              </Link>
            );
          })}
        </div>
      </CardBody>
    </CardContainer>
  );
}

// Founders Section Component
export function TS2() {
  return (
    <div>
      <div className="mb-6 px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="mt-2 text-4xl font-bold text-gray-900 sm:text-5xl">
            The Team <span className="text-blue-600">Behind</span>
          </h2>
          <p className="mt-4 text-lg text-primary">
            Sleep-Deprived Developers who Trade their Nights for Project
          </p>
        </div>
      </div>
    <div className="flex flex-col md:flex-row justify-center items-center gap-8 p-8">
      {foundersData.map((founder, index) => (
        <FounderCard key={index} founder={founder} />
      ))}
    </div>
    </div>
  );
}

