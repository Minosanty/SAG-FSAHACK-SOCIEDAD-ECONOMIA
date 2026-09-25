CREATE TABLE IF NOT EXISTS comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL,

    variable VARCHAR(255) NOT NULL,

    source_a JSONB NOT NULL,

    source_b JSONB NOT NULL,

    difference NUMERIC,

    percentage_difference NUMERIC,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comparisons_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES analyses(id)
        ON DELETE CASCADE
);