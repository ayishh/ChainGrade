/**
 * Switch MetaMask to BNB Smart Chain testnet; add the network if missing (error 4902).
 */
import { BSC_TESTNET_CHAIN_ID } from "@/lib/contract";

const BSC_TESTNET_PARAMS = {
  chainId: BSC_TESTNET_CHAIN_ID,
  chainName: "BNB Smart Chain Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
  blockExplorerUrls: ["https://testnet.bscscan.com"],
};

export async function ensureBscTestnet(ethereum) {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BSC_TESTNET_CHAIN_ID }],
    });
  } catch (err) {
    const code = err?.code ?? err?.data?.originalError?.code;
    if (code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BSC_TESTNET_PARAMS],
      });
      return;
    }
    console.warn("Could not switch to BSC testnet:", err);
  }
}
