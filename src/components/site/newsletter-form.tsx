"use client";

import * as React from "react";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Newsletter signup.
 *
 * TODO(newsletter): the live WP form posted to admin-ajax, which no longer
 * exists. Wire site.integrations.newsletterProvider to the real provider
 * (Mailchimp / ConvertKit / etc.) once confirmed. Until then this validates
 * the email and shows a clear "not yet connected" notice instead of silently
 * dropping signups.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const provider = site.integrations.newsletterProvider;
  const [status, setStatus] = React.useState<"idle" | "error" | "todo">("idle");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!provider) {
      setStatus("todo");
      return;
    }
    // Real provider POST goes here once configured.
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="you@email.com"
          aria-label="Email address"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" variant="dark">
          Subscribe
        </Button>
      </div>
      {status === "todo" && (
        <p className="text-xs text-secondary-foreground/70">
          Newsletter signup is not yet connected. Configure the provider to enable it.
        </p>
      )}
    </form>
  );
}
