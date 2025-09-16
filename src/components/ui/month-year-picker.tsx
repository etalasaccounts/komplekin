"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MonthYearPickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
}

const months = [
  { value: "0", label: "Januari" },
  { value: "1", label: "Februari" },
  { value: "2", label: "Maret" },
  { value: "3", label: "April" },
  { value: "4", label: "Mei" },
  { value: "5", label: "Juni" },
  { value: "6", label: "Juli" },
  { value: "7", label: "Agustus" },
  { value: "8", label: "September" },
  { value: "9", label: "Oktober" },
  { value: "10", label: "November" },
  { value: "11", label: "Desember" },
]

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Pilih bulan & tahun",
  disabled = false,
  className,
  minDate,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedMonth, setSelectedMonth] = React.useState<string>("")
  const [selectedYear, setSelectedYear] = React.useState<string>("")

  // Generate years (current year - 10 to current year + 10)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  // Filter available months based on minDate and selected year
  const getAvailableMonths = () => {
    if (!minDate || !selectedYear) return months
    
    const minYear = minDate.getFullYear()
    const minMonth = minDate.getMonth()
    const currentSelectedYear = parseInt(selectedYear)
    
    if (currentSelectedYear > minYear) {
      return months
    } else if (currentSelectedYear === minYear) {
      return months.filter(month => parseInt(month.value) >= minMonth)
    } else {
      return []
    }
  }

  // Filter available years based on minDate
  const getAvailableYears = () => {
    if (!minDate) return years
    
    const minYear = minDate.getFullYear()
    return years.filter(year => year >= minYear)
  }

  React.useEffect(() => {
    if (value) {
      setSelectedMonth(value.getMonth().toString())
      setSelectedYear(value.getFullYear().toString())
    } else {
      setSelectedMonth("")
      setSelectedYear("")
    }
  }, [value])

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    if (selectedYear) {
      const newDate = new Date(parseInt(selectedYear), parseInt(month), 1)
      // Validate against minDate
      if (minDate && newDate < minDate) {
        return // Don't update if the date is before minDate
      }
      onChange(newDate)
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    if (selectedMonth) {
      const newDate = new Date(parseInt(year), parseInt(selectedMonth), 1)
      // Validate against minDate
      if (minDate && newDate < minDate) {
        // If the selected month is invalid for this year, clear the month
        setSelectedMonth("")
        return
      }
      onChange(newDate)
    }
  }

  const handleClear = () => {
    setSelectedMonth("")
    setSelectedYear("")
    onChange(undefined)
  }



  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(value, "MMMM yyyy", { locale: id })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            {/* Month and Year Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bulan</label>
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableMonths().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tahun</label>
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableYears().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
