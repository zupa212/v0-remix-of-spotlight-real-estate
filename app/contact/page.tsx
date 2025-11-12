import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Metadata } from "next"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact Us | Spotlight Real Estate",
  description: "Get in touch with Spotlight Real Estate. We're here to help you find your perfect property or answer any questions.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="w-full px-6 lg:px-8 py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              We're here to help you find your perfect property. Get in touch with our team today.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="w-full px-6 lg:px-8 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Details */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">
                    Get in Touch
                  </h2>
                  <p className="text-slate-600 leading-relaxed mb-8">
                    Whether you're looking to buy, sell, or rent a property, our experienced team is ready to assist you.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <Mail className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                      <a href="mailto:info@spotlight.gr" className="text-slate-600 hover:text-slate-900 transition-colors">
                        info@spotlight.gr
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <Phone className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                      <a href="tel:+302101234567" className="text-slate-600 hover:text-slate-900 transition-colors">
                        +30 210 123 4567
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <MapPin className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Address</h3>
                      <p className="text-slate-600">
                        Athens, Greece
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <Clock className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Business Hours</h3>
                      <p className="text-slate-600">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Send us a Message
                </h2>
                <form 
                  className="space-y-6"
                  action="mailto:info@spotlight.gr"
                  method="post"
                  encType="text/plain"
                >
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

