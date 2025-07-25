export default function Loading() {
     return (
          <main className="flex justify-center items-center min-h-screen p-4">
               <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 200 200"
                    className="w-36 h-36 text-primary-foreground" // Control size and color
                    role="status"
                    aria-label="Loading..."
               >
                    <circle
                         fill="none"
                         strokeOpacity="1"
                         stroke="currentColor" // Use currentColor for Tailwind control
                         strokeWidth="0.5"
                         cx="100"
                         cy="100"
                         r="0"
                    >
                         <animate
                              attributeName="r"
                              calcMode="spline"
                              dur="2"
                              values="1;80"
                              keyTimes="0;1"
                              keySplines="0 .2 .5 1"
                              repeatCount="indefinite"
                         />
                         <animate
                              attributeName="stroke-width"
                              calcMode="spline"
                              dur="2"
                              values="0;25"
                              keyTimes="0;1"
                              keySplines="0 .2 .5 1"
                              repeatCount="indefinite"
                         />
                         <animate
                              attributeName="stroke-opacity"
                              calcMode="spline"
                              dur="2"
                              values="1;0"
                              keyTimes="0;1"
                              keySplines="0 .2 .5 1"
                              repeatCount="indefinite"
                         />
                    </circle>
               </svg>
          </main>
     );
}
