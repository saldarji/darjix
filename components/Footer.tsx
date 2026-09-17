"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/sycmembertv") || pathname?.startsWith("/sychalltv")) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto py-12 px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-8">
          <nav className="flex justify-center space-x-4 mb-4">
            <Link href="/about" className="text-base text-gray-600 hover:text-black">
              About
            </Link>
            <span className="text-base text-gray-600">|</span>
            <Link href="/contact" className="text-base text-gray-600 hover:text-black">
              Contact
            </Link>
          </nav>

          <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-4">
            Darjix.com - Insights, thoughts, and experiments by Sal Darji.
          </p>

          <p className="text-xs text-gray-500 text-center">
            &copy; {currentYear} DARJIX. Powered by Next.js & Firebase.
          </p>
        </div>
      </div>
    </footer>
  );
}
