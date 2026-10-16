import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext"; // Import your AuthProvider
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";

// Runs before hydration so the page never flashes the wrong theme on load.
// Must stay in sync with THEMES/DEFAULT_THEME in context/ThemeContext.js.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('lh_ui_theme');if(t!=='bright'&&t!=='semi-bright'&&t!=='dark')t='bright';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen selection:bg-blue-100 selection:text-blue-700`}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {/* Step 1: Theme (bright / semi-bright / dark) — outermost, no dependency on auth or data */}
        <ThemeProvider>
          {/* Step 2: React Query Context */}
          <QueryProvider>
            {/* Step 3: Auth Context (Nested inside QueryProvider so it can use hooks if needed) */}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
