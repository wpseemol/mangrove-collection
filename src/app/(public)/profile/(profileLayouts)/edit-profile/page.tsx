import * as motion from "motion/react-client";
import Image from "next/image";

export default function EditProfilePage() {
     return (
          <div className="md:grid grid-cols-2 items-center w-full">
               <div className="flex flex-col items-center">
                    <motion.form
                         initial={{ opacity: 0, y: 40 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.8, delay: 0.2 }}
                         className="md:w-96 w-full flex flex-col gap-4"
                    >
                         <div className="flex flex-col items-center mb-1">
                              <div className="relative">
                                   <Image
                                        src="/assets/logo/user-avatar.png"
                                        alt="Profile"
                                        width={100}
                                        height={100}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow"
                                   />
                                   <label
                                        htmlFor="profile-image-upload"
                                        className="absolute bottom-0 right-0 bg-primary-foreground text-white rounded-full p-2 cursor-pointer shadow hover:bg-primary transition"
                                        title="Change profile picture"
                                   >
                                        <motion.svg
                                             xmlns="http://www.w3.org/2000/svg"
                                             viewBox="0 0 20 20"
                                             fill="currentColor"
                                             className="w-5 h-5"
                                             initial={{ y: 0 }}
                                             animate={{ y: [0, -4, 0] }}
                                             transition={{
                                                  repeat: Infinity,
                                                  duration: 1.2,
                                                  ease: "easeInOut",
                                             }}
                                        >
                                             <path d="M4 16.5A1.5 1.5 0 0 1 5.5 15h9a1.5 1.5 0 0 1 1.5 1.5v.25A2.25 2.25 0 0 1 13.75 19h-7.5A2.25 2.25 0 0 1 4 16.75v-.25ZM10 3a.75.75 0 0 1 .75.75v6.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V3.75A.75.75 0 0 1 10 3Z" />
                                        </motion.svg>
                                        <input
                                             id="profile-image-upload"
                                             type="file"
                                             accept="image/*"
                                             className="hidden"
                                        />
                                   </label>
                              </div>
                              <span className="mt-2 text-sm text-gray-600">
                                   Profile Image
                              </span>
                         </div>
                         <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                              Name
                              <input
                                   type="text"
                                   name="name"
                                   placeholder="Your name"
                                   className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                         </label>
                         <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                              Email
                              <input
                                   type="email"
                                   name="email"
                                   placeholder="Your email"
                                   className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                         </label>
                         <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                              Bio
                              <textarea
                                   name="bio"
                                   placeholder="Short bio"
                                   className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                   rows={3}
                              />
                         </label>
                         <motion.button
                              type="submit"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.98 }}
                              className="mt-2 px-6 py-3 bg-blue-600 text-white rounded font-semibold shadow hover:bg-blue-700 transition"
                         >
                              Save Changes
                         </motion.button>
                    </motion.form>
               </div>

               <motion.div
                    initial={{ scale: 0, rotate: -90, x: -100 }}
                    animate={{ scale: 1, rotate: 0, x: 0 }}
                    transition={{ type: "spring", stiffness: 120, delay: 0.6 }}
                    className=" flex-col items-center justify-center md:flex hidden"
               >
                    <svg
                         width="80"
                         height="80"
                         viewBox="0 0 80 80"
                         fill="none"
                         xmlns="http://www.w3.org/2000/svg"
                         className="drop-shadow-lg"
                    >
                         <motion.rect
                              x="18"
                              y="50"
                              width="44"
                              height="12"
                              rx="6"
                              stroke="#2563eb"
                              strokeWidth="3"
                              fill="#dbeafe"
                              animate={{
                                   y: [50, 48, 52, 50],
                              }}
                              transition={{
                                   repeat: Infinity,
                                   duration: 2,
                                   ease: "easeInOut",
                              }}
                         />
                         <motion.circle
                              cx="40"
                              cy="30"
                              r="14"
                              stroke="#2563eb"
                              strokeWidth="3"
                              fill="#e0e7ff"
                              animate={{
                                   scale: [1, 1.1, 1],
                              }}
                              transition={{
                                   repeat: Infinity,
                                   duration: 2,
                                   ease: "easeInOut",
                              }}
                         />
                         <motion.path
                              d="M54 26L60 32L54 38"
                              stroke="#2563eb"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              animate={{
                                   pathLength: [0, 1, 0],
                              }}
                              transition={{
                                   repeat: Infinity,
                                   duration: 2,
                                   ease: "easeInOut",
                              }}
                         />
                         <motion.path
                              d="M60 32H44"
                              stroke="#2563eb"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              animate={{
                                   pathLength: [0, 1, 0],
                              }}
                              transition={{
                                   repeat: Infinity,
                                   duration: 2,
                                   ease: "easeInOut",
                                   delay: 1,
                              }}
                         />
                         <motion.g
                              animate={{
                                   rotate: [0, 10, -10, 0],
                              }}
                              transition={{
                                   repeat: Infinity,
                                   duration: 2,
                                   ease: "easeInOut",
                              }}
                         >
                              <rect
                                   x="34"
                                   y="18"
                                   width="12"
                                   height="4"
                                   rx="2"
                                   fill="#2563eb"
                                   opacity="0.2"
                              />
                         </motion.g>
                    </svg>
                    <span className="mt-4 text-xl text-gray-700 font-semibold">
                         Edit Profile
                    </span>
               </motion.div>
          </div>
     );
}
