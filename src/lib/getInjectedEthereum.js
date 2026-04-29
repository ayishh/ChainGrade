/**
 * Resolves window.ethereum for EIP-1193 calls (handles multiple injected providers).
 */

export function getInjectedProvider() {
  if (typeof window === "undefined") return null;
  const eth = window.ethereum;
  if (!eth) return null;
  if (Array.isArray(eth.providers)) {
    const metaMask = eth.providers.find((p) => p.isMetaMask);
    return metaMask || eth.providers[0] || null;
  }
  return eth;
}

/** Use before connect or contract calls; throws with a clear message if no usable wallet. */
export function requireInjectedProvider() {
  const provider = getInjectedProvider();
  if (!provider || typeof provider.request !== "function") {
    throw new Error(
      "No browser wallet found. Install MetaMask and open this site in Chrome or Edge with the extension enabled. IDE embedded previews usually cannot use MetaMask."
    );
  }
  return provider;
}
