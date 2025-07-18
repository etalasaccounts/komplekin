"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, FileText, ClipboardList } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import StatusPembayaran from "./components/StatusPembayaran";
import VerifikasiPembayaran from "./components/VerifikasiPembayaran";
import { SingleDatePicker } from "@/components/input/singleDatePicker";
import FilterComponent, {
  FilterState,
} from "@/components/filter/filterComponent";

// Define form state type for new payment
type NewPaymentForm = {
  name: string;
  contact: string;
  houseNumber: string;
  houseType: string;
  dueDate: Date | undefined;
  amount: string;
};

export default function TransaksiWargaPage() {
  const [activeTab, setActiveTab] = useState("status");
  const [searchTerm, setSearchTerm] = useState("");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
  });
  const [newPaymentForm, setNewPaymentForm] = useState<NewPaymentForm>({
    name: "",
    contact: "",
    houseNumber: "",
    houseType: "",
    dueDate: undefined,
    amount: "",
  });

  const handleResetFilters = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      status: "",
    });
  };

  const handleCreatePayment = () => {
    // Create payment logic here
    console.log("Creating new payment:", newPaymentForm);
    setCreateSheetOpen(false);

    // Show success toast
    toast.success("Iuran Berhasil Ditambahkan", {
      description:
        "Iuran berhasil diatur untuk warga baru. Mereka akan segera menerima notifikasinya.",
      duration: 3000,
      dismissible: true,
      closeButton: true,
    });

    // Reset form
    setNewPaymentForm({
      name: "",
      contact: "",
      houseNumber: "",
      houseType: "",
      dueDate: undefined,
      amount: "",
    });
  };

  const updateNewPaymentForm = (
    field: keyof NewPaymentForm,
    value: string | Date | undefined
  ) => {
    setNewPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Transaksi Warga</h1>
        <p className="text-sm text-muted-foreground">
          Data lengkap iuran warga berdasarkan bulan, nominal, dan status
          pembayaran
        </p>
      </div>

      {/* Tabs */}

      <div className="flex items-center justify-between">
        <div className="flex space-x-1 p-1 w-fit">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("status")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors rounded-none",
              activeTab === "status"
                ? "bg-background text-foreground border-b border-b-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ClipboardList className="size-4 mr-2" />
            Status Pembayaran
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("verifikasi")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors rounded-none",
              activeTab === "verifikasi"
                ? "bg-background text-foreground border-b border-b-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="size-4 mr-2" />
            Verifikasi Pembayaran
          </Button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, nomor rumah, dll"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <FilterComponent
            filters={filters}
            setFilters={(filters) => setFilters(filters)}
            handleApplyFilters={() => {}}
            handleResetFilters={handleResetFilters}
          />

          {/* Create New Payment Sheet */}
          <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
            <SheetTrigger asChild>
              <Button
                size="sm"
                className="bg-black text-white hover:bg-black/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Iuran Baru
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Buat Iuran Warga</SheetTitle>
                <SheetDescription>
                  Isi detail iuran warga untuk menambahkan tagihan baru ke
                  sistem.
                </SheetDescription>
              </SheetHeader>

              <div className="grid gap-4 py-4 px-4 ">
                {/* Nama Warga */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nama Warga *
                  </Label>

                  <Select
                    value={newPaymentForm.name}
                    onValueChange={(value) =>
                      updateNewPaymentForm("name", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Mathew Alexander" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathew Alexander">
                        Mathew Alexander
                      </SelectItem>
                      <SelectItem value="Susi Pujianti">
                        Susi Pujianti
                      </SelectItem>
                      <SelectItem value="Isabella Nguyen">
                        Isabella Nguyen
                      </SelectItem>
                      <SelectItem value="Olivia Martin">
                        Olivia Martin
                      </SelectItem>
                      <SelectItem value="Jackson Lee">Jackson Lee</SelectItem>
                      <SelectItem value="Marthin Luther">
                        Marthin Luther
                      </SelectItem>
                      <SelectItem value="Cania Martin">Cania Martin</SelectItem>
                      <SelectItem value="William Kim">William Kim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Kontak */}
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm font-medium">
                    Kontak *
                  </Label>
                  <Input
                    id="contact"
                    placeholder="089534924330"
                    value={newPaymentForm.contact}
                    onChange={(e) =>
                      updateNewPaymentForm("contact", e.target.value)
                    }
                    disabled
                    className="bg-[#E0E0E0]"
                  />
                </div>

                {/* Nomor Rumah */}
                <div className="space-y-2">
                  <Label htmlFor="houseNumber" className="text-sm font-medium">
                    Nomor Rumah *
                  </Label>
                  <Input
                    id="houseNumber"
                    placeholder="No1 Blok A"
                    value={newPaymentForm.houseNumber}
                    onChange={(e) =>
                      updateNewPaymentForm("houseNumber", e.target.value)
                    }
                    disabled
                    className="bg-[#E0E0E0]"
                  />
                </div>

                {/* Tipe Rumah */}
                <div className="space-y-2">
                  <Label htmlFor="houseType" className="text-sm font-medium">
                    Tipe Rumah *
                  </Label>
                  <Input
                    id="houseType"
                    placeholder="42 A"
                    value={newPaymentForm.houseType}
                    onChange={(e) =>
                      updateNewPaymentForm("houseType", e.target.value)
                    }
                    disabled
                    className="bg-[#E0E0E0]"
                  />
                </div>

                {/* Jatuh Tempo */}
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium">
                    Jatuh tempo *
                  </Label>
                  <div className="relative">
                    <SingleDatePicker
                      id="dueDate"
                      placeholder="Select date"
                      value={newPaymentForm.dueDate}
                      onChange={(date) => updateNewPaymentForm("dueDate", date)}
                      buttonClassName="w-full"
                    />
                  </div>
                </div>

                {/* Jumlah Iuran */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Jumlah Iuran *
                  </Label>
                  <Input
                    id="amount"
                    placeholder="Rp120.000"
                    value={newPaymentForm.amount}
                    onChange={(e) =>
                      updateNewPaymentForm("amount", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6 px-4">
                <Button
                  onClick={handleCreatePayment}
                  className="bg-black text-white hover:bg-black/90"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Buat Iuran
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {activeTab === "status" && <StatusPembayaran searchTerm={searchTerm} />}
      {activeTab === "verifikasi" && (
        <VerifikasiPembayaran searchTerm={searchTerm} />
      )}
    </div>
  );
}
