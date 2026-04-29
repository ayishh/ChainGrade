/**
 * Deployed GPARecorder address, ABI (matches Remix artifact), and public BSC testnet RPC for reads.
 */
export const CONTRACT_ADDRESS = "0xB15BcB2bb966eC05Ca9D7ed2Ad013A8AE68cec74"

/** Public RPC for read-only sponsor view (no wallet). BSC testnet default. */
export const BSC_TESTNET_RPC =
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC ||
  "https://data-seed-prebsc-1-s1.binance.org:8545";

export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "year",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "semesterNumber",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "gpa",
        "type": "uint256"
      }
    ],
    "name": "addSemester",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "student",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "NameSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "student",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "year",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "semesterNumber",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gpa",
        "type": "uint256"
      }
    ],
    "name": "SemesterAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "setName",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "studentAddress",
        "type": "address"
      }
    ],
    "name": "getStudent",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "nameLocked",
        "type": "bool"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "year",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "semesterNumber",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gpa",
            "type": "uint256"
          }
        ],
        "internalType": "struct GPARecorder.Semester[]",
        "name": "records",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const BSC_TESTNET_CHAIN_ID = "0x61";
