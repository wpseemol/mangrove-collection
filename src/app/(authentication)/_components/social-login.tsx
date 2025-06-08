import LoginWithGoogleBtn from "./login-with-google-btn";

export default function SocialLogin() {
     return (
          <div className="bg-white py-6 px-6 shadow-sm rounded-lg border border-gray-200">
               <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                         <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                         <span className="px-2 bg-white text-gray-500">
                              Or continue with
                         </span>
                    </div>
               </div>

               <div>
                    <LoginWithGoogleBtn />
               </div>
          </div>
     );
}
