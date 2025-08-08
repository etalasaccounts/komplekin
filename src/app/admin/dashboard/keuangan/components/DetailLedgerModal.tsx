import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Ledger } from "@/types/ledger";

export default function DetailLedgerModal({ selectedLedger, detailModalOpen, setDetailModalOpen }: { selectedLedger: Ledger, detailModalOpen: boolean, setDetailModalOpen: (open: boolean) => void }) {
    return (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-6xl min-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between p-6 bg-white sticky top-0 z-10">
            <DialogTitle className="text-xl font-bold">
              Detail Pembayaran Iuran
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => setDetailModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto  pt-0 p-6">
            {selectedLedger && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-row items-center justify-start gap-3">
                  <h3 className="text-lg font-semibold">
                    Table Pembayaran Iuran
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs text-foreground font-semibold rounded-full"
                  >
                    Tahun 2025
                  </Badge>
                </div>

                {/* Payment History Table - Work in Progress */}
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-10 h-10 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Riwayat Pembayaran
                  </h4>
                  
                  <p className="text-gray-600 text-center max-w-sm mb-4">
                    Fitur riwayat pembayaran sedang dalam pengembangan. Tim kami akan segera menyelesaikan fitur ini.
                  </p>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Work in Progress</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
}