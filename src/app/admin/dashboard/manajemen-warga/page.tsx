"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronDown,
  Plus,
  User,
  ClipboardList,
  CheckSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WargaList from "./components/WargaList";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

export default function ManajemenWargaPage() {
  const [activeTab, setActiveTab] = useState("daftar");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Manajemen Warga</h1>
        <p className="text-muted-foreground">
          Kelola data warga secara menyeluruh, mulai dari pendaftaran hingga
          pembaruan informasi.
        </p>
      </div>

      {/* Tabs and Actions */}
      <div className="flex items-center justify-between">
        {/* Tabs */}
        <div className="flex space-x-1 p-1 w-fit border-b">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("daftar")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
              activeTab === "daftar"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            <User className="size-4 mr-2" />
            Daftar Warga
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("pendaftaran")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
              activeTab === "pendaftaran"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            <ClipboardList className="size-4 mr-2" />
            Pendaftaran
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("status")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
              activeTab === "status"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            <CheckSquare className="size-4 mr-2" />
            Status Warga
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, nomor rumah, dll"
              className="pl-10 w-80"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Filter
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Status Warga</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Aktif</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Pindah</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Admin</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Warga
          </Button>
        </div>
      </div>

      {/* Warga List */}
      {activeTab === "daftar" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Daftar Warga Komplek</h2>
            <Badge variant="outline">112 Warga Terdaftar</Badge>
          </div>
          <WargaList />
        </div>
      )}
      {/* TODO: Add content for 'pendaftaran' and 'status' tabs */}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Menampilkan 10 dari 112 Warga List</span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
             <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
