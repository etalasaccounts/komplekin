import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ClipboardList, FileText } from "lucide-react";
import { useState } from "react";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import Image from "next/image";

type DetailTransaksiWargaModalProps = {
  detailModalOpen: boolean;
  setDetailModalOpen: (open: boolean) => void;
  selectedInvoice: Invoice;
};

export default function DetailTransaksiWargaModal({
  detailModalOpen,
  setDetailModalOpen,
  selectedInvoice,
}: DetailTransaksiWargaModalProps) {
    const [activeTab, setActiveTab] = useState("data-pribadi");
    return (
    <>
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
            <DialogContent className="max-w-[98vw] max-h-[90vh] min-w-[75vw] min-h-[50vh] overflow-hidden p-0 flex flex-col rounded-3xl">
            <DialogHeader className="flex flex-row items-center justify-between p-6 bg-white sticky top-0 z-10">
                <DialogTitle className="text-xl font-bold">
                Detail Warga
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

            <div className="flex-1 overflow-y-auto flex flex-col">
                {selectedInvoice && (
                <>
                    {/* Tabs - Sticky */}
                    <div className="flex bg-white sticky top-0 z-10 px-6 gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab("data-pribadi")}
                        className={`py-2 text-sm font-medium border-b transition-colors rounded-none ${
                        activeTab === "data-pribadi"
                            ? "border-foreground text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Data Pribadi Warga
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab("riwayat")}
                        className={`py-2 text-sm font-medium border-b transition-colors rounded-none ${
                        activeTab === "riwayat"
                            ? "border-foreground text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Riwayat Pembayaran
                    </Button>
                    </div>

                    {/* Tab Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6">
                    {/* Tab Content */}
                    {activeTab === "data-pribadi" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Personal Data */}
                        <div className="space-y-6">
                            <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Nama Lengkap
                            </p>
                            <p className="font-semibold text-lg">
                                {selectedInvoice.user_permission?.profile?.fullname}
                            </p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Nomor HP Aktif
                            </p>
                            <p className="font-semibold">
                                {selectedInvoice.user_permission?.profile?.no_telp || '-'}
                            </p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="font-semibold">{selectedInvoice.user_permission?.profile?.email || '-'}</p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Alamat Rumah
                            </p>
                            <p className="font-semibold">
                                {selectedInvoice.user_permission?.profile?.house_number || '-'}
                            </p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Status Kepemilikan
                            </p>
                            <p className="font-semibold">{selectedInvoice.user_permission?.profile?.ownership_status}</p>
                            </div>
                        </div>

                        {/* Right Column - Images and Additional Info */}
                        <div className="space-y-6">
                            <div>
                            <p className="text-sm text-gray-500 mb-2">Foto KTP</p>
                            {selectedInvoice.user_permission?.profile?.file_ktp ? (
                                <div className="border-2 border-gray-300 rounded-lg p-2 h-32 bg-gray-50">
                                    <Image 
                                        src={selectedInvoice.user_permission.profile.file_ktp} 
                                        alt="Foto KTP" 
                                        width={200}
                                        height={128}
                                        className="w-full h-full object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50">
                                    <p className="text-gray-400 text-sm">
                                        Belum ada foto KTP
                                    </p>
                                </div>
                            )}
                            </div>

                            <div>
                            <p className="text-sm text-gray-500 mb-2">Foto KK</p>
                            {selectedInvoice.user_permission?.profile?.file_kk ? (
                                <div className="border-2 border-gray-300 rounded-lg p-2 h-32 bg-gray-50">
                                    <Image 
                                        src={selectedInvoice.user_permission.profile.file_kk} 
                                        alt="Foto KK" 
                                        width={200}
                                        height={128}
                                        className="w-full h-full object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50">
                                    <p className="text-gray-400 text-sm">
                                        Belum ada foto KK
                                    </p>
                                </div>
                            )}
                            </div>

                            <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Nama Kepala Keluarga
                            </p>
                            <p className="font-semibold">
                                {selectedInvoice.user_permission?.profile?.head_of_family || '-'}
                            </p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Nomor Darurat
                            </p>
                            <p className="font-semibold">{selectedInvoice.user_permission?.profile?.emergency_telp || '-'}</p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Pekerjaan
                            </p>
                            <p className="font-semibold">{selectedInvoice.user_permission?.profile?.work || '-'}</p>
                            </div>

                            <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Tanggal Tinggal
                            </p>
                            <p className="font-semibold">{selectedInvoice.user_permission?.profile?.moving_date || '-'}</p>
                            </div>
                        </div>
                        </div>
                    )}

                    {activeTab === "riwayat" && (
                        <div className="space-y-6">
                        <div className="flex items-center justify-start gap-3">
                            <h3 className="text-lg font-semibold">
                            Table Pembayaran Iuran
                            </h3>
                            <span className="text-xs font-semibold text-foreground rounded-full border border-border px-2">
                            Tahun 2025
                            </span>
                        </div>

                        <div className="overflow-hidden">
                            <table className="w-full">
                            <thead className="border-b">
                                <tr>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Jan
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Feb
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Mar
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Apr
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Mei
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Jun
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Jul
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Agst
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Sept
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Okt
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Nov
                                </th>
                                <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">
                                    Des
                                </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                <td className="px-2 py-4 text-center text-sm">
                                    Lunas
                                </td>
                                <td className="px-2 py-4 text-center text-sm">
                                    Lunas
                                </td>
                                <td className="px-2 py-4 text-center text-sm">
                                    Lunas
                                </td>
                                <td className="px-2 py-4 text-center text-sm">
                                    Lunas
                                </td>
                                <td className="px-2 py-4 text-center text-sm">
                                    Lunas
                                </td>
                                <td className="px-2 py-2 text-center text-sm">
                                    Lunas
                                </td>
                                <td className="px-2 py-4 text-center text-sm">
                                    {selectedInvoice.invoice_status === InvoiceStatus.PAID
                                    ? "Lunas"
                                    : "Belum Bayar"}
                                </td>
                                <td className="px-2 py-4 text-center text-sm text-gray-400">
                                    -
                                </td>
                                <td className="px-2 py-4 text-center text-sm text-gray-400">
                                    -
                                </td>
                                <td className="px-2 py-4 text-center text-sm text-gray-400">
                                    -
                                </td>
                                <td className="px-2 py-4 text-center text-sm text-gray-400">
                                    -
                                </td>
                                <td className="px-2 py-4 text-center text-sm text-gray-400">
                                    -
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        </div>
                    )}
                    </div>
                </>
                )}
            </div>
            </DialogContent>
        </Dialog>
    </>);
}