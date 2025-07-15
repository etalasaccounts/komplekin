import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Bell, Eye, X, ClipboardList, FileText } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
type Transaction = {
  id: number;
  name: string;
  contact: string;
  houseNumber: string;
  houseType: string;
  amount: string;
  dueDate: string;
  paymentDate: string;
  status: "belum" | "sudah";
};

type StatusPembayaranProps = {
  searchTerm: string;
};

const transactionData: Transaction[] = [
  {
    id: 1,
    name: "Mathew Alexander",
    contact: "089534924330",
    houseNumber: "No1 Blok A",
    houseType: "42 A",
    amount: "Rp120.000",
    dueDate: "06/06/2025",
    paymentDate: "-",
    status: "belum",
  },
  {
    id: 2,
    name: "Susi Pujianti",
    contact: "089534924331",
    houseNumber: "No2 Blok A",
    houseType: "42 B",
    amount: "Rp150.000",
    dueDate: "08/06/2025",
    paymentDate: "08/06/2025",
    status: "sudah",
  },
  {
    id: 3,
    name: "Isabella Nguyen",
    contact: "089734924310",
    houseNumber: "No24 Blok A",
    houseType: "42 C",
    amount: "Rp130.000",
    dueDate: "10/06/2025",
    paymentDate: "10/06/2025",
    status: "sudah",
  },
  {
    id: 4,
    name: "Olivia Martin",
    contact: "089534504330",
    houseNumber: "No34 Blok A",
    houseType: "42 D",
    amount: "Rp110.000",
    dueDate: "11/06/2025",
    paymentDate: "-",
    status: "belum",
  },
  {
    id: 5,
    name: "Jackson Lee",
    contact: "088734924230",
    houseNumber: "No12 Blok B",
    houseType: "42 A",
    amount: "Rp120.000",
    dueDate: "12/06/2025",
    paymentDate: "-",
    status: "belum",
  },
  {
    id: 6,
    name: "Marthin Luther",
    contact: "089534924110",
    houseNumber: "No18 Blok B",
    houseType: "42 B",
    amount: "Rp150.000",
    dueDate: "13/06/2025",
    paymentDate: "13/06/2025",
    status: "sudah",
  },
  {
    id: 7,
    name: "Cania Martin",
    contact: "088234924332",
    houseNumber: "No43 Blok B",
    houseType: "42 C",
    amount: "Rp130.000",
    dueDate: "14/06/2025",
    paymentDate: "-",
    status: "belum",
  },
  {
    id: 8,
    name: "William Kim",
    contact: "089534924230",
    houseNumber: "No18 Blok C",
    houseType: "42 D",
    amount: "Rp110.000",
    dueDate: "15/06/2025",
    paymentDate: "15/06/2025",
    status: "sudah",
  },
];

export default function StatusPembayaran({
  searchTerm,
}: StatusPembayaranProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Transaction | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("data-pribadi");

  const filteredTransactions = transactionData.filter(
    (transaction) =>
      transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.contact.includes(searchTerm) ||
      transaction.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(
        filteredTransactions.map((transaction) => transaction.id)
      );
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    }
  };

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedResident(transaction);
    setDetailModalOpen(true);
    setActiveTab("data-pribadi");
  };

  const handleDownload = () => {
    toast.success("Bukti pembayaran Diunduh", {
      description: "Transaksi warga berhasil diunduh.",
      duration: 3000,
    });
  };

  const handleReminder = () => {
    toast.success("Notifikasi Terkirim", {
      description: "Warga telah menerima pengingat untuk membayar tagihan.",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-foreground">
            Table Iuran Bulanan
          </h2>
          <p className="text-xs font-semibold border border-[#E4E4E7] rounded-full px-2 py-1">
            Bulan Juli 2025
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={
                    filteredTransactions.length > 0 &&
                    selectedItems.length === filteredTransactions.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Nama Warga
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Kontak
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Nomor Rumah
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Tipe Rumah
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Jumlah Bayar
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Jatuh Tempo
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Tanggal Bayar
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Status Bayar
              </TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="p-4">
                  <Checkbox
                    checked={selectedItems.includes(transaction.id)}
                    onCheckedChange={(checked) =>
                      handleSelectItem(transaction.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.name}
                </TableCell>
                <TableCell>{transaction.contact}</TableCell>
                <TableCell>{transaction.houseNumber}</TableCell>
                <TableCell>{transaction.houseType}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.dueDate}</TableCell>
                <TableCell>{transaction.paymentDate}</TableCell>
                <TableCell>
                  <Badge
                    variant="destructive"
                    className={
                      transaction.status === "sudah"
                        ? "bg-[#178C4E] text-white rounded-full font-semibold text-xs"
                        : "bg-[#D02533] text-white rounded-full font-semibold text-xs"
                    }
                  >
                    {transaction.status === "sudah"
                      ? "Sudah Bayar"
                      : "Belum Bayar"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {transaction.status === "sudah" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload()}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {transaction.status === "belum" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReminder()}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(transaction)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground w-fit">
          Menampilkan 8 dari 112 List Warga
        </p>
        <div className="w-fit">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 py-2">...</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">8</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">9</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">10</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Detail Modal */}
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
            {selectedResident && (
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
                            {selectedResident.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Nomor HP Aktif
                          </p>
                          <p className="font-semibold">
                            {selectedResident.contact}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Email</p>
                          <p className="font-semibold">mathewa@gmail.com</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Alamat Rumah
                          </p>
                          <p className="font-semibold">
                            Komplek Mahata Margonda{" "}
                            {selectedResident.houseNumber}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Status Kepemilikan
                          </p>
                          <p className="font-semibold">Sewa</p>
                        </div>
                      </div>

                      {/* Right Column - Images and Additional Info */}
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Foto KTP</p>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50">
                            <p className="text-gray-400 text-sm">
                              KTP Image Placeholder
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-2">Foto KK</p>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50">
                            <p className="text-gray-400 text-sm">
                              KK Image Placeholder
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Nama Kepala Keluarga
                          </p>
                          <p className="font-semibold">
                            {selectedResident.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Nomor Darurat
                          </p>
                          <p className="font-semibold">085157429811</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Pekerjaan
                          </p>
                          <p className="font-semibold">CEO Figma</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Tanggal Tinggal
                          </p>
                          <p className="font-semibold">20/06/2025</p>
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
                                {selectedResident.status === "sudah"
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
    </div>
  );
}
