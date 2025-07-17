import * as motion from "motion/react-client";

export default function EmptyAddressBook() {
     return (
          <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="flex flex-col items-center justify-center py-16 px-4 "
          >
               <svg
                    className="w-16 h-16 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
               >
                    <rect
                         x="8"
                         y="12"
                         width="32"
                         height="24"
                         rx="4"
                         strokeWidth="2"
                    />
                    <path
                         d="M16 20h16M16 28h8"
                         strokeWidth="2"
                         strokeLinecap="round"
                    />
               </svg>
               <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    No Addresses Found
               </h2>
               <p className="text-gray-500 mb-4 text-center">
                    Your address book is empty. Add a new address to get
                    started.
               </p>
          </motion.div>
     );
}
