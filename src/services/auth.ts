import { createClient } from "@/lib/supabase/client";
import {
  AuthResponse,
  User,
  AuthChangeEvent,
  Session,
} from "@supabase/supabase-js";

// Simple cache for user profile to avoid repeated fetches
const profileCache: {
  userId: string | null;
  data: {
    user: User | null;
    role: string | null;
    profile: { id: string; fullname: string; email: string } | null;
    cluster: { id: string; cluster_name: string } | null;
  } | null;
  timestamp: number;
} = {
  userId: null,
  data: null,
  timestamp: 0,
};

// Cache expiry: 5 minutes
const CACHE_EXPIRY = 5 * 60 * 1000;

export const authService = {
  // Get supabase client
  getClient() {
    return createClient();
  },

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const supabase = this.getClient();
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const supabase = this.getClient();
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Sign out
  async signOut(): Promise<{ error: Error | null }> {
    const supabase = this.getClient();
    // Clear cache on sign out
    profileCache.userId = null;
    profileCache.data = null;
    profileCache.timestamp = 0;
    return await supabase.auth.signOut();
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const supabase = this.getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // Get user permissions from database
  async getUserPermissions(userId: string) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  },

  // Get user with profile and role from database
  async getAuthenticatedUserProfile(): Promise<{
    user: User | null;
    role: string | null;
    profile: { id: string; fullname: string; email: string } | null;
    cluster: { id: string; cluster_name: string } | null;
  }> {
    const supabase = this.getClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, role: null, profile: null, cluster: null };
    }

    // Check if we have valid cached data (extended cache time for better performance)
    if (
      profileCache.userId === user.id &&
      profileCache.data &&
      Date.now() - profileCache.timestamp < CACHE_EXPIRY
    ) {
      console.log(
        "✅ Using cached data for user:",
        user.id,
        "Age:",
        Math.floor((Date.now() - profileCache.timestamp) / 1000),
        "seconds"
      );
      return profileCache.data;
    }

    try {
      console.log("🔄 Fetching fresh data for user:", user.id);

      // Get user permissions dengan profiles dan clusters sekaligus dalam satu query
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("user_permissions")
        .select(
          `
          role,
          profiles (
            id,
            fullname,
            email
          ),
          clusters (
            id,
            cluster_name
          )
        `
        )
        .eq("user_id", user.id)
        .single();

      if (permissionsError) {
        console.log("❌ Error fetching permissions:", permissionsError);
        return { user, role: null, profile: null, cluster: null };
      }

      // Extract profile dari nested select (handle array result)
      const userProfile = Array.isArray(permissionsData?.profiles)
        ? permissionsData.profiles[0] || null
        : permissionsData?.profiles || null;

      const clusterData = Array.isArray(permissionsData?.clusters)
        ? permissionsData.clusters[0] || null
        : permissionsData?.clusters || null;

      const result = {
        user,
        role: permissionsData.role,
        profile: userProfile,
        cluster: clusterData,
      };

      // Cache the result
      profileCache.userId = user.id;
      profileCache.data = result;
      profileCache.timestamp = Date.now();

      console.log("💾 Cached fresh data for user:", user.id);

      return result;
    } catch (err) {
      console.log("Exception caught:", err);
      return { user, role: null, profile: null, cluster: null };
    }
  },

  // Get session
  async getSession() {
    const supabase = this.getClient();
    return await supabase.auth.getSession();
  },

  // Listen to auth changes
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    const supabase = this.getClient();
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  async resetPassword(email: string, isAdmin = false) {
    const supabase = this.getClient();
    const nextParam = isAdmin ? "?next=admin" : "?next=user";
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback${nextParam}`,
    });
  },

  // Update user
  async updateUser(attributes: {
    email?: string;
    password?: string;
    data?: Record<string, unknown>;
  }) {
    const supabase = this.getClient();
    const result = await supabase.auth.updateUser(attributes);
    // Clear cache when user data is updated
    profileCache.userId = null;
    profileCache.data = null;
    profileCache.timestamp = 0;
    return result;
  },

  // Clear profile cache manually
  clearCache() {
    profileCache.userId = null;
    profileCache.data = null;
    profileCache.timestamp = 0;
  },

  // Register new user with profile and inactive status
  async registerUser(registrationData: {
    email: string;
    fullname: string;
    no_telp: string;
    address: string;
    house_type: string;
    house_number: string;
    ownership_status: string;
    file_ktp: File;
    file_kk: File;
    emergency_telp: string;
    head_of_family: string;
    work: string;
    moving_date: string;
    citizen_status?: string;
  }) {
    try {
      // Create FormData for API call
      const formData = new FormData();

      // Add all fields to FormData
      Object.entries(registrationData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch("/api/user/register", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Registration failed" };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mendaftar",
      };
    }
  },

  // Login with redirect helper
  async loginWithRedirect(
    email: string,
    password: string,
    onSuccess?: (redirectPath: string) => void,
    onError?: (error: string) => void
  ) {
    try {
      const { data, error } = await this.signIn(email, password);

      if (error) {
        onError?.("Email atau password salah");
        return { success: false, error: "Email atau password salah" };
      }

      if (data.user) {
        // Get role from database instead of user_metadata
        const permissions = await this.getUserPermissions(data.user.id);
        const userRole = permissions?.role;

        if (!userRole) {
          onError?.("User tidak memiliki role yang valid");
          return {
            success: false,
            error: "User tidak memiliki role yang valid",
          };
        }

        const redirectPath =
          userRole === "admin" ? "/admin/dashboard" : "/user/dashboard";
        onSuccess?.(redirectPath);
        return { success: true, redirectPath, role: userRole };
      }

      return { success: false, error: "Login gagal" };
    } catch {
      const errorMessage = "Terjadi kesalahan saat login";
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
};
