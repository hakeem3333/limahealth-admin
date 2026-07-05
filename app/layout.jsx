import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext"; // Import your AuthProvider
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LimaHealth | Institutional Biometric Oversight",
  description:
    "Advanced safety analytics and wearable monitoring for educational institutions.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F9FAFB] text-gray-900 min-h-screen selection:bg-blue-100 selection:text-blue-700`}
      >
        {/* Step 1: React Query Context */}
        <QueryProvider>
          {/* Step 2: Auth Context (Nested inside QueryProvider so it can use hooks if needed) */}
          <AuthProvider>
            {children}

            {/* Global Notification System */}
            <Toaster
              position="top-right"
              toastOptions={{
                className:
                  "rounded-2xl font-bold text-sm border border-gray-100 shadow-xl",
                duration: 4000,
                style: {
                  padding: "16px",
                  color: "#111827",
                },
                success: {
                  iconTheme: {
                    primary: "#2563eb",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
