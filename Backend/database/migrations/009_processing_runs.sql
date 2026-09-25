CREATE TABLE IF NOT EXISTS processing_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL,

    stage VARCHAR(100) NOT NULL,

    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    error_message TEXT,

    started_at TIMESTAMP WITH TIME ZONE,

    finished_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_processing_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES analyses(id)
        ON DELETE CASCADE
);