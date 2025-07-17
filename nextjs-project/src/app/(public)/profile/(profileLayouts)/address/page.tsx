import * as motion from "motion/react-client";

export default function AddressPage() {
     return (
          <motion.div
               className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow"
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
          >
               <motion.h2
                    className="text-2xl font-semibold mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
               >
                    Your Addresses
               </motion.h2>
               <ul className="space-y-4">
                    {[
                         "123 Main St, City, Country",
                         "456 Another Rd, City, Country",
                    ].map((address, idx) => (
                         <motion.li
                              key={address}
                              className="flex items-center justify-between bg-gray-50 p-4 rounded"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                   delay: 0.4 + idx * 0.1,
                                   duration: 0.4 + idx * 0.1,
                              }}
                         >
                              <span>{address}</span>
                              <div className="flex space-x-2">
                                   <button
                                        title="Edit"
                                        className="p-2 rounded hover:bg-blue-100 text-blue-600 transition"
                                   >
                                        ✏️
                                   </button>
                                   <button
                                        title="Delete"
                                        className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                                   >
                                        🗑️
                                   </button>
                              </div>
                         </motion.li>
                    ))}
               </ul>
          </motion.div>
     );
}
