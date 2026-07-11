import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";
import { useApp } from "@/contexts/AppContext";

export default function ContactUs() {
  const { submitContact } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await submitContact(formData.name, formData.email, formData.message);

      setFormData({
        name: "",
        email: "",
        message: "",
      });

      setErrors({});

      setTimeout(() => {
        setErrors({});
      }, 3000);
    } catch (error) {
      console.error("Contact error:", error);

      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to send message",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card mb-6">
              ✉️ Get In Touch
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Contact
              <span className="block text-primary">
                {SITE_CONFIG.companyName}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions about products, orders, or partnerships? Our team
              is here to help and will respond as quickly as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Contact Info Cards */}
            <div
              className="bg-card/80 backdrop-blur-sm border border-border/50
rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1
transition-all duration-300 hover-lift animate-slide-up"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Mail className="text-primary" size={24} />
              </div>
              <h3 className="font-bold monospace text-lg mb-2">Email</h3>
              <p className="text-muted-foreground">
                support@{SITE_CONFIG.companyName}.com
              </p>
            </div>

            <div
              className="bg-card/80 backdrop-blur-sm border border-border/50
rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1
transition-all duration-300 hover-lift animate-slide-up"
              style={{ animationDelay: "50ms" }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Phone className="text-primary" size={24} />
              </div>
              <h3 className="font-bold monospace text-lg mb-2">Phone</h3>
              <p className="text-muted-foreground">+1 (800) 123-4567</p>
            </div>

            <div
              className="bg-card/80 backdrop-blur-sm border border-border/50
rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1
transition-all duration-300 hover-lift animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="text-primary" size={24} />
              </div>
              <h3 className="font-bold monospace text-lg mb-2">Address</h3>
              <p className="text-muted-foreground">San Francisco, CA 94105</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-10 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="
w-full
px-4
py-3.5
rounded-xl
border
border-border
bg-background
transition-all
duration-200
focus:outline-none
focus:ring-2
focus:ring-primary/30
focus:border-primary
"
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="
w-full
px-4
py-3.5
rounded-xl
border
border-border
bg-background
transition-all
duration-200
focus:outline-none
focus:ring-2
focus:ring-primary/30
focus:border-primary
"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  rows={6}
                  className="
w-full
px-4
py-3.5
rounded-xl
border
border-border
bg-background
transition-all
duration-200
focus:outline-none
focus:ring-2
focus:ring-primary/30
focus:border-primary
"
                />
                {errors.message && (
                  <p className="text-red-600 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="
    w-full
    h-12
    text-base
    font-semibold
    rounded-xl
    flex
    items-center
    justify-center
    gap-2
    shadow-md
    hover:shadow-lg
    transition-all
  "
              >
                <Send size={18} />
                Send Message
              </Button>
            </form>
          </div>

          {/* FAQ Section */}
          <div
            className="mt-16 animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <h2 className="text-3xl font-bold mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: "What is the shipping time?",
                  a: "We typically ship within 2-3 business days.",
                },
                {
                  q: "Do you offer returns?",
                  a: "Yes, we offer 30-day returns on all products.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards and digital wallets.",
                },
                {
                  q: "Is there a warranty?",
                  a: "All products come with manufacturer warranty.",
                },
              ].map((item, index) => (
                <details
                  key={index}
                  className="
          bg-card
          border
          border-border
          rounded-2xl
          px-6
          py-5
          hover:border-primary/30
          transition-all
          duration-200
        "
                >
                  <summary className="font-bold text-lg group-open:text-primary transition-colors duration-200">
                    {item.q}
                  </summary>

                  <p className="text-muted-foreground mt-3">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
