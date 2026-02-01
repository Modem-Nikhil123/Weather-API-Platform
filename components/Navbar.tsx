"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { FiUser, FiLogOut } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  const navLinkClass = (href: string) => {
    const isActive =
      pathname === href || pathname.startsWith(href + "/");

    return `text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors ${
      isActive ? "text-blue-600 dark:text-blue-400 font-medium" : ""
    }`;
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Weather<span className="text-blue-600">API</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/docs" className={navLinkClass("/docs")}>
              Docs
            </Link>
            <Link href="/pricing" className={navLinkClass("/pricing")}>
              Pricing
            </Link>
            <Link href="/weather" className={navLinkClass("/weather")}>
              Demo
            </Link>

            {status === "loading" ? (
              <div className="ml-4 text-sm text-gray-500">Loading...</div>
            ) : status === "authenticated" ? (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                )}

                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {session?.user?.name ?? "User"}
                </span>

                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
                >
                  <FiLogOut className="w-4 h-4 mr-2" />
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Get API Key
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
