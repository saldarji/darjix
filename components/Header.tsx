"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-3xl font-bold text-black tracking-wider">
            DARJIX
          </Link>

          <div className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/about"
              className={`transition ${
                pathname === "/about" ? "text-black font-semibold" : "text-gray-600 hover:text-black"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`transition ${
                pathname === "/contact" ? "text-black font-semibold" : "text-gray-600 hover:text-black"
              }`}
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
