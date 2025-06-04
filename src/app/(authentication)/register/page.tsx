import SocialLogin from "../_components/social-login";
import TabNavigation from "../_components/tab-navigation";
import RegisterForm from "./_components/register-form";

export default function RegisterPage() {
     return (
          <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
               <section className="max-w-md w-full space-y-8">
                    <header className="text-center">
                         <h2 className="text-3xl font-bold text-gray-900">
                              Create your account
                         </h2>
                         <p className="mt-2 text-sm text-gray-600">
                              Join us today and start shopping.
                         </p>
                    </header>
                    {/* Tab Navigation */}
                    <TabNavigation />
                    {/* Register Form Section */}
                    <RegisterForm />
                    <SocialLogin />
               </section>
          </main>
     );
}
