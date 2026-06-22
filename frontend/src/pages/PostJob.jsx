import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRecruiterProfile } from "../services/auth";
import { createJob, getJobById, updateJob } from "../services/jobs";
import "./Profile.css";
import "./PostJob.css";

const emptyForm = {
  title: "",
  category: "",
  location: "",
  jobType: "Full-time",
  workMode: "On-site",
  experienceLevel: "Entry Level",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "USD",
  openings: "1",
  deadline: "",
  urgency: "Medium",
  description: "",
  education: "",
  responsibilities: "",
  skills: "",
  preferredQualifications: "",
  hiringStages: "",
  benefits: "",
};

const splitList = (value) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const listToText = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => (typeof item === "string" ? item : item?.label))
        .filter(Boolean)
        .join(", ")
    : "";

const formatDateInput = (dateString) => {
  if (!dateString) {
    return "";
  }

  return new Date(dateString).toISOString().slice(0, 10);
};

const mapJobToForm = (job) => ({
  title: job.title || "",
  category: job.category || "",
  location: job.location || "",
  jobType: job.job_type || "Full-time",
  workMode: job.work_mode || "On-site",
  experienceLevel: job.experience_level || "Entry Level",
  salaryMin: job.salary_min || "",
  salaryMax: job.salary_max || "",
  salaryCurrency: job.salary_currency || "USD",
  openings: job.openings || "1",
  deadline: formatDateInput(job.deadline),
  urgency: job.urgency || "Medium",
  description: job.description || "",
  education: job.education || "",
  responsibilities: listToText(job.responsibilities),
  skills: listToText(job.skills),
  preferredQualifications: listToText(job.preferred_qualifications),
  hiringStages: listToText(job.hiring_stages),
  benefits: listToText(job.benefits),
});

const PostJob = () => {
  const navigate = useNavigate();
  const { id: editJobId } = useParams();
  const isEditMode = Boolean(editJobId);
  const storedUser = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadRecruiter = async () => {
      if (!storedUser?.id || storedUser.role !== "recruiter") {
        setError("Only recruiters can post jobs.");
        setIsLoading(false);
        return;
      }

      try {
        const [profileData, jobData] = await Promise.all([
          getRecruiterProfile(storedUser.id),
          isEditMode ? getJobById(editJobId) : Promise.resolve(null),
        ]);

        setProfile(profileData.profile);

        if (jobData?.job) {
          if (jobData.job.company_id !== profileData.profile.company_id) {
            setError("You can only edit jobs posted by your company.");
            return;
          }

          setFormData(mapJobToForm(jobData.job));
          return;
        }

        setFormData((prev) => ({
          ...prev,
          location: profileData.profile.location || "",
        }));
      } catch (err) {
        setError(err.message || "Unable to load recruiter job details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecruiter();
  }, [editJobId, isEditMode, storedUser?.id, storedUser?.role]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!profile?.company_id) {
      setError("Complete your recruiter company profile before posting a job.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      companyId: profile.company_id,
      title: formData.title.trim(),
      category: formData.category.trim(),
      location: formData.location.trim(),
      jobType: formData.jobType,
      workMode: formData.workMode,
      experienceLevel: formData.experienceLevel,
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
      salaryCurrency: formData.salaryCurrency.trim() || "USD",
      openings: formData.openings ? Number(formData.openings) : 1,
      deadline: formData.deadline || null,
      urgency: formData.urgency,
      description: formData.description.trim(),
      education: formData.education.trim(),
      responsibilities: splitList(formData.responsibilities),
      skills: splitList(formData.skills),
      preferredQualifications: splitList(formData.preferredQualifications),
      hiringStages: splitList(formData.hiringStages),
      benefits: splitList(formData.benefits).map((label) => ({
        label,
        icon: "bx-check-circle",
      })),
      recruiterName: profile.full_name,
      recruiterRole: profile.job_title,
      recruiterImage: profile.avatar_url,
    };

    try {
      const data = isEditMode
        ? await updateJob(editJobId, payload)
        : await createJob(payload);
      setSuccess(isEditMode ? "Job updated successfully." : "Job posted successfully.");
      navigate(`/job/${data.job.id}`);
    } catch (err) {
      setError(err.message || "Unable to post job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPost = profile?.company_id;

  return (
    <div className="profile-page-wrapper">
      <Navbar />
      <main className="profile-main container post-job-page">
        <div className="post-job-header">
          <div>
            <p className="post-job-eyebrow">Recruiter tools</p>
            <h1>{isEditMode ? "Edit Job" : "Post a Job"}</h1>
            <p>
              {isEditMode ? "Update this role for" : "Publish a role for"}{" "}
              {profile?.company_name || "your company"} and keep candidates
              looking at the latest details.
            </p>
          </div>
          <Link className="btn btn-outline" to="/recruiter/jobs">
            <i className="bx bx-list-ul"></i> My Jobs
          </Link>
        </div>

        {error ? <p className="auth-message auth-error">{error}</p> : null}
        {success ? <p className="auth-message auth-success">{success}</p> : null}

        {isLoading ? (
          <section className="profile-section-card">
            <p>Loading recruiter details...</p>
          </section>
        ) : !canPost ? (
          <section className="profile-section-card post-job-empty">
            <i className="bx bx-info-circle"></i>
            <h2>Finish your company profile first</h2>
            <p>
              A job needs to be connected to a recruiter company before it can
              be published.
            </p>
            <Link className="btn btn-primary" to="/recruiter-profile">
              Complete Profile
            </Link>
          </section>
        ) : (
          <form className="post-job-form" onSubmit={handleSubmit}>
            <section className="profile-section-card">
              <h3>Role Details</h3>
              <div className="post-job-grid">
                <label className="post-job-full">
                  Job Title
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Frontend Developer"
                    required
                  />
                </label>
                <label>
                  Category
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Engineering"
                  />
                </label>
                <label>
                  Location
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Kathmandu or Remote"
                    required
                  />
                </label>
                <label>
                  Job Type
                  <select name="jobType" value={formData.jobType} onChange={handleChange}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                    <option>Freelance</option>
                  </select>
                </label>
                <label>
                  Work Mode
                  <select name="workMode" value={formData.workMode} onChange={handleChange}>
                    <option>On-site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </label>
                <label>
                  Experience Level
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                  >
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                    <option>Lead</option>
                    <option>Manager</option>
                  </select>
                </label>
                <label>
                  Openings
                  <input
                    type="number"
                    min="1"
                    name="openings"
                    value={formData.openings}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Deadline
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Urgency
                  <select name="urgency" value={formData.urgency} onChange={handleChange}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="profile-section-card">
              <h3>Compensation</h3>
              <div className="post-job-grid">
                <label>
                  Minimum Salary
                  <input
                    type="number"
                    min="0"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="40000"
                  />
                </label>
                <label>
                  Maximum Salary
                  <input
                    type="number"
                    min="0"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="70000"
                  />
                </label>
                <label>
                  Currency
                  <input
                    name="salaryCurrency"
                    value={formData.salaryCurrency}
                    onChange={handleChange}
                    maxLength="3"
                  />
                </label>
              </div>
            </section>

            <section className="profile-section-card">
              <h3>Job Description</h3>
              <div className="post-job-grid">
                <label className="post-job-full">
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="7"
                    placeholder="Describe the role, team, and impact."
                    required
                  />
                </label>
                <label className="post-job-full">
                  Education
                  <input
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="Bachelor's degree or equivalent experience"
                  />
                </label>
                <label>
                  Skills
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    rows="5"
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </label>
                <label>
                  Responsibilities
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Build UI features, Review pull requests"
                  />
                </label>
                <label>
                  Preferred Qualifications
                  <textarea
                    name="preferredQualifications"
                    value={formData.preferredQualifications}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Experience with design systems"
                  />
                </label>
                <label>
                  Benefits
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Health insurance, Flexible hours"
                  />
                </label>
                <label className="post-job-full">
                  Hiring Stages
                  <input
                    name="hiringStages"
                    value={formData.hiringStages}
                    onChange={handleChange}
                    placeholder="Application Review, Technical Interview, Final Interview"
                  />
                </label>
              </div>
            </section>

            <div className="post-job-actions">
              <Link className="btn btn-outline" to="/recruiter/jobs">
                Cancel
              </Link>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Posting..."
                  : isEditMode
                    ? "Save Changes"
                    : "Post Job"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default PostJob;
