import { motion } from "framer-motion";
import { Zap, Wallet, PlayCircle } from "lucide-react";
import { useWallet } from "./hooks/useWallet";
import { useLiveDemo } from "./hooks/useLiveDemo";
import { useSpeedTest } from "./hooks/useSpeedTest";
import { formatAddress } from "./utils/formatters";

function App() {
  const { wallet, loading, connect, disconnect } = useWallet();
  const { steps, running, runDemo, resetDemo } = useLiveDemo();
  const { results, isRunning, progress, stats, runTest, clearResults } =
    useSpeedTest();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-500" />
              <h1 className="text-2xl font-bold gradient-text">
                x402-flash on Stellar
              </h1>
            </div>

            {!wallet.connected ? (
              <button
                onClick={connect}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="text-gray-400">Balance</div>
                  <div className="font-semibold">
                    {parseFloat(wallet.balance).toFixed(4)} XLM
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-400">Address</div>
                  <div className="font-mono">
                    {formatAddress(wallet.publicKey)}
                  </div>
                </div>
                <button onClick={disconnect} className="btn-secondary text-sm">
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-6">
            Lightning Fast <span className="gradient-text">Micropayments</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Experience sub-100ms payment channels on Stellar. Perfect for AI
            agents, APIs, and real-time services.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="card text-center">
              <div className="text-4xl font-bold text-purple-500">
                {"<"}100ms
              </div>
              <div className="text-gray-400 mt-2">Payment Latency</div>
            </div>
            <div className="card text-center">
              <div className="text-4xl font-bold text-purple-500">50x</div>
              <div className="text-gray-400 mt-2">Faster than Standard</div>
            </div>
            <div className="card text-center">
              <div className="text-4xl font-bold text-purple-500">$0.0001</div>
              <div className="text-gray-400 mt-2">Minimum Payment</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Live Demo Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-8 text-center">Live Demo</h3>

        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-4">
                Payment Channel Flow
              </h4>
              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border ${
                      step.status === "success"
                        ? "border-green-500/50 bg-green-500/10"
                        : step.status === "running"
                          ? "border-purple-500/50 bg-purple-500/10 animate-pulse"
                          : step.status === "error"
                            ? "border-red-500/50 bg-red-500/10"
                            : "border-gray-700 bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{step.title}</div>
                        <div className="text-sm text-gray-400">
                          {step.description}
                        </div>
                        {step.result && (
                          <div className="text-xs text-gray-500 mt-2">
                            {JSON.stringify(step.result, null, 2)}
                          </div>
                        )}
                        {step.error && (
                          <div className="text-xs text-red-400 mt-2">
                            {step.error}
                          </div>
                        )}
                      </div>
                      <div className="text-2xl">
                        {step.status === "success" && "✅"}
                        {step.status === "running" && "⏳"}
                        {step.status === "error" && "❌"}
                        {step.status === "pending" && "⚪"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={runDemo}
                disabled={running || !wallet.connected}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                {running ? "Running Demo..." : "Run Demo"}
              </button>
              <button
                onClick={resetDemo}
                disabled={running}
                className="btn-secondary"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Speed Test Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-8 text-center">Speed Test</h3>

        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-4">
                Compare x402-flash vs Standard Payments
              </h4>

              {stats.flashAvg > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="card">
                    <div className="text-sm text-gray-400">Flash Average</div>
                    <div className="text-2xl font-bold text-purple-500">
                      {stats.flashAvg.toFixed(0)}ms
                    </div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-gray-400">
                      Standard Average
                    </div>
                    <div className="text-2xl font-bold text-blue-500">
                      {stats.standardAvg.toFixed(0)}ms
                    </div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-gray-400">Speedup</div>
                    <div className="text-2xl font-bold text-green-500">
                      {stats.speedup.toFixed(1)}x
                    </div>
                  </div>
                </div>
              )}

              {isRunning && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {results.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        result.method === "flash"
                          ? "bg-purple-900/30"
                          : "bg-blue-900/30"
                      }`}
                    >
                      <span className="text-sm font-mono">
                        {result.method === "flash" ? "⚡ Flash" : "🐌 Standard"}
                      </span>
                      <span className="text-sm font-semibold">
                        {result.latency}ms
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => runTest(10)}
                disabled={isRunning}
                className="btn-primary flex-1"
              >
                {isRunning ? "Running..." : "Run Speed Test"}
              </button>
              <button
                onClick={clearResults}
                disabled={isRunning}
                className="btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>Built with ❤️ on Stellar Soroban</p>
          <p className="text-sm mt-2">
            x402-flash SDK - Lightning Fast Micropayments for the Future
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
