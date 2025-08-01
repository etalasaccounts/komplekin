import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  itemLabel?: string; // Optional label untuk menampilkan jenis item (default: "List Warga")
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
  onPageChange,
  itemLabel = "List Warga"
}: PaginationComponentProps) {
  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground w-fit">
        Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} {itemLabel}
      </p>
      <div className="w-fit">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2">...</span>
                ) : (
                  <PaginationLink 
                    href="#" 
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page as number);
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    handlePageChange(currentPage + 1);
                  }
                }}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
} 