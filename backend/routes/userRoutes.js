const express = require("express");
const router = express.Router();
const {
  findCandidateByUserId,
  findRecruiterByUserId,
  updateCandidateProfile,
  updateRecruiterProfile,
} = require("../model/UserModel");

router.get("/:userId/profile", async (req, res) => {
  try {
    const profile = await findCandidateByUserId(req.params.userId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("Fetch profile error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while fetching profile" });
  }
});

router.put("/:userId/profile", async (req, res) => {
  try {
    const profile = await updateCandidateProfile(req.params.userId, req.body);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({
      message: "Candidate profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update candidate profile error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while updating profile" });
  }
});

router.get("/:userId/recruiter-profile", async (req, res) => {
  try {
    const profile = await findRecruiterByUserId(req.params.userId);

    if (!profile) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("Fetch recruiter profile error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while fetching recruiter profile" });
  }
});

router.put("/:userId/recruiter-profile", async (req, res) => {
  try {
    const profile = await updateRecruiterProfile(req.params.userId, req.body);

    if (!profile) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    return res.status(200).json({
      message: "Recruiter profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update recruiter profile error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while updating recruiter profile" });
  }
});

module.exports = router;
