"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Bed, Maximize, MapPin, Check, Sun, Wind, Heater, Warehouse, ArrowUpCircle,
  Flame, Shrub, Phone, ShieldCheck, Bell, Lock, Grid, MoveVertical, Gamepad2,
  Antenna, Paintbrush, Car, Mountain, LayoutTemplate, Route, Home, Umbrella,
  Accessibility, CornerUpRight, UtensilsCrossed, ArrowDown, ChevronDown, Armchair
} from "lucide-react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { BeforeAfterSection } from "@/components/listing/BeforeAfterSection"

// Helper for currency formatting
function formatPrice(price: number) {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price)
}

// Data for Before/After Section
const COMPARE_ITEMS = [
  {
    id: "yard",
    title: "Εσωτερικός χώρος σκάλας", // Renamed from Πίσω Αυλή
    beforeSrc: "/kapandriti/before/1.jpg",
    afterSrc: "/kapandriti/after/1.jpg",
  },
  {
    id: "driveway", // Renamed contextually based on "Living Room" -> "Central Staircase" request, but maintaining ID structure
    title: "Κεντρική Είσοδος",
    beforeSrc: "/kapandriti/before/2.jpg",
    afterSrc: "/kapandriti/after/2.jpg",
  },
  {
    id: "interior",
    title: "Σκάλα Κεντρικής Εισόδου", // Renamed from Σαλόνι
    beforeSrc: "/kapandriti/before/3.jpg",
    afterSrc: "/kapandriti/after/3.jpg",
  },
  {
    id: "garden2",
    title: "Κήπος",
    beforeSrc: "/kapandriti/before/4.jpg",
    afterSrc: "/kapandriti/after/4.jpg",
  },
]

export default function KapandritiRealEstatePage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white" ref={containerRef}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent transition-all duration-500">
        <div className="flex items-center gap-2">
          <Image
            src="/kapandriti/logo.svg"
            alt="Vertical Logo"
            width={160}
            height={40}
            className="object-contain invert brightness-0 drop-shadow-lg"
          />
        </div>
        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-6 font-medium backdrop-blur-md transition-all">
          <Phone className="h-4 w-4 mr-2" />
          +30 694 885 2892
        </Button>
      </header>

      <main className="pb-0">

        {/* Improved Hero Section */}
        <section className="relative h-screen w-full overflow-hidden flex items-end pb-24 md:pb-32">
          <motion.div style={{ y }} className="absolute inset-0 w-full h-full">
            <Image
              src="/kapandriti/image1.png"
              alt="Luxury House Main"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1600&auto=format&fit=crop"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
          </motion.div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Προς Πώληση
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6 tracking-tight drop-shadow-2xl">
                Πολυτελής Κατοικία <br />
                <span className="text-white/80 font-light italic">στο Καπανδρίτι</span>
              </h1>

              <div className="flex flex-wrap items-center gap-8 text-lg font-light tracking-wide text-white/90 border-t border-white/20 pt-6 mt-6 max-w-2xl">
                <div className="flex items-center gap-3">
                  <Maximize className="h-6 w-6 stroke-1" />
                  <span>336 τ.μ.</span>
                </div>
                <div className="flex items-center gap-3">
                  <Bed className="h-6 w-6 stroke-1" />
                  <span>5 Υ/Δ</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 stroke-1" />
                  <span>Καπανδρίτι, Αττική</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            style={{ opacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white flex flex-col items-center gap-2"
          >
            <span className="text-xs uppercase tracking-[0.2em] opacity-80">Scroll to Explore</span>
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </motion.div>
        </section>

        <div className="bg-white relative z-20 rounded-t-[3rem] -mt-12 pt-16 md:pt-24 space-y-24 container mx-auto px-6 lg:px-8">

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pb-16">

            {/* Left Detail Column */}
            <div className="lg:col-span-2 space-y-16">

              {/* Image Gallery Grid */}
              <div className="grid grid-cols-2 gap-4 h-[500px] rounded-3xl overflow-hidden group">
                <div className="relative h-full bg-gray-100 overflow-hidden rounded-2xl">
                  <Image
                    src="/kapandriti/after/1.jpg"
                    alt="Backyard"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="grid grid-rows-2 gap-4 h-full">
                  <div className="relative h-full bg-gray-100 overflow-hidden rounded-2xl">
                    <Image
                      src="/kapandriti/after/2.jpg"
                      alt="Driveway"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="relative h-full bg-gray-100 overflow-hidden rounded-2xl">
                    <Image
                      src="/kapandriti/after/3.jpg"
                      alt="Interior"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Levels */}
              <div>
                <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">Σχετικά με το ακίνητο</h2>
                <div className="prose prose-lg text-gray-600 max-w-none space-y-6 text-lg leading-relaxed font-light">
                  <p>
                    Μοναδική κατοικία 336 τ.μ., φωτεινή και διαμπερής, σχεδιασμένη για άνετη οικογενειακή ζωή με ποιοτικά υλικά και premium παροχές. Διαθέτει ασανσέρ, τζάκι, ενδοδαπέδια θέρμανση, κλιματισμό, εσωτερική σκάλα, σοφίτα & playroom, καθώς και εξωτερικούς χώρους με κήπο και εντοιχισμένο BBQ.
                  </p>
                  <p className="hidden md:block">
                    Πρόκειται για κατοικία υψηλών προδιαγραφών, ιδανική για οικογένεια που θέλει μεγάλους χώρους, λειτουργική διαρρύθμιση και άνεση όλες τις εποχές του χρόνου.
                  </p>
                </div>

                {/* Levels Cards */}
                <div className="mt-12 space-y-8">
                  <h3 className="text-xl font-bold text-[#1a1a1a]">Διαρρύθμιση Επιπέδων</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      {[
                        { l: "Επίπεδο 0", d: "1 Δωμάτιο • Κουζίνα • Σαλόνι" },
                        { l: "Επίπεδο 1", d: "1 Δωμάτιο • Κουζίνα • Σαλόνι" },
                        { l: "Επίπεδο 2", d: "3 Υπνοδωμάτια" },
                        { l: "Επίπεδο 3", d: "Σοφίτα / Playroom" }
                      ].map((lvl, index) => (
                        <div key={index} className="bg-gray-50 border border-transparent hover:border-black/5 rounded-2xl p-5 flex items-center gap-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
                          <div className="h-12 w-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center font-bold text-lg text-black">{index}</div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{lvl.l}</div>
                            <div className="text-gray-500">{lvl.d}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Placeholder for Layer Diagram */}
                    <div className="relative h-[300px] w-full bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center">
                      <span className="text-gray-400 font-medium">Property Levels Diagram</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features & Amenities */}
              <div className="space-y-12">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-8">Εσωτερικά Χαρακτηριστικά</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                    {[
                      { l: "Ασανσέρ", i: MoveVertical },
                      { l: "Τζάκι", i: Flame },
                      { l: "Ηλιακός θερμοσίφωνας", i: Sun },
                      { l: "Αποθήκη (≈10 τ.μ.)", i: Warehouse },
                      { l: "Δάπεδα: Ξύλο (σε χώρους)", i: ArrowUpCircle },
                      { l: "Πόρτα ασφαλείας", i: ShieldCheck },
                      { l: "Συναγερμός", i: Bell },
                      { l: "Κουφώματα αλουμινίου", i: Maximize },
                      { l: "Διπλά τζάμια", i: Grid },
                      { l: "Σίτες", i: Grid },
                      { l: "Φωτεινό", i: Sun },
                      { l: "Διαμπερές", i: Wind },
                      { l: "Εσωτερική σκάλα", i: ArrowUpCircle },
                      { l: "Επιπλωμένο", i: Armchair },
                      { l: "Ενδοδαπέδια θέρμανση", i: Heater },
                      { l: "Κλιματισμός", i: Wind },
                      { l: "Νυχτερινό ρεύμα", i: Lock },
                      { l: "Σοφίτα", i: ArrowUpCircle },
                      { l: "Playroom", i: Gamepad2 },
                      { l: "Δορυφορική κεραία", i: Antenna },
                      { l: "Βαμμένο / Πολυτελές", i: Paintbrush },
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 group hover:border-black/20 transition-colors">
                        <feature.i className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                        <span className="text-gray-700 group-hover:text-black transition-colors">{feature.l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-8">Εξωτερικά Χαρακτηριστικά</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                    {[
                      { l: "Θέση στάθμευσης (1) / Parking", i: Car },
                      { l: "Θέα", i: Mountain },
                      { l: "Προσόψεως", i: LayoutTemplate },
                      { l: "Πρόσβαση από άσφαλτο", i: Route },
                      { l: "Οικιστική ζώνη", i: Home },
                      { l: "Τέντες", i: Umbrella },
                      { l: "Κήπος", i: Shrub },
                      { l: "Εντοιχισμένο BBQ", i: UtensilsCrossed },
                      { l: "Πρόσβαση για ΑμεΑ", i: Accessibility },
                      { l: "Γωνιακό", i: CornerUpRight },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 group hover:border-black/20 transition-colors">
                        <item.i className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                        <span className="text-gray-700 group-hover:text-black transition-colors">{item.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Tour Section */}
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-[#1a1a1a]">Video Tour</h2>
                <div className="w-full md:w-3/4 mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-100">
                  <div style={{ position: 'relative', paddingTop: '177.77%' }}>
                    <iframe
                      src="https://iframe.mediadelivery.net/embed/518087/7082a34f-f425-4284-bdf5-058191240f75?autoplay=true&loop=true&muted=false&preload=true&responsive=true"
                      loading="lazy"
                      style={{ border: 0, position: 'absolute', top: 0, height: '100%', width: '100%' }}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen={true}
                    ></iframe>
                  </div>
                </div>
              </section>

              {/* Map Section */}
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-[#1a1a1a]">Τοποθεσία</h2>
                <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-gray-200 bg-gray-50 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12532.618698946761!2d23.87679805!3d38.22156845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a17ed91d6c8e3f%3A0x400bd2ce2b97fe0!2sKapandriti%20190%2014!5e0!3m2!1sen!2sgr!4v1717584000000!5m2!1sen!2sgr"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                  ></iframe>
                </div>
              </section>

            </div>

            {/* Right Sidebar - Sticky */}
            <div className="relative hidden lg:block">
              <div className="sticky top-8 space-y-6">
                <Card className="rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-black/5 bg-white">
                  <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-medium text-gray-900">Τιμή Πώλησης</h3>
                      <div className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                        Κατόπιν Επικοινωνίας
                      </div>
                    </div>

                    <a href="tel:+306948852892" className="flex items-center justify-center gap-2 text-lg font-bold text-white bg-black py-4 px-6 rounded-full hover:bg-black/80 transition-all w-full mt-4 cursor-pointer">
                      <Phone className="h-5 w-5" />
                      Καλέστε μας
                    </a>
                    <p className="text-gray-500 text-sm">
                      Επικοινωνήστε μαζί μας για περισσότερες πληροφορίες
                    </p>

                    {/* Agent Avatars */}
                    <div className="flex justify-center -space-x-4 py-2">
                      {[1, 2, 3].map((i) => (
                        <Avatar key={i} className="border-2 border-white w-12 h-12">
                          <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 15}`} />
                          <AvatarFallback>A{i}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-sm">Εξειδικευμένοι Συνεργάτες</p>
                      <div className="flex gap-1 justify-center text-yellow-400 text-xs">
                        {Array(5).fill(0).map((_, i) => (
                          <Sun key={i} className="h-4 w-4 fill-current" />
                        ))}
                        <span className="text-black font-bold ml-1 text-sm">5 / 5</span>
                      </div>
                    </div>

                    <Button className="w-full bg-white border-2 border-black text-black hover:bg-black hover:text-white rounded-full py-6 text-lg transition-colors">
                      Εκδήλωση Ενδιαφέροντος
                    </Button>

                  </CardContent>
                </Card>

                {/* Additional Sidebar Info */}
                <Card className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                  <h4 className="font-semibold mb-4 text-[#1a1a1a]">Επενδυτικό Προφίλ</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Ιδανικό για μεγάλες οικογένειες</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Δυνατότητα αυτονομίας επιπέδων</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Lifestyle με BBQ</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>

          </div>
        </div>

        {/* New Integrated Sections - Before/After Comparison */}
        <BeforeAfterSection compareItems={COMPARE_ITEMS} />

        {/* Bottom CTA Section */}
        <section className="relative w-full py-32 bg-[#050505] overflow-hidden">
          {/* Abstract Background Element */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-12">

              <div className="space-y-4">
                <Badge className="bg-white text-black hover:bg-white/90 text-sm px-6 py-1 rounded-full border-0 shadow-lg">
                  Επικοινωνία
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md leading-tight">
                  ΑΣ ΚΑΝΟΥΜΕ ΤΟ ΕΠΟΜΕΝΟ ΒΗΜΑ<br />ΜΑΖΙ
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                  Έχετε απορίες; Η ομάδα μας είναι εδώ για να σας καθοδηγήσει σε κάθε βήμα της διαδικασίας αγοράς.
                </p>
              </div>

              <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-8 sm:p-12 text-black">
                <CardContent className="p-0 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 text-left">
                      <Input placeholder="Όνομα" className="border-0 border-b border-gray-200 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-black bg-transparent placeholder:text-gray-400 text-lg" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Input placeholder="Επίθετο" className="border-0 border-b border-gray-200 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-black bg-transparent placeholder:text-gray-400 text-lg" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Input placeholder="Email" className="border-0 border-b border-gray-200 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-black bg-transparent placeholder:text-gray-400 text-lg" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Input placeholder="Τηλέφωνο" className="border-0 border-b border-gray-200 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-black bg-transparent placeholder:text-gray-400 text-lg" />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Textarea placeholder="Πώς μπορούμε να βοηθήσουμε;" className="min-h-[100px] border-0 border-b border-gray-200 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-black bg-transparent placeholder:text-gray-400 text-lg resize-none" />
                  </div>

                  <Button className="w-full bg-black hover:bg-black/90 text-white rounded-full py-6 text-lg font-medium">
                    Αποστολή Μηνύματος
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
