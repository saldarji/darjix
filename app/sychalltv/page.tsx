import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "SYC Dashboard - DARJIX",
};

export default function SycHallTvPage() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 className="text-3xl font-bold text-black mb-6">SYC Weather & Tides Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Squantum Yacht Club live weather, wind, and tide conditions.
        </p>
        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-600 hover:text-black text-sm inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
