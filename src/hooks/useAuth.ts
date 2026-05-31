// src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { User as PrismaUser } from "../../generated/prisma/index";

interface AuthUser {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData: AuthUser = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
