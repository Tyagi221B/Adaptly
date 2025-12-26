import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { LoadingBar } from "@/components/ui/loading-bar";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { SkipLink } from "@/components/navigation/skip-link";
import { checkDatabaseConnection } from "@/lib/startup";
import { AccessibilityChecker } from "@/components/providers/accessibility-checker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adaptly - AI-Powered Adaptive Learning Platform",
  description: "Transform how you learn with personalized AI tutoring that adapts to your knowledge gaps",
};

// Run database health check on startup
checkDatabaseConnection();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SkipLink />
            <LoadingBar />
            <ScrollToTop />
            {children}
            <AccessibilityChecker />
          </ThemeProvider>
        </AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
