import { useState, useEffect } from "react";
import { isConnected, getPublicKey } from "@stellar/freighter-api";

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  loading: boolean;
  error: string | null;
}

export function useFreighter() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    publicKey: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      setWallet((prev) => ({ ...prev, loading: true, error: null }));

      const connected = await isConnected();

      if (connected) {
        const publicKey = await getPublicKey();
        setWallet({
          connected: true,
          publicKey,
          loading: false,
          error: null,
        });
      } else {
        setWallet({
          connected: false,
          publicKey: null,
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      setWallet({
        connected: false,
        publicKey: null,
        loading: false,
        error: error.message || "Failed to check wallet connection",
      });
    }
  }

  async function connect() {
    try {
      setWallet((prev) => ({ ...prev, loading: true, error: null }));

      const publicKey = await getPublicKey();

      setWallet({
        connected: true,
        publicKey,
        loading: false,
        error: null,
      });

      return publicKey;
    } catch (error: any) {
      setWallet({
        connected: false,
        publicKey: null,
        loading: false,
        error: error.message || "Failed to connect wallet",
      });
      throw error;
    }
  }

  function disconnect() {
    setWallet({
      connected: false,
      publicKey: null,
      loading: false,
      error: null,
    });
  }

  return {
    ...wallet,
    connect,
    disconnect,
    refresh: checkConnection,
  };
}
