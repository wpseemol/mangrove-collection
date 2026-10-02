import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <p className="font-heading text-8xl font-semibold tracking-tight text-primary/15">404</p>
      <h1 className="font-heading -mt-4 text-3xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild size="lg">
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/shop">Browse products</Link>
        </Button>
      </div>
    </Container>
  );
}
