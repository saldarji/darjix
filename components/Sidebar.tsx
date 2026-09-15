import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="space-y-8">
      <div className="border-t-2 border-black pt-4">
        <h3 className="text-lg font-bold text-black mb-4">Experiments</h3>
        <ul className="space-y-4">
          <li>
            <Link href="/news" className="font-medium text-black hover:underline text-sm block">
              EdTech News
            </Link>
            <p className="text-xs text-gray-500 mt-1">
              Top news stories with summaries. AI powered. Weekly. Stable prototype.
            </p>
          </li>
          <li>
            <Link href="/podcasts" className="font-medium text-black hover:underline text-sm block">
              EdTech Podcasts
            </Link>
            <p className="text-xs text-gray-500 mt-1">
              Top podcast episodes about education technology. Updated on page load. Work in progress.
            </p>
          </li>
          <li>
            <Link href="/sychalltv" className="font-medium text-black hover:underline text-sm block">
              SYC Dashboard
            </Link>
            <p className="text-xs text-gray-500 mt-1">
              Weather and Tides Dashboard for Squantum Yacht Club
            </p>
          </li>
          <li>
            <Link href="/archive" className="font-medium text-black hover:underline text-sm block">
              Archive
            </Link>
            <p className="text-xs text-gray-500 mt-1">
              Past experiments, games, and retired features.
            </p>
          </li>
        </ul>
      </div>
    </aside>
  );
}
