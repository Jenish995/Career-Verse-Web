const express = require("express");
const router = express.Router();
const {
  getApplicationStatus,
  getCandidateApplications,
  applyToJob,
} = require("../controller/applicationController");

router.get("/check", getApplicationStatus);
router.get("/candidate/:candidateId", getCandidateApplications);
router.post("/", applyToJob);

module.exports = router;
