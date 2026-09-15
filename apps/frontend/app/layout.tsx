import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trackr · A calm tracker for job and OJT applications",
    template: "%s · Trackr",
  },
  description:
    "Trackr keeps every job and OJT application in one visual pipeline, with notes, tasks, and files alongside each one.",
};

export const viewport: Viewport = {
  themeColor: "#f4f6f2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
