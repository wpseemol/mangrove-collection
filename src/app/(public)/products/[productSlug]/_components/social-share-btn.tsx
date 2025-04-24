"use client";

import { useState } from "react";
import { FaFacebookF, FaLink, FaTwitter } from "react-icons/fa6";
import { GrLinkedinOption } from "react-icons/gr";
import {
     FacebookShareButton,
     LinkedinShareButton,
     TwitterShareButton,
} from "react-share";

interface SocialShareBtnType {
     title: string;
     description: string;
}

export default function SocialShareBtn({
     description,
     title,
}: SocialShareBtnType) {
     const [copied, setCopied] = useState(false);
     const fullUrl =
          typeof window !== "undefined"
               ? window.location.href
               : "URL_NOT_AVAILABLE";

     const clearDescription = stripHtml(description);

     const handleCopy = async () => {
          try {
               await navigator.clipboard.writeText(fullUrl);
               setCopied(true);
               setTimeout(() => setCopied(false), 2000); // Reset after 2s
          } catch (err) {
               console.error("Failed to copy: ", err);
          }
     };

     return (
          <div className="flex md:justify-start justify-center items-center gap-3 mt-4">
               {/* Facebook */}
               <FacebookShareButton
                    url={fullUrl}
                    title={title}
                    hashtag={"#mangrove_collection"}
                    className="flex flex-col justify-center items-center"
               >
                    <span className="text-primary-foreground hover:text-primary h-8 w-8 rounded-full border border-primary-foreground hover:border-primary duration-200 flex items-center justify-center">
                         <FaFacebookF />
                    </span>
               </FacebookShareButton>

               {/* Twitter */}
               <TwitterShareButton
                    title={title}
                    url={fullUrl}
                    hashtags={["mangrove_collection"]}
                    className="flex flex-col justify-center items-center"
               >
                    <span className="text-primary-foreground hover:text-primary h-8 w-8 rounded-full border border-primary-foreground hover:border-primary duration-200 flex items-center justify-center">
                         <FaTwitter />
                    </span>
               </TwitterShareButton>

               {/* LinkedIn */}
               <LinkedinShareButton
                    title={title}
                    summary={clearDescription}
                    url={fullUrl}
                    className="flex flex-col justify-center items-center"
               >
                    <span className="text-primary-foreground hover:text-primary h-8 w-8 rounded-full border border-primary-foreground hover:border-primary duration-200 flex items-center justify-center">
                         <GrLinkedinOption />
                    </span>
               </LinkedinShareButton>

               {/* Copy Link */}
               <button
                    onClick={handleCopy}
                    className="flex flex-col justify-center items-center relative"
                    aria-label="Copy link"
               >
                    <span className="text-primary-foreground hover:text-primary h-8 w-8 rounded-full border border-primary-foreground hover:border-primary duration-200 flex items-center justify-center">
                         <FaLink />
                    </span>
                    {copied && (
                         <span className="text-xs mt-1 text-green-500 absolute top-full z-10">
                              Copied!
                         </span>
                    )}
               </button>
          </div>
     );
}

function stripHtml(html: string): string {
     return html.replace(/<\/?[^>]+(>|$)/g, "");
}
