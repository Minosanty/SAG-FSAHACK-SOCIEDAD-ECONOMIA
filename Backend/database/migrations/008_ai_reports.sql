CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL,

    summary TEXT,

    findings JSONB DEFAULT '[]'::jsonb,

    possible_needs JSONB DEFAULT '[]'::jsonb,

    additional_information JSONB DEFAULT '[]'::jsonb,

    questions JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES analyses(id)
        ON DELETE CASCADE
);