"use client";

/**
 * MetaMask connection state: account, connect, disconnect, BSC testnet chain switch.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ethers } from "ethers";
import { ensureBscTestnet } from "@/lib/bscTestnet";
import { getInjectedProvider, requireInjectedProvider } from "@/lib/getInjectedEthereum";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshAccounts = useCallback(async () => {
    const eth = getInjectedProvider();
    if (!eth) return;
    const provider = new ethers.BrowserProvider(eth);
    const list = await provider.listAccounts();
    if (list.length > 0) {
      setAccount(await list[0].getAddress());
    } else {
      setAccount("");
    }
  }, []);

  useEffect(() => {
    const eth = getInjectedProvider();
    if (!eth) return;

    const t = setTimeout(() => {
      void refreshAccounts();
    }, 0);

    const onAccounts = () => {
      void refreshAccounts();
    };

    const canListen =
      typeof eth.on === "function" && typeof eth.removeListener === "function";

    if (canListen) {
      eth.on("accountsChanged", onAccounts);
    }

    return () => {
      clearTimeout(t);
      if (canListen) {
        eth.removeListener("accountsChanged", onAccounts);
      }
    };
  }, [refreshAccounts]);

  const connect = useCallback(async () => {
    const eth = requireInjectedProvider();
    setLoading(true);
    try {
      await eth.request({ method: "eth_requestAccounts" });
      await ensureBscTestnet(eth);
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount("");
  }, []);

  const value = useMemo(
    () => ({
      account,
      loading,
      connect,
      disconnect,
      refreshAccounts,
    }),
    [account, loading, connect, disconnect, refreshAccounts]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
