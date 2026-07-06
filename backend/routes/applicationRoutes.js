const express = require("express");
const router = express.Router();
const {
  getApplicationStatus,
  getCandidateApplications,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
} = require("../controller/applicationController");

router.get("/check", getApplicationStatus);
router.get("/candidate/:candidateId", getCandidateApplications);
router.get("/job/:jobId", getJobApplications);
router.post("/", applyToJob);
router.put("/:applicationId/status", updateApplicationStatus);

module.exports = router;
