import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AppProvider } from "@/context/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "BlogApp",
  description: "A clean and minimal blogging platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground">
        <AppProvider>
          <Navbar />
          <SidebarProvider>
            <main className="flex-1 w-full">
              {children}
            </main>
          </SidebarProvider>
        </AppProvider>
      </body>
    </html>
  );
}