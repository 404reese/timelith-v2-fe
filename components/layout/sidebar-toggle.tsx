"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar";

export function SidebarToggle() {
  const { toggleSidebar } = useSidebarStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 lg:hidden"
      onClick={toggleSidebar}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}