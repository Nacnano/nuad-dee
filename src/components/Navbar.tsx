"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Heart, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <img src="/favicon.ico" alt="Eye Touch Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-gradient-primary">
              Eye Touch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/")
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground hover:bg-card-hover hover:text-primary"
                }`}
              >
                Home
              </Link>
              <Link
                href="/services"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/services")
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground hover:bg-card-hover hover:text-primary"
                }`}
              >
                Services
              </Link>
              <Link
                href="/training"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/training")
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground hover:bg-card-hover hover:text-primary"
                }`}
              >
                Training
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground hover:bg-card-hover hover:text-primary"
                  }`}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/impact"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/impact")
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground hover:bg-card-hover hover:text-primary"
                }`}
              >
                Impact
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  {user.avatar} {user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    <User className="h-4 w-4 mr-1" />
                    Login
                  </Link>
                </Button>
                <Button size="sm" className="btn-healing">
                  <Link href="/services">Book Now</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-card-hover transition-colors duration-200"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-card-hover"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/services"
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive("/services")
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-card-hover"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/training"
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive("/training")
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-card-hover"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Training
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive("/dashboard")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-card-hover"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/impact"
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive("/impact")
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-card-hover"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Impact
            </Link>

            {/* Mobile user menu */}
            <div className="border-t border-border pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {user.avatar} {user.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2 inline" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-lg text-base font-medium text-foreground hover:bg-card-hover transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2 inline" />
                    Login
                  </Link>
                  <Link
                    href="/services"
                    className="block px-3 py-2 rounded-lg text-base font-medium bg-healing text-healing-foreground text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Book Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
