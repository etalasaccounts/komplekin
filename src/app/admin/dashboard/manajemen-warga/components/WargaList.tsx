import React from "react";
import WargaCard from "./WargaCard";
import { WargaData } from "./WargaDetailModal";

interface WargaListProps {
  dataWarga: (WargaData & { id: number })[];
  refetch?: () => void;
}

export default function WargaList({ dataWarga, refetch }: WargaListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {dataWarga.map((warga, index) => (
        <WargaCard 
          key={index}
          {...warga}
          tanggalDaftar={warga.tanggalDaftar || ''} // Provide default empty string
          refetch={refetch}
        />
      ))}
    </div>
  );
}