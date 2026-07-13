const {
  findApplicationByJobAndCandidate,
  listApplicationsByCandidate,
  createApplication,
  listApplicationsByJob,
  updateApplicationStatus: updateApplicationStatusModel,
} = require("../model/ApplicationModel");

const { createNotificationForUser } = require("../model/NotificationModel");
const pool = require("../database/db");

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

const getJobApplications = async (req, res) => {
  const { jobId } = req.params;

  try {
    const applications = await listApplicationsByJob(jobId);
    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Get job applications error:", error.message);
    return res.status(500).json({ message: "Server error while fetching job applications" });
  }
};

const updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  const validStatuses = ["applied", "reviewing", "interviewing", "offered", "rejected", "withdrawn"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const application = await updateApplicationStatusModel(applicationId, status);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Fetch job title so we can compose a meaningful notification message
    const jobResult = await pool.query(
      `SELECT title FROM jobs WHERE id = $1`,
      [application.job_id]
    );
    const jobTitle = jobResult.rows[0]?.title || "your applied job";

    // Build a friendly status label
    const statusLabels = {
      applied: "Applied",
      reviewing: "Under Review",
      interviewing: "Invited for Interview",
      offered: "Offered",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
    };
    const statusLabel = statusLabels[status] || status;

    const notificationTitle = `Application Status Update`;
    const notificationMessage = `Your application for "${jobTitle}" has been updated to: ${statusLabel}.`;

    // Send notification to the candidate (fire-and-forget, don't block the response)
    createNotificationForUser(
      application.candidate_id,
      application.job_id,
      notificationTitle,
      notificationMessage
    ).catch((err) => console.error("Failed to send status notification:", err.message));

    return res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update application status error:", error.message);
    return res.status(500).json({ message: "Server error while updating application status" });
  }
};

module.exports = {
  getApplicationStatus,
  getCandidateApplications,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
};
