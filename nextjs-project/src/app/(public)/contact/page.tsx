"use client";
import { motion, Variants } from "framer-motion";
import Head from "next/head";

const ContactPage = () => {
     // Animation variants
     const containerVariants: Variants = {
          hidden: { opacity: 0 },
          visible: {
               opacity: 1,
               transition: {
                    staggerChildren: 0.2,
                    when: "beforeChildren",
               },
          },
     };

     const itemVariants: Variants = {
          hidden: { y: 20, opacity: 0 },
          visible: {
               y: 0,
               opacity: 1,
               transition: {
                    duration: 0.5,
                    ease: "easeOut",
               },
          },
     };

     const formVariants: Variants = {
          hidden: { scale: 0.95, opacity: 0 },
          visible: {
               scale: 1,
               opacity: 1,
               transition: {
                    delay: 0.3,
                    duration: 0.5,
                    ease: "easeOut",
               },
          },
     };

     return (
          <>
               <Head>
                    <title>Contact Us | Green Design</title>
                    <meta
                         name="description"
                         content="Get in touch with our team"
                    />
               </Head>

               <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
               >
                    <div className="max-w-7xl mx-auto">
                         <motion.div
                              variants={itemVariants}
                              className="text-center mb-12"
                         >
                              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                                   Contact Us
                              </h1>
                              <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                                   {`We'd love to hear from you. Send us a message
                                   and we'll respond as soon as possible.`}
                              </p>
                         </motion.div>

                         <div className="flex flex-col lg:flex-row gap-12">
                              <motion.div
                                   variants={itemVariants}
                                   className="lg:w-1/2 space-y-8"
                              >
                                   <div className="bg-white p-6 rounded-lg shadow-lg">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                             Our Information
                                        </h2>

                                        <div className="space-y-4">
                                             <div className="flex items-start">
                                                  <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
                                                       <svg
                                                            className="h-6 w-6 text-green-600"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                       >
                                                            <path
                                                                 strokeLinecap="round"
                                                                 strokeLinejoin="round"
                                                                 strokeWidth={2}
                                                                 d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                            />
                                                            <path
                                                                 strokeLinecap="round"
                                                                 strokeLinejoin="round"
                                                                 strokeWidth={2}
                                                                 d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                       </svg>
                                                  </div>
                                                  <div className="ml-3">
                                                       <h3 className="text-lg font-medium text-gray-800">
                                                            Address
                                                       </h3>
                                                       <p className="text-gray-600">
                                                            123 Green Street,
                                                            Eco City, EC 12345
                                                       </p>
                                                  </div>
                                             </div>

                                             <div className="flex items-start">
                                                  <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
                                                       <svg
                                                            className="h-6 w-6 text-green-600"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                       >
                                                            <path
                                                                 strokeLinecap="round"
                                                                 strokeLinejoin="round"
                                                                 strokeWidth={2}
                                                                 d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                            />
                                                       </svg>
                                                  </div>
                                                  <div className="ml-3">
                                                       <h3 className="text-lg font-medium text-gray-800">
                                                            Phone
                                                       </h3>
                                                       <p className="text-gray-600">
                                                            +1 (555) 123-4567
                                                       </p>
                                                  </div>
                                             </div>

                                             <div className="flex items-start">
                                                  <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
                                                       <svg
                                                            className="h-6 w-6 text-green-600"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                       >
                                                            <path
                                                                 strokeLinecap="round"
                                                                 strokeLinejoin="round"
                                                                 strokeWidth={2}
                                                                 d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                            />
                                                       </svg>
                                                  </div>
                                                  <div className="ml-3">
                                                       <h3 className="text-lg font-medium text-gray-800">
                                                            Email
                                                       </h3>
                                                       <p className="text-gray-600">
                                                            contact@greencompany.com
                                                       </p>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>

                                   <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="bg-white p-6 rounded-lg shadow-lg"
                                   >
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                             Business Hours
                                        </h2>
                                        <ul className="space-y-3">
                                             <li className="flex justify-between">
                                                  <span className="text-gray-600">
                                                       Monday - Friday
                                                  </span>
                                                  <span className="font-medium text-gray-800">
                                                       9:00 AM - 5:00 PM
                                                  </span>
                                             </li>
                                             <li className="flex justify-between">
                                                  <span className="text-gray-600">
                                                       Saturday
                                                  </span>
                                                  <span className="font-medium text-gray-800">
                                                       10:00 AM - 2:00 PM
                                                  </span>
                                             </li>
                                             <li className="flex justify-between">
                                                  <span className="text-gray-600">
                                                       Sunday
                                                  </span>
                                                  <span className="font-medium text-gray-800">
                                                       Closed
                                                  </span>
                                             </li>
                                        </ul>
                                   </motion.div>
                              </motion.div>

                              <motion.div
                                   variants={formVariants}
                                   className="lg:w-1/2"
                              >
                                   <div className="bg-white p-6 rounded-lg shadow-lg">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                             Send us a message
                                        </h2>
                                        <form className="space-y-6">
                                             <div>
                                                  <label
                                                       htmlFor="name"
                                                       className="block text-sm font-medium text-gray-700"
                                                  >
                                                       Full Name
                                                  </label>
                                                  <motion.div
                                                       whileHover={{
                                                            scale: 1.01,
                                                       }}
                                                       whileFocus={{
                                                            scale: 1.01,
                                                       }}
                                                  >
                                                       <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                       />
                                                  </motion.div>
                                             </div>

                                             <div>
                                                  <label
                                                       htmlFor="email"
                                                       className="block text-sm font-medium text-gray-700"
                                                  >
                                                       Email Address
                                                  </label>
                                                  <motion.div
                                                       whileHover={{
                                                            scale: 1.01,
                                                       }}
                                                       whileFocus={{
                                                            scale: 1.01,
                                                       }}
                                                  >
                                                       <input
                                                            type="email"
                                                            id="email"
                                                            name="email"
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                       />
                                                  </motion.div>
                                             </div>

                                             <div>
                                                  <label
                                                       htmlFor="subject"
                                                       className="block text-sm font-medium text-gray-700"
                                                  >
                                                       Subject
                                                  </label>
                                                  <motion.div
                                                       whileHover={{
                                                            scale: 1.01,
                                                       }}
                                                       whileFocus={{
                                                            scale: 1.01,
                                                       }}
                                                  >
                                                       <input
                                                            type="text"
                                                            id="subject"
                                                            name="subject"
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                       />
                                                  </motion.div>
                                             </div>

                                             <div>
                                                  <label
                                                       htmlFor="message"
                                                       className="block text-sm font-medium text-gray-700"
                                                  >
                                                       Message
                                                  </label>
                                                  <motion.div
                                                       whileHover={{
                                                            scale: 1.01,
                                                       }}
                                                       whileFocus={{
                                                            scale: 1.01,
                                                       }}
                                                  >
                                                       <textarea
                                                            id="message"
                                                            name="message"
                                                            rows={4}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                       ></textarea>
                                                  </motion.div>
                                             </div>

                                             <motion.div
                                                  whileHover={{ scale: 1.02 }}
                                                  whileTap={{ scale: 0.98 }}
                                             >
                                                  <button
                                                       type="submit"
                                                       className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                                  >
                                                       Send Message
                                                  </button>
                                             </motion.div>
                                        </form>
                                   </div>
                              </motion.div>
                         </div>
                    </div>
               </motion.div>
          </>
     );
};

export default ContactPage;
