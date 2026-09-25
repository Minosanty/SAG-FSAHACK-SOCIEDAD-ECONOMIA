export class N8nService {
    private readonly webhookBaseUrl: string;

    constructor(webhookBaseUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678") {
        this.webhookBaseUrl = webhookBaseUrl.replace(/\/$/, "");
    }

    async triggerWorkflow(workflowName: string, payload: Record<string, unknown>) {
        // Try webhook-test first (n8n test mode), then fall back to production webhook
        const urls = [
            `${this.webhookBaseUrl}/webhook-test/${workflowName}`,
            `${this.webhookBaseUrl}/webhook/${workflowName}`
        ];

        let lastError: Error | null = null;

        for (const url of urls) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log(`[n8n] Webhook exitoso: ${url}`);
                    return {
                        ok: true,
                        status: response.status,
                        workflow: workflowName,
                        payload
                    };
                }

                lastError = new Error(`HTTP ${response.status} desde ${url}`);
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.warn(`[n8n] No se pudo contactar ${url}: ${lastError.message}`);
            }
        }

        throw new Error(`No fue posible iniciar el workflow ${workflowName}. ${lastError?.message ?? ""}`);
    }
}
