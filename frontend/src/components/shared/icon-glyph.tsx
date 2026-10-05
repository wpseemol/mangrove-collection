import { createElement, type SVGProps } from "react";

import type { IconNode } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALLOWED_TAGS = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse"]);
const ALLOWED_ATTRS = new Set(["d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "width", "height", "points"]);

const safeAttrs = (attrs: Record<string, string>) =>
  Object.fromEntries(Object.entries(attrs).filter(([key, value]) => ALLOWED_ATTRS.has(key) && typeof value === "string"));

/** Draws a category icon from the API (`[tag, attrs][]`) without using innerHTML. */
export function IconGlyph({ nodes, className, ...props }: { nodes: IconNode[] } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
      {...props}
    >
      {nodes.filter(([tag]) => ALLOWED_TAGS.has(tag)).map(([tag, attrs], index) => createElement(tag, { ...safeAttrs(attrs), key: index }))}
    </svg>
  );
}
