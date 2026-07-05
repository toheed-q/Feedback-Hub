import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessagesSquare className="size-5" />
            </span>
            <span className="text-lg">Feedback Hub</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Admin sign in
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to review and manage feedback.
          </p>
        </div>

        <Card>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
