"use client";

import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/shared/container";
import { RemoteImage } from "@/components/shared/remote-image";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DEFAULT_HOME,
    type HeroBlock,
    type HeroPromo,
    useHomeContent,
} from "@/lib/home-content";
import { useBanners } from "@/lib/queries";
import type { Banner } from "@/lib/types";
import { cn } from "@/lib/utils";

function BannerLink({
    banner,
    children,
    className,
}: {
    banner: Banner;
    children: React.ReactNode;
    className?: string;
}) {
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
        <div
            className={cn(
                "absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 via-black/20 to-transparent text-white",
                large ? "p-6 md:p-10" : "p-5",
            )}
        >
            {banner.title && (
                <p
                    className={cn(
                        "font-heading font-semibold",
                        large
                            ? "max-w-lg text-2xl md:text-4xl"
                            : "text-lg md:text-xl",
                    )}
                >
                    {banner.title}
                </p>
            )}
            {banner.subtitle && (
                <p
                    className={cn(
                        "mt-1 text-white/85",
                        large ? "max-w-md text-sm md:text-base" : "text-sm",
                    )}
                >
                    {banner.subtitle}
                </p>
            )}
        </div>
    );
}

/** Headline hero; also shown in slider mode until slides are uploaded from the dashboard. */
function StaticHero({ hero }: { hero: HeroBlock }) {
    return (
        <div className="relative flex h-full min-h-80 flex-col justify-center overflow-hidden bg-linear-to-br from-[#0d4a36] via-[#0d4a36] to-forest p-6 text-white sm:min-h-90 md:p-12 lg:min-h-105">
            {hero.image ? (
                <>
                    <RemoteImage
                        src={hero.image}
                        alt=""
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-black/10" />
                </>
            ) : (
                <>
                    <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand/25 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-gold/20 blur-3xl" />
                    <Image
                        src="/assets/logo.png"
                        alt=""
                        width={260}
                        height={260}
                        className="pointer-events-none absolute top-1/2 right-10 hidden size-60 -translate-y-1/2 rounded-full bg-white/95 object-contain p-4 opacity-95 shadow-2xl ring-8 ring-white/10 xl:block"
                    />
                </>
            )}

            <div className="relative max-w-lg xl:max-w-[58%]">
                {hero.eyebrow && (
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 ring-1 ring-white/15">
                        <Sparkles className="size-3.5 text-gold" /> {hero.eyebrow}
                    </p>
                )}
                {(hero.title || hero.highlight) && (
                    <h1 className="font-heading mt-5 text-[2rem] leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl">
                        {hero.title}{" "}
                        {hero.highlight && (
                            <span className="text-gold">{hero.highlight}</span>
                        )}
                    </h1>
                )}
                {hero.description && (
                    <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/80">
                        {hero.description}
                    </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                    {hero.primary_label && hero.primary_url && (
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-[#0d4a36] hover:bg-white/90"
                        >
                            <Link href={hero.primary_url}>
                                {hero.primary_label} <ArrowRight />
                            </Link>
                        </Button>
                    )}
                    {hero.secondary_label && hero.secondary_url && (
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        >
                            <Link href={hero.secondary_url}>
                                {hero.secondary_label}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function HeroSlider({
    slides,
    delaySeconds,
}: {
    slides: Banner[];
    delaySeconds: number;
}) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [plugins] = useState(() =>
        delaySeconds > 0
            ? [
                  Autoplay({
                      delay: delaySeconds * 1000,
                      stopOnInteraction: false,
                      stopOnMouseEnter: true,
                  }),
              ]
            : [],
    );

    useEffect(() => {
        if (!api) return;
        const onSelect = () => setCurrent(api.selectedScrollSnap());
        onSelect();
        api.on("select", onSelect);
        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    return (
        <Carousel
            setApi={setApi}
            opts={{ loop: slides.length > 1 }}
            plugins={plugins}
            className="h-full"
        >
            <CarouselContent className="ml-0 h-full">
                {slides.map((slide, index) => (
                    <CarouselItem key={slide.id} className="h-full pl-0">
                        <BannerLink
                            banner={slide}
                            className="relative block aspect-video w-full lg:aspect-auto lg:h-full lg:min-h-105"
                        >
                            <RemoteImage
                                src={slide.image}
                                alt={slide.title ?? "Mangrove Collection"}
                                sizes="(max-width: 1024px) 100vw, 66vw"
                                priority={index === 0}
                            />
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
                                className={cn(
                                    "h-1.5 rounded-full transition-all",
                                    index === current
                                        ? "w-6 bg-white"
                                        : "w-2.5 bg-white/60",
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </Carousel>
    );
}

const PROMO_STYLES = [
    {
        icon: Sparkles,
        className:
            "from-[#f3ead3] to-[#e9dcb5] text-[#5b4410]",
    },
    {
        icon: Tag,
        className:
            "from-[#eaf3ee] to-[#d3e8dc] text-[#0d4a36]",
    },
];

function PromoCard({ promo, index }: { promo: HeroPromo; index: number }) {
    const style = PROMO_STYLES[index % PROMO_STYLES.length];
    const Icon = style.icon;

    return (
        <Link
            href={promo.link_url || "/shop"}
            className={cn(
                "group relative flex h-full min-h-36 flex-col justify-between overflow-hidden bg-linear-to-br p-4 sm:min-h-40 sm:p-6",
                style.className,
            )}
        >
            <Icon className="absolute -right-4 -bottom-4 size-24 opacity-10 transition-transform duration-500 group-hover:scale-110 sm:size-32" />
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase opacity-70 sm:text-xs">
                {promo.eyebrow}
            </p>
            <div>
                <p className="font-heading text-lg font-semibold sm:text-2xl">
                    {promo.title}
                </p>
                {promo.link_label && (
                    <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium">
                        {promo.link_label}{" "}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </p>
                )}
            </div>
        </Link>
    );
}

export function Hero() {
    const { data: banners, isLoading: bannersLoading } = useBanners();
    const { content, ready } = useHomeContent();
    const hero = content.hero;
    const loading = bannersLoading || !ready;

    const slides = banners?.filter((b) => b.type === "slide") ?? [];
    const showSlider = hero.mode === "slider" && slides.length > 0;
    const showSide = !ready || hero.show_side_cards;
    const side = [
        banners?.find((b) => b.type === "right_top"),
        banners?.find((b) => b.type === "right_bottom"),
    ];

    return (
        <Container className="pt-4 sm:pt-6">
            <div
                className={cn(
                    "grid gap-3 sm:gap-4",
                    showSide && "lg:grid-cols-[2fr_1fr]",
                )}
            >
                <div className="relative overflow-hidden rounded-2xl bg-muted sm:rounded-3xl lg:min-h-105">
                    {loading ? (
                        <Skeleton className="aspect-video h-full w-full rounded-none lg:aspect-auto" />
                    ) : showSlider ? (
                        <HeroSlider
                            slides={slides}
                            delaySeconds={hero.autoplay_seconds}
                        />
                    ) : (
                        <StaticHero hero={hero} />
                    )}
                </div>

                {showSide && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1 lg:grid-rows-2">
                        {side.map((banner, index) => (
                            <div
                                key={banner?.id ?? index}
                                className="relative overflow-hidden rounded-2xl bg-muted sm:rounded-3xl"
                            >
                                {loading ? (
                                    <Skeleton className="aspect-16/10 h-full w-full rounded-none lg:aspect-auto" />
                                ) : banner ? (
                                    <BannerLink
                                        banner={banner}
                                        className="relative block aspect-16/10 h-full w-full lg:aspect-auto"
                                    >
                                        <RemoteImage
                                            src={banner.image}
                                            alt={
                                                banner.title ??
                                                "Mangrove Collection"
                                            }
                                            sizes="(max-width: 1024px) 50vw, 33vw"
                                        />
                                        <BannerCaption banner={banner} />
                                    </BannerLink>
                                ) : (
                                    <PromoCard
                                        promo={
                                            hero.promos[index] ??
                                            DEFAULT_HOME.hero.promos[index]
                                        }
                                        index={index}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}
