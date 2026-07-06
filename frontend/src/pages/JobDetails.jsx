import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import JobDetailsContent from "../components/JobDetailsContent";
import { uploadResume } from "../services/auth";
import { applyToJob, getApplicationStatus } from "../services/applications";
import { getJobById, mapJobDetails } from "../services/jobs";
import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = useMemo(() => {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  }, []);

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [applicationStatus, setApplicationStatus] = useState({
    checked: false,
    applied: false,
    application: null,
  });

  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true);
      setError("");
      setApplicationError("");
      setApplicationMessage("");

      try {
        const requests = [getJobById(id)];

        if (storedUser?.role === "candidate") {
          requests.push(getApplicationStatus(id, storedUser.id));
        }

        const [jobData, statusData] = await Promise.all(requests);
        setJob(mapJobDetails(jobData.job));
        setApplicationStatus({
          checked: true,
          applied: Boolean(statusData?.applied),
          application: statusData?.application || null,
        });
      } catch (err) {
        setError(err.message || "Unable to fetch job details");
        setApplicationStatus({
          checked: true,
          applied: false,
          application: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id, storedUser]);

  const handleApply = async ({ resumeFile, coverLetter }) => {
    if (!storedUser) {
      navigate("/login");
      return false;
    }

    if (storedUser.role !== "candidate") {
      setApplicationMessage("");
      setApplicationError("Only candidates can apply to jobs.");
      return false;
    }

    setApplicationMessage("");
    setApplicationError("");
    setIsApplying(true);

    try {
      let resumeUrl = null;

      if (resumeFile) {
        const uploadResult = await uploadResume(resumeFile);
        resumeUrl = uploadResult.url;
      }

      const data = await applyToJob({
        jobId: id,
        candidateId: storedUser.id,
        resumeUrl,
        coverLetter,
      });

      setApplicationStatus({
        checked: true,
        applied: true,
        application: data.application,
      });
      setApplicationMessage(
        data.message || "Application submitted successfully",
      );
      setJob((prevJob) => {
        if (!prevJob) {
          return prevJob;
        }

        return {
          ...prevJob,
          sidebarData: {
            ...prevJob.sidebarData,
            applicantsCount: (prevJob.sidebarData?.applicantsCount || 0) + 1,
          },
        };
      });

      return true;
    } catch (err) {
      if (storedUser?.role === "candidate") {
        try {
          const statusData = await getApplicationStatus(id, storedUser.id);
          setApplicationStatus({
            checked: true,
            applied: Boolean(statusData.applied),
            application: statusData.application || null,
          });
        } catch {
          // keep original error message below
        }
      }

      setApplicationMessage("");
      setApplicationError(err.message || "Unable to submit application");
      return false;
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="job-details-page-wrapper">
      <Navbar />
      <main className="job-details-main container">
        {isLoading ? (
          <div className="loading-state">Loading job details...</div>
        ) : error ? (
          <div className="loading-state">{error}</div>
        ) : job ? (
          <JobDetailsContent
            job={job}
            currentUser={storedUser}
            hasApplied={applicationStatus.applied}
            application={applicationStatus.application}
            isApplying={isApplying}
            applicationMessage={applicationMessage}
            applicationError={applicationError}
            onApply={handleApply}
            onRequestLogin={() => navigate("/login")}
          />
        ) : (
          <div className="loading-state">Job not found</div>
        )}
      </main>
    </div>
  );
};

export default JobDetails;
