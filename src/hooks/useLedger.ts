import { useEffect, useState } from "react";
import { Ledger, AccountType } from "@/types/ledger";
import { ledgerService } from "@/services/ledgerService";

export const useLedger = () => {
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLedgers = async () => {
        try {
            setLoading(true);
            const ledgers = await ledgerService.getLedgers();
            setLedgers(ledgers);
            console.log(ledgers);
        } catch (error) {
            console.error("Error fetching ledgers:", error);
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
        fetchLedgers
    };
}