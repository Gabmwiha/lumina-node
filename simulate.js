// =================================================================
// [START] NAIROBI CRYPTO SENTINEL ACTIVE ENGINE - LOCAL LOGGING
// =================================================================
console.log("=================================================================");
console.log("[START] NAIROBI CRYPTO SENTINEL LOGGING MODULE RUNNING");
console.log("=================================================================\n");

const fs = require('fs');

class TelemetryEngine {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl;
        this.monitoredWallets = new Set();
        this.logFile = 'alerts.json';
        this.initLogFile();
    }

    initLogFile() {
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, JSON.stringify([], null, 4));
        }
    }

    addWatchlist(address) {
        this.monitoredWallets.add(address.toLowerCase());
        console.log(`[+] Auditing Vector: Tracking address initialized...`);
        console.log(`[>] On-Chain Footprint: ${address}\n`);
    }

    saveAlert(alertData) {
        try {
            const fileData = fs.readFileSync(this.logFile, 'utf8');
            const alerts = JSON.parse(fileData);
            alerts.push(alertData);
            fs.writeFileSync(this.logFile, JSON.stringify(alerts, null, 4));
            console.log(`[Disk] Safe-write complete. Saved to ${this.logFile}`);
        } catch (err) {
            console.error(`[Error] Failed writing telemetry data to disk: ${err.message}`);
        }
    }

    analyzeTransaction(tx) {
        if (this.monitoredWallets.has(tx.to?.toLowerCase()) || this.monitoredWallets.has(tx.from?.toLowerCase())) {
            const report = {
                flagged: true,
                timestamp: new Date().toLocaleTimeString(),
                hash: tx.hash,
                value: tx.value,
                from: tx.from,
                to: tx.to
            };
            
            // Persist the alert to storage
            this.saveAlert(report);
            return report;
        }
        return { flagged: false };
    }
}

// --- INITIALIZE ENGINE ---
const engine = new TelemetryEngine("https://mock-rpc-node.io");
const whaleWallet = "0x28C6c06298d514Db089934071355E5743bf21d60";
engine.addWatchlist(whaleWallet);

// --- MOCK DATA STREAM ---
const mockTransactions = [
    { hash: "0xaa15...89b", from: "0xAlice...", to: "0xBob...", value: "0.45 ETH" },
    { hash: "0xbc72...44f", from: "0xInvestor_Alpha...", to: whaleWallet, value: "1,250 ETH" },
    { hash: "0xde94...11a", from: "0xCharlie...", to: "0xDave...", value: "3.10 ETH" },
    { hash: "0xff38...77c", from: whaleWallet, to: "0xExchange_Cold_Wallet...", value: "890 ETH" }
];

console.log("[Simulation] Tracking and parsing mock telemetry stream...\n");

mockTransactions.forEach((tx, index) => {
    setTimeout(() => {
        console.log(`[Block Scan] Checking Tx: ${tx.hash}`);
        const report = engine.analyzeTransaction(tx);
        
        if (report.flagged) {
            console.log(`🚨 ALERT: On-Chain Movement Tracked! Value: ${report.value}\n`);
        }
    }, index * 1500);
});
