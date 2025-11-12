import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Spotlight Real Estate",
  description: "Read Spotlight Real Estate's terms of service to understand the rules and regulations for using our website and services.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="pt-20">
        <section className="w-full px-6 lg:px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8">
              Terms of Service
            </h1>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 mb-8 text-lg">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
                  <p className="text-slate-600 leading-relaxed">
                    By accessing or using Spotlight Real Estate's website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Use License</h2>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Permission is granted to temporarily access the materials on Spotlight Real Estate's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                    <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Property Listings</h2>
                  <p className="text-slate-600 leading-relaxed">
                    All property listings, descriptions, and information are provided for informational purposes only. While we strive to ensure accuracy, we do not guarantee the completeness, reliability, or accuracy of any property information. Property availability, prices, and details are subject to change without notice.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">4. User Accounts</h2>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Prohibited Uses</h2>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    You may not use our website:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>In any way that violates any applicable national or international law or regulation</li>
                    <li>To transmit, or procure the sending of, any advertising or promotional material</li>
                    <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
                    <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Disclaimer</h2>
                  <p className="text-slate-600 leading-relaxed">
                    The materials on Spotlight Real Estate's website are provided on an 'as is' basis. Spotlight Real Estate makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Limitations</h2>
                  <p className="text-slate-600 leading-relaxed">
                    In no event shall Spotlight Real Estate or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Spotlight Real Estate's website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Revisions</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Spotlight Real Estate may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Contact Information</h2>
                  <p className="text-slate-600 leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <p className="text-slate-600 mt-4">
                    Email: <a href="mailto:legal@spotlight.gr" className="text-slate-900 hover:underline">legal@spotlight.gr</a><br />
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

