import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Heart,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
  ShieldCheck,
  Home,
  Store,
  Info,
  Mail,
  ArrowRight,
  Users,
  Star,
  Ticket,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { SITE_CONFIG } from "@/config/siteConfig";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { userLoggedIn, user, cartCount, wishlistCount, logout } = useApp();
  const [location, navigate] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdminRoute = location.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/products", icon: Store },
    { label: "About", href: "/about", icon: Info },
    { label: "Contact", href: "/contact", icon: Mail },
  ];

  const adminLinks = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "Products", icon: Store, href: "/admin/products" },
    { label: "Orders", icon: Package, href: "/admin/orders" },
    { label: "Reviews", icon: Star, href: "/admin/reviews" },
    { label: "Wishlists", icon: Heart, href: "/admin/wishlists" },
    { label: "Coupons", icon: Ticket, href: "/admin/coupons" },
    { label: "Contacts", icon: MessageSquare, href: "/admin/contacts" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-100 transition-all duration-500",
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-2 shadow-sm"
          : "bg-transparent py-4",
        isAdminRoute &&
          "bg-slate-950/90 backdrop-blur-md border-slate-800 shadow-2xl",
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          {/* Logo Section */}
          <Link href="/">
            <a className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={
                      isAdminRoute
                        ? "/logoo small admin.png"
                        : "/logoo small.png"
                    }
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
              </div>

              <span
                className={cn(
                  "font-black text-xl tracking-tight hidden sm:block",
                  isAdminRoute
                    ? "text-white"
                    : "text-slate-900 dark:text-white",
                )}
              >
                {SITE_CONFIG.companyName}
              </span>
            </a>
          </Link>

          {/* Desktop Nav Links */}
          <div
            className={cn(
              "hidden lg:flex items-center p-1 rounded-full border transition-colors duration-300",
              isAdminRoute
                ? "bg-slate-800/50 border-slate-700/50"
                : "bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50",
            )}
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    location === link.href
                      ? isAdminRoute
                        ? "bg-primary text-white"
                        : "bg-white dark:bg-slate-700 text-primary shadow-sm"
                      : isAdminRoute
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isAdminRoute && userLoggedIn && (
              <div className="flex items-center gap-1">
                {/* Wishlist Dropdown */}

                <Link href="/wishlist">
                  <a className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <Heart
                      size={20}
                      className="text-slate-600 dark:text-slate-400 group-hover:text-rose-500 transition-colors"
                    />

                    {wishlistCount > 0 && (
                      <span className="absolute top-3.5 right-.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                        {wishlistCount}
                      </span>
                    )}
                  </a>
                </Link>

                {/* Cart Button */}
                <Link href="/cart">
                  <a className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <ShoppingCart
                      size={20}
                      className="text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors"
                    />
                    {cartCount > 0 && (
                      <span className="absolute top-3.5 right-.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                        {cartCount}
                      </span>
                    )}
                  </a>
                </Link>
              </div>
            )}

            {/* User Profile Dropdown */}
            {userLoggedIn ? (
              <div ref={dropdownRef} className="relative ml-1">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 p-1 pl-3 rounded-full transition-all group",
                    isAdminRoute
                      ? "bg-slate-800 hover:bg-slate-700"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-black hidden sm:block",
                      isAdminRoute
                        ? "text-slate-200"
                        : "text-slate-700 dark:text-slate-300",
                    )}
                  >
                    {user?.username || "Account"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                    <User size={16} />
                  </div>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Signed in as
                      </p>
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      {isAdminRoute ? (
                        <>
                          {adminLinks.map((item) => (
                            <button
                              key={item.href}
                              onClick={() => {
                                setIsUserDropdownOpen(false);
                                navigate(item.href);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-colors text-sm font-bold",
                                location === item.href
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-gray-200 text-slate-600 dark:text-slate-400",
                              )}
                            >
                              <item.icon size={18} /> {item.label}
                            </button>
                          ))}
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-2"></div>
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              navigate("/");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-200 dark:bg-amber-900/20 dark:hover:bg-amber-800/30 text-amber-600 dark:text-amber-400 text-sm font-bold transition-colors"
                          >
                            <ShieldCheck size={18} />
                            Exit Admin Panel
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/profile">
                            <a
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors"
                            >
                              <Settings size={18} /> Profile Settings
                            </a>
                          </Link>
                          <Link href="/orders">
                            <a
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors"
                            >
                              <Package size={18} /> My Orders
                            </a>
                          </Link>
                          {user?.role === "admin" && (
                            <Link href="/admin">
                              <a
                                onClick={() => setIsUserDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-primary/10 text-primary text-sm font-bold transition-colors"
                              >
                                <LayoutDashboard size={18} /> Admin Panel
                              </a>
                            </Link>
                          )}
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-300 dark:bg-rose-900/20 dark:hover:bg-rose-800/30 text-rose-600 dark:text-rose-400 text-sm font-bold transition-colors mt-2"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={cn(
                      "rounded-full font-bold text-sm",
                      isAdminRoute &&
                        "text-white hover:bg-slate-800 hover:text-white",
                    )}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-full font-bold text-sm px-6 shadow-lg shadow-primary/20">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "lg:hidden p-2.5 rounded-full transition-colors",
                isAdminRoute
                  ? "text-white hover:bg-slate-800"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800",
              )}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-6 animate-in slide-in-from-top-4 duration-300">
            <div
              className={cn(
                "flex flex-col gap-2 p-4 rounded-3xl border shadow-xl",
                isAdminRoute
                  ? "bg-slate-900 border-slate-800"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
              )}
            >
              {/* If Admin, show Admin Links first */}
              {isAdminRoute && (
                <div className="mb-4 space-y-1">
                  <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Admin Navigation
                  </p>
                  {adminLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <a
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                          location === link.href
                            ? "bg-primary text-white"
                            : "text-slate-400 hover:bg-slate-800",
                        )}
                      >
                        <link.icon size={18} /> {link.label}
                      </a>
                    </Link>
                  ))}
                  <div className="h-px bg-slate-800 my-4 mx-4"></div>
                </div>
              )}

              <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Main Menu
              </p>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-black transition-all",
                      location === link.href
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : isAdminRoute
                          ? "text-slate-400 hover:bg-slate-800"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    <link.icon size={22} /> {link.label}
                  </a>
                </Link>
              ))}

              {!userLoggedIn && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl py-6 font-bold hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full rounded-2xl py-6 font-bold">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
