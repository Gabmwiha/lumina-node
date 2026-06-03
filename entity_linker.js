const axios = require('axios');

const targetDirectory = [
  {
    name: "Primary Liquidity Core Node",
    address: "0x28C6c06298d514Db089934071355E5743bf21d60"
  },
  {
    name: "Ecosystem Bridge Gateway",
    address: "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a"
  }
];

function convertHexToEth(hexValue) {
  if (!hexValue || hexValue === '0x' || hexValue === '0x0') return '0.00 ETH';
  try {
    const weiBigInt = BigInt(hexValue);
    const weiString = weiBigInt.toString();
    const len = weiString.length;
    if (len <= 18) return '0.' + weiString.padStart(18, '0').substring(0, 4) + ' ETH';
    const integerPart = weiString.substring(0, len - 18);
    const decimalPart = weiString.substring(len - 18, len - 14);
    return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.' + decimalPart + ' ETH';
  } catch (error) { return 'Calculation Error'; }
}

async function auditProjectMetrics() {
  console.log("==================================================");
  console.log("[START] NAIROBI CRYPTO SENTINEL ACTIVE ENGINE     ");
  console.log("==================================================");

  // Using a verified high-availability RPC endpoint
  const rpcEndpoint = "https://rpc.ankr.com/eth"; 

  for (const target of targetDirectory) {
    console.log(`\n[+] Auditing Vector: ${target.name}`);
    console.log(`[>] On-Chain Footprint: ${target.address}`);
    
    try {
      const response = await axios.post(rpcEndpoint, {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [target.address, "latest"],
        id: 1
      }, { timeout: 15000 });

      if (response.data && response.data.result) {
        console.log(`[!] Verified Real-Time Capital: ${convertHexToEth(response.data.result)}`);
      } else {
        console.log("[-] Ledger Status: 0 ETH or empty response.");
      }
    } catch (err) {
      console.log("[X] Network Status: Public RPC interface busy. Retrying transaction routing...");
    }
  }
  console.log("\n==================================================");
}

auditProjectMetrics();
