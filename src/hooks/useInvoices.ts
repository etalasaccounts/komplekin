import { Invoice, InvoiceStatus } from "@/types/invoice"
import { useState, useEffect } from "react"
import { invoiceService } from "@/services/invoiceService"
import { toast } from "sonner";

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [paidInvoices, setPaidInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(false)
    const [invoiceByUserId, setInvoiceByUserId] = useState<Invoice[]>([])

    const getInvoices = async () => {
        console.log("Getting invoices");
        setLoading(true);
        const invoices = await invoiceService.getInvoices();
        setInvoices(invoices);
        setPaidInvoices(invoices.filter(invoice => invoice.invoice_status === InvoiceStatus.PAID  ));
        setLoading(false);
    };

    const createInvoice = async (invoice: Invoice): Promise<Invoice | null> => {
        try {
        const newInvoice = await invoiceService.createInvoice(invoice);
          getInvoices();
          toast.success("Invoice berhasil dibuat", {
            description: "Invoice berhasil dibuat.",
            duration: 3000,
          });
            return newInvoice;
        } catch (error) {
            console.error('Create invoice failed:', error);
            toast.error("Gagal membuat invoice", {
                description: "Terjadi kesalahan saat membuat invoice.",
                duration: 3000,
            });
            return null
        }
    };

    const updateInvoice = async (invoice: Invoice): Promise<Invoice | null> => {
        try {
          setLoading(true);
          const updatedInvoice = await invoiceService.updateInvoiceStatus(invoice);
          getInvoices();
          toast.success("Invoice berhasil diupdate", {
              description: "Invoice berhasil diupdate.",
              duration: 3000,
          });
          return updatedInvoice;
        } catch (error) {
          toast.error("Gagal mengupdate invoice", {
            description: error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate invoice.",
            duration: 3000,
          });
          return null;
        } finally {
          setLoading(false);
        }
    }

    const getInvoicesByUserId = async (userId: string) => {
        try {
            const invoices = await invoiceService.getInvoicesByUserId(userId);
            setInvoiceByUserId(invoices);
            console.log("invoices", invoices);
        } catch (error) {
            console.error('Get invoice by user id failed:', error);
            toast.error("Gagal mengambil invoice", {
                description: "Terjadi kesalahan saat mengambil invoice.",
                duration: 3000,
            });
        }
    }

    const createManualPayment = async (invoice: Invoice, uploadedReceipt: File): Promise<Invoice | null> => {
        try {
            const newInvoice = await invoiceService.createManualPayment(invoice, uploadedReceipt);
            getInvoices();
            toast.success("Pembayaran manual berhasil dibuat", {
                description: "Pembayaran manual berhasil dibuat.",
                duration: 3000,
            });
            return newInvoice;
        } catch (error) {
            console.error('Create manual payment failed:', error);
            toast.error("Gagal membuat pembayaran manual", {
                description: "Terjadi kesalahan saat membuat pembayaran manual.",
                duration: 3000,
            });
            return null;
        }
    }

    useEffect(() => {
        getInvoices();
    }, []);

    const handleDownload = async (receipt: string) => {
        try {
          const response = await fetch(receipt);
          if (!response.ok) {
            throw new Error('Failed to fetch file');
          }
          
          const blob = await response.blob();
          
          const blobUrl = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `bukti_pembayaran.png`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
    
          window.URL.revokeObjectURL(blobUrl);
    
          toast.success("Bukti pembayaran Diunduh", {
            description: "Transaksi warga berhasil diunduh.",
            duration: 3000,
          });
        } catch (error) {
          console.error('Download failed:', error);
          toast.error("Gagal mengunduh file", {
            description: "Terjadi kesalahan saat mengunduh bukti pembayaran.",
            duration: 3000,
          });
        }
      };

  return { invoices, paidInvoices, invoiceByUserId, loading, handleDownload, createInvoice, updateInvoice, getInvoicesByUserId, createManualPayment };
};