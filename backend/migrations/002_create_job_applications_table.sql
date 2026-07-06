CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(user_id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'applied'
        CHECK (status IN ('applied', 'reviewing', 'interviewing', 'offered', 'rejected', 'withdrawn')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_candidate_job_application UNIQUE (candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id
ON job_applications(job_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id
ON job_applications(candidate_id);

CREATE OR REPLACE FUNCTION update_job_applicants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE jobs
        SET applicants_count = applicants_count + 1
        WHERE id = NEW.job_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE jobs
        SET applicants_count = GREATEST(0, applicants_count - 1)
        WHERE id = OLD.job_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_job_applicants_count ON job_applications;

CREATE TRIGGER trg_update_job_applicants_count
AFTER INSERT OR DELETE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION update_job_applicants_count();
