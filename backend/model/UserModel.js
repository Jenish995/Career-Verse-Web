 pool = require("../database/db");

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, email, password_hash, role, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
};

const findCandidateByUserId = async (userId) => {
  const candidateResult = await pool.query(
    `SELECT user_id, full_name, bio, location, phone, avatar_url, banner_url, updated_at
     FROM candidates
     WHERE user_id = $1`,
    [userId],
  );

  const candidate = candidateResult.rows[0];

  if (!candidate) {
    return null;
  }

  const skillsResult = await pool.query(
    `SELECT id, skill_name
     FROM candidate_skills
     WHERE candidate_id = $1
     ORDER BY skill_name ASC`,
    [userId],
  );

  const experienceResult = await pool.query(
    `SELECT id, role, company_name, period, description, created_at
     FROM candidate_experience
     WHERE candidate_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return {
    ...candidate,
    skills: skillsResult.rows,
    experience: experienceResult.rows,
  };
};

const findRecruiterByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT
       r.user_id,
       r.company_id,
       r.full_name,
       r.job_title,
       r.phone,
       r.avatar_url,
       r.updated_at,
       u.email,
       c.company_name,
       c.logo_url,
       c.banner_url,
       c.location,
       c.website,
       c.description,
       c.industry,
       c.size,
       c.founded
     FROM recruiters r
     INNER JOIN users u ON u.id = r.user_id
     LEFT JOIN companies c ON c.id = r.company_id
     WHERE r.user_id = $1`,
    [userId],
  );

  return result.rows[0] || null;
};

const createUserWithProfile = async ({
  email,
  passwordHash,
  role,
  fullName,
  companyName,
  companyLocation,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at, updated_at`,
      [email, passwordHash, role],
    );

    const user = userResult.rows[0];

    if (role === "candidate") {
      const candidateResult = await client.query(
        `INSERT INTO candidates (user_id, full_name)
         VALUES ($1, $2)
         RETURNING user_id, full_name, bio, location, phone, avatar_url, banner_url, updated_at`,
        [user.id, fullName],
      );

      await client.query("COMMIT");
      return {
        user,
        profile: {
          ...candidateResult.rows[0],
          skills: [],
          experience: [],
        },
      };
    }

    const normalizedCompanyName = companyName.trim();
    const existingCompanyResult = await client.query(
      `SELECT id, company_name, logo_url, banner_url, location, website, description, industry, size, founded, created_at
       FROM companies
       WHERE company_name = $1`,
      [normalizedCompanyName],
    );

    let company = existingCompanyResult.rows[0];

    if (!company) {
      const companyResult = await client.query(
        `INSERT INTO companies (company_name, location)
         VALUES ($1, $2)
         RETURNING id, company_name, logo_url, banner_url, location, website, description, industry, size, founded, created_at`,
        [normalizedCompanyName, companyLocation || null],
      );

      company = companyResult.rows[0];
    }

    const recruiterResult = await client.query(
      `INSERT INTO recruiters (user_id, company_id, full_name)
       VALUES ($1, $2, $3)
       RETURNING user_id, company_id, full_name, job_title, phone, avatar_url, updated_at`,
      [user.id, company.id, fullName],
    );

    await client.query("COMMIT");
    return {
      user,
      profile: {
        ...recruiterResult.rows[0],
        email: user.email,
        company_name: company.company_name,
        logo_url: company.logo_url,
        banner_url: company.banner_url,
        location: company.location,
        website: company.website,
        description: company.description,
        industry: company.industry,
        size: company.size,
        founded: company.founded,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateCandidateProfile = async (userId, payload) => {
  const {
    fullName,
    bio,
    location,
    phone,
    avatarUrl,
    bannerUrl,
    skills = [],
    experience = [],
  } = payload;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const candidateCheck = await client.query(
      `SELECT user_id FROM candidates WHERE user_id = $1`,
      [userId],
    );

    if (candidateCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `UPDATE candidates
       SET full_name = COALESCE($2, full_name),
           bio = COALESCE($3, bio),
           location = COALESCE($4, location),
           phone = COALESCE($5, phone),
           avatar_url = COALESCE($6, avatar_url),
           banner_url = COALESCE($7, banner_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [
        userId,
        fullName || null,
        bio || null,
        location || null,
        phone || null,
        avatarUrl || null,
        bannerUrl || null,
      ],
    );

    await client.query(`DELETE FROM candidate_skills WHERE candidate_id = $1`, [
      userId,
    ]);

    const normalizedSkills = skills
      .map((skill) => skill?.trim())
      .filter(Boolean);

    for (const skill of normalizedSkills) {
      await client.query(
        `INSERT INTO candidate_skills (candidate_id, skill_name)
         VALUES ($1, $2)
         ON CONFLICT (candidate_id, skill_name) DO NOTHING`,
        [userId, skill],
      );
    }

    await client.query(
      `DELETE FROM candidate_experience WHERE candidate_id = $1`,
      [userId],
    );

    const normalizedExperience = experience.filter(
      (item) => item && item.role?.trim() && item.company_name?.trim(),
    );

    for (const item of normalizedExperience) {
      await client.query(
        `INSERT INTO candidate_experience (candidate_id, role, company_name, period, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          item.role.trim(),
          item.company_name.trim(),
          item.period?.trim() || null,
          item.description?.trim() || null,
        ],
      );
    }

    await client.query("COMMIT");
    return findCandidateByUserId(userId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateRecruiterProfile = async (userId, payload) => {
  const {
    fullName,
    jobTitle,
    phone,
    avatarUrl,
    companyName,
    logoUrl,
    bannerUrl,
    location,
    website,
    description,
    industry,
    size,
    founded,
  } = payload;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const recruiterLookup = await client.query(
      `SELECT company_id FROM recruiters WHERE user_id = $1`,
      [userId],
    );

    if (recruiterLookup.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const { company_id: companyId } = recruiterLookup.rows[0];

    const recruiterResult = await client.query(
      `UPDATE recruiters
       SET full_name = COALESCE($2, full_name),
           job_title = COALESCE($3, job_title),
           phone = COALESCE($4, phone),
           avatar_url = COALESCE($5, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING user_id, company_id, full_name, job_title, phone, avatar_url, updated_at`,
      [
        userId,
        fullName || null,
        jobTitle || null,
        phone || null,
        avatarUrl || null,
      ],
    );

    const companyResult = await client.query(
      `UPDATE companies
       SET company_name = COALESCE($2, company_name),
           logo_url = COALESCE($3, logo_url),
           banner_url = COALESCE($4, banner_url),
           location = COALESCE($5, location),
           website = COALESCE($6, website),
           description = COALESCE($7, description),
           industry = COALESCE($8, industry),
           size = COALESCE($9, size),
           founded = COALESCE($10, founded)
       WHERE id = $1
       RETURNING id, company_name, logo_url, banner_url, location, website, description, industry, size, founded`,
      [
        companyId,
        companyName || null,
        logoUrl || null,
        bannerUrl || null,
        location || null,
        website || null,
        description || null,
        industry || null,
        size || null,
        founded || null,
      ],
    );

    const userResult = await client.query(
      `SELECT email FROM users WHERE id = $1`,
      [userId],
    );

    await client.query("COMMIT");

    const recruiter = recruiterResult.rows[0];
    const company = companyResult.rows[0];
    const user = userResult.rows[0];

    return {
      ...recruiter,
      email: user?.email || null,
      company_name: company?.company_name || null,
      logo_url: company?.logo_url || null,
      banner_url: company?.banner_url || null,
      location: company?.location || null,
      website: company?.website || null,
      description: company?.description || null,
      industry: company?.industry || null,
      size: company?.size || null,
      founded: company?.founded || null,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  findUserByEmail,
  findCandidateByUserId,
  findRecruiterByUserId,
  createUserWithProfile,
  updateCandidateProfile,
  updateRecruiterProfile,
};
