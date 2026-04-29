# GPA Recorder DApp

Next.js frontend for `contracts/GPARecorder.sol`, deployed on **BNB Smart Chain Testnet** (chain id **97**, hex `0x61`). Students use MetaMask to write data; sponsors can read any address over **JSON-RPC** without a wallet.

## What’s in the repo (matches the code)

| Piece | Location |
|--------|-----------|
| Home / **Student** UI | `src/app/page.js` → route `/` |
| **Sponsor** UI | `src/app/sponsor/page.js` → route `/sponsor` |
| Root layout, metadata title/description | `src/app/layout.js` |
| Tab icon | `src/app/icon.png` (Next serves it as `/icon.png`) |
| Contract address + ABI + `BSC_TESTNET_CHAIN_ID` | `src/lib/contract.js` |
| Sponsor RPC URL | `src/lib/contract.js` — `BSC_TESTNET_RPC`: uses `process.env.NEXT_PUBLIC_BSC_TESTNET_RPC` if set, else `https://data-seed-prebsc-1-s1.binance.org:8545` |
| Wallet: connect, disconnect, `accountsChanged` | `src/lib/WalletContext.js` |
| EIP-1193 helper (multi-wallet / MetaMask) | `src/lib/getInjectedEthereum.js` |
| `wallet_switchEthereumChain` + `wallet_addEthereumChain` (4902) | `src/lib/bscTestnet.js` |
| Header / footer shell | `src/components/DAppChrome.js` |
| Page wrapper | `src/components/DAppPageShell.js` |
| styled-components SSR | `src/lib/styledRegistry.js` |
| Solidity | `contracts/GPARecorder.sol` |

**Important:** The deployed address is the **`CONTRACT_ADDRESS` string in `src/lib/contract.js`**. This project does **not** read `NEXT_PUBLIC_CONTRACT_ADDRESS` from env; change that file after you deploy. Only the sponsor RPC is overridden via env (see above).

## Stack (`package.json`)

- Next.js **16.x**, React **19.x**, **styled-components** **6.x**, **ethers** **6.x**

## Scripts

```bash
npm install
npm run dev      # dev server (default http://localhost:3000)
npm run build
npm run start
npm run lint
```

## Wallet behavior (implementation)

- **Connect** calls `eth_requestAccounts`, then `ensureBscTestnet` (switch to `0x61`, or add chain if MetaMask returns **4902**), then stores the signer address.
- **Disconnect** only clears local React state (MetaMask has no real “disconnect” API).
- Use a normal browser (Chrome/Edge) with MetaMask; `requireInjectedProvider` explains when no injectable wallet exists (common in IDE embedded previews).

## Student page (`/`)

- If no account: placeholder asks user to connect (copy also mentions viewing records by address — sponsor flow is on `/sponsor`).
- **Set name:** `setName` once; UI disables input when `nameLocked` is true.
- **Add semester:** Fields are year, semester number, GPA as a **decimal** (e.g. `3.85`). The client sends `Math.round(gpa * 100)` as the third argument to `addSemester`.
- **Client-side checks before send:** year must be integer **1900–2100**; semester positive integer; GPA in **[0, 4]**.
- **On-chain rules** (contract; tx can still revert if UI and contract disagree): `gpa <= 400`, `year > 2000`, `semesterNumber` must be **1 or 2**.
- Records table: data from `getStudent(account)`; rows decoded in `mapRecords` using tuple fields / indices.

## Sponsor page (`/sponsor`)

- `ethers.JsonRpcProvider(BSC_TESTNET_RPC)` + read-only `getStudent(address)`.
- No wallet required for the fetch button.

## Smart contract (`contracts/GPARecorder.sol`)

- `setName(string)` — sets name and `nameLocked` if not already locked; non-empty name required.
- `addSemester(uint256 year, uint256 semesterNumber, uint256 gpa)` — `gpa` is **0–400** (hundredths of 4.0, e.g. 385 → 3.85).
- `getStudent(address)` — returns `name`, `nameLocked`, `Semester[]` with `year`, `semesterNumber`, `gpa`.

After changing the contract, update **`CONTRACT_ABI` in `src/lib/contract.js`** to match the Remix compilation artifact.

## Deploy (Remix + BSC testnet)

1. Open [Remix](https://remix.ethereum.org/), use `contracts/GPARecorder.sol`, compiler **0.8.20** (or compatible **0.8.x**).
2. **Deploy & run:** **Injected Provider — MetaMask**, network **BNB Smart Chain Testnet**.
3. Copy the deployed address into **`CONTRACT_ADDRESS`** in `src/lib/contract.js` and paste the matching ABI.

Optional: set **`NEXT_PUBLIC_BSC_TESTNET_RPC`** in `.env.local` if you want a different RPC for sponsor reads; restart `npm run dev` after changing env.

## Layout / hydration

`src/app/layout.js` sets **`suppressHydrationWarning`** on `<html>` and `<body>` to avoid mismatches when browser extensions alter the DOM.
