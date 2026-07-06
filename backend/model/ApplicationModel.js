const pool = require("../database/db");

const applicationSelect = `
  SELECT
    ja.id,
    ja.job_id,
    ja.candidate_id,
    ja.resume_url,
    ja.cover_letter,
    ja.status,
    ja.applied_at,
    ja.updated_at,
    j.title AS job_title,
    j.location AS job_location,
    j.job_type,
    j.work_mode,
    c.company_name,
    c.logo_url
  FROM job_applications ja
  INNER JOIN jobs j ON j.id = ja.job_id
  INNER JOIN companies c ON c.id = j.company_id
`;

const ensureCandidateExists = async (candidateId) => {
  const result = await pool.query(
    `SELECT c.user_id
     FROM candidates c
     INNER JOIN users u ON u.id = c.user_id
     WHERE c.user_id = $1 AND u.role = 'candidate'`,
    [candidateId],
  );

  return result.rows[0] || null;
};

const ensureActiveJobExists = async (jobId) => {
  const result = await pool.query(
    `SELECT id
     FROM jobs
     WHERE id = $1 AND is_active = TRUE`,
    [jobId],
  );

  return result.rows[0] || null;
};

const findApplicationByJobAndCandidate = async (jobId, candidateId) => {
  const result = await pool.query(
    `${applicationSelect}
     WHERE ja.job_id = $1 AND ja.candidate_id = $2`,
    [jobId, candidateId],
  );

  return result.rows[0] || null;
};

const listApplicationsByCandidate = async (candidateId) => {
  const result = await pool.query(
    `${applicationSelect}
     WHERE ja.candidate_id = $1
     ORDER BY ja.applied_at DESC`,
    [candidateId],
  );

  return result.rows;
};

const createApplication = async ({ jobId, candidateId, resumeUrl, coverLetter }) => {
  const candidate = await ensureCandidateExists(candidateId);
  if (!candidate) {
    const error = new Error("Candidate profile not found");
    error.status = 404;
    throw error;
  }

  const job = await ensureActiveJobExists(jobId);
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    throw error;
  }

  try {
    const result = await pool.query(
      `INSERT INTO job_applications (job_id, candidate_id, resume_url, cover_letter)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [jobId, candidateId, resumeUrl || null, coverLetter?.trim() || null],
    );

    return findApplicationByJobAndCandidate(jobId, candidateId);
  } catch (error) {
    if (error.code === "23505") {
      const duplicateError = new Error("You have already applied to this job");
      duplicateError.status = 409;
      throw duplicateError;
    }

    throw error;
  }
};

module.exports = {
  findApplicationByJobAndCandidate,
  listApplicationsByCandidate,
  createApplication,
};
