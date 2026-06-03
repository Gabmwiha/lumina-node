// =================================================================
// [START] LUMINANODE AI ORCHESTRATION ENGINE - RISK EVALUATION CORE
// =================================================================
console.log("=================================================================");
console.log("[START] LUMINANODE AI ORCHESTRATION PIPELINE ACTIVE");
console.log("=================================================================\n");

const fs = require('fs');
const { AlertNotifier } = require('./notifier.js');

class AIOrchestrator {
    constructor(logFile) {
        this.logFile = logFile;
        this.notifier = new AlertNotifier();
    }

    async evaluateRiskProfile() {
        try {
            if (!fs.existsSync(this.logFile)) {
                console.log("[!] No localized transaction telemetry found to ingest.");
                return;
            }

            const rawData = fs.readFileSync(this.logFile, 'utf8');
            const transactions = JSON.parse(rawData);

            console.log(`[Ingestion] Successfully ingested ${transactions.length} telemetry streams for analysis.\n`);

            for (const tx of transactions) {
                let riskScore = 0;
                let riskFactors = [];

                const numericalValue = parseFloat(tx.value.replace(/,/g, ''));

                if (numericalValue >= 1000) {
                    riskScore += 50;
                    riskFactors.push("High-Volume Liquidity Spike (>= 1000 Assets)");
                } else if (numericalValue >= 500) {
                    riskScore += 30;
                    riskFactors.push("Moderate-Whale Velocity Shift (>= 500 Assets)");
                }

                if (tx.to?.toLowerCase().includes("exchange") || tx.from?.toLowerCase().includes("exchange")) {
                    riskScore += 25;
                    riskFactors.push("CEX Interactivity (Potential Off-Ramp Vector)");
                }

                let riskTier = "LOW";
                if (riskScore >= 70) riskTier = "CRITICAL RISK";
                else if (riskScore >= 40) riskTier = "ELEVATED RISK";

                console.log(`[Audit Mapping] Evaluating Tx: ${tx.hash}`);
                console.log(` -> Detected Value : ${tx.value}`);
                console.log(` -> Risk Score     : ${riskScore}/100 [Tier: ${riskTier}]`);
                
                const auditReport = {
                    hash: tx.hash,
                    value: tx.value,
                    score: riskScore,
                    tier: riskTier,
                    factors: riskFactors
                };

                if (riskTier !== "LOW") {
                    await this.notifier.dispatchRiskAlert(auditReport);
                }
                console.log("-----------------------------------------------------------------");
            }

        } catch (err) {
            console.error(`[AI Error] Critical pipeline execution failure: ${err.message}`);
        }
    }
}

const auditor = new AIOrchestrator('alerts.json');
auditor.evaluateRiskProfile();
