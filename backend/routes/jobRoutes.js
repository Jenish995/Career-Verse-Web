const express = require("express");
const router = express.Router();
const {
  getJobs,
  getJobById,
  createNewJob,
  updateExistingJob,
  deleteExistingJob,
} = require("../controller/jobController");

router.get("/", getJobs);
router.get("/:id", getJobById);
router.post("/", createNewJob);
router.put("/:id", updateExistingJob);
router.delete("/:id", deleteExistingJob);

module.exports = router;
