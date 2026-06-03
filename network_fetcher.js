// =================================================================
// [START] LUMINANODE ARCHITECTURE - LIVE RPC DATA INGESTION CORE
// =================================================================
console.log("=================================================================");
console.log("[START] LUMINANODE REAL-TIME NETWORK FETCHER ACTIVE");
console.log("=================================================================\n");

const fs = require('fs');
const axios = require('axios');

class NetworkFetcher {
    constructor(rpcUrl, logFile = 'alerts.json') {
        this.rpcUrl = rpcUrl;
        this.logFile = logFile;
        this.monitoredWallets = new Set();
    }

    addWatchlist(address) {
        this.monitoredWallets.add(address.toLowerCase());
        console.log(`[Watchlist] Registering Live Network Hook for: ${address}`);
    }

    async fetchLatestBlockTransactions() {
        console.log(`[📡 RPC Connection] Querying payload from node: ${this.rpcUrl}...`);
        try {
            const blockNumRes = await axios.post(this.rpcUrl, {
                jsonrpc: "2.0",
                method: "eth_blockNumber",
                params: [],
                id: 1
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const latestBlockHex = blockNumRes.data?.result;
            if (!latestBlockHex) {
                console.log("[Node Response Error Payload]:", blockNumRes.data);
                throw new Error("Failed to retrieve valid block height hex from target RPC node.");
            }
            console.log(`[Block Sync] Current Network Height Resolved: ${parseInt(latestBlockHex, 16)} (${latestBlockHex})`);

            const blockDataRes = await axios.post(this.rpcUrl, {
                jsonrpc: "2.0",
                method: "eth_getBlockByNumber",
                params: [latestBlockHex, true],
                id: 1
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const transactions = blockDataRes.data?.result?.transactions || [];
            console.log(`[Ingestion] Found ${transactions.length} active transactions inside block execution frame.`);

            let flaggedCount = 0;
            const capturedAlerts = [];

            transactions.forEach(tx => {
                const sourceAddr = tx.from ? tx.from.toLowerCase() : '';
                const destAddr = tx.to ? tx.to.toLowerCase() : '';

                if (this.monitoredWallets.has(sourceAddr) || this.monitoredWallets.has(destAddr)) {
                    flaggedCount++;
                    
                    const hexValue = tx.value;
                    const approximateEth = (Number(BigInt(hexValue) / 1000000000000000n) / 1000).toFixed(4);

                    capturedAlerts.push({
                        flagged: true,
                        timestamp: new Date().toLocaleTimeString(),
                        hash: tx.hash,
                        value: `${approximateEth} ETH`,
                        from: tx.from,
                        to: tx.to
                    });
                }
            });

            if (flaggedCount > 0) {
                console.log(`\n🚨 [ALERT] Traced ${flaggedCount} targeted on-chain interactions matching tracking matrices.`);
                this.persistNetworkAlerts(capturedAlerts);
            } else {
                console.log("\n[Block Scan] Block processing complete. 0 watched interactions found.");
            }

        } catch (error) {
            console.error(`[⚠️ RPC Error] Network data extraction loop broken: ${error.message}`);
        }
    }

    persistNetworkAlerts(newAlerts) {
        try {
            let existingAlerts = [];
            if (fs.existsSync(this.logFile)) {
                const fileData = fs.readFileSync(this.logFile, 'utf8');
                existingAlerts = JSON.parse(fileData || '[]');
            }
            
            const updatedLedger = existingAlerts.concat(newAlerts);
            fs.writeFileSync(this.logFile, JSON.stringify(updatedLedger, null, 4));
            console.log(`[Disk] Appended ${newAlerts.length} real-time event signatures to ${this.logFile}`);
        } catch (err) {
            console.error(`[Disk Error] Failed to write network telemetry data: ${err.message}`);
        }
    }
}

// --- SYSTEM INITIALIZATION RUNTIME ---
// Utilizing Flashbots Open RPC Infrastructure Core
const liveRpcEndpoint = "https://rpc.flashbots.net";
const fetcher = new NetworkFetcher(liveRpcEndpoint);

// To ensure we get immediate transaction matching on the live chain, 
// let's monitor a massive, highly-active transactional router: The Uniswap V3 Factory.
const trackingTarget = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; 
fetcher.addWatchlist(trackingTarget);

// Run the ingestion module
fetcher.fetchLatestBlockTransactions();
