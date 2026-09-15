import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevUrl = currentPage === 2 ? "/" : `/page/${currentPage - 1}`;
  const nextUrl = `/page/${currentPage + 1}`;

  return (
    <nav className="flex justify-between items-center border-t border-gray-200 pt-8 mt-12 text-sm font-medium">
      <div>
        {currentPage > 1 ? (
          <Link
            href={prevUrl}
            className="inline-flex items-center px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Newer Posts
          </Link>
        ) : (
          <span className="opacity-0 pointer-events-none">Placeholder</span>
        )}
      </div>

      <div className="text-gray-500 font-mono text-xs">
        Page {currentPage} of {totalPages}
      </div>

      <div>
        {currentPage < totalPages ? (
          <Link
            href={nextUrl}
            className="inline-flex items-center px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition"
          >
            Older Posts
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        ) : (
          <span className="opacity-0 pointer-events-none">Placeholder</span>
        )}
      </div>
    </nav>
  );
}
