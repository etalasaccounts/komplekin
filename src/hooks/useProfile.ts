import { useState, useEffect } from "react";

export interface ProfileData {
  id: string;
  fullname: string;
  email: string;
  no_telp: string;
  address: string;
  house_number: string;
  ownership_status: string;
  photo?: string;
  citizen_status: string;
  created_at: string;
}

interface UseProfileReturn {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: FormData) => Promise<boolean>;
  refetch: () => void;
  updating: boolean;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/profile");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch profile");
      }

      if (result.success) {
        setProfile(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData: FormData): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      if (result.success) {
        // Update local profile data
        setProfile(result.data);
        return true;
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Update failed");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const refetch = () => {
    fetchProfile();
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch,
    updating,
  };
};
