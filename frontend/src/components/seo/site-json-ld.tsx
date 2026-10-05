import { absoluteUrl, jsonLd, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/** Store and site-search structured data, rendered once in the root layout. */
export function SiteJsonLd() {
  const home = absoluteUrl("/");
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": `${home}#store`,
        name: SITE_NAME,
        url: home,
        logo: absoluteUrl("/assets/logo.png"),
        image: absoluteUrl("/assets/og-image.jpg"),
        description: SITE_DESCRIPTION,
        areaServed: { "@type": "Country", name: "Bangladesh" },
        currenciesAccepted: "BDT",
        paymentAccepted: "Cash on delivery, mobile banking",
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        name: SITE_NAME,
        url: home,
        inLanguage: "en",
        publisher: { "@id": `${home}#store` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/shop/")}?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
