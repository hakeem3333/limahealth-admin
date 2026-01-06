// app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Supporting Student Wellbeing,
          <span className="block text-gray-600 mt-2">One School at a Time</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
          LimaHealth helps schools monitor student wellness, manage alerts, and
          empower counselors — securely and responsibly.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-black px-6 py-3 text-white font-medium hover:bg-gray-800"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-md border px-6 py-3 font-medium hover:bg-gray-100"
          >
            Admin Login
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          School registration requires approval before access is granted.
        </p>
      </section>

      {/* Value Proposition */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-3 gap-10">
          <Feature
            title="Student Wellness Monitoring"
            description="Track stress indicators and wellness signals using secure, privacy-focused tools."
          />
          <Feature
            title="Early Alerts & Intervention"
            description="Identify at-risk students early and route alerts to the right counselors."
          />
          <Feature
            title="Built for Schools"
            description="Designed for educational environments with strong data protection and oversight."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-semibold text-center">How It Works</h2>

        <div className="mt-12 grid md:grid-cols-4 gap-8 text-center">
          <Step
            number="1"
            title="Register Your School"
            description="Provide your school details and administrator information."
          />
          <Step
            number="2"
            title="Verify Email"
            description="Confirm your email address to secure your account."
          />
          <Step
            number="3"
            title="Review & Approval"
            description="Your registration is reviewed to ensure platform safety."
          />
          <Step
            number="4"
            title="Access Dashboard"
            description="Once approved, manage students, counselors, and alerts."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LimaHealth. All rights reserved.
      </footer>
    </main>
  );
}

/* -----------------------------
   Components
------------------------------ */

function Feature({
  title,
  description,
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}) {
  return (
    <div>
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black text-white font-semibold">
        {number}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
