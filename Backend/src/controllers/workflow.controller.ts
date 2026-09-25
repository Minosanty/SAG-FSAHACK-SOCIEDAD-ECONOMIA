import type { Request, Response } from "express";
import { N8nService } from "../services/n8n.service.js";

export class WorkflowController {
    private service: N8nService;

    constructor() {
        this.service = new N8nService();
    }

    trigger = async (req: Request, res: Response) => {
        try {
            const workflowName = typeof req.params.workflowName === "string" ? req.params.workflowName : "infodex-ai";
            const payload = req.body ?? {};

            const result = await this.service.triggerWorkflow(workflowName, payload);
            return res.status(202).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: {
                    code: "WORKFLOW_ERROR",
                    message: error instanceof Error ? error.message : "No fue posible iniciar el workflow."
                }
            });
        }
    };
}
