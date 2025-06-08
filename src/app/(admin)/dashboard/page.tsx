import LogoutBtn from "@/app/(public)/profile/_components/logout-btn";
import { auth } from "@/auth";

export default async function AdminDashboard() {
     const session = await auth();

     if (!session) {
          return (
               <main className="container mx-auto">
                    <section className="py-12 px-4 sm:px-6 lg:px-8">
                         <h1 className="text-3xl font-bold text-gray-900">
                              Profile Page
                         </h1>
                         <p className="mt-2 text-sm text-gray-600">
                              You are not logged in.
                         </p>
                    </section>
               </main>
          );
     }

     return (
          <main className="container mx-auto">
               <section className="py-12 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                         Profile Page
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                         Welcome, {session?.user?.name || "Guest"}!
                    </p>
                    <div className="mt-6">
                         <pre className="bg-gray-100 p-4 rounded-md">
                              {JSON.stringify(session, null, 2)}
                         </pre>
                    </div>
                    <div className="mt-6">
                         <LogoutBtn />
                    </div>
               </section>
          </main>
     );
}
