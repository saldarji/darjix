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
              I&apos;m Sal Darji, a Product Management Executive partnering with organizations on a contract basis to shape product strategy, launch AI-first initiatives, and scale high-performing product teams. <em>(Currently fully booked for engagements.)</em>
            </p>
            <p className="text-base text-gray-600">
              Over my career, I&apos;ve led product strategy and execution across fintech, healthcare, insurance, edtech, and higher education:
            </p>

            <ul className="list-disc ml-6 text-base text-gray-600 space-y-2">
              <li>
                <strong>Asset Management ($1.4T AUM):</strong> Led learning and development initiatives and built enterprise products at scale.
              </li>
              <li>
                <strong>Clinical Trials:</strong> Directed product strategy, planning, and new feature development for clinical trials software leaders—providing hands-on leadership to offshore engineering teams and mentoring junior product staff.
              </li>
              <li>
                <strong>Insurance ($50M Platform):</strong> Advised on product strategy and feature prioritization to sharpen roadmap execution.
              </li>
              <li>
                <strong>AI Startups (DocRouter):</strong> Guided market research, product strategy, and positioning for a pre-revenue, AI-first startup.
              </li>
              <li>
                <strong>Higher Ed &amp; Deep Tech (Northeastern University):</strong> Fostered AI and deep-tech spinouts, created the <em>Spinout Readiness Foundations</em> course, and co-organized <em>Venturium&apos;24</em>, a 20-startup showcase spanning five universities.
              </li>
              <li>
                <strong>EdTech (Series A, Exited):</strong> Led in-depth product marketing research and spearheaded new product development through exit.
              </li>
            </ul>

            <p className="text-base text-gray-600">
              This site is where I share notes on AI, product leadership, and the tools I&apos;m exploring.
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
