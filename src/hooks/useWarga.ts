import { useState, useEffect, useCallback, useRef } from 'react';
import { wargaService, WargaWithProfile } from '@/services/wargaService';
import { useAuth } from './useAuth';

export const useWarga = () => {
  const [warga, setWarga] = useState<WargaWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clusterId } = useAuth();
  
  // Refs untuk mencegah fetch berulang
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const hasInitialFetchRef = useRef(false);
  const lastClusterIdRef = useRef<string | null>(null);

  const fetchWarga = useCallback(async (force: boolean = false) => {
    // Jika sedang fetch atau tidak ada clusterId, skip
    if (isFetchingRef.current || !clusterId) {
      return;
    }

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    // Jika bukan force fetch dan baru saja fetch dalam 5 detik terakhir, skip
    if (!force && timeSinceLastFetch < 5000 && hasInitialFetchRef.current) {
      console.log('Skip fetch - recent fetch detected');
      return;
    }

    // Jika cluster tidak berubah dan sudah pernah fetch, skip (kecuali force)
    if (!force && lastClusterIdRef.current === clusterId && hasInitialFetchRef.current) {
      console.log('Skip fetch - same cluster and already fetched');
      return;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    lastClusterIdRef.current = clusterId;

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching warga data for cluster:', clusterId);
      const data = await wargaService.getAllWarga(clusterId || undefined);
      setWarga(data);
      hasInitialFetchRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching warga');
      console.error('Error fetching warga:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [clusterId]);

  // Manual refetch function yang force fetch
  const refetch = useCallback(() => {
    console.log('Manual refetch triggered');
    return fetchWarga(true);
  }, [fetchWarga]);

  useEffect(() => {
    // Hanya fetch jika clusterId berubah atau belum pernah fetch
    if (clusterId && (!hasInitialFetchRef.current || lastClusterIdRef.current !== clusterId)) {
      console.log('Initial fetch or cluster changed');
      fetchWarga(false);
    }
  }, [clusterId, fetchWarga]);

  return {
    warga,
    loading,
    error,
    refetch
  };
};

export const useWargaByStatus = (status: 'Active' | 'Inactive') => {
  const [warga, setWarga] = useState<WargaWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clusterId } = useAuth();
  
  // Refs untuk mencegah fetch berulang
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const hasInitialFetchRef = useRef(false);
  const lastParamsRef = useRef<{ clusterId: string | null; status: string }>({ clusterId: null, status: '' });

  const fetchWarga = useCallback(async (force: boolean = false) => {
    if (isFetchingRef.current || !clusterId) {
      return;
    }

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    const paramsChanged = lastParamsRef.current.clusterId !== clusterId || lastParamsRef.current.status !== status;
    
    // Skip jika bukan force, baru fetch, dan parameter tidak berubah
    if (!force && timeSinceLastFetch < 5000 && hasInitialFetchRef.current && !paramsChanged) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    lastParamsRef.current = { clusterId, status };

    try {
      setLoading(true);
      setError(null);
      const data = await wargaService.getWargaByStatus(status, clusterId || undefined);
      setWarga(data);
      hasInitialFetchRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching warga by status');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [clusterId, status]);

  const refetch = useCallback(() => {
    return fetchWarga(true);
  }, [fetchWarga]);

  useEffect(() => {
    const paramsChanged = lastParamsRef.current.clusterId !== clusterId || lastParamsRef.current.status !== status;
    if (clusterId && (!hasInitialFetchRef.current || paramsChanged)) {
      fetchWarga(false);
    }
  }, [clusterId, status, fetchWarga]);

  return {
    warga,
    loading,
    error,
    refetch
  };
};

export const useWargaByCitizenStatus = (citizenStatus: 'Warga baru' | 'Pindah') => {
  const [warga, setWarga] = useState<WargaWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clusterId } = useAuth();
  
  // Refs untuk mencegah fetch berulang
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const hasInitialFetchRef = useRef(false);
  const lastParamsRef = useRef<{ clusterId: string | null; citizenStatus: string }>({ clusterId: null, citizenStatus: '' });

  const fetchWarga = useCallback(async (force: boolean = false) => {
    if (isFetchingRef.current || !clusterId) {
      return;
    }

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    const paramsChanged = lastParamsRef.current.clusterId !== clusterId || lastParamsRef.current.citizenStatus !== citizenStatus;
    
    // Skip jika bukan force, baru fetch, dan parameter tidak berubah
    if (!force && timeSinceLastFetch < 5000 && hasInitialFetchRef.current && !paramsChanged) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    lastParamsRef.current = { clusterId, citizenStatus };

    try {
      setLoading(true);
      setError(null);
      const data = await wargaService.getWargaByCitizenStatus(citizenStatus, clusterId || undefined);
      setWarga(data);
      hasInitialFetchRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching warga by citizen status');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [clusterId, citizenStatus]);

  const refetch = useCallback(() => {
    return fetchWarga(true);
  }, [fetchWarga]);

  useEffect(() => {
    const paramsChanged = lastParamsRef.current.clusterId !== clusterId || lastParamsRef.current.citizenStatus !== citizenStatus;
    if (clusterId && (!hasInitialFetchRef.current || paramsChanged)) {
      fetchWarga(false);
    }
  }, [clusterId, citizenStatus, fetchWarga]);

  return {
    warga,
    loading,
    error,
    refetch
  };
};

export const useWargaActions = () => {
  const updateStatus = async (userPermissionId: string, status: 'Active' | 'Inactive') => {
    try {
      await wargaService.updateWargaStatus(userPermissionId, status);
    } catch (error) {
      throw error;
    }
  };

  const updateRole = async (userPermissionId: string, role: 'admin' | 'user' | 'super admin') => {
    try {
      await wargaService.updateWargaRole(userPermissionId, role);
    } catch (error) {
      throw error;
    }
  };

  const updateCitizenStatus = async (profileId: string, citizenStatus: 'Warga baru' | 'Pindah' | 'Admin') => {
    try {
      await wargaService.updateCitizenStatus(profileId, citizenStatus);
    } catch (error) {
      throw error;
    }
  };

  const deleteWarga = async (userPermissionId: string, hardDelete = false) => {
    try {
      if (hardDelete) {
        await wargaService.hardDeleteWarga(userPermissionId);
      } else {
        await wargaService.deleteWarga(userPermissionId);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (profileId: string, profileData: {
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
  }) => {
    try {
      await wargaService.updateProfile(profileId, profileData);
    } catch (error) {
      throw error;
    }
  };

  return {
    updateStatus,
    updateRole,
    updateCitizenStatus,
    deleteWarga,
    updateProfile
  };
};