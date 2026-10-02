"use client";

import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/shared/container";
import { RemoteImage } from "@/components/shared/remote-image";
import { Button } from "@/components/ui/button";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useBanners } from "@/lib/queries";
import type { Banner } from "@/lib/types";
import { cn } from "@/lib/utils";

function BannerLink({ banner, children, className }: { banner: Banner; children: React.ReactNode; className?: string }) {
  if (banner.link_enabled && banner.link_url) {
    return (
      <Link href={banner.link_url} className={className}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
}

function BannerCaption({ banner, large }: { banner: Banner; large?: boolean }) {
  if (!banner.title && !banner.subtitle) return null;

  return (
    <div className={cn("absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent text-white", large ? "p-6 md:p-10" : "p-5")}>
      {banner.title && <p className={cn("font-heading font-semibold", large ? "max-w-lg text-2xl md:text-4xl" : "text-lg md:text-xl")}>{banner.title}</p>}
      {banner.subtitle && <p className={cn("mt-1 text-white/85", large ? "max-w-md text-sm md:text-base" : "text-sm")}>{banner.subtitle}</p>}
    </div>
  );
}

/** Shown until slides are uploaded from the dashboard. */
function BrandHero() {
  return (
    <div className="relative flex h-full min-h-[360px] flex-col justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-forest p-8 text-white md:p-12">
      <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-gold/20 blur-3xl" />
      <Image
        src="/assets/logo.png"
        alt=""
        width={260}
        height={260}
        className="pointer-events-none absolute top-1/2 right-10 hidden size-60 -translate-y-1/2 rounded-full bg-white/95 object-contain p-4 opacity-95 shadow-2xl ring-8 ring-white/10 xl:block"
      />

      <div className="relative max-w-lg xl:max-w-[58%]">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 ring-1 ring-white/15">
          <Sparkles className="size-3.5 text-gold" /> From the heart of the Sundarbans
        </p>
        <h1 className="font-heading mt-5 text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl">
          Fresh from the mangrove, <span className="text-gold">delivered to your door.</span>
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/80">
          Fish, crab, prawn and pure honey collected directly from the Sundarbans — carefully packed and delivered all over Bangladesh.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link href="/shop">
              Shop now <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/categories">Browse categories</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const PROMOS = [
  { href: "/shop?sort=latest", eyebrow: "Just landed", title: "New arrivals", icon: Sparkles, className: "from-[#f3ead3] to-[#e9dcb5] text-[#5b4410]" },
  { href: "/offers", eyebrow: "Limited time", title: "Today's offers", icon: Tag, className: "from-secondary to-[#d3e8dc] text-primary" },
];

function PromoCard({ index }: { index: number }) {
  const promo = PROMOS[index];
  const Icon = promo.icon;

  return (
    <Link href={promo.href} className={cn("group relative flex h-full min-h-40 flex-col justify-between overflow-hidden bg-gradient-to-br p-6", promo.className)}>
      <Icon className="absolute -right-4 -bottom-4 size-32 opacity-10 transition-transform duration-500 group-hover:scale-110" />
      <p className="text-xs font-semibold tracking-[0.18em] uppercase opacity-70">{promo.eyebrow}</p>
      <div>
        <p className="font-heading text-2xl font-semibold">{promo.title}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium">
          Shop now <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}

export function Hero() {
  const { data: banners, isLoading } = useBanners();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [autoplay] = useState(() => Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const slides = banners?.filter((b) => b.type === "slide") ?? [];
  const side = [banners?.find((b) => b.type === "right_top"), banners?.find((b) => b.type === "right_bottom")];

  return (
    <Container className="pt-6">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-muted lg:min-h-[420px]">
          {isLoading ? (
            <Skeleton className="aspect-[16/9] h-full w-full rounded-none lg:aspect-auto" />
          ) : slides.length === 0 ? (
            <BrandHero />
          ) : (
            <Carousel setApi={setApi} opts={{ loop: true }} plugins={[autoplay]} className="h-full">
              <CarouselContent className="ml-0 h-full">
                {slides.map((slide, index) => (
                  <CarouselItem key={slide.id} className="h-full pl-0">
                    <BannerLink banner={slide} className="relative block aspect-[16/9] w-full lg:aspect-auto lg:h-full lg:min-h-[420px]">
                      <RemoteImage src={slide.image} alt={slide.title ?? "Mangrove Collection"} sizes="(max-width: 1024px) 100vw, 66vw" priority={index === 0} />
                      <BannerCaption banner={slide} large />
                    </BannerLink>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {slides.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 size-10 border-0 bg-white/80 shadow-md hover:bg-white" />
                  <CarouselNext className="right-4 size-10 border-0 bg-white/80 shadow-md hover:bg-white" />
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        aria-label={`Go to slide ${index + 1}`}
                        onClick={() => api?.scrollTo(index)}
                        className={cn("h-1.5 rounded-full transition-all", index === current ? "w-6 bg-white" : "w-2.5 bg-white/60")}
                      />
                    ))}
                  </div>
                </>
              )}
            </Carousel>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:grid-rows-2">
          {side.map((banner, index) => (
            <div key={banner?.id ?? index} className="relative overflow-hidden rounded-3xl bg-muted">
              {isLoading ? (
                <Skeleton className="aspect-[16/10] h-full w-full rounded-none lg:aspect-auto" />
              ) : banner ? (
                <BannerLink banner={banner} className="relative block aspect-[16/10] h-full w-full lg:aspect-auto">
                  <RemoteImage src={banner.image} alt={banner.title ?? "Mangrove Collection"} sizes="(max-width: 1024px) 50vw, 33vw" />
                  <BannerCaption banner={banner} />
                </BannerLink>
              ) : (
                <PromoCard index={index} />
              )}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
