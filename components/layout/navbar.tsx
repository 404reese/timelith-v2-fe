"use client";

import {  Menu, CircleHelp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useSidebarStore } from "@/store/sidebar";


export default function Navbar() {
  const { toggleSidebar } = useSidebarStore();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            {/* <Image src="/timelith-text-v2.png" alt="TIMELITH" width={150} height={10} /> */}
             <span className="font-bold text-xl">TIMELITH</span> 
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/help" className="flex items-center space-x-1 text-muted-foreground hover:text-primary">
            <span>Help</span>
            <CircleHelp className="h-4 w-4" />
          </Link>
          <ModeToggle />
          <Button>Login</Button>
        </div>
      </div>
    </nav>
  );
}