import { useState, useEffect } from 'react';
import { iuranService } from '@/services/iuranService';
import { Iuran, CreateIuranRequest, UpdateIuranRequest } from '@/types/iuran';

export const useIuran = () => {
  const [iuran, setIuran] = useState<Iuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIuran = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await iuranService.getIuran();
      setIuran(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data iuran');
      setIuran([]); // Reset data on error
    } finally {
      setLoading(false);
    }
  }

  const createIuran = async (iuranData: CreateIuranRequest): Promise<Iuran | null> => {
    try {
      setError(null);
      const newIuran = await iuranService.createIuran(iuranData);
      setIuran(prev => [newIuran, ...prev]);
      return newIuran;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat iuran');
      return null;
    }
  };

  const updateIuran = async (id: string, iuranData: UpdateIuranRequest): Promise<Iuran | null> => {
    try {
      setError(null);
      const updatedIuran = await iuranService.updateIuran(id, iuranData);
      setIuran(prev => prev.map(item => item.id === id ? updatedIuran : item));
      return updatedIuran;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengupdate iuran');
      return null;
    }
  };

  const deleteIuran = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await iuranService.deleteIuran(id);
      setIuran(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus iuran');
      return false;
    }
  };

  const getIuranById = async (id: string): Promise<Iuran | null> => {
    try {
      setError(null);
      return await iuranService.getIuranById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil detail iuran');
      return null;
    }
  };

  useEffect(() => {
    fetchIuran();
  }, []);

  return {
    iuran,
    loading,
    error,
    fetchIuran,
    createIuran,
    updateIuran,
    deleteIuran,
    getIuranById,
  };
}; 