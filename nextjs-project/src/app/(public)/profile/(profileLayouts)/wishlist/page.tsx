import * as motion from "motion/react-client";

export default function WishListPage() {
     return (
          <div className="max-w-3xl mx-auto my-6 p-6 bg-white rounded-lg shadow-md">
               <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    My Wishlist
               </h1>
               <ul className="space-y-4">
                    {[1, 2, 3].map((item, idx) => (
                         <motion.li
                              key={item}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow transition-transform duration-200 hover:-translate-y-0.5"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.4 + idx * 0.1 }}
                         >
                              <div className="flex items-center space-x-4">
                                   <motion.div
                                        className="w-16 h-16 bg-gray-200 rounded-md"
                                        layoutId={`wishlist-img-${item}`}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                             duration: 0.4 + idx * 0.1,
                                             delay: 0.1 + idx * 0.1,
                                        }}
                                   />
                                   <div>
                                        <p className="font-semibold text-gray-700">
                                             Wishlist Item {item}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                             Short description here.
                                        </p>
                                   </div>
                              </div>
                              <button
                                   className="ml-4 px-4 py-2 bg-red-500/80 text-white rounded hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                                   aria-label="Delete"
                              >
                                   Delete
                              </button>
                         </motion.li>
                    ))}
               </ul>
          </div>
     );
}
