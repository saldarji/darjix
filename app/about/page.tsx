export const metadata = {
  title: "About - DARJIX",
  description: "About Sal Darji and DARJIX",
};

export default function AboutPage() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-black mb-4">About</h1>
          <div className="prose space-y-4">
            <img
              src="/assets/images/saldarji headshot b&w.jpg"
              alt="Sal Darji"
              className="w-[100px] h-[100px] object-cover rounded float-left mr-4 mb-4"
              width="100"
              height="100"
            />
            <p className="text-base text-gray-600">
              I'm Sal Darji, and this is my space to explore AI and education technology.
            </p>
            <p className="text-base text-gray-600">
              After two years of successfully running the Boston chapter for AI Tinkerers, I'm embarking on a new adventure building AI products for higher education. This site is where I document what I learn along the way.
            </p>

            <h2 className="text-xl font-bold text-black mt-8 mb-4">What You'll Find Here</h2>

            <ul className="list-disc ml-6 text-base text-gray-600 space-y-1">
              <li>Updates on AI projects and experiments</li>
              <li>Reflections on learning and education</li>
              <li>Tools and techniques I'm exploring</li>
            </ul>

            <h2 className="text-xl font-bold text-black mt-8 mb-4">Tech Stack</h2>

            <p className="text-base text-gray-600">
              This site is built with Next.js, Cloud Firestore, Firebase Auth, and Firebase Storage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
