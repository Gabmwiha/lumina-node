// =================================================================
// [START] NAIROBI CRYPTO SENTINEL ACTIVE ENGINE - CORE TELEMETRY
// =================================================================
console.log("=================================================================");
console.log("[START] NAIROBI CRYPTO SENTINEL ACTIVE ENGINE RUNNING");
console.log("=================================================================\n");

class TelemetryEngine {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl;
        this.monitoredWallets = new Set();
    }

    addWatchlist(address) {
        this.monitoredWallets.add(address.toLowerCase());
        console.log(`[+] Auditing Vector: Tracking address initialized...`);
        console.log(`[>] On-Chain Footprint: ${address}\n`);
    }

    analyzeTransaction(tx) {
        if (this.monitoredWallets.has(tx.to?.toLowerCase()) || this.monitoredWallets.has(tx.from?.toLowerCase())) {
            return {
                flagged: true,
                timestamp: new Date().toLocaleTimeString(),
                hash: tx.hash,
                value: tx.value,
                from: tx.from,
                to: tx.to
            };
        }
        return { flagged: false };
    }
}

// --- INITIALIZE & CONFIGURATION ---
const engine = new TelemetryEngine("https://mock-rpc-node.io");

// Add a target high-value institutional whale wallet to track
const whaleWallet = "0x28C6c06298d514Db089934071355E5743bf21d60";
engine.addWatchlist(whaleWallet);

// --- MOCK TRANSACTION DATA STREAM ---
const mockTransactions = [
    { hash: "0xaa15...89b", from: "0xAlice...", to: "0xBob...", value: "0.45 ETH" },
    { hash: "0xbc72...44f", from: "0xInvestor_Alpha...", to: whaleWallet, value: "1,250 ETH" }, // Whale Match!
    { hash: "0xde94...11a", from: "0xCharlie...", to: "0xDave...", value: "3.10 ETH" },
    { hash: "0xff38...77c", from: whaleWallet, to: "0xExchange_Cold_Wallet...", value: "890 ETH" } // Whale Match!
];

console.log("[Simulation] Initiating live block-telemetry parse sequence...\n");

// --- TELEMETRY ENGINE LOOP ---
mockTransactions.forEach((tx, index) => {
    setTimeout(() => {
        console.log(`[Block Scan] Checking Tx Hash: ${tx.hash}...`);
        const report = engine.analyzeTransaction(tx);
        
        if (report.flagged) {
            console.log(`\n🚨 🚨 [ALERT] CRITICAL ON-CHAIN MOVEMENT DETECTED 🚨 🚨`);
            console.log(`[Time]  : ${report.timestamp}`);
            console.log(`[Hash]  : ${report.hash}`);
            console.log(`[From]  : ${report.from}`);
            console.log(`[To]    : ${report.to}`);
            console.log(`[Value] : 🔥 ${report.value} 🔥\n`);
        }
    }, index * 2000);
});
