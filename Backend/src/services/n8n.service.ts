export class N8nService {
    private readonly webhookBaseUrl: string;

    constructor(webhookBaseUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678") {
        this.webhookBaseUrl = webhookBaseUrl.replace(/\/$/, "");
    }

    async triggerWorkflow(workflowName: string, payload: Record<string, unknown>) {
        const response = await fetch(`${this.webhookBaseUrl}/webhook/${workflowName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`No fue posible iniciar el workflow ${workflowName}.`);
        }

        return {
            ok: true,
            status: response.status,
            workflow: workflowName,
            payload
        };
    }
}
