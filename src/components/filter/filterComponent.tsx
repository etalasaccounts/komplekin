import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
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
};

export type StatusOption = {
  value: string;
  label: string;
};

type FilterComponentProps = {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  handleApplyFilters: (newFilters: FilterState) => void;
  handleResetFilters: () => void;
  statusOptions?: StatusOption[]; // Custom status options
};

// Default status options
const defaultStatusOptions: StatusOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "belum bayar", label: "Belum Bayar" },
  { value: "sudah bayar", label: "Sudah Bayar" },
  { value: "kurang bayar", label: "Kurang Bayar" },
];

export default function FilterComponent({
  filters,
  setFilters,
  handleApplyFilters,
  handleResetFilters,
  statusOptions = defaultStatusOptions,
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
    };
    setTempFilters(resetState);
    setFilters(resetState); // Also reset the actual filters
    handleResetFilters();
  };

  return (
    <div className="relative">
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Filter
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
                  <Label className="text-sm font-medium">Date Range</Label>
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
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={tempFilters.status}
                  onValueChange={(value) =>
                    setTempFilters({ ...tempFilters, status: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Status" />
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