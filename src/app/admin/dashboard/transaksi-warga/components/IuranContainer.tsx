"use client"

import { useState } from "react"
import { Iuran, UpdateIuranRequest, CreateIuranRequest } from "@/types/iuran"
import { UserPermissions } from "@/types/user_permissions"
import IuranTable from "./IuranTable"
import IuranWargaDrawer from "./IuranWargaDrawer"

type IuranContainerProps = {
  iuranList: Iuran[];
  iuranLoading: boolean;
  updateIuran: (id: string, data: UpdateIuranRequest) => Promise<Iuran | null>;
  clusterId: string | null;
  createIuran: (data: CreateIuranRequest) => Promise<Iuran | null>;
  userPermissions: UserPermissions[];
  iuranError: string | null;
}

export default function IuranContainer({ 
  iuranList, 
  iuranLoading, 
  updateIuran, 
  clusterId,
  createIuran,
  userPermissions,
  iuranError
}: IuranContainerProps) {
  const [selectedIuran, setSelectedIuran] = useState<Iuran | null>(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  
  const iuranPerCluster = iuranList.filter((iuran) => iuran.cluster_id === clusterId)

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
        loading={iuranLoading}
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
        createIuran={createIuran}
        userPermissions={userPermissions}
        clusterId={clusterId}
        iuranError={iuranError}
      />
    </div>
  )
} 