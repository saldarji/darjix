"use client";

import { useState } from "react";
import { User, Phone } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-black mb-6">Contact</h1>

          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span>Salil (Sal) Darji</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <a href="tel:+16173024332" className="hover:text-black">
                617.302.4332
              </a>
            </div>
          </div>

          <p className="text-base text-gray-600">Send a message.</p>
        </div>

        {submitted && (
          <div className="mb-6 p-4 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
            Thank you! Your message has been sent.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">Message</label>
            <textarea
              rows={6}
              required
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
              placeholder="Your message..."
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800 transition text-sm disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
