import type { Request, Response } from "express";
import { pool } from "../config/database.js";

export class DashboardController {

    getResults = async (req: Request, res: Response) => {
        try {
            const analysisId = req.params.id;

            if (typeof analysisId !== "string") {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "INVALID_ANALYSIS_ID",
                        message: "El identificador del análisis es inválido."
                    }
                });
            }

            // Fetch all data in parallel
            const [indicatorsResult, qualityResult, findingsResult, reportsResult, sourcesResult] = await Promise.all([
                pool.query("SELECT * FROM indicators WHERE analysis_id = $1 ORDER BY created_at DESC", [analysisId]),
                pool.query("SELECT * FROM quality_results WHERE analysis_id = $1 ORDER BY created_at DESC LIMIT 1", [analysisId]),
                pool.query("SELECT * FROM ai_findings WHERE analysis_id = $1 ORDER BY created_at DESC", [analysisId]),
                pool.query("SELECT * FROM ai_reports WHERE analysis_id = $1 ORDER BY created_at DESC LIMIT 1", [analysisId]),
                pool.query("SELECT id, name FROM sources WHERE analysis_id = $1", [analysisId])
            ]);

            // Build source name lookup
            const sourceMap = new Map<string, string>();
            for (const row of sourcesResult.rows) {
                sourceMap.set(row.id, row.name);
            }

            // Transform indicators to KPIs
            const kpis = indicatorsResult.rows.map((ind: Record<string, unknown>) => {
                const kpi: { label: string; value: string | number; calculation: string; source_name?: string; trend?: string } = {
                    label: ind.name as string,
                    value: ind.value as (string | number) ?? 0,
                    calculation: (ind.calculation as string) ?? "CALC",
                };
                if (Array.isArray(ind.source_ids) && ind.source_ids.length > 0) {
                    kpi.source_name = (ind.source_ids as string[]).map((sid) => sourceMap.get(sid) ?? sid).join(", ");
                }
                return kpi;
            });

            // Transform quality results
            const qualityRow = qualityResult.rows[0];
            const data_quality: Array<{ severity: string; description: string; evidence?: string; field?: string }> = [];

            if (qualityRow) {
                const inconsistencies = Array.isArray(qualityRow.inconsistencies) ? qualityRow.inconsistencies : [];
                const missing = Array.isArray(qualityRow.missing_data) ? qualityRow.missing_data : [];
                const duplicates = Array.isArray(qualityRow.duplicates) ? qualityRow.duplicates : [];
                const formatErrors = Array.isArray(qualityRow.format_errors) ? qualityRow.format_errors : [];

                const pushQualityIssue = (item: unknown, severity: string) => {
                    const issue: { severity: string; description: string; evidence?: string; field?: string } = {
                        severity,
                        description: typeof item === "string" ? item : (item as Record<string, unknown>)?.description as string ?? JSON.stringify(item),
                    };
                    if (typeof item === "object" && item !== null) {
                        const rec = item as Record<string, unknown>;
                        if (rec.evidence !== undefined) issue.evidence = rec.evidence as string;
                        if (rec.field !== undefined) issue.field = rec.field as string;
                    }
                    data_quality.push(issue);
                };

                for (const item of inconsistencies) {
                    pushQualityIssue(item, "high");
                }

                for (const item of missing) {
                    pushQualityIssue(item, "medium");
                }

                for (const item of [...duplicates, ...formatErrors]) {
                    pushQualityIssue(item, "low");
                }
            }

            // Transform AI findings
            const ai_findings = findingsResult.rows.map((f: Record<string, unknown>) => {
                const finding: { type: string; description: string; evidence_sources?: string[] } = {
                    type: (f.type as string) ?? "insight",
                    description: f.description as string,
                };
                if (Array.isArray(f.source_ids)) {
                    finding.evidence_sources = (f.source_ids as string[]).map((sid) => sourceMap.get(sid) ?? sid);
                }
                return finding;
            });

            // Transform AI report
            const reportRow = reportsResult.rows[0];
            const executive_report = reportRow ? {
                summary: (reportRow.summary as string) ?? "",
                potential_needs: Array.isArray(reportRow.possible_needs) ? reportRow.possible_needs.map(String) : [],
                additional_info_needed: Array.isArray(reportRow.additional_information) ? reportRow.additional_information.map(String) : [],
                questions_to_investigate: Array.isArray(reportRow.questions) ? reportRow.questions.map(String) : []
            } : null;

            return res.json({
                kpis,
                data_quality,
                ai_findings,
                executive_report
            });

        } catch (error) {
            console.error("[Dashboard] Error:", error);
            return res.status(500).json({
                success: false,
                error: {
                    code: "DASHBOARD_ERROR",
                    message: error instanceof Error ? error.message : "No fue posible obtener los resultados del dashboard."
                }
            });
        }
    };
}
