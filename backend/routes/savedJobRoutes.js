const express = require("express");
const router = express.Router();
const {
  getSavedJobsByUser,
  getSavedJobStatus,
  saveJob,
  unsaveJob,
} = require("../controller/savedJobController");

router.get("/check", getSavedJobStatus);
router.get("/:userId", getSavedJobsByUser);
router.post("/", saveJob);
router.delete("/", unsaveJob);

module.exports = router;
