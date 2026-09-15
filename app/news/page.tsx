import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "EdTech News - DARJIX",
  description: "AI powered top news stories in educational technology",
};

export default function NewsPage() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 className="text-3xl font-bold text-black mb-6">EdTech News</h1>

        <div className="prose max-w-none text-gray-800 space-y-4">
          <p>
            Welcome to the AI-powered EdTech News digest. This page aggregates the latest developments across AI and educational technology.
          </p>
        </div>

        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
            About This Experiment
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            This page is updated with recent news about educational technology, summarized using Google Gemini.
          </p>
          <p className="text-xs text-gray-500">
            Powered by Google Gemini & Firebase Infrastructure
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-600 hover:text-black text-sm inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
