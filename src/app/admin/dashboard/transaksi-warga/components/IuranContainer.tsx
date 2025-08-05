"use client"

import { useState } from "react"
import { useIuran } from "@/hooks/useIuran"
import { Iuran, UpdateIuranRequest } from "@/types/iuran"
import IuranTable from "./IuranTable"
import IuranWargaDrawer from "./IuranWargaDrawer"
import { useAuth } from "@/hooks/useAuth"

export default function IuranContainer() {
  const [selectedIuran, setSelectedIuran] = useState<Iuran | null>(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  
  const { iuran, loading, updateIuran } = useIuran()
  const { clusterId } = useAuth()
  const iuranPerCluster = iuran.filter((iuran) => iuran.cluster_id === clusterId)

  const handleEdit = (iuran: Iuran) => {
    setSelectedIuran(iuran)
    setIsEditDrawerOpen(true)
  }

  const handleUpdate = async (id: string, data: UpdateIuranRequest) => {
    return await updateIuran(id, data)
  }

  return (
    <div className="space-y-4"> 
      <div className="flex items-center space-x-3">
        <span className="text-lg font-semibold">Table Iuran</span>
      </div>
      <IuranTable
        iuran={iuranPerCluster}
        loading={loading}
        onEdit={handleEdit}
      />

      {/* Edit Iuran Drawer */}
      <IuranWargaDrawer
        editMode={true}
        editingIuran={selectedIuran}
        createSheetOpen={isEditDrawerOpen}
        setCreateSheetOpen={setIsEditDrawerOpen}
        onUpdate={handleUpdate}
        createInvoice={async () => null} // Placeholder function
      />
    </div>
  )
} 