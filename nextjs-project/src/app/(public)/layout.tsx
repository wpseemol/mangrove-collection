import FloatingSocialIcons from "./_components/floating-social-Icons";
import Footer from "./_components/footer";
import Header from "./_components/header";
import PublicProviders from "./_components/public-providers";

export default function PublicLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <>
               <PublicProviders>
                    <Header />
                    {children}
                    <FloatingSocialIcons />
                    <Footer />
               </PublicProviders>
          </>
     );
}
