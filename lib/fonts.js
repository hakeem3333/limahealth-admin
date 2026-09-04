import { Playfair_Display } from "next/font/google";

// Scoped display face for the super-admin portal's headings.
// Apply `playfairDisplay.variable` on a wrapping element, then use the
// `font-display` Tailwind utility (registered in globals.css) on headings.
export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});
