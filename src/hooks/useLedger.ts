import { useEffect, useState } from "react";
import { Ledger } from "@/types/ledger";
import { ledgerService } from "@/services/ledgerService";

export const useLedger = () => {
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLedgers = async () => {
        try {
            setLoading(true);
            const ledgers = await ledgerService.getLedgers();
            setLedgers(ledgers);
        } catch (error) {
            console.error("Error fetching ledgers:", error);
        } finally {
            setLoading(false);
        }
    }

    const createLedger = async (ledgerData: Ledger): Promise<Ledger> => {
        try {
        const ledger = await ledgerService.createLedger(ledgerData);
        fetchLedgers();
        return ledger;
        } catch (error) {
            console.error("Error creating ledger:", error);
            return null as unknown as Ledger;
        } finally {
            setLoading(false);
        }
    }

    const updateLedger = async (id: string, ledgerData: Ledger): Promise<Ledger> => {
        try {
            const ledger = await ledgerService.updateLedger(id, ledgerData);
            fetchLedgers();
            return ledger;
        } catch (error) {
            console.error("Error updating ledger:", error);
            return null as unknown as Ledger;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchLedgers();
    }, []);

    return { 
        ledgers,
        loading,
        fetchLedgers,
        createLedger,
        updateLedger
    };
}