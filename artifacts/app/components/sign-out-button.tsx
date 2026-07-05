"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="h-9 gap-1.5 px-4"
      onClick={() => signOut({ redirectTo: "/admin/login" })}
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
