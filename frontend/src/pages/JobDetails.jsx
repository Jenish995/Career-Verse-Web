import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import JobDetailsContent from "../components/JobDetailsContent";
import { getJobById, mapJobDetails } from "../services/jobs";
import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await getJobById(id);
        setJob(mapJobDetails(data.job));
      } catch (err) {
        setError(err.message || "Unable to fetch job details");
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id]);

  return (
    <div className="job-details-page-wrapper">
      <Navbar />
      <main className="job-details-main container">
        {isLoading ? (
          <div className="loading-state">Loading job details...</div>
        ) : error ? (
          <div className="loading-state">{error}</div>
        ) : job ? (
          <JobDetailsContent job={job} />
        ) : (
          <div className="loading-state">Job not found</div>
        )}
      </main>
    </div>
  );
};

export default JobDetails;
