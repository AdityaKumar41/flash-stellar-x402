import { SorobanRpc, Contract, Keypair, TransactionBuilder, nativeToScVal, Address } from "@stellar/stellar-sdk";

const CONTRACT_ID = "CA4UKOBIWMJXRC5K4GMCTWYDQ3NMZKVS4YWQQIP6UHYFZ27EP2XMN65T";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

const server = new SorobanRpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

console.log("🔍 Testing contract:", CONTRACT_ID);
console.log("📡 RPC URL:", RPC_URL);

// Try to get contract data
try {
  const contractData = await server.getContractData(CONTRACT_ID);
  console.log("✅ Contract exists and is accessible");
  console.log("📦 Contract data:", JSON.stringify(contractData, null, 2));
} catch (error) {
  console.error("❌ Contract not accessible:", error.message);
}
