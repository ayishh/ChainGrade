# GPA Recorder DApp (Next.js + Styled Components)

This app includes:

- **Student portal** — connect wallet, set display name once (locked), add semester rows (year, semester #, GPA × 100), view a table of on-chain records.
- **Sponsor portal** — fetch any student’s records by address using a **read-only** JSON-RPC connection (no wallet required for the lookup).
- **Solidity contract** — deploy from Remix on **BNB Smart Chain Testnet**.

## 1) Install and run frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 2) Deploy smart contract in Remix

Contract file: `contracts/GPARecorder.sol`

1. Open [https://remix.ethereum.org/](https://remix.ethereum.org/)
2. Create/import `GPARecorder.sol`.
3. Compile with Solidity `0.8.20` (or compatible `0.8.x`).
4. In “Deploy & run transactions”:
   - Environment: **Injected Provider - MetaMask**
   - Network in MetaMask: **BNB Smart Chain Testnet (chain id 97)**
5. Deploy the contract and copy the deployed contract address.

## 3) Connect frontend to deployed contract

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Optional — custom BSC testnet RPC for sponsor read-only calls (defaults to a public endpoint):

```env
NEXT_PUBLIC_BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
```

Restart the dev server after changing `.env.local`.

## Contract behavior

- `setName(string)` — once per wallet; then `nameLocked` is true.
- `addSemester(uint256 year, uint256 semesterNumber, uint256 gpaTimes100)` — appends a semester row; `gpaTimes100` must be ≤ 400 (e.g. `387` → 3.87).
- `getStudent(address)` — returns `name`, `nameLocked`, and `records[]` of `{ year, semesterNumber, gpaTimes100 }`.
