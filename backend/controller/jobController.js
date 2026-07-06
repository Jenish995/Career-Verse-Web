const {
  listJobs,
  findJobById,
  createJob,
  updateJob,
  deleteJob,
} = require("../model/JobModel");
const { createNotificationsForAllCandidates } = require("../model/NotificationModel");

const getJobs = async (req, res) => {
  try {
    const limit = req.query.limit ? Number.parseInt(req.query.limit, 10) : null;
    const sortBy = req.query.sortBy === "salary" ? "salary" : "newest";
    const companyId = req.query.companyId || null;
    const jobs = await listJobs({ limit, sortBy, companyId });

    return res.status(200).json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error.message);
    return res.status(500).json({ message: "Server error while fetching jobs" });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await findJobById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ job });
  } catch (error) {
    console.error("Get job details error:", error.message);
    return res.status(500).json({ message: "Server error while fetching job details" });
  }
};

const createNewJob = async (req, res) => {
  const { companyId, title, location, jobType, workMode, experienceLevel, description } = req.body;

  if (!companyId || !title || !location || !jobType || !workMode || !experienceLevel || !description) {
    return res.status(400).json({ message: "Missing required job fields" });
  }

  try {
    const job = await createJob(req.body);

    // Fan-out: notify all candidates about the new job (non-blocking)
    const notifTitle = "New Job Posted";
    const companyDisplay = job.company_name || "A company";
    const notifMessage = `${companyDisplay} just posted a new ${job.title} position. Check it out!`;
    createNotificationsForAllCandidates(job.id, notifTitle, notifMessage).catch((err) =>
      console.error("Notification fan-out error:", err.message)
    );

    return res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    console.error("Create job error:", error.message);
    return res.status(500).json({ message: "Server error while creating job" });
  }
};

const updateExistingJob = async (req, res) => {
  try {
    const job = await updateJob(req.params.id, {
      ...req.body,
      expectedCompanyId: req.body.companyId || req.query.companyId,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job updated successfully", job });
  } catch (error) {
    console.error("Update job error:", error.message);
    return res.status(500).json({ message: "Server error while updating job" });
  }
};

const deleteExistingJob = async (req, res) => {
  try {
    const result = await deleteJob(req.params.id, req.query.companyId);

    if (!result) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error.message);
    return res.status(500).json({ message: "Server error while deleting job" });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createNewJob,
  updateExistingJob,
  deleteExistingJob,
};
