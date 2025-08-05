import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
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
  iuran?: string; // Tambahkan field iuran
};

export type StatusOption = {
  value: string;
  label: string;
};

export type IuranOption = {
  value: string;
  label: string;
};

type FilterComponentProps = {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  handleApplyFilters: (newFilters: FilterState) => void;
  handleResetFilters: () => void;
  statusOptions?: StatusOption[]; // Custom status options
  statusLabel?: string; // Custom label untuk status filter
  hasUnappliedChanges?: boolean; // Tambahkan prop untuk menampilkan indikator perubahan
  enableIuranFilter?: boolean; // Prop untuk mengaktifkan filter iuran
  iuranOptions?: IuranOption[]; // Opsi iuran untuk filter
};

// Default status options yang general
const defaultStatusOptions: StatusOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Tidak Aktif" },
];

export default function FilterComponent({
  filters,
  setFilters,
  handleApplyFilters,
  handleResetFilters,
  statusOptions = defaultStatusOptions,
  statusLabel = "Status",
  hasUnappliedChanges = false,
  enableIuranFilter = false,
  iuranOptions = [],
}: FilterComponentProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  // Update temp filters when modal opens or filters prop changes
  useEffect(() => {
    setTempFilters(filters);
  }, [filters, filterOpen]);

  const handleApplyTempFilters = () => {
    setFilters(tempFilters); // Apply the temporary filters to actual filters
    handleApplyFilters(tempFilters);
    setFilterOpen(false);
  };

  const handleResetTempFilters = () => {
    const resetState = {
      dateFrom: undefined,
      dateTo: undefined,
      status: "all",
      iuran: "all", // Reset iuran filter juga
    };
    setTempFilters(resetState);
    setFilters(resetState); // Also reset the actual filters
    handleResetFilters();
  };

  return (
    <div className="relative">
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            Filter
            {hasUnappliedChanges && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-95 p-0 bg-white border border-gray-200 rounded-lg mt-2 z-50 shadow-lg"
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
                  setTempFilters(filters); // Reset temp filters to current applied filters
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
                  <Label className="text-sm font-medium">Rentang Tanggal</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetTempFilters}
                    className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Reset
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Dari</Label>
                    <SingleDatePicker
                      value={tempFilters.dateFrom}
                      onChange={(date) =>
                        setTempFilters({ ...tempFilters, dateFrom: date })
                      }
                      placeholder="20/06/2025"
                      buttonClassName="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Sampai</Label>
                    <SingleDatePicker
                      value={tempFilters.dateTo}
                      onChange={(date) =>
                        setTempFilters({ ...tempFilters, dateTo: date })
                      }
                      placeholder="20/06/2025"
                      buttonClassName="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{statusLabel}</Label>
                <Select
                  value={tempFilters.status}
                  onValueChange={(value) =>
                    setTempFilters({ ...tempFilters, status: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Pilih ${statusLabel}`} />
                  </SelectTrigger>
                  <SelectContent className="z-[60]">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Iuran Filter - hanya tampil jika enableIuranFilter = true */}
              {enableIuranFilter && iuranOptions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Jenis Iuran</Label>
                  <Select
                    value={tempFilters.iuran || "all"}
                    onValueChange={(value) =>
                      setTempFilters({ ...tempFilters, iuran: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Jenis Iuran" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="all">Semua Iuran</SelectItem>
                      {iuranOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Apply Filter Button */}
            <div className="mt-6">
              <Button
                onClick={handleApplyTempFilters}
                className="w-full bg-black text-white hover:bg-black/90"
              >
                <Filter className="h-4 w-4 mr-2" />
                Terapkan Filter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}