const pool = require("../database/db");

const savedJobsSelect = `
  SELECT
    sj.id AS saved_job_id,
    sj.user_id,
    sj.job_id,
    sj.created_at AS saved_at,
    j.id,
    j.company_id,
    j.title,
    j.category,
    j.location,
    j.job_type,
    j.work_mode,
    j.experience_level,
    j.salary_min,
    j.salary_max,
    j.salary_currency,
    j.salary_label,
    j.skills,
    j.created_at,
    c.company_name,
    c.logo_url,
    c.banner_url
  FROM saved_jobs sj
  INNER JOIN jobs j ON j.id = sj.job_id
  INNER JOIN companies c ON c.id = j.company_id
`;

const findUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, role
     FROM users
     WHERE id = $1`,
    [userId],
  );

  return result.rows[0] || null;
};

const findActiveJobById = async (jobId) => {
  const result = await pool.query(
    `SELECT id
     FROM jobs
     WHERE id = $1 AND is_active = TRUE`,
    [jobId],
  );

  return result.rows[0] || null;
};

const listSavedJobsByUserId = async (userId) => {
  const result = await pool.query(
    `${savedJobsSelect}
     WHERE sj.user_id = $1
       AND j.is_active = TRUE
     ORDER BY sj.created_at DESC`,
    [userId],
  );

  return result.rows;
};

const findSavedJob = async (userId, jobId) => {
  const result = await pool.query(
    `${savedJobsSelect}
     WHERE sj.user_id = $1
       AND sj.job_id = $2
       AND j.is_active = TRUE`,
    [userId, jobId],
  );

  return result.rows[0] || null;
};

const createSavedJob = async ({ userId, jobId }) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const job = await findActiveJobById(jobId);
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    throw error;
  }

  try {
    await pool.query(
      `INSERT INTO saved_jobs (user_id, job_id)
       VALUES ($1, $2)`,
      [userId, jobId],
    );

    return findSavedJob(userId, jobId);
  } catch (error) {
    if (error.code === "23505") {
      const duplicateError = new Error("Job already saved");
      duplicateError.status = 409;
      throw duplicateError;
    }

    throw error;
  }
};

const deleteSavedJob = async ({ userId, jobId }) => {
  const result = await pool.query(
    `DELETE FROM saved_jobs
     WHERE user_id = $1 AND job_id = $2
     RETURNING id`,
    [userId, jobId],
  );

  return result.rows[0] || null;
};

module.exports = {
  listSavedJobsByUserId,
  findSavedJob,
  createSavedJob,
  deleteSavedJob,
};
