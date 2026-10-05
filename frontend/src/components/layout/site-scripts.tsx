"use client";

import Script from "next/script";
import { useEffect } from "react";

import { useSettings } from "@/lib/queries";

const MANAGED = "data-site-settings";

/** Inserts admin-provided markup; scripts are re-created because `innerHTML` never runs them. */
function injectMarkup(html: string, target: HTMLElement) {
  const template = document.createElement("template");
  template.innerHTML = html;

  for (const node of Array.from(template.content.childNodes)) {
    let element: Node = node;
    if (node instanceof HTMLScriptElement) {
      const script = document.createElement("script");
      for (const { name, value } of Array.from(node.attributes)) script.setAttribute(name, value);
      script.text = node.text;
      element = script;
    }
    if (element instanceof Element) element.setAttribute(MANAGED, "");
    target.appendChild(element);
  }
}

/**
 * Tracking tags, verification meta, favicon and custom scripts are configured in
 * the dashboard (`settings` table), so they are applied at runtime instead of
 * being baked into the static build.
 */
export function SiteScripts() {
  const { data: settings } = useSettings();

  const favicon = settings?.site_favicon;
  const verification = settings?.google_site_verification;
  const headScript = settings?.custom_head_script;
  const bodyScript = settings?.custom_body_script;

  useEffect(() => {
    if (!favicon) return;
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = favicon;
    document.head.querySelectorAll("link[rel~='icon']").forEach((icon) => icon.remove());
    document.head.appendChild(link);
  }, [favicon]);

  useEffect(() => {
    if (!verification || document.head.querySelector("meta[name='google-site-verification']")) return;
    const meta = document.createElement("meta");
    meta.name = "google-site-verification";
    meta.content = verification;
    document.head.appendChild(meta);
  }, [verification]);

  useEffect(() => {
    // Runs once per page load: custom scripts usually aren't safe to execute twice.
    if (document.querySelector(`[${MANAGED}]`)) return;
    if (headScript) injectMarkup(headScript, document.head);
    if (bodyScript) injectMarkup(bodyScript, document.body);
  }, [headScript, bodyScript]);

  if (!settings) {
    return null;
  }

  const { google_analytics_id: ga, google_tag_manager_id: gtm, facebook_pixel_id: pixel } = settings;

  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga)});`}
          </Script>
        </>
      )}

      {gtm && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtm)});`}
        </Script>
      )}

      {pixel && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(pixel)});fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
