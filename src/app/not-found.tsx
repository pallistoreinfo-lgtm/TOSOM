import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold text-secondary">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        That page may have moved. Try the homepage or browse the articles.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/articles/">Browse articles</Link>
        </Button>
      </div>
    </div>
  );
}
