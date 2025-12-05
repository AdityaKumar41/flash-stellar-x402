import { useState, useCallback, useEffect } from "react";
import { apiService } from "@/services/api";
import { SpeedTestResult } from "@/types";
import { Keypair } from "@stellar/stellar-sdk";
import toast from "react-hot-toast";

export function useSpeedTest() {
  const [results, setResults] = useState<SpeedTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize demo keypair on mount
  useEffect(() => {
    const secretKey = import.meta.env.VITE_CLIENT_SECRET_KEY;
    if (secretKey) {
      const keypair = Keypair.fromSecret(secretKey);
      apiService.initDemoKeypair(keypair);
    }
  }, []);

  const runTest = useCallback(async (iterations: number = 10) => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    try {
      for (let i = 0; i < iterations; i++) {
        // Flash payment
        const flashStart = Date.now();
        const flashResult = await apiService.callWeatherAPI("flash");
        const flashLatency = Date.now() - flashStart;

        setResults((prev: SpeedTestResult[]) => [
          ...prev,
          {
            id: `flash-${Date.now()}`,
            method: "flash",
            latency: flashLatency,
            timestamp: Date.now(),
            status: flashResult.success ? "success" : "failed",
          },
        ]);

        // Standard payment
        const standardStart = Date.now();
        const standardResult = await apiService.callWeatherAPI("standard");
        const standardLatency = Date.now() - standardStart;

        setResults((prev: SpeedTestResult[]) => [
          ...prev,
          {
            id: `standard-${Date.now()}`,
            method: "standard",
            latency: standardLatency,
            timestamp: Date.now(),
            status: standardResult.success ? "success" : "failed",
          },
        ]);

        setProgress(((i + 1) / iterations) * 100);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast.success("Speed test completed!");
    } catch (error: any) {
      console.error("Speed test error:", error);
      toast.error(`Speed test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setProgress(0);
  }, []);

  const flashResults = results.filter(
    (r: SpeedTestResult) => r.method === "flash"
  );
  const standardResults = results.filter(
    (r: SpeedTestResult) => r.method === "standard"
  );

  const stats = {
    flashAvg:
      flashResults.length > 0
        ? flashResults.reduce(
            (sum: number, r: SpeedTestResult) => sum + r.latency,
            0
          ) / flashResults.length
        : 0,
    standardAvg:
      standardResults.length > 0
        ? standardResults.reduce(
            (sum: number, r: SpeedTestResult) => sum + r.latency,
            0
          ) / standardResults.length
        : 0,
    speedup: 0,
  };

  stats.speedup = stats.flashAvg > 0 ? stats.standardAvg / stats.flashAvg : 0;

  return {
    results,
    isRunning,
    progress,
    stats,
    runTest,
    clearResults,
  };
}
