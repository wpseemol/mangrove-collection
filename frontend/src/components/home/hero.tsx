"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/shared/container";
import { RemoteImage } from "@/components/shared/remote-image";
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

function BannerCaption({ banner }: { banner: Banner }) {
  if (!banner.title && !banner.subtitle) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white md:p-6">
      {banner.title && <p className="text-lg font-semibold md:text-2xl">{banner.title}</p>}
      {banner.subtitle && <p className="text-sm text-white/85 md:text-base">{banner.subtitle}</p>}
    </div>
  );
}

function BrandPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary to-emerald-800 p-6 text-center text-white", className)}>
      <Image src="/assets/logo.png" alt="" width={120} height={120} className="size-24 rounded-full bg-white object-contain md:size-32" />
      <p className="font-heading text-sm tracking-[0.2em] uppercase md:text-base">From the heart of Sundarban</p>
    </div>
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
    <Container className="pt-4 md:pt-6">
      <div className="grid gap-3 md:gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-muted shadow-sm">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-none" />
          ) : slides.length === 0 ? (
            <BrandPlaceholder />
          ) : (
            <Carousel setApi={setApi} opts={{ loop: true }} plugins={[autoplay]} className="h-full">
              <CarouselContent className="ml-0 h-full">
                {slides.map((slide, index) => (
                  <CarouselItem key={slide.id} className="h-full pl-0">
                    <BannerLink banner={slide} className="relative block aspect-[16/9] w-full">
                      <RemoteImage src={slide.image} alt={slide.title ?? "Mangrove Collection"} sizes="(max-width: 1024px) 100vw, 66vw" priority={index === 0} />
                      <BannerCaption banner={slide} />
                    </BannerLink>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {slides.length > 1 && (
                <>
                  <CarouselPrevious className="left-3 border-0 bg-white/70 hover:bg-white" />
                  <CarouselNext className="right-3 border-0 bg-white/70 hover:bg-white" />
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        aria-label={`Go to slide ${index + 1}`}
                        onClick={() => api?.scrollTo(index)}
                        className={cn("h-1.5 rounded-full transition-all", index === current ? "w-5 bg-brand" : "w-2.5 bg-white/80")}
                      />
                    ))}
                  </div>
                </>
              )}
            </Carousel>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-1 lg:grid-rows-2">
          {side.map((banner, index) => (
            <div key={banner?.id ?? index} className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted shadow-sm lg:aspect-auto">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-none" />
              ) : banner ? (
                <BannerLink banner={banner} className="relative block h-full w-full">
                  <RemoteImage src={banner.image} alt={banner.title ?? "Mangrove Collection"} sizes="(max-width: 1024px) 50vw, 33vw" />
                  <BannerCaption banner={banner} />
                </BannerLink>
              ) : (
                <BrandPlaceholder className={index === 1 ? "from-emerald-800 to-primary" : undefined} />
              )}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
