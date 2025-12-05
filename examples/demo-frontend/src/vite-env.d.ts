/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CONTRACT_ID: string;
  readonly VITE_USDC_CONTRACT_ID: string;
  readonly VITE_SERVER_ADDRESS: string;
  readonly VITE_STELLAR_NETWORK: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_HORIZON_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
