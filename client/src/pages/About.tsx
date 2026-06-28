import { SITE_CONFIG } from "@/config/siteConfig";
import {
  ShieldCheck,
  Truck,
  Headphones,
  BadgeDollarSign,
  Sparkles,
  Target,
  Calendar,
} from "lucide-react";

export default function About() {
  const features = [
    {
      icon: ShieldCheck,
      title: "100% Genuine Products",
      description:
        "Every product is sourced from trusted suppliers and verified vendors.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "Quick order processing and reliable shipping across the country.",
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description: "Friendly customer support whenever you need assistance.",
    },
    {
      icon: BadgeDollarSign,
      title: "Competitive Pricing",
      description:
        "Premium technology products at fair and transparent prices.",
    },
  ];

  const values = [
    {
      title: "Authenticity",
      description:
        "We believe customers deserve genuine products and honest information.",
    },
    {
      title: "Transparency",
      description:
        "Clear pricing, transparent policies, and no hidden surprises.",
    },
    {
      title: "Customer First",
      description:
        "Every decision we make is focused on improving customer experience.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-primary/5" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card mb-6">
              <Sparkles size={16} />
              Trusted Technology Marketplace
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Welcome to
              <span className="block text-primary">
                {SITE_CONFIG.companyName}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your trusted destination for premium technology products, computer
              components, accessories, and innovative gadgets. We help
              enthusiasts, creators, professionals, and gamers discover the
              right technology for their needs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <Target className="text-primary" />
                <span className="font-semibold text-primary">Our Mission</span>
              </div>

              <h2 className="text-4xl font-bold mb-6">
                Technology Made Accessible
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At {SITE_CONFIG.companyName}, our mission is simple: make
                  quality technology accessible to everyone.
                </p>

                <p>
                  Whether you're building a gaming setup, upgrading your
                  workstation, or exploring the latest gadgets, we aim to
                  provide a seamless shopping experience backed by reliability
                  and trust.
                </p>

                <p>
                  We continuously improve our catalog, customer support, and
                  delivery experience to ensure every purchase meets
                  expectations.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-7xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold mb-2">Powering Innovation</h3>
                <p className="text-muted-foreground">
                  Quality • Reliability • Trust
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose {SITE_CONFIG.companyName}?
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              We focus on delivering an exceptional shopping experience through
              quality products, reliable service, and customer trust.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="bg-card border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="text-primary" size={26} />
                  </div>

                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>

                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Our Journey</h2>
          </div>

          <div className="space-y-8">
            <div className="border-l-4 border-primary pl-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} />
                <h3 className="font-bold">2024 - Founded</h3>
              </div>

              <p className="text-muted-foreground">
                {SITE_CONFIG.companyName} was launched with a vision to simplify
                technology shopping.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="font-bold mb-2">Growing Community</h3>

              <p className="text-muted-foreground">
                Expanded our catalog and built relationships with trusted
                suppliers and customers.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="font-bold mb-2">Today</h3>

              <p className="text-muted-foreground">
                Continuing to provide premium technology products while
                improving customer experience every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Our Core Values</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-card border rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>

                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border bg-card p-10">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="font-bold text-xl mb-2">Secure Payments</h3>
                <p className="text-muted-foreground">
                  Safe and encrypted payment processing.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xl mb-2">Quality Assurance</h3>
                <p className="text-muted-foreground">
                  Carefully selected products from trusted vendors.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-xl mb-2">Customer First</h3>
                <p className="text-muted-foreground">
                  Dedicated support throughout your journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Explore?</h2>

          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Discover premium technology products and find everything you need
            for your next build, upgrade, or project.
          </p>

          <a
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all"
          >
            Browse Products →
          </a>
        </div>
      </section>
    </div>
  );
}
