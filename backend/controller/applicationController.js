const {
  findApplicationByJobAndCandidate,
  listApplicationsByCandidate,
  createApplication,
} = require("../model/ApplicationModel");

const getApplicationStatus = async (req, res) => {
  const { jobId, candidateId } = req.query;

  if (!jobId || !candidateId) {
    return res.status(400).json({ message: "jobId and candidateId are required" });
  }

  try {
    const application = await findApplicationByJobAndCandidate(jobId, candidateId);

    return res.status(200).json({
      applied: Boolean(application),
      application: application || null,
    });
  } catch (error) {
    console.error("Get application status error:", error.message);
    return res.status(500).json({ message: "Server error while fetching application status" });
  }
};

const getCandidateApplications = async (req, res) => {
  try {
    const applications = await listApplicationsByCandidate(req.params.candidateId);
    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Get candidate applications error:", error.message);
    return res.status(500).json({ message: "Server error while fetching applications" });
  }
};

const applyToJob = async (req, res) => {
  const { jobId, candidateId, resumeUrl, coverLetter } = req.body;

  if (!jobId || !candidateId) {
    return res.status(400).json({ message: "jobId and candidateId are required" });
  }

  try {
    const application = await createApplication({
      jobId,
      candidateId,
      resumeUrl,
      coverLetter,
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Apply to job error:", error.message);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    return res.status(500).json({ message: "Server error while applying to job" });
  }
};

module.exports = {
  getApplicationStatus,
  getCandidateApplications,
  applyToJob,
};
