"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { getOrgTheme, DEFAULT_THEME } from "@/lib/orgTheme";
import { isPublicPath } from "@/lib/publicPaths";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const refreshUser = useCallback(async (force = false) => {
    // The super-admin portal has its own session (super_access_token /
    // super_refresh_token) and its own middleware-based route protection —
    // it never reads `user` from this context. Calling /auth/me here would
    // always 401 (no org-admin access_token cookie exists in that session)
    // and spuriously trigger the super-admin refresh-token rotation on every
    // page load, which is both wasted work and a source of multi-tab races.
    if (window.location.pathname.startsWith("/super-admin")) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);

      if (!force) {
        const cached = sessionStorage.getItem("auth_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setLoading(false);
          return parsed;
        }
      }

      const res      = await api.get("/auth/me");
      const userData = res.data.user || res.data;
      setUser(userData);
      sessionStorage.setItem("auth_user", JSON.stringify(userData));

      // Status-based redirects
      const path         = window.location.pathname;
      const isBilling    = path.startsWith("/billing");
      const isSuccess    = path === "/billing/success";
      const orgStatus    = userData.org?.status ?? userData.orgStatus;

      if (!isBilling && !isSuccess && orgStatus && orgStatus !== "ACTIVE") {
        if (orgStatus === "PENDING_EMAIL_VERIFICATION" || orgStatus === "PENDING_ACTIVATION") {
          router.push("/org-admin/pending-approval");
        } else if (orgStatus === "PAYMENT_REQUIRED" || orgStatus === "EXPIRED") {
          router.push("/billing");
        }
      }

      return userData;
    } catch (err) {
      if (err.response?.status === 402 && err.response.data?.user) {
        const userData = err.response.data.user;
        setUser(userData);
        sessionStorage.setItem("auth_user", JSON.stringify(userData));
        // Don't bounce /billing/success back to /billing — it's polling /auth/me
        // (which stays 402 until the Stripe webhook flips the org to ACTIVE).
        if (!window.location.pathname.startsWith("/billing")) {
          router.push("/billing");
        }
        return userData;
      }
      setUser(null);
      sessionStorage.removeItem("auth_user");
      if (!isPublicPath(window.location.pathname)) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // A new sign-in in the same tab must never inherit the previous admin's
  // cached profile or query data (org name, theme, member lists, …).
  const startSession = useCallback(async () => {
    sessionStorage.removeItem("auth_user");
    queryClient.clear();
    return refreshUser(true);
  }, [queryClient, refreshUser]);

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    finally {
      setUser(null);
      sessionStorage.removeItem("auth_user");
      queryClient.clear();
      router.push("/login");
    }
  };

  useEffect(() => { refreshUser(true); }, []);

  // Derive org info
  const orgType = user?.orgType ?? user?.org?.orgType ?? null;
  const theme   = getOrgTheme(orgType);
  const orgName = user?.org?.name ?? user?.orgName ?? "Your Organisation";
  const orgStatus = user?.org?.status ?? user?.orgStatus ?? null;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      orgType,
      orgName,
      orgStatus,
      theme,
      memberLabel:   theme.memberLabel,
      membersLabel:  theme.membersLabel,
      supportLabel:  theme.supportLabel,
      supportsLabel: theme.supportsLabel,
      refreshUser,
      startSession,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
