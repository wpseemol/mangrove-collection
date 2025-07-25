import SocialLogin from "../_components/social-login";
import TabNavigation from "../_components/tab-navigation";
import LoginForm from "./_components/login-form";

export default async function LoginPage() {
     return (
          <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
               {" "}
               <section className="max-w-md w-full space-y-8">
                    <header className="text-center">
                         <h2 className="text-3xl font-bold text-gray-900">
                              Sign in to your account
                         </h2>
                         <p className="mt-2 text-sm text-gray-600">
                              Welcome back! Please sign in to continue.
                         </p>
                    </header>
                    {/* Tab Navigation */}
                    <TabNavigation />
                    {/* Login Form Section */}
                    <LoginForm />
                    {/* Social Login Section */}
                    <SocialLogin />
               </section>
          </main>
     );
}
