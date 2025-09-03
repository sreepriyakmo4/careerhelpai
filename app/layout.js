import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "careerhelpai",
  description: "Gai application to help you with your career and to provide you interiew preparation tips",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{
      baseTheme: "dark",
      }}>   
       <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className}`}
      >
      
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          
           <Header/>
            <main className="min-h-screen">{children}</main>
            <Toaster/>
            <footer className="bg-muted/50 py-12">
               <div className="container mx-auto text-center">
                <p>copyright@sreepriyakrishnan</p>
              </div>
            </footer>
          </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
