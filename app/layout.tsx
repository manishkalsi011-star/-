import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "\u091f\u092a\u0930\u0940 \u0930\u0947\u0921\u093f\u092f\u094b",
  description:
    "A single-screen chai tapri music player inspired by the provided Figma frame.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "\u091f\u092a\u0930\u0940 \u0930\u0947\u0921\u093f\u092f\u094b",
    description:
      "A full-screen chai tapri music player with a glass control bar and YouTube playlist link.",
    images: ["/bg.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
