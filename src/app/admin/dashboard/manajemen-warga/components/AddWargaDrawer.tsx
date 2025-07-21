"use client";

import React, { useState } from "react";
import Drawer from "../../components/Drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { SingleDatePicker } from "@/components/input/singleDatePicker";

export default function AddWargaDrawer() {
  const [step, setStep] = useState(1);
  const [tanggalTinggal, setTanggalTinggal] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const triggerButton = (
    <Button className="bg-foreground text-background hover:bg-foreground/90">
      <Plus className="h-4 w-4 mr-2" />
      Tambah Warga
    </Button>
  );

  const Step1Form = (
    <div className="grid gap-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="nama">Nama Lengkap *</Label>
        <Input id="nama" placeholder="Mathew Alexander" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hp">Nomor HP Aktif *</Label>
        <Input id="hp" placeholder="0895349243330" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" placeholder="mathewa@gmail.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="alamat">Alamat Rumah *</Label>
        <Input id="alamat" placeholder="Komplek Mahata Margonda No12 Blok A" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tipe-rumah">Tipe Rumah *</Label>
        <Input id="tipe-rumah" placeholder="42 B" />
      </div>
      <div className="grid gap-2 w-full">
        <Label htmlFor="status-kepemilikan">Status Kepemilikan *</Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sewa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sewa">Sewa</SelectItem>
            <SelectItem value="milik-sendiri">Milik Sendiri</SelectItem>
            <SelectItem value="milik-lain">Milik Orang Tua</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const Step2Form = (
    <div className="grid gap-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="foto-ktp">Foto KTP</Label>
        <Input id="foto-ktp" type="file" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="foto-kk">Foto Kartu keluarga</Label>
        <Input id="foto-kk" type="file" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hp-darurat">Nomor HP Darurat</Label>
        <Input id="hp-darurat" placeholder="085157429811" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="nama-kepala-keluarga">Nama Kepala Keluarga</Label>
        <Input id="nama-kepala-keluarga" placeholder="Mathew Alexander" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pekerjaan">Pekerjaan</Label>
        <Input id="pekerjaan" placeholder="CEO Figma" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tanggal-tinggal">Tanggal Tinggal</Label>
        <SingleDatePicker
            id="tanggal-tinggal"
            placeholder="20/06/2025"
            value={tanggalTinggal}
            onChange={setTanggalTinggal}
            buttonClassName="w-full"
        />
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex justify-between">
      {step === 2 && (
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sebelumnya
        </Button>
      )}
      <div className="flex-grow"></div>
      {step === 1 && (
        <Button onClick={() => setStep(2)}>
          Selanjutnya
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
      {step === 2 && (
        <Button>
          Tambah Warga
          <Send className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <Drawer
      trigger={triggerButton}
      title="Form Pendaftaran Warga baru"
      description="Isi data warga baru untuk menambahkan mereka ke dalam sistem."
      steps={`Step ${step}/2`}
      footer={footerContent}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      {step === 1 ? Step1Form : Step2Form}
    </Drawer>
  );
} 