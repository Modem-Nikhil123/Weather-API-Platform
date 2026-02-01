"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FiHome, FiLogOut, FiUser } from "react-icons/fi";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <FiHome className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full fixed left-0 top-0 flex flex-col">
      <div className="p-4">
        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white">
          Weather<span className="text-blue-500">API</span>
        </Link>
      </div>

      <nav className="mt-8 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              pathname === item.href ? 'bg-gray-100 dark:bg-gray-700 text-blue-500 border-r-2 border-blue-500' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Free Plan
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <FiLogOut className="w-4 h-4 mr-2" />
          Sign out
        </button>
      </div>
    </div>
  );
}
