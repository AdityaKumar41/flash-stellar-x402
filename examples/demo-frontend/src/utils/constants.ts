export const STELLAR_CONFIG = {
  TESTNET: {
    rpcUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
  },
  MAINNET: {
    rpcUrl: "https://soroban.stellar.org",
    horizonUrl: "https://horizon.stellar.org",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
  },
};

export const CONTRACT_IDS = {
  X402_FLASH: import.meta.env.VITE_CONTRACT_ID || "",
  USDC: import.meta.env.VITE_USDC_CONTRACT_ID || "",
};

export const API_ENDPOINTS = {
  DEMO: "/api/demo",
  SPEEDTEST: "/api/speedtest",
  WEATHER: "/api/weather",
  METRICS: "/api/metrics",
};

export const DEMO_STEPS = [
  {
    id: 1,
    title: "Connect Wallet",
    description: "Connect your Freighter wallet to Stellar testnet",
  },
  {
    id: 2,
    title: "Open Channel",
    description: "Deposit 0.1 XLM into payment channel",
  },
  {
    id: 3,
    title: "Make Payment",
    description: "Call API with instant x402-flash payment",
  },
  {
    id: 4,
    title: "Check Balance",
    description: "Verify remaining channel balance",
  },
  {
    id: 5,
    title: "Close Channel",
    description: "Withdraw remaining funds",
  },
];

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
};
