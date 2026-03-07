import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AppProvider } from "@/context/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "ScreenScoop — The inside scoop on films",
  description: "Discover, review, and discuss the films that matter. The inside scoop on cinema.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="antialiased h-full bg-[#0a0a0a] text-[#f0ece3] flex flex-col">
        <AppProvider>
          <SidebarProvider>
            <div className="flex flex-col h-full w-full">
              <Navbar />
              <main className="flex-1 flex flex-col overflow-hidden min-h-0">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </AppProvider>
      </body>
    </html>
  );
}