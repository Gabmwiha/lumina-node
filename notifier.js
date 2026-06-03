// =================================================================
// [START] LUMINANODE ARCHITECTURE - DISPATCH & WEBHOOK LAYER
// =================================================================
const https = require('https');
const { URL } = require('url');

class AlertNotifier {
    constructor(webhookUrl = null) {
        this.webhookUrl = webhookUrl || process.env.ALERT_WEBHOOK_URL;
    }

    async dispatchRiskAlert(auditReport) {
        console.log(`[Notifier] Processing outbound event distribution for Tx: ${auditReport.hash}...`);
        
        const payload = JSON.stringify({
            username: "LuminaNode Security Sentinel",
            content: `🚨 **CRITICAL TRANSACTION RISK AUDIT FIRED** 🚨`,
            embeds: [{
                title: `Risk Analysis Level: ${auditReport.tier}`,
                color: auditReport.tier === "CRITICAL RISK" ? 15158332 : 15105570,
                fields: [
                    { name: "Transaction Hash", value: `\`${auditReport.hash}\``, inline: false },
                    { name: "Computed Intelligence Score", value: `**${auditReport.score}/100**`, inline: true },
                    { name: "Asset Volume Traced", value: `\`${auditReport.value}\``, inline: true },
                    { name: "Risk Triggers Isolated", value: auditReport.factors.join("\n• ") || "None", inline: false }
                ],
                timestamp: new Date().toISOString()
            }]
        });

        if (!this.webhookUrl) {
            console.log("\n🛰️  [SIMULATED TRANSMISSION] Webhook URL not set. Local fallback payload structured:");
            console.log(JSON.stringify(JSON.parse(payload), null, 2));
            console.log("[Disk] Transmission mock-complete.\n");
            return true;
        }

        try {
            const urlProps = new URL(this.webhookUrl);
            const options = {
                hostname: urlProps.hostname,
                path: urlProps.pathname + urlProps.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            return new Promise((resolve) => {
                const req = https.request(options, (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`[📡 Network] Alert successfully broadcasted. HTTP Status: ${res.statusCode}`);
                        resolve(true);
                    } else {
                        console.error(`[⚠️ Network Error] Endpoint rejected payload. Status: ${res.statusCode}`);
                        resolve(false);
                    }
                });

                req.on('error', (e) => {
                    console.error(`[⚠️ Connection Error] Failed to reach notification channel: ${e.message}`);
                    resolve(false);
                });

                req.write(payload);
                req.end();
            });

        } catch (err) {
            console.error(`[Error] Malformed endpoint pipeline execution: ${err.message}`);
            return false;
        }
    }
}

module.exports = { AlertNotifier };
