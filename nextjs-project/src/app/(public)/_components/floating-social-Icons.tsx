import Link from "next/link";
import { FaFacebook, FaLinkedin, FaWhatsapp } from "react-icons/fa";

export default function FloatingSocialIcons() {
     return (
          /* 1. Positioning Container: Centers the bar horizontally at the top */
          <div className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col justify-center z-[9999] p-3 items-center sm:gap-y-5 gap-y-4 bg-primary/90 backdrop-blur-sm rounded-l-md shadow-md transform transition-all w-fit">
               {/* 2. The Main Bar: pointer-events-auto allows clicks on the bar
               itself  */}

               {/* WhatsApp */}
               <Link
                    href="https://wa.me/+8801323846556?text=Hi,%20is%20there%20anyone%20to%20assist%20me?"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-[#25D366] transition-all duration-300 hover:scale-125 active:scale-95"
                    title="WhatsApp"
               >
                    <FaWhatsapp size={28} />
               </Link>

               {/* Facebook */}
               <Link
                    href="https://www.facebook.com/mangrove.collection"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-[#1877F2] transition-all duration-300 hover:scale-125 active:scale-95"
                    title="Facebook"
               >
                    <FaFacebook size={28} />
               </Link>

               {/* LinkedIn */}
               <Link
                    href="https://linkedin.com/in/yourprofile"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-[#0A66C2] transition-all duration-300 hover:scale-125 active:scale-95"
                    title="LinkedIn"
               >
                    <FaLinkedin size={28} />
               </Link>
          </div>
     );
}
