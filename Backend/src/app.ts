import express from "express";
import cors from "cors";

import analysisRoutes from "./routes/analysis.routes.js";
import sourceRoutes from "./routes/source.routes.js";
import structuredDataRoutes from "./routes/structured-data.routes.js";
import indicatorRoutes from "./routes/indicator.routes.js";
import comparisonRoutes from "./routes/comparison.routes.js";
import qualityResultRoutes from "./routes/quality-result.routes.js";
import aiFindingRoutes from "./routes/ai-finding.routes.js";
import aiReportRoutes from "./routes/ai-report.routes.js";
import processingRunRoutes from "./routes/processing-run.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import analizarRoutes from "./routes/analizar.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Infodex AI Backend funcionando"
    });
});

app.use("/api", sourceRoutes);
app.use("/api", structuredDataRoutes);
app.use("/api", indicatorRoutes);
app.use("/api", comparisonRoutes);
app.use("/api", qualityResultRoutes);
app.use("/api", aiFindingRoutes);
app.use("/api", aiReportRoutes);
app.use("/api", processingRunRoutes);
app.use("/api", workflowRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", analizarRoutes);
app.use("/api/analyses", analysisRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Backend ejecutándose en http://localhost:${PORT}`);
});