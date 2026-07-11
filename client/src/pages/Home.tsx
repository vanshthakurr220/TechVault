import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * TechVault Landing Page - Enhanced with Cool Animations
 * Design: Futuristic Tech Minimalism
 * - Dark navy backgrounds with electric blue and cyan accents
 * - Smooth animations and transitions everywhere
 * - Fully responsive design
 * - Premium, professional aesthetic
 */

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "High-performance components tested for speed and reliability",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663779154259/aaWptzr5aqA8N4iBhf5aMn/feature-lightning-nGNCB9d9Fa8NbtCEKwnNdP.png",
    },
    {
      icon: Shield,
      title: "Trusted Quality",
      description: "Genuine products from leading manufacturers worldwide",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663779154259/aaWptzr5aqA8N4iBhf5aMn/feature-shield-6we5fYspLHaBXSrCs5i8qr.png",
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Quick delivery to your doorstep with tracking",
      image:
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663779154259/aaWptzr5aqA8N4iBhf5aMn/feature-delivery-Mo84tJYMsgbkiExVY5HpE9.png",
    },
  ];

  const categories = [
    { name: "RAM", count: 4 },
    { name: "SSD", count: 3 },
    { name: "GPU", count: 3 },
    { name: "Cabinet", count: 2 },
  ];

  const stats = [
    { value: "15+", label: "Products" },
    { value: "5000+", label: "Happy Customers" },
    { value: "2024", label: "Since Launch" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 animate-float"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2 animate-float-slow"
          style={{ animationDelay: "1.5s" }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div
              className={`space-y-8 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <div className="space-y-4 animate-slide-up-fade">
                <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full hover:border-primary/60 hover:bg-primary/20 transition-all duration-300 cursor-pointer group">
                  <span className="text-sm font-medium text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                    <Sparkles size={16} className="group-hover:animate-spin" />
                    Premium Tech Components
                  </span>
                </div>

                <h1
                  className="text-5xl md:text-6xl font-bold leading-tight"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Unleash Your Build's{" "}
                  <span className="gradient-text">Potential</span>
                </h1>

                <p
                  className="text-lg text-muted-foreground max-w-lg animate-slide-up-fade"
                  style={{ animationDelay: "0.2s" }}
                >
                  Discover high-performance RAM, SSDs, GPUs, and PC cabinets for
                  your next build. Trusted by builders and creators worldwide.
                </p>
              </div>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up-fade"
                style={{ animationDelay: "0.4s" }}
              >
                <a href="/products" className="inline-block">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-105 active:scale-95 font-bold"
                    size="lg"
                  >
                    <span className="flex items-center gap-2">
                      Shop Now
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-2 transition-transform duration-300"
                      />
                    </span>
                  </Button>
                </a>
                <a href="#features" className="inline-block">
                  <Button
                    variant="outline"
                    className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-105 active:scale-95 font-bold"
                    size="lg"
                  >
                    Learn More
                  </Button>
                </a>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/30">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="space-y-1 animate-bounce-in group cursor-pointer"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <p
                      className="text-2xl md:text-3xl font-bold text-primary group-hover:text-accent transition-colors duration-300"
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual - Hero Image */}
            <div
              className={`relative h-96 md:h-full transition-all duration-1000 delay-300 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="relative h-full flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663779154259/aaWptzr5aqA8N4iBhf5aMn/hero-tech-visual-nVAfYBBHmLQnBF6g3xddWt.webp"
                  alt="Tech Visualization"
                  className="relative w-full h-full object-cover rounded-3xl shadow-2xl shadow-primary/30 group-hover:shadow-primary/60 transition-all duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-slide-up-fade">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary hover:to-accent transition-all duration-300"
              style={{ fontFamily: "Space Grotesk" }}
            >
              Why Choose TechVault?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide premium tech components with exceptional quality and
              service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative animate-bounce-in"
                  style={{
                    animationDelay: `${index * 200}ms`,
                  }}
                >
                  {/* Gradient border background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur group-hover:blur-lg"></div>

                  {/* Card content */}
                  <div className="relative bg-card/50 backdrop-blur-xl border border-border/30 p-8 rounded-2xl group-hover:border-primary/50 transition-all duration-300 h-full hover-lift group-hover:shadow-2xl group-hover:shadow-primary/30">
                    {/* Feature image */}
                    <div className="mb-6 h-32 rounded-xl overflow-hidden bg-secondary/50 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                      />
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/30 group-hover:shadow-lg group-hover:shadow-primary/50 group-hover:scale-110 transition-all duration-300">
                      <Icon
                        className="text-primary group-hover:animate-bounce"
                        size={28}
                      />
                    </div>

                    {/* Text content */}
                    <h3
                      className="font-bold text-xl mb-2 group-hover:text-primary transition-colors duration-300"
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up-fade">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary hover:to-accent transition-all duration-300"
              style={{ fontFamily: "Space Grotesk" }}
            >
              Browse Categories
            </h2>
            <p className="text-muted-foreground text-lg">
              Find exactly what you need for your build
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <a
                key={index}
                href={`/products?category=${category.name}`}
                className="group relative animate-bounce-in"
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                {/* Hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur group-hover:blur-lg"></div>

                {/* Card */}
                <div className="relative bg-card/50 backdrop-blur-xl border border-border/30 p-6 md:p-8 rounded-2xl text-center group-hover:border-primary/50 transition-all duration-300 h-full hover-lift group-hover:shadow-2xl group-hover:shadow-primary/30">
                  <p
                    className="font-bold text-2xl md:text-3xl mb-2 group-hover:text-primary transition-all duration-300 group-hover:scale-110"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {category.name}
                  </p>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {category.count} Products
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 md:py-32 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-gradient-shift"></div>
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-8 max-w-2xl mx-auto animate-slide-up-fade">
            <h2
              className="text-4xl md:text-5xl font-bold hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary hover:to-accent transition-all duration-300"
              style={{ fontFamily: "Space Grotesk" }}
            >
              Ready to Build Your Dream PC?
            </h2>

            <p
              className="text-lg text-muted-foreground/90 animate-slide-up-fade"
              style={{ animationDelay: "0.2s" }}
            >
              Explore our collection of premium tech components and find
              everything you need to create the perfect build.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-up-fade"
              style={{ animationDelay: "0.4s" }}
            >
              <a href="/products" className="inline-block">
                <Button
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-105 active:scale-95 font-bold"
                  size="lg"
                >
                  <span className="flex items-center gap-2">
                    Start Shopping
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-2 transition-transform duration-300"
                    />
                  </span>
                </Button>
              </a>
              <a href="#features" className="inline-block">
                <Button
                  variant="outline"
                  className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-105 active:scale-95 font-bold"
                  size="lg"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
