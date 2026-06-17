const pool = require("../database/db");

const baseSelect = `
  SELECT
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
    j.openings,
    j.description,
    j.education,
    j.responsibilities,
    j.skills,
    j.preferred_qualifications,
    j.hiring_stages,
    j.current_stage,
    j.benefits,
    j.applicants_count,
    j.urgency,
    j.deadline,
    j.recruiter_name,
    j.recruiter_role,
    j.recruiter_image,
    j.is_active,
    j.created_at,
    j.updated_at,
    c.company_name,
    c.logo_url,
    c.banner_url,
    c.description AS company_description,
    c.industry,
    c.size,
    c.founded,
    c.website
  FROM jobs j
  INNER JOIN companies c ON c.id = j.company_id
`;

const listJobs = async ({ limit, sortBy = "newest" }) => {
  const values = [];
  const orderBy = sortBy === "salary" ? "j.salary_max DESC NULLS LAST" : "j.created_at DESC";
  let query = `${baseSelect} WHERE j.is_active = TRUE ORDER BY ${orderBy}`;

  if (limit) {
    values.push(limit);
    query += ` LIMIT $${values.length}`;
  }

  const result = await pool.query(query, values);
  return result.rows;
};

const findJobById = async (jobId) => {
  const result = await pool.query(
    `${baseSelect} WHERE j.id = $1 AND j.is_active = TRUE`,
    [jobId]
  );

  return result.rows[0] || null;
};

const createJob = async (payload) => {
  const {
    companyId,
    title,
    category,
    location,
    jobType,
    workMode,
    experienceLevel,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryLabel,
    openings,
    description,
    education,
    responsibilities,
    skills,
    preferredQualifications,
    hiringStages,
    currentStage,
    benefits,
    applicantsCount,
    urgency,
    deadline,
    recruiterName,
    recruiterRole,
    recruiterImage,
  } = payload;

  const result = await pool.query(
    `INSERT INTO jobs (
      company_id, title, category, location, job_type, work_mode, experience_level,
      salary_min, salary_max, salary_currency, salary_label, openings,
      description, education, responsibilities, skills, preferred_qualifications,
      hiring_stages, current_stage, benefits, applicants_count, urgency, deadline,
      recruiter_name, recruiter_role, recruiter_image
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12,
      $13, $14, $15, $16, $17,
      $18, $19, $20::jsonb, $21, $22, $23,
      $24, $25, $26
    )
    RETURNING id`,
    [
      companyId,
      title,
      category || null,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryMin || null,
      salaryMax || null,
      salaryCurrency || "USD",
      salaryLabel || null,
      openings || 1,
      description,
      education || null,
      responsibilities || [],
      skills || [],
      preferredQualifications || [],
      hiringStages || [],
      currentStage || 0,
      JSON.stringify(benefits || []),
      applicantsCount || 0,
      urgency || "Medium",
      deadline || null,
      recruiterName || null,
      recruiterRole || null,
      recruiterImage || null,
    ]
  );

  return findJobById(result.rows[0].id);
};

const updateJob = async (jobId, payload) => {
  const {
    companyId,
    title,
    category,
    location,
    jobType,
    workMode,
    experienceLevel,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryLabel,
    openings,
    description,
    education,
    responsibilities,
    skills,
    preferredQualifications,
    hiringStages,
    currentStage,
    benefits,
    applicantsCount,
    urgency,
    deadline,
    recruiterName,
    recruiterRole,
    recruiterImage,
    isActive,
  } = payload;

  const result = await pool.query(
    `UPDATE jobs
     SET company_id = COALESCE($2, company_id),
         title = COALESCE($3, title),
         category = COALESCE($4, category),
         location = COALESCE($5, location),
         job_type = COALESCE($6, job_type),
         work_mode = COALESCE($7, work_mode),
         experience_level = COALESCE($8, experience_level),
         salary_min = COALESCE($9, salary_min),
         salary_max = COALESCE($10, salary_max),
         salary_currency = COALESCE($11, salary_currency),
         salary_label = COALESCE($12, salary_label),
         openings = COALESCE($13, openings),
         description = COALESCE($14, description),
         education = COALESCE($15, education),
         responsibilities = COALESCE($16, responsibilities),
         skills = COALESCE($17, skills),
         preferred_qualifications = COALESCE($18, preferred_qualifications),
         hiring_stages = COALESCE($19, hiring_stages),
         current_stage = COALESCE($20, current_stage),
         benefits = COALESCE($21::jsonb, benefits),
         applicants_count = COALESCE($22, applicants_count),
         urgency = COALESCE($23, urgency),
         deadline = COALESCE($24, deadline),
         recruiter_name = COALESCE($25, recruiter_name),
         recruiter_role = COALESCE($26, recruiter_role),
         recruiter_image = COALESCE($27, recruiter_image),
         is_active = COALESCE($28, is_active),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id`,
    [
      jobId,
      companyId || null,
      title || null,
      category || null,
      location || null,
      jobType || null,
      workMode || null,
      experienceLevel || null,
      salaryMin || null,
      salaryMax || null,
      salaryCurrency || null,
      salaryLabel || null,
      openings || null,
      description || null,
      education || null,
      responsibilities || null,
      skills || null,
      preferredQualifications || null,
      hiringStages || null,
      currentStage ?? null,
      benefits ? JSON.stringify(benefits) : null,
      applicantsCount ?? null,
      urgency || null,
      deadline || null,
      recruiterName || null,
      recruiterRole || null,
      recruiterImage || null,
      typeof isActive === "boolean" ? isActive : null,
    ]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return findJobById(jobId);
};

const deleteJob = async (jobId) => {
  const result = await pool.query(
    `UPDATE jobs
     SET is_active = FALSE,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id`,
    [jobId]
  );

  return result.rows[0] || null;
};

module.exports = {
  listJobs,
  findJobById,
  createJob,
  updateJob,
  deleteJob,
};
