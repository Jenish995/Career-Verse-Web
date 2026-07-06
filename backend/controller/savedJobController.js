const {
  listSavedJobsByUserId,
  findSavedJob,
  createSavedJob,
  deleteSavedJob,
} = require("../model/SavedJobModel");

const getSavedJobsByUser = async (req, res) => {
  try {
    const savedJobs = await listSavedJobsByUserId(req.params.userId);
    return res.status(200).json({ savedJobs });
  } catch (error) {
    console.error("Get saved jobs error:", error.message);
    return res.status(500).json({ message: "Server error while fetching saved jobs" });
  }
};

const getSavedJobStatus = async (req, res) => {
  const { userId, jobId } = req.query;

  if (!userId || !jobId) {
    return res.status(400).json({ message: "userId and jobId are required" });
  }

  try {
    const savedJob = await findSavedJob(userId, jobId);
    return res.status(200).json({
      saved: Boolean(savedJob),
      savedJob: savedJob || null,
    });
  } catch (error) {
    console.error("Get saved job status error:", error.message);
    return res.status(500).json({ message: "Server error while fetching saved job status" });
  }
};

const saveJob = async (req, res) => {
  const { userId, jobId } = req.body;

  if (!userId || !jobId) {
    return res.status(400).json({ message: "userId and jobId are required" });
  }

  try {
    const savedJob = await createSavedJob({ userId, jobId });
    return res.status(201).json({
      message: "Job saved successfully",
      savedJob,
    });
  } catch (error) {
    console.error("Save job error:", error.message);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    return res.status(500).json({ message: "Server error while saving job" });
  }
};

const unsaveJob = async (req, res) => {
  const userId = req.query.userId || req.body.userId;
  const jobId = req.query.jobId || req.body.jobId;

  if (!userId || !jobId) {
    return res.status(400).json({ message: "userId and jobId are required" });
  }

  try {
    const result = await deleteSavedJob({ userId, jobId });

    if (!result) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    return res.status(200).json({ message: "Job removed from saved jobs successfully" });
  } catch (error) {
    console.error("Unsave job error:", error.message);
    return res.status(500).json({ message: "Server error while removing saved job" });
  }
};

module.exports = {
  getSavedJobsByUser,
  getSavedJobStatus,
  saveJob,
  unsaveJob,
};
