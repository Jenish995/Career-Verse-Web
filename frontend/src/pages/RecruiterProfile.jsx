import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Profile.css";
import "./RecruiterProfile.css";
import {
  getRecruiterProfile,
  persistProfile,
  updateRecruiterProfile,
  uploadImage,
} from "../services/auth";

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000";
const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/281/281764.png";
const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='100%' height='100%'><rect width='24' height='24' fill='%23e2e8f0'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%2394a3b8'/></svg>";

const emptyForm = {
  fullName: "",
  jobTitle: "",
  phone: "",
  avatarUrl: "",
  companyName: "",
  logoUrl: "",
  bannerUrl: "",
  location: "",
  website: "",
  description: "",
  industry: "",
  size: "",
  founded: "",
};

const RecruiterProfile = () => {
  const storedUser = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const avatarInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const avatarInputId = `recruiter-avatar-upload-${storedUser?.id || "new"}`;
  const logoInputId = `recruiter-logo-upload-${storedUser?.id || "new"}`;
  const bannerInputId = `recruiter-banner-upload-${storedUser?.id || "new"}`;

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!storedUser?.id) {
        setError("No logged in recruiter found");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getRecruiterProfile(storedUser.id);
        setProfile(data.profile);
        setFormData({
          fullName: data.profile.full_name || "",
          jobTitle: data.profile.job_title || "",
          phone: data.profile.phone || "",
          avatarUrl: data.profile.avatar_url || "",
          companyName: data.profile.company_name || "",
          logoUrl: data.profile.logo_url || "",
          bannerUrl: data.profile.banner_url || "",
          location: data.profile.location || "",
          website: data.profile.website || "",
          description: data.profile.description || "",
          industry: data.profile.industry || "",
          size: data.profile.size || "",
          founded: data.profile.founded || "",
        });
      } catch (err) {
        setError(err.message || "Unable to load recruiter profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [storedUser?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = async (fieldName, file) => {
    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      const data = await uploadImage(file);
      setFormData((prev) => ({ ...prev, [fieldName]: data.url }));
    } catch {
      setError("Unable to upload selected image");
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = (fieldName, inputRef) => {
    setFormData((prev) => ({ ...prev, [fieldName]: "" }));
    if (inputRef?.current) {
      inputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!storedUser?.id) {
      setError("No logged in recruiter found");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = await updateRecruiterProfile(storedUser.id, formData);
      setProfile(data.profile);
      persistProfile(data.profile);
      setIsEditing(false);
      setSuccess("Recruiter profile updated successfully");
    } catch (err) {
      setError(err.message || "Unable to update recruiter profile");
    } finally {
      setIsSaving(false);
    }
  };

  const display = profile || {};
  const headerBanner = isEditing
    ? formData.bannerUrl || display.banner_url
    : display.banner_url;
  const headerLogo = isEditing
    ? formData.logoUrl || display.logo_url
    : display.logo_url;
  const headerCompanyName = isEditing
    ? formData.companyName || display.company_name
    : display.company_name;
  const headerRecruiterName = isEditing
    ? formData.fullName || display.full_name
    : display.full_name;
  const headerRecruiterTitle = isEditing
    ? formData.jobTitle || display.job_title
    : display.job_title;
  const headerRecruiterAvatar = isEditing
    ? formData.avatarUrl || display.avatar_url
    : display.avatar_url;

  return (
    <div className="profile-page-wrapper">
      <Navbar />
      <main className="profile-main container">
        {error ? <p className="auth-message auth-error">{error}</p> : null}
        {success ? (
          <p className="auth-message auth-success">{success}</p>
        ) : null}

        {isLoading ? (
          <section className="profile-section-card">
            <p>Loading recruiter profile...</p>
          </section>
        ) : (
          <>
            <section className="profile-header-card">
              <div
                className="profile-banner"
                style={{
                  backgroundImage: `url(${headerBanner || DEFAULT_BANNER})`,
                }}
              ></div>
              <div className="profile-header-content">
                <div className="profile-avatar-wrapper">
                  <img
                    src={headerLogo || DEFAULT_LOGO}
                    alt={headerCompanyName || "Recruiter company"}
                    className="profile-avatar company-logo-profile"
                  />
                </div>
                <div className="profile-title-info">
                  <h1>{headerCompanyName || "Your Company"}</h1>
                  <div className="recruiter-header-meta">
                    <img
                      src={headerRecruiterAvatar || DEFAULT_AVATAR}
                      alt={headerRecruiterName || "Recruiter"}
                      className="recruiter-mini-avatar"
                    />
                    <p className="profile-role">
                      Managed by{" "}
                      <strong>{headerRecruiterName || "Recruiter"}</strong>
                      {headerRecruiterTitle ? ` • ${headerRecruiterTitle}` : ""}
                    </p>
                  </div>
                </div>
                <div className="profile-header-actions">
                  <Link className="btn btn-primary" to="/post-job">
                    <i className="bx bx-plus"></i> Post a Job
                  </Link>
                  <Link
                    className="btn btn-outline"
                    to="/recruiter/jobs"
                    style={{ marginLeft: "10px" }}
                  >
                    <i className="bx bx-list-ul"></i> My Jobs
                  </Link>
                  <button
                    className="btn btn-outline"
                    style={{ marginLeft: "10px" }}
                    onClick={() => setIsEditing((prev) => !prev)}
                  >
                    <i className="bx bx-edit-alt"></i>{" "}
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>
              </div>
            </section>

            <div className="profile-grid">
              <div className="profile-content-left">
                <section className="profile-section-card">
                  <h3>About the Company</h3>
                  {isEditing ? (
                    <textarea
                      className="profile-textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="6"
                    />
                  ) : (
                    <p className="text-content">
                      {display.description ||
                        "Add a company description to tell candidates about your organization."}
                    </p>
                  )}
                </section>

                <section className="profile-section-card">
                  <div className="section-header-flex">
                    <h3>Recruiter Information</h3>
                  </div>

                  <div className="recruiter-form-grid">
                    <label>
                      Recruiter Name
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>
                    <label>
                      Job Title
                      <input
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>
                    <label>
                      Phone
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>
                    <div className="recruiter-form-field">
                      <span className="field-label">
                        Recruiter Profile Image
                      </span>
                      <input
                        ref={avatarInputRef}
                        id={avatarInputId}
                        type="file"
                        accept="image/*"
                        className="hidden-file-input"
                        onChange={(event) =>
                          handleImageFileChange(
                            "avatarUrl",
                            event.target.files?.[0],
                          )
                        }
                        disabled={!isEditing || isUploading}
                      />
                      <div className="file-action-row">
                        <label
                          htmlFor={avatarInputId}
                          className={`btn btn-outline file-picker-button ${!isEditing || isUploading ? "disabled" : ""}`}
                          aria-disabled={!isEditing || isUploading}
                        >
                          {isUploading ? "Uploading..." : "Choose from device"}
                        </label>
                        {formData.avatarUrl ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() =>
                              clearImage("avatarUrl", avatarInputRef)
                            }
                            disabled={!isEditing}
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="profile-section-card">
                  <h3>Company Information</h3>
                  <div className="recruiter-form-grid">
                    <label>
                      Company Name
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>
                    <label>
                      Company Location
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>
                    <label>
                      Website
                      <input
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>
                    <label>
                      Industry
                      <input
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>
                    <label>
                      Company Size
                      <input
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>
                    <label>
                      Founded
                      <input
                        name="founded"
                        value={formData.founded}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </label>
                    <div className="recruiter-form-field">
                      <span className="field-label">Company Logo</span>
                      <input
                        ref={logoInputRef}
                        id={logoInputId}
                        type="file"
                        accept="image/*"
                        className="hidden-file-input"
                        onChange={(event) =>
                          handleImageFileChange(
                            "logoUrl",
                            event.target.files?.[0],
                          )
                        }
                        disabled={!isEditing || isUploading}
                      />
                      <div className="file-action-row">
                        <label
                          htmlFor={logoInputId}
                          className={`btn btn-outline file-picker-button ${!isEditing || isUploading ? "disabled" : ""}`}
                          aria-disabled={!isEditing || isUploading}
                        >
                          {isUploading ? "Uploading..." : "Choose from device"}
                        </label>
                        {formData.logoUrl ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => clearImage("logoUrl", logoInputRef)}
                            disabled={!isEditing}
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="recruiter-form-field">
                      <span className="field-label">Company Banner</span>
                      <input
                        ref={bannerInputRef}
                        id={bannerInputId}
                        type="file"
                        accept="image/*"
                        className="hidden-file-input"
                        onChange={(event) =>
                          handleImageFileChange(
                            "bannerUrl",
                            event.target.files?.[0],
                          )
                        }
                        disabled={!isEditing || isUploading}
                      />
                      <div className="file-action-row">
                        <label
                          htmlFor={bannerInputId}
                          className={`btn btn-outline file-picker-button ${!isEditing || isUploading ? "disabled" : ""}`}
                          aria-disabled={!isEditing || isUploading}
                        >
                          {isUploading ? "Uploading..." : "Choose from device"}
                        </label>
                        {formData.bannerUrl ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() =>
                              clearImage("bannerUrl", bannerInputRef)
                            }
                            disabled={!isEditing}
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <button
                      className="auth-btn recruiter-save-btn"
                      onClick={handleSave}
                      disabled={isSaving || isUploading}
                    >
                      {isSaving
                        ? "Saving..."
                        : isUploading
                          ? "Uploading image..."
                          : "Save Changes"}
                    </button>
                  ) : null}
                </section>
              </div>

              <aside className="profile-sidebar">
                <section className="profile-section-card">
                  <h3>Company Details</h3>
                  <div className="contact-info">
                    <div className="contact-item">
                      <i className="bx bx-envelope"></i>
                      <div>
                        <span className="label">Email</span>
                        <p>
                          {display.email || storedUser?.email || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <i className="bx bx-buildings"></i>
                      <div>
                        <span className="label">Industry</span>
                        <p>{display.industry || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <i className="bx bx-group"></i>
                      <div>
                        <span className="label">Company Size</span>
                        <p>{display.size || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <i className="bx bx-calendar"></i>
                      <div>
                        <span className="label">Founded</span>
                        <p>{display.founded || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <i className="bx bx-map"></i>
                      <div>
                        <span className="label">Location</span>
                        <p>{display.location || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <i className="bx bx-globe"></i>
                      <div>
                        <span className="label">Website</span>
                        <p>
                          {display.website ? (
                            <a
                              href={display.website}
                              target="_blank"
                              rel="noreferrer"
                              className="link"
                            >
                              {display.website.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default RecruiterProfile;
