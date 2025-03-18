"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  DoorOpen,
  Layers,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  SquareMenu
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Function to determine the greeting based on the time of day
const getGreeting = () => {
  const currentHour = new Date().getHours();
  
  if (currentHour < 12) {
    return "Good Morning";
  } else if (currentHour < 18) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
};

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Departments",
    icon: Building2,
    href: "/departments",
  },
  {
    label: "Period Types",
    icon: SquareMenu,
    href: "/periodtypes",
  },
  {
    label: "Courses",
    icon: BookOpen,
    href: "/courses",
  },
  {
    label: "Faculties",
    icon: Users,
    href: "/faculties",
  },
  {
    label: "Classrooms",
    icon: DoorOpen,
    href: "/classrooms",
  },
  {
    label: "Divisions",
    icon: Layers,
    href: "/divisions",
  },
  {
    label: "Timeslots",
    icon: Clock,
    href: "/timeslots",
  },
  {
    label: "Generate",
    icon: Calendar,
    href: "/generate",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggleSidebar } = useSidebarStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-16 z-40 bg-background transition-width duration-300",
        "border-r no-scrollbar",
        isOpen ? "w-64" : "w-0 lg:w-[4.5rem]",
        "overflow-y-auto overflow-x-hidden",
        "lg:block",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Greeting and toggle button */}
        <div className="py-4 px-3 flex justify-between items-center border-b border-muted">
          {/* Conditionally render greeting based on sidebar state */}
          {isOpen && (
            <div className="text-xl font-bold text-primary">{getGreeting()}</div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:flex"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Sidebar Routes */}
        <div className="flex-1 py-4 px-3 space-y-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                "group relative",
                pathname === route.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <route.icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "transition-opacity duration-300",
                  !isOpen && "lg:opacity-0 lg:group-hover:opacity-100"
                )}
              >
                {route.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
