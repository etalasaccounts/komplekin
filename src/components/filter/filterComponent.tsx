import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter } from "lucide-react";
import { SingleDatePicker } from "../input/singleDatePicker";

export type FilterState = {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  status: string;
  verificationStatus?: string;
};

type FilterComponentProps = {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  handleApplyFilters: () => void;
  handleResetFilters: () => void;
  showVerificationFilter?: boolean;
  hasUnappliedChanges?: boolean;
};

export default function FilterComponent({
  filters,
  setFilters,
  handleApplyFilters,
  handleResetFilters,
  showVerificationFilter = false,
  hasUnappliedChanges = false,
}: FilterComponentProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <Popover open={filterOpen} onOpenChange={setFilterOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={hasUnappliedChanges ? "border-orange-500 text-orange-600" : ""}
        >
          Filter
          {hasUnappliedChanges && (
            <div className="w-2 h-2 bg-orange-500 rounded-full ml-2" />
          )}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-95 p-0 bg-white border border-gray-200 rounded-lg mt-2 z-[99999] filter-popup"
        align="end"
        side="bottom"
      >
        <div className="p-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filter</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterOpen(false);
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Date Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Date Range</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Dari</Label>
                  <SingleDatePicker
                    value={filters.dateFrom}
                    onChange={(date) =>
                      setFilters({ ...filters, dateFrom: date })
                    }
                    placeholder="20/06/2025"
                    buttonClassName="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Sampai</Label>
                  <SingleDatePicker
                    value={filters.dateTo}
                    onChange={(date) =>
                      setFilters({ ...filters, dateTo: date })
                    }
                    placeholder="20/06/2025"
                    buttonClassName="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status Pembayaran</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="belum">Belum Bayar</SelectItem>
                  <SelectItem value="sudah">Sudah Bayar</SelectItem>
                  <SelectItem value="semua">Semua Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verification Status Filter */}
            {showVerificationFilter && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status Verifikasi</Label>
                <Select
                  value={filters.verificationStatus || ""}
                  onValueChange={(value) =>
                    setFilters({ ...filters, verificationStatus: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Status Verifikasi" />
                  </SelectTrigger>
                  <SelectContent className="z-[99999]">
                    <SelectItem value="verified">Terverifikasi</SelectItem>
                    <SelectItem value="unverified">Ditolak</SelectItem>
                    <SelectItem value="not_checked">Belum Dicek</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="semua">Semua Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Apply Filter Button */}
          <div className="mt-6">
            <Button
              onClick={handleApplyFilters}
              className={`w-full text-white hover:bg-black/90 ${
                hasUnappliedChanges 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : "bg-black"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              {hasUnappliedChanges ? "Terapkan Filter" : "Filter Aktif"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
