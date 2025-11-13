"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Facebook, Linkedin, Youtube } from "lucide-react"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white">
      <div className="w-full px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Top Section - Logo and Contact Info */}
          <div className="mb-12 sm:mb-16 md:mb-20">
            {/* Logo */}
            <div className="mb-8 sm:mb-10 md:mb-12">
              <Link href="/" className="inline-block">
                <Image
                  src="/black spottles.png"
                  alt="spot-less logo"
                  width={180}
                  height={60}
                  className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Contact Information - Vertical List */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-white/80 flex-shrink-0" />
                <a 
                  href="tel:+302101234567" 
                  className="text-sm sm:text-base md:text-lg text-white/90 hover:text-white transition-colors"
                  style={{
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 400,
                  }}
                >
                  +30 210 123 4567
                </a>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white/80 flex-shrink-0" />
                <a 
                  href="mailto:info@spotlight.gr" 
                  className="text-sm sm:text-base md:text-lg text-white/90 hover:text-white transition-colors"
                  style={{
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 400,
                  }}
                >
                  info@spotlight.gr
                </a>
              </div>
              
              <div className="flex items-start gap-3 sm:gap-4">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white/80 flex-shrink-0 mt-0.5" />
                <span 
                  className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 400,
                  }}
                >
                  123 Serenity Boulevard,<br />
                  Greenwood Heights, NY 11222,<br />
                  United States
                </span>
              </div>
            </div>
          </div>

          {/* Social Media Icons - Centered */}
          <div className="flex justify-center items-center gap-4 sm:gap-6 mb-12 sm:mb-16">
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full flex items-center justify-center transition-colors group"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
            </Link>
            
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full flex items-center justify-center transition-colors group"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
            </Link>
            
            <Link
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full flex items-center justify-center transition-colors group"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          {/* Copyright - Bottom */}
          <div className="pt-8 sm:pt-10 border-t border-white/10">
            <p 
              className="text-center text-xs sm:text-sm text-white/70"
              style={{
                fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 400,
              }}
            >
              © Copyright {currentYear}. All Rights Reserved by spot-less
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
