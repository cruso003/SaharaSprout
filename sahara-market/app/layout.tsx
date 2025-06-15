import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NavHeader } from "@/components/nav-header";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaharaMarket - Fresh Farm to Table",
  description: "Connect directly with farmers and get the freshest produce delivered to your door. Supporting sustainable agriculture across Africa and beyond.",
  keywords: ["organic farming", "fresh produce", "sustainable agriculture", "Africa", "farm to table"],
  authors: [{ name: "SaharaMarket Team" }],
  openGraph: {
    title: "SaharaMarket - Fresh Farm to Table",
    description: "Connect directly with farmers and get the freshest produce delivered to your door.",
    url: "https://saharamarket.com",
    siteName: "SaharaMarket",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SaharaMarket - Fresh Farm to Table",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaharaMarket - Fresh Farm to Table",
    description: "Connect directly with farmers and get the freshest produce delivered to your door.",
    images: ["/og-image.jpg"],
  },
};

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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <CartProvider>
              <NavHeader />
              {children}
              <Toaster position="top-right" />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
