import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./(styles)/index.css";
import { Providers } from "@/components/Providers";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Project Board",
  description: "Manage your projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>
          <ClientLayout> {children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
