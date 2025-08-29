"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@/utils/mockData";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
} from "@/utils/localStorage";

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = getFromLocalStorage("currentUser");
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    removeFromLocalStorage("currentUser");
    setCurrentUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">NuadDee</span>
            </Link>
            <div className="hidden md:flex md:items-center md:ml-10 space-x-4">
              <Link
                href="/booking"
                className="text-gray-600 hover:text-gray-900"
              >
                Book a Massage
              </Link>
              <Link
                href="/training"
                className="text-gray-600 hover:text-gray-900"
              >
                Training
              </Link>
              <Link
                href="/partners"
                className="text-gray-600 hover:text-gray-900"
              >
                Partners
              </Link>
              <Link
                href="/impact"
                className="text-gray-600 hover:text-gray-900"
              >
                Impact
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Welcome, {currentUser.name}
                </span>
                {currentUser.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
