import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  getPublicKey,
  signTransaction,
} from "@stellar/freighter-api";
import { Keypair } from "@stellar/stellar-sdk";
import { stellarService } from "@/services/stellar";
import { WalletState } from "@/types";
import toast from "react-hot-toast";

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    publicKey: "",
    balance: "0",
    network: "testnet",
  });

  const [loading, setLoading] = useState(false);

  // Check if Freighter is installed, or use demo keypair
  const checkFreighter = useCallback(async () => {
    try {
      const connected = await isConnected();
      if (connected) {
        const publicKey = await getPublicKey();
        const balance = await stellarService.getBalance(publicKey);

        setWallet({
          connected: true,
          publicKey,
          balance,
          network: "testnet",
        });
      } else {
        // Use demo keypair if Freighter is not connected
        const secretKey = import.meta.env.VITE_CLIENT_SECRET_KEY;
        if (secretKey) {
          const demoKeypair = Keypair.fromSecret(secretKey);
          const balance = await stellarService.getBalance(
            demoKeypair.publicKey()
          );

          setWallet({
            connected: true,
            publicKey: demoKeypair.publicKey(),
            balance,
            network: "testnet",
          });
        }
      }
    } catch (error) {
      console.error("Wallet check failed:", error);
      // Fallback to demo keypair
      const secretKey = import.meta.env.VITE_CLIENT_SECRET_KEY;
      if (secretKey) {
        try {
          const demoKeypair = Keypair.fromSecret(secretKey);
          const balance = await stellarService.getBalance(
            demoKeypair.publicKey()
          );

          setWallet({
            connected: true,
            publicKey: demoKeypair.publicKey(),
            balance,
            network: "testnet",
          });
        } catch (err) {
          console.error("Demo keypair fallback failed:", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    checkFreighter();
  }, [checkFreighter]);

  const connect = useCallback(async () => {
    setLoading(true);
    try {
      // Check if Freighter is installed
      const connected = await isConnected();
      if (!connected) {
        toast.error(
          "Freighter wallet not found. Please install it from https://www.freighter.app/",
          { duration: 5000 }
        );
        window.open("https://www.freighter.app/", "_blank");
        setLoading(false);
        return false;
      }

      // Request access
      const publicKey = await getPublicKey();
      const balance = await stellarService.getBalance(publicKey);

      setWallet({
        connected: true,
        publicKey,
        balance,
        network: "testnet",
      });

      toast.success("Wallet connected successfully!");
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      toast.error(`Failed to connect wallet: ${error.message}`);
      setLoading(false);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      connected: false,
      publicKey: "",
      balance: "0",
      network: "testnet",
    });
    toast.success("Wallet disconnected");
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!wallet.connected) return;

    try {
      const balance = await stellarService.getBalance(wallet.publicKey);
      setWallet((prev: WalletState) => ({ ...prev, balance }));
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  }, [wallet.connected, wallet.publicKey]);

  const signTx = useCallback(
    async (xdr: string): Promise<string> => {
      try {
        const signedTx = await signTransaction(xdr, {
          network: "TESTNET",
          networkPassphrase: "Test SDF Network ; September 2015",
          accountToSign: wallet.publicKey,
        });
        return signedTx;
      } catch (error: any) {
        throw new Error(`Failed to sign transaction: ${error.message}`);
      }
    },
    [wallet.publicKey]
  );

  return {
    wallet,
    loading,
    connect,
    disconnect,
    refreshBalance,
    signTx,
  };
}
