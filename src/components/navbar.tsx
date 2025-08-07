"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  canOrganizeEvents,
  canAccessAdmin,
  ROLE_LABELS,
  UserRole,
} from "@/lib/roles";
import MobileNav from "@/components/mobile-nav";

const SorykPassLogo = () => (
  <Link
    href="/"
    className="flex items-center transition-transform hover:scale-105"
  >
    <Image
      src="/sorykpass_horizontal_black.png"
      alt="SorykPass - La Puerta de Entrada al Presente"
      width={160}
      height={40}
      className="h-8 w-auto sm:h-10 dark:hidden"
      priority
    />
    <Image
      src="/sorykpass_horizontal_white.png"
      alt="SorykPass - La Puerta de Entrada al Presente"
      width={160}
      height={40}
      className="h-8 w-auto sm:h-10 hidden dark:block"
      priority
    />
  </Link>
);

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

export default function Navbar() {
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (!isLoaded) return;

      if (!clerkUser) {
        setDbUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setDbUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [clerkUser, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="w-10 h-10 bg-muted animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <SorykPassLogo />
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/events"
              className="text-foreground hover:text-[#0053CC] transition-colors font-medium relative group"
            >
              Eventos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] transition-all group-hover:w-full"></span>
            </Link>

            {clerkUser && (
              <>
                <Link
                  href="/dashboard"
                  className="text-foreground hover:text-[#0053CC] transition-colors font-medium relative group"
                >
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] transition-all group-hover:w-full"></span>
                </Link>

                {dbUser && canOrganizeEvents(dbUser.role) && (
                  <Link
                    href="/events/create"
                    className="text-foreground hover:text-[#CC66CC] transition-colors font-medium relative group"
                  >
                    Crear Evento
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] transition-all group-hover:w-full"></span>
                  </Link>
                )}

                {dbUser && canAccessAdmin(dbUser.role) && (
                  <Link
                    href="/admin"
                    className="text-foreground hover:text-[#FE4F00] transition-colors font-medium relative group"
                  >
                    Admin
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FE4F00] to-[#FDBD00] transition-all group-hover:w-full"></span>
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            {dbUser && (
              <div className="relative">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    dbUser.role === "ADMIN"
                      ? "bg-gradient-to-r from-[#CC66CC] to-[#0053CC] text-white"
                      : dbUser.role === "ORGANIZER"
                      ? "bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] text-white"
                      : "bg-gradient-to-r from-[#01CBFE] to-[#0053CC] text-white"
                  }`}
                >
                  {ROLE_LABELS[dbUser.role]}
                </div>
              </div>
            )}

            <ThemeToggle />

            {clerkUser ? (
              <div className="relative">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-10 h-10 ring-2 ring-[#01CBFE]/20 hover:ring-[#01CBFE]/40 transition-all",
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <SignInButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-[#0053CC] hover:bg-[#01CBFE]/10"
                  >
                    Iniciar Sesión
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white shadow-lg"
                  >
                    Registrarse
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>

          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />

            {clerkUser ? (
              <div className="flex items-center space-x-2">
                {dbUser && (
                  <div
                    className={`px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                      dbUser.role === "ADMIN"
                        ? "bg-gradient-to-r from-[#CC66CC] to-[#0053CC] text-white"
                        : dbUser.role === "ORGANIZER"
                        ? "bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] text-white"
                        : "bg-gradient-to-r from-[#01CBFE] to-[#0053CC] text-white"
                    }`}
                  >
                    {dbUser.role === "ADMIN"
                      ? "ADM"
                      : dbUser.role === "ORGANIZER"
                      ? "ORG"
                      : "CLI"}
                  </div>
                )}

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-8 h-8 ring-1 ring-[#01CBFE]/30 flex-shrink-0",
                    },
                  }}
                />
              </div>
            ) : null}

            <div className="flex-shrink-0">
              <MobileNav user={dbUser} userId={clerkUser?.id || null} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}