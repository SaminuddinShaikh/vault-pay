import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";

export const metadata: Metadata = {
  title: "Vaultpay — Secure Payments Demo",
  description: "Payment gateway UI demo built with Next.js, TypeScript, Redux Toolkit and Tailwind CSS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning={true}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
