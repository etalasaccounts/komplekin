import React from "react";
import WargaCard from "./WargaCard";

const wargaData = [
  {
    status: "Admin",
    nama: "Mathew Alexander",
    role: "Warga Komplek",
    kontak: "089534924330",
    alamat: "Komplek Mahata Margonda No12 Blok A",
    tipeRumah: "Tipe 42 A",
    terdaftar: "20/06/2025",
  },
  {
    status: "Warga Baru",
    nama: "Mathew Alexander",
    role: "Warga Komplek",
    kontak: "089534924330",
    alamat: "Komplek Mahata Margonda No12 Blok A",
    tipeRumah: "Tipe 42 A",
    terdaftar: "20/06/2025",
  },
  {
    status: "Aktif",
    nama: "Mathew Alexander",
    role: "Warga Komplek",
    kontak: "089534924330",
    alamat: "Komplek Mahata Margonda No12 Blok A",
    tipeRumah: "Tipe 42 A",
    terdaftar: "20/06/2025",
  },
  {
    status: "Aktif",
    nama: "Mathew Alexander",
    role: "Warga Komplek",
    kontak: "089534924330",
    alamat: "Komplek Mahata Margonda No12 Blok A",
    tipeRumah: "Tipe 42 A",
    terdaftar: "20/06/2025",
  },
  {
    status: "Pindah",
    nama: "Mathew Alexander",
    role: "Warga Komplek",
    kontak: "089534924330",
    alamat: "Komplek Mahata Margonda No12 Blok A",
    tipeRumah: "Tipe 42 A",
    terdaftar: "20/06/2025",
  },
  {
    status: "Aktif",
    nama: "Mathew Alexander",
    role: "Warga Komplek",
    kontak: "089534924330",
    alamat: "Komplek Mahata Margonda No12 Blok A",
    tipeRumah: "Tipe 42 A",
    terdaftar: "20/06/2025",
  },
];

export default function WargaList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {wargaData.map((warga, index) => (
        <WargaCard key={index} {...warga} />
      ))}
    </div>
  );
} 