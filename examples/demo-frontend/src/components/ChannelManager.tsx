import React, { useState } from "react";
import { Zap, DollarSign, AlertCircle } from "lucide-react";
import { Channel } from "../hooks/usePayments";

interface ChannelManagerProps {
  channel: Channel | null;
  loading: boolean;
  error: string | null;
  onOpen: (amount: string) => Promise<void>;
  onClose: () => Promise<void>;
  disabled?: boolean;
}

export function ChannelManager({
  channel,
  loading,
  error,
  onOpen,
  onClose,
  disabled = false,
}: ChannelManagerProps) {
  const [amount, setAmount] = useState("1000000"); // 0.1 XLM default

  const handleOpen = async () => {
    try {
      await onOpen(amount);
    } catch (err) {
      console.error("Failed to open channel:", err);
    }
  };

  const handleClose = async () => {
    if (confirm("Are you sure you want to close this payment channel?")) {
      try {
        await onClose();
      } catch (err) {
        console.error("Failed to close channel:", err);
      }
    }
  };

  return (
    <div className="gradient-border">
      <div className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          Payment Channel
        </h2>

        {channel ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Status</span>
                <span className="text-green-400 font-semibold">● Active</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Channel ID</span>
                <span className="text-sm font-mono">
                  {channel.id.slice(0, 8)}...{channel.id.slice(-6)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Balance</span>
                <span className="text-lg font-bold text-stellar-blue">
                  {(parseInt(channel.balance) / 10000000).toFixed(4)} XLM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Nonce</span>
                <span className="text-sm font-mono">{channel.nonce}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Closing..." : "Close Channel"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Open a payment channel to start making instant micropayments
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Initial Amount (stroops)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={disabled || loading}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-20 focus:outline-none focus:border-stellar-purple disabled:opacity-50"
                  placeholder="1000000"
                  min="100000"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {(parseInt(amount || "0") / 10000000).toFixed(4)} XLM
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                1 XLM = 10,000,000 stroops
              </p>
            </div>

            <button
              onClick={handleOpen}
              disabled={
                disabled || loading || !amount || parseInt(amount) < 100000
              }
              className="w-full bg-stellar-purple hover:bg-stellar-purple/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              {loading ? "Opening..." : "Open Channel"}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
