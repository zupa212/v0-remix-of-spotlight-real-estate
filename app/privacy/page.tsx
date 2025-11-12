import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Spotlight Real Estate",
  description: "Read Spotlight Real Estate's privacy policy to understand how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="pt-20">
        <section className="w-full px-6 lg:px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8">
              Privacy Policy
            </h1>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 mb-8 text-lg">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Spotlight Real Estate ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    We may collect information about you in a variety of ways:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>Personal information such as name, email address, phone number, and mailing address</li>
                    <li>Property preferences and search criteria</li>
                    <li>Communication preferences</li>
                    <li>Website usage data and analytics</li>
                    <li>Cookies and tracking technologies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send you property listings and updates based on your preferences</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                    <li>Detect, prevent, and address technical issues</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Information Sharing</h2>
                  <p className="text-slate-600 leading-relaxed">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mt-4">
                    <li>With your consent</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>With service providers who assist us in operating our website and conducting our business</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Security</h2>
                  <p className="text-slate-600 leading-relaxed">
                    We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Rights</h2>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your information</li>
                    <li>Object to processing of your information</li>
                    <li>Request data portability</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies</h2>
                  <p className="text-slate-600 leading-relaxed">
                    We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Contact Us</h2>
                  <p className="text-slate-600 leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <p className="text-slate-600 mt-4">
                    Email: <a href="mailto:privacy@spotlight.gr" className="text-slate-900 hover:underline">privacy@spotlight.gr</a><br />
                    Phone: <a href="tel:+302101234567" className="text-slate-900 hover:underline">+30 210 123 4567</a>
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

