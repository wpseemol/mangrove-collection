import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-20 text-center">
      <p className="font-heading text-6xl font-semibold tracking-widest text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Browse products</Link>
        </Button>
      </div>
    </Container>
  );
}
