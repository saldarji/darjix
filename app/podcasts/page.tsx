import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "EdTech Podcasts - DARJIX",
};

export default function PodcastsPage() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 className="text-3xl font-bold text-black mb-6">EdTech Podcasts</h1>
        <p className="text-gray-600 mb-8">
          Curated podcast episodes focusing on education technology, higher ed innovations, and AI learning tools.
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
