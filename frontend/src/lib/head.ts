import { absoluteUrl } from "@/lib/seo";

export const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : text);

export const toAbsolute = (url: string) => (/^https?:\/\//i.test(url) ? url : absoluteUrl(url));

/** Sets `<meta>` / `<link>` in the head, creating the tag when the page metadata didn't render one. Returns an undo function. */
function setHeadTag(selector: string, create: () => HTMLElement, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLElement>(selector);
  const created = !element;
  element ??= document.head.appendChild(create());
  const previous = element.getAttribute(attribute);
  element.setAttribute(attribute, value);

  return () => {
    if (created) element.remove();
    else if (previous !== null) element.setAttribute(attribute, previous);
  };
}

export const meta = (key: "name" | "property", name: string, content: string) =>
  setHeadTag(
    `meta[${key}="${name}"]`,
    () => {
      const tag = document.createElement("meta");
      tag.setAttribute(key, name);
      return tag;
    },
    "content",
    content,
  );

export const canonical = (href: string) =>
  setHeadTag(
    'link[rel="canonical"]',
    () => {
      const tag = document.createElement("link");
      tag.rel = "canonical";
      return tag;
    },
    "href",
    href,
  );
