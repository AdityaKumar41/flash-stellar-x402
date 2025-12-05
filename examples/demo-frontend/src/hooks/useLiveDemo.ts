import { useState, useCallback, useEffect } from "react";
import { Keypair } from "@stellar/stellar-sdk";
import { stellarService } from "@/services/stellar";
import { apiService } from "@/services/api";
import { useWallet } from "./useWallet";
import { DemoStep } from "@/types";
import { DEMO_STEPS } from "@/utils/constants";
import toast from "react-hot-toast";

export function useLiveDemo() {
  const { wallet, refreshBalance } = useWallet();
  const [steps, setSteps] = useState<DemoStep[]>(
    DEMO_STEPS.map((s) => ({ ...s, status: "pending" as const }))
  );
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [demoKeypair, setDemoKeypair] = useState<Keypair | null>(null);

  // Initialize demo keypair on mount
  useEffect(() => {
    const secretKey = import.meta.env.VITE_CLIENT_SECRET_KEY;
    if (secretKey) {
      const keypair = Keypair.fromSecret(secretKey);
      setDemoKeypair(keypair);
      apiService.initDemoKeypair(keypair);
    }
  }, []);

  const updateStep = useCallback(
    (stepId: number, updates: Partial<DemoStep>) => {
      setSteps((prev: DemoStep[]) =>
        prev.map((step: DemoStep) =>
          step.id === stepId ? { ...step, ...updates } : step
        )
      );
    },
    []
  );

  const runDemo = useCallback(async () => {
    if (!demoKeypair) {
      toast.error("Demo keypair not initialized");
      return;
    }

    setRunning(true);
    setCurrentStep(1);

    try {
      // Step 1: Already connected (skip)
      updateStep(1, { status: "success" });
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 2: Open Channel
      setCurrentStep(2);
      updateStep(2, { status: "running" });

      const serverAddress = import.meta.env.VITE_SERVER_ADDRESS || "";
      const tokenAddress = "native"; // Using XLM
      const amount = "1000000"; // 0.1 XLM
      const ttl = 86400; // 24 hours

      const channelTx = await stellarService.openChannel(
        demoKeypair,
        serverAddress,
        tokenAddress,
        amount,
        ttl
      );

      updateStep(2, {
        status: "success",
        result: { txHash: channelTx, amount },
      });
      toast.success("Channel opened!");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3: Make Payment
      setCurrentStep(3);
      updateStep(3, { status: "running" });

      const startTime = Date.now();
      const paymentResult = await apiService.callWeatherAPI(
        "flash",
        "San Francisco"
      );
      const latency = Date.now() - startTime;

      if (paymentResult.success) {
        updateStep(3, {
          status: "success",
          result: { ...paymentResult.data, latency },
        });
        toast.success(`Payment completed in ${latency}ms!`);
      } else {
        throw new Error(paymentResult.error || "Payment failed");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Check Balance
      setCurrentStep(4);
      updateStep(4, { status: "running" });

      const balance = await stellarService.getChannelBalance(
        demoKeypair.publicKey(),
        serverAddress
      );

      updateStep(4, {
        status: "success",
        result: { balance },
      });
      toast.success(`Remaining balance: ${balance} stroops`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 5: Close Channel
      setCurrentStep(5);
      updateStep(5, { status: "running" });

      const closeTx = await stellarService.closeChannel(
        demoKeypair,
        serverAddress
      );

      updateStep(5, {
        status: "success",
        result: { txHash: closeTx, refunded: balance },
      });
      toast.success("Channel closed successfully!");

      // Refresh wallet balance
      await refreshBalance();

      setCurrentStep(0);
    } catch (error: any) {
      console.error("Demo error:", error);
      updateStep(currentStep, {
        status: "error",
        error: error.message,
      });
      toast.error(`Demo failed: ${error.message}`);
    } finally {
      setRunning(false);
    }
  }, [demoKeypair, currentStep, updateStep, refreshBalance]);

  const resetDemo = useCallback(() => {
    setSteps(DEMO_STEPS.map((s) => ({ ...s, status: "pending" as const })));
    setCurrentStep(0);
    setRunning(false);
  }, []);

  return {
    steps,
    running,
    currentStep,
    runDemo,
    resetDemo,
  };
}
