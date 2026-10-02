"use client";

import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { RegisterForm } from "@/app/(auth)/register/register-form";
import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

const COPY: Record<Mode, { title: string; subtitle: string; panelTitle: string; panelText: string; cta: string; switchTo: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to track orders and check out faster.",
    panelTitle: "New to Mangrove Collection?",
    panelText: "Create a free account to save your addresses, check out faster and follow every order to your door.",
    cta: "Create an account",
    switchTo: "/register",
  },
  register: {
    title: "Create your account",
    subtitle: "Join us for faster checkout and order tracking.",
    panelTitle: "Already one of us?",
    panelText: "Log in to see your orders, reuse saved addresses and get your Sundarban favourites again in seconds.",
    cta: "Log in instead",
    switchTo: "/login",
  },
};

const POINTS = [
  { icon: Leaf, text: "Collected directly from the Sundarbans" },
  { icon: Truck, text: "Home delivery all over Bangladesh" },
  { icon: ShieldCheck, text: "Cash on delivery & mobile banking" },
];

const FLIP = "duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none";

function SwitchLinkWithRedirect({ href, ...props }: React.ComponentProps<typeof Link> & { href: string }) {
  const redirect = useSearchParams().get("redirect");
  return <Link href={redirect ? `${href}?redirect=${encodeURIComponent(redirect)}` : href} scroll={false} {...props} />;
}

function SwitchLink(props: React.ComponentProps<typeof Link> & { href: string }) {
  return (
    <Suspense fallback={<Link scroll={false} {...props} />}>
      <SwitchLinkWithRedirect {...props} />
    </Suspense>
  );
}

function MobileTabs({ mode }: { mode: Mode }) {
  const tab = (target: Mode, label: string) => (
    <SwitchLink
      href={`/${target}`}
      aria-current={mode === target ? "page" : undefined}
      className={cn(
        "relative z-10 rounded-full py-2.5 text-center text-sm font-semibold transition-colors duration-500",
        mode === target ? "text-white" : "text-muted-foreground",
      )}
    >
      {label}
    </SwitchLink>
  );

  return (
    <div className="mx-auto mb-4 max-w-md md:hidden">
      <div className="relative grid grid-cols-2 rounded-full border bg-card p-1">
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-md shadow-primary/30 transition-transform",
            FLIP,
            mode === "register" && "translate-x-full",
          )}
        />
        {tab("login", "Log in")}
        {tab("register", "Sign up")}
      </div>
    </div>
  );
}

function BrandPanel({ mode }: { mode: Mode }) {
  const copy = COPY[mode];

  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0d4a36] to-forest p-10 text-white md:flex">
      <div className={cn("pointer-events-none absolute -top-20 size-64 rounded-full bg-brand/25 blur-3xl", mode === "login" ? "-right-20" : "-left-20")} />
      <div className={cn("pointer-events-none absolute -bottom-24 size-64 rounded-full bg-gold/20 blur-3xl", mode === "login" ? "-left-10" : "-right-10")} />

      <div className="relative flex items-center gap-3">
        <Image src="/assets/logo.png" alt="" width={48} height={48} className="size-12 rounded-full bg-white object-contain" />
        <span className="flex flex-col leading-none">
          <span className="font-heading text-xl font-semibold">Mangrove</span>
          <span className="mt-1 text-[10px] font-medium tracking-[0.32em] text-white/70 uppercase">Collection</span>
        </span>
      </div>

      <div className="relative py-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">From the heart of Sundarban</p>
        <h2 className="font-heading mt-3 text-3xl leading-tight font-semibold">{copy.panelTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/75">{copy.panelText}</p>
        <SwitchLink
          href={copy.switchTo}
          className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold transition-colors hover:bg-white hover:text-[#0d4a36]"
        >
          {copy.cta}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </SwitchLink>
      </div>

      <ul className="relative space-y-3.5 text-sm text-white/85">
        {POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
              <Icon className="size-4 text-gold" />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Face({
  mode,
  active,
  faceRef,
  children,
}: {
  mode: Mode;
  active: boolean;
  faceRef: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const copy = COPY[mode];
  const form = (
    <div className="p-6 sm:p-10 md:p-12">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{copy.title}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{copy.subtitle}</p>
      <div className="mt-6 sm:mt-8">{children}</div>
    </div>
  );

  return (
    <div
      ref={faceRef}
      inert={!active}
      aria-hidden={!active || undefined}
      className={cn(
        "grid w-full overflow-hidden rounded-2xl border bg-card shadow-xl shadow-black/10 backface-hidden sm:rounded-3xl md:min-h-[620px]",
        mode === "login" ? "md:grid-cols-[5fr_6fr]" : "rotate-y-180 md:grid-cols-[6fr_5fr]",
        active ? "relative" : "absolute inset-x-0 top-0",
      )}
    >
      {mode === "login" ? (
        <>
          <BrandPanel mode="login" />
          {form}
        </>
      ) : (
        <>
          {form}
          <BrandPanel mode="register" />
        </>
      )}
    </div>
  );
}

export function AuthSwitcher({ children }: { children: React.ReactNode }) {
  const mode: Mode = usePathname().startsWith("/register") ? "register" : "login";
  const loginRef = useRef<HTMLDivElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<Partial<Record<Mode, number>>>({});

  const [firstMode] = useState(mode);
  const [hasFlipped, setHasFlipped] = useState(false);
  if (!hasFlipped && mode !== firstMode) setHasFlipped(true);

  useEffect(() => {
    const login = loginRef.current;
    const register = registerRef.current;
    if (!login || !register) return;
    const observer = new ResizeObserver(() => setHeights({ login: login.offsetHeight, register: register.offsetHeight }));
    observer.observe(login);
    observer.observe(register);
    return () => observer.disconnect();
  }, []);

  return (
    <Container className="py-6 sm:py-12 md:py-16">
      <MobileTabs mode={mode} />
      <div className="mx-auto max-w-5xl">
        <div
          style={{ height: heights[mode], perspective: "1800px" }}
          className={cn(
            "relative transition-[height]",
            FLIP,
            hasFlipped && (mode === "register" ? "animate-[card-pop-a_900ms_ease-in-out]" : "animate-[card-pop-b_900ms_ease-in-out]"),
            "motion-reduce:animate-none",
          )}
        >
          <div className={cn("relative transition-transform transform-3d", FLIP, mode === "register" && "rotate-y-180")}>
            <Face mode="login" active={mode === "login"} faceRef={loginRef}>
              <Suspense>
                <LoginForm />
              </Suspense>
            </Face>
            <Face mode="register" active={mode === "register"} faceRef={registerRef}>
              <Suspense>
                <RegisterForm />
              </Suspense>
            </Face>
          </div>
        </div>
      </div>
      {children}
    </Container>
  );
}
