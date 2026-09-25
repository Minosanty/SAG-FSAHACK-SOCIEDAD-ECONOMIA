CREATE TABLE IF NOT EXISTS quality_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL,

    inconsistencies JSONB DEFAULT '[]'::jsonb,

    missing_data JSONB DEFAULT '[]'::jsonb,

    duplicates JSONB DEFAULT '[]'::jsonb,

    format_errors JSONB DEFAULT '[]'::jsonb,

    outdated_sources JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quality_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES analyses(id)
        ON DELETE CASCADE
);