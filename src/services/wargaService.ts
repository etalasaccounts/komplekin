import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface WargaWithProfile {
  id: string;
  user_id: string;
  profile_id: string;
  cluster_id: string;
  role: 'admin' | 'user' | 'super admin';
  user_status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    fullname: string;
    email: string;
    no_telp: string;
    address: string;
    house_type: string;
    house_number: string;
    ownership_status: string;
    head_of_family: string;
    emergency_job: string;
    moving_date: string;
    citizen_status: 'Warga baru' | 'Pindah';
    created_at: string;
    updated_at: string;
    file_ktp: string;
    file_kk: string;
    emergency_telp: string;
    work: string;
  };
  cluster: {
    id: string;
    cluster_name: string;
    address: string;
    cluster_unit: string;
  };
}

export const wargaService = {
  // Ambil semua warga dengan profile dan cluster info dalam satu query
  async getAllWarga(clusterId?: string): Promise<WargaWithProfile[]> {
    let query = supabase
      .from("user_permissions")
      .select(`
        *,
        profile:profiles!profile_id(*),
        cluster:clusters!cluster_id(*)
      `);
    
    // Filter by cluster if provided
    if (clusterId) {
      query = query.eq('cluster_id', clusterId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Ambil warga berdasarkan status untuk different tabs
  async getWargaByStatus(status: 'Active' | 'Inactive', clusterId?: string): Promise<WargaWithProfile[]> {
    let query = supabase
      .from("user_permissions")
      .select(`
        *,
        profile:profiles!profile_id(*),
        cluster:clusters!cluster_id(*)
      `)
      .eq('user_status', status);
    
    if (clusterId) {
      query = query.eq('cluster_id', clusterId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Ambil warga by citizen status (Warga baru, Pindah)
  async getWargaByCitizenStatus(citizenStatus: 'Warga baru' | 'Pindah', clusterId?: string): Promise<WargaWithProfile[]> {
    let query = supabase
      .from("user_permissions")
      .select(`
        *,
        profile:profiles!profile_id(*)
      `)
      .eq('profile.citizen_status', citizenStatus);
    
    if (clusterId) {
      query = query.eq('cluster_id', clusterId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Ambil satu warga berdasarkan ID
  async getWargaById(userPermissionId: string): Promise<WargaWithProfile | null> {
    const { data, error } = await supabase
      .from("user_permissions")
      .select(`
        *,
        profile:profiles!profile_id(*),
        cluster:clusters!cluster_id(*)
      `)
      .eq('id', userPermissionId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update status warga
  async updateWargaStatus(userPermissionId: string, status: 'Active' | 'Inactive'): Promise<void> {
    const { error } = await supabase
      .from("user_permissions")
      .update({ user_status: status })
      .eq('id', userPermissionId);
    
    if (error) throw error;
  },

  // Update role warga
  async updateWargaRole(userPermissionId: string, role: 'admin' | 'user' | 'super admin'): Promise<void> {
    const { error } = await supabase
      .from("user_permissions")
      .update({ role })
      .eq('id', userPermissionId);
    
    if (error) throw error;
  },

  // Update citizen status  
  async updateCitizenStatus(profileId: string, citizenStatus: 'Warga baru' | 'Pindah' | 'Admin'): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ citizen_status: citizenStatus })
      .eq('id', profileId);
    
    if (error) throw error;
  },

  // Update profile data
  async updateProfile(profileId: string, profileData: {
    fullname?: string;
    email?: string;
    no_telp?: string;
    address?: string;
    house_type?: string;
    ownership_status?: string;
    head_of_family?: string;
    emergency_telp?: string;
    work?: string;
    moving_date?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq('id', profileId);
    
    if (error) throw error;
  },

  // Delete warga (soft delete dengan inactive status)
  async deleteWarga(userPermissionId: string): Promise<void> {
    const { error } = await supabase
      .from("user_permissions")
      .update({ user_status: 'Inactive' })
      .eq('id', userPermissionId);
    
    if (error) throw error;
  },

  // Hard delete warga record (untuk yang benar-benar perlu dihapus)
  async hardDeleteWarga(userPermissionId: string): Promise<void> {
    // Pertama, ambil data user_permissions untuk mendapatkan user_id dan profile_id
    const { data: userPermission, error: fetchError } = await supabase
      .from("user_permissions")
      .select('user_id, profile_id')
      .eq('id', userPermissionId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch user permission: ${fetchError.message}`);
    }

    if (!userPermission) {
      throw new Error('User permission not found');
    }

    try {
      // 1. Hapus dari user_permissions terlebih dahulu
      const { error: permissionError } = await supabase
        .from("user_permissions")
        .delete()
        .eq('id', userPermissionId);
      
      if (permissionError) {
        throw new Error(`Failed to delete user permission: ${permissionError.message}`);
      }

      // 2. Hapus dari profiles jika ada profile_id
      if (userPermission.profile_id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .delete()
          .eq('id', userPermission.profile_id);
        
        if (profileError) {
          console.error('Failed to delete profile:', profileError.message);
          // Jangan throw error untuk profile karena mungkin sudah dihapus atau tidak ada
        }
      }

      // 3. Hapus dari auth.users jika ada user_id (menggunakan API route)
      if (userPermission.user_id) {
        try {
          const response = await fetch('/api/admin/delete-auth-user', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userPermission.user_id }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to delete auth user via API:', errorData.error);
            // Jangan throw error untuk auth user karena data utama sudah dihapus
          } else {
            await response.json(); // Parse response
          }
        } catch (authError) {
          console.error('Network error calling delete auth user API:', authError);
          // Jangan throw error untuk auth user karena data utama sudah dihapus
        }
      }

    } catch (error) {
      throw error;
    }
  }
};