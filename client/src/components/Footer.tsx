import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-primary text-primary-foreground mt-16 shadow-sm"
      style={{ borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-foreground rounded-md flex items-center justify-center">
                <span className="text-primary font-bold text-sm monospace">
                  {SITE_CONFIG.companyShortName}
                </span>
              </div>
              <span className="font-bold text-lg monospace">{SITE_CONFIG.companyName}</span>
            </div>
            <p className="text-sm opacity-80">
              Premium tech products for builders and creators.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold monospace text-sm">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/products">
                <a className="opacity-80 hover:opacity-100 transition-opacity duration-200">
                  Products
                </a>
              </Link>
              <Link href="/about">
                <a className="opacity-80 hover:opacity-100 transition-opacity duration-200">
                  About Us
                </a>
              </Link>
              <Link href="/contact">
                <a className="opacity-80 hover:opacity-100 transition-opacity duration-200">
                  Contact
                </a>
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold monospace text-sm">Support</h3>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity duration-200"
              >
                FAQ
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity duration-200"
              >
                Shipping Info
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity duration-200"
              >
                Returns
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold monospace text-sm">Contact</h3>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2 opacity-80">
                <Mail size={16} />
                <span>support@{SITE_CONFIG.companyName}.com</span>
              </div>

              <div className="flex items-center gap-2 opacity-80">
                <Phone size={16} />
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-center gap-2 opacity-80">
                <MapPin size={16} />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-8"
          style={{ height: "1px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        ></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
          <p>&copy; {currentYear} {SITE_CONFIG.companyName}. All rights reserved.</p>
          <div className="flex gap-6">
            <a
              href="#"
              className="hover:opacity-100 transition-opacity duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:opacity-100 transition-opacity duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:opacity-100 transition-opacity duration-200"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
