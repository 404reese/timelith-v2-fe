"use client";

import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import Footer from '@/components/layout/footer';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/store/sidebar';
import { cn } from '@/lib/utils';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const { isOpen } = useSidebarStore();

  if (isLandingPage) {
    return children;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main
          className={cn(
            "flex-1 p-6 transition-all duration-300",
            "mt-16 mb-16",
            "lg:ml-[4.5rem]",
            isOpen && "lg:ml-64"
          )}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}