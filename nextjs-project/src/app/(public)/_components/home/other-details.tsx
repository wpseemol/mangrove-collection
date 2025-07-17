import * as motion from "motion/react-client";
import Link from "next/link";

export default function OtherDetails() {
     return (
          <motion.section
               className="bg-gradient-to-b from-green-50 to-white"
               id="about"
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
          >
               <div className="container mx-auto py-12 px-4 md:px-0 ">
                    <motion.div
                         className="space-y-2 mb-6 text-center"
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         viewport={{ once: true }}
                         transition={{ delay: 0.2 }}
                    >
                         <h2 className="text-4xl font-extrabold flex items-center justify-center gap-2">
                              <span role="img" aria-label="leaf">
                                   🌿
                              </span>
                              <span className="text-primary-foreground drop-shadow">
                                   Mangrove Collection
                              </span>
                         </h2>
                         <h3 className="text-2xl font-semibold text-green-700">
                              🐟 “সুন্দরবনের বিশুদ্ধতা, আপনার টেবিলে”
                         </h3>
                         <h4 className="text-lg font-medium text-gray-700">
                              আমাদের গল্প:
                         </h4>
                    </motion.div>

                    <motion.div
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         viewport={{ once: true }}
                         transition={{ delay: 0.4 }}
                         className="space-y-4 bg-white/80 rounded-lg shadow p-6"
                    >
                         <p className="text-base leading-7 text-gray-800">
                              আমরা{" "}
                              <Link
                                   href="/"
                                   className="underline text-primary-foreground"
                              >
                                   Mangrove collection
                              </Link>{" "}
                              বিভিন্ন ধরণের সমুদ্র জলের মাছ, কাঁকড়া, বিভিন্ন
                              ধরণের চিংড়ি, সুন্দরবনের কাঁচা মধু সহ সুন্দরবন
                              এলাকার অন্যান্য পণ্য সরবরাহ করি। আমাদের সকল পণ্যই
                              শুধুমাত্র{" "}
                              <Link
                                   href="https://en.wikipedia.org/wiki/Sundarbans"
                                   className="underline text-primary-foreground font-medium"
                              >
                                   সুন্দরবন
                              </Link>{" "}
                              এবং এর পাশবর্তী নদী ও এলাকা থেকে সংগৃহিত এবং আমরা
                              সরাসরি ওই এলাকা থেকে সংগ্রহ করি।
                         </p>
                         <p className="text-base leading-7 text-gray-800">
                              আমাদের মূল উদ্দেশ্য, প্রাকৃতিক সম্পদের ভরপুর
                              সুন্দরবনের স্বাদ আপনার কাছে পৌঁছে দেয়া।
                         </p>
                         <p className="text-base leading-7 text-gray-800">
                              আমরা সর্বোত্তম তাজা মানের পণ্য নিশ্চিত করতে
                              আত্মবিশ্বাসী কারণ আমরা সুন্দর এলাকার স্থানীয়
                              বসবাসকারী এবং আমরা নিজস্ব তত্বাবধায়নে সকল
                              স্বাস্থ্যবিধি পালন করে মাছ সংগ্রহ করি এবং
                              শুধুমাত্র প্রাকৃতিক খাদ্য গ্রহণ করা মাছ সরাসরি
                              জেলেদের কাছ থেকে সংগ্রহ করি।
                         </p>
                         <p className="text-base leading-7 text-gray-800">
                              আমরা পণ্যের গুণমান নিশ্চিত করার জন্য, অর্ডার গ্রহণ
                              করার পরেই শুধুমাত্র মাছ সংগ্রহ করি এবং এটাই
                              একমাত্র পদ্ধতি সর্বোচ্চ তাজা মাছ কে আপনার
                              কাছে পৌঁছে দেয়ার।
                         </p>
                         <p className="text-base leading-7 text-gray-800">
                              আমি একজন টেক্সটাইল ইঞ্জিনিয়ার এবং আমি গত ১৫ বছর
                              ধরে ঢাকা শহরে থাকি। আমি কখনোই আমার এলাকার সেই
                              প্রিয় স্বাদ ঢাকার মাছে পাইনি। এছাড়া সেগুলো
                              বেশিরভাগই অনেক অনিরাপদ। এই কারণে আমরা সিদ্ধান্ত
                              নিয়েছি সুন্দরবনের প্রাকৃতিক স্বাদ আপনার কাছে
                              পৌঁছে দেয়া এবং স্থানীয় জেলেদের ন্যায্য মূল্য
                              গ্রহণে সহায়তা করা।
                         </p>
                         <p className="text-base leading-7 text-gray-800">
                              প্রতিটি ধাপে আমরা অনুসরণ করি একটি “Conscious
                              Process” যেখানে পণ্যের স্বাদ ও শুদ্ধতা অক্ষুন্ন
                              রাখা হয়।
                         </p>
                    </motion.div>

                    <motion.div
                         className="my-8 space-y-3"
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         viewport={{ once: true }}
                         transition={{ delay: 0.6 }}
                    >
                         <h2 className="text-2xl font-bold text-center">
                              <span className="text-primary-foreground">
                                   <Link
                                        href="/"
                                        className="underline text-primary-foreground"
                                   >
                                        Mangrove Collection
                                   </Link>
                                   – পণ্য সমূহ
                              </span>
                         </h2>

                         <div className="flex flex-wrap gap-2 justify-center">
                              <span className="text-xl font-semibold bg-yellow-100 px-3 py-1 rounded shadow">
                                   কাঁচা ম্যানগ্রোভ মধু
                              </span>
                              <span className="text-xl font-semibold bg-green-100 px-3 py-1 rounded shadow">
                                   বিভিন্ন ধরণের চিংড়ি
                              </span>
                              <span className="text-xl font-semibold bg-blue-100 px-3 py-1 rounded shadow">
                                   জীবন্ত কাঁকড়া
                              </span>
                              <span className="text-xl font-semibold bg-blue-50 px-3 py-1 rounded shadow">
                                   নরম খোলস কাঁকড়া
                              </span>
                              <span className="text-xl font-semibold bg-green-50 px-3 py-1 rounded shadow">
                                   বিভিন্ন ধরণের সমুদ্রিক মাছ
                              </span>
                         </div>
                         <div className="text-center text-gray-700 mt-2 text-base">
                              <span className="font-medium">
                                   যেমন: বাগদা চিংড়ি, গলদা চিংড়ি, হরিনা চিংড়ি,
                                   চাকা চিংড়ি, গুঁড়া চিংড়ি, গোদা চিংড়ি, কোরাল
                                   মাছ, পায়রা মাছ, ফাইশা মাছ, টেংরা মাছ, ভাঙাল
                                   মাছ ইত্যাদি।
                              </span>
                              <br />
                              Mangrove Collection সুন্দরবন, যা বিশ্বের বৃহত্তম
                              ম্যানগ্রোভ বন, তার শিক্ষা ও প্রাকৃতিক সমৃদ্ধিকে
                              প্রতিফলিত করে আমাদের পণ্য–প্রতিটি মাছ প্রাকৃতিক,
                              স্বাস্থ্যকর ও পরিবেশবান্ধব পদ্ধতিতে সংগ্রহ করা হয়।
                         </div>
                    </motion.div>

                    <motion.div
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         viewport={{ once: true }}
                         transition={{ delay: 0.8 }}
                         className="bg-green-50 rounded-lg shadow p-6"
                    >
                         <h3 className="text-xl font-semibold mb-3 text-green-900">
                              ক্রয়াদেশ থেকে সরবরাহ :
                         </h3>
                         <ul className="space-y-2 text-base leading-7 text-gray-800">
                              <li className="flex items-start gap-2">
                                   <span>
                                        <svg
                                             width="22"
                                             height="22"
                                             viewBox="0 0 22 22"
                                             fill="none"
                                             className="mt-1"
                                             xmlns="http://www.w3.org/2000/svg"
                                        >
                                             <circle
                                                  cx="11"
                                                  cy="11"
                                                  r="10"
                                                  fill="#22c55e"
                                             />
                                             <path
                                                  d="M7 11.5l2.5 2.5 5-5"
                                                  stroke="#fff"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                             />
                                        </svg>
                                   </span>
                                   <span>
                                        প্রথম ধাপে, আমরা সকাল থেকে সাধারণত রাত
                                        ১০ টা পর্যন্ত অর্ডার গ্রহণ করি।
                                   </span>
                              </li>
                              <li className="flex items-start gap-2">
                                   <span>
                                        <svg
                                             width="22"
                                             height="22"
                                             viewBox="0 0 22 22"
                                             fill="none"
                                             className="mt-1"
                                             xmlns="http://www.w3.org/2000/svg"
                                        >
                                             <circle
                                                  cx="11"
                                                  cy="11"
                                                  r="10"
                                                  fill="#22c55e"
                                             />
                                             <path
                                                  d="M7 11.5l2.5 2.5 5-5"
                                                  stroke="#fff"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                             />
                                        </svg>
                                   </span>
                                   <span>
                                        দ্বিতীয় ধাপে, আমরা সকল অর্ডার সংগ্রহ করে
                                        পরদিন ভোর হতে সকাল ৮ টার মধ্যে
                                        পণ্য সংগ্রহ শেষ করি।
                                   </span>
                              </li>
                              <li className="flex items-start gap-2">
                                   <span>
                                        <svg
                                             width="22"
                                             height="22"
                                             viewBox="0 0 22 22"
                                             fill="none"
                                             className="mt-1"
                                             xmlns="http://www.w3.org/2000/svg"
                                        >
                                             <circle
                                                  cx="11"
                                                  cy="11"
                                                  r="10"
                                                  fill="#22c55e"
                                             />
                                             <path
                                                  d="M7 11.5l2.5 2.5 5-5"
                                                  stroke="#fff"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                             />
                                        </svg>
                                   </span>
                                   <span>
                                        তৃতীয় ধাপে, আমরা বায়ুরোধী প্যাকেটে
                                        বরফজাত করে ঢাকার উদ্দেশ্যে পাঠিয়ে দেই।
                                   </span>
                              </li>
                              <li className="flex items-start gap-2">
                                   <span>
                                        <svg
                                             width="22"
                                             height="22"
                                             viewBox="0 0 22 22"
                                             fill="none"
                                             className="mt-1"
                                             xmlns="http://www.w3.org/2000/svg"
                                        >
                                             <circle
                                                  cx="11"
                                                  cy="11"
                                                  r="10"
                                                  fill="#22c55e"
                                             />
                                             <path
                                                  d="M7 11.5l2.5 2.5 5-5"
                                                  stroke="#fff"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                             />
                                        </svg>
                                   </span>
                                   <span>
                                        চতুর্থ ধাপে আমরা ঢাকা থেকে সকল ক্রেতার
                                        কাছে রাত ১০ টার ভিতর সরবরাহ করি।
                                   </span>
                              </li>
                         </ul>
                    </motion.div>
               </div>
          </motion.section>
     );
}
