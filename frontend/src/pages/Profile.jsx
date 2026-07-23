import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getCandidateProfile,
  persistProfile,
  updateCandidateProfile,
  uploadImage,
} from "../services/auth";
import "./Profile.css";
import "./Registration.css";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='100%' height='100%'><rect width='24' height='24' fill='%23e2e8f0'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%2394a3b8'/></svg>";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1518655061766-48c257e899ae?w=1000";

const emptyExperience = {
  role: "",
  company_name: "",
  period: "",
  description: "",
};

const Profile = () => {
  const storedUser = useMemo(() => {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  }, []);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const avatarInputId = `candidate-avatar-upload-${storedUser?.id || "new"}`;
  const bannerInputId = `candidate-banner-upload-${storedUser?.id || "new"}`;

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    location: "",
    phone: "",
    avatarUrl: "",
    bannerUrl: "",
    skillsText: "",
    experience: [emptyExperience],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!storedUser?.id) {
        setError("Authentication failed");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getCandidateProfile(storedUser.id);
        setProfile(data.profile);
        persistProfile(data.profile);
        setFormData({
          fullName: data.profile.full_name || "",
          bio: data.profile.bio || "",
          location: data.profile.location || "",
          phone: data.profile.phone || "",
          avatarUrl: data.profile.avatar_url || "",
          bannerUrl: data.profile.banner_url || "",
          skillsText: (data.profile.skills || [])
            .map((skill) => skill.skill_name)
            .join(", "),
          experience:
            data.profile.experience?.length > 0
              ? data.profile.experience.map((item) => ({
                role: item.role || "",
                company_name: item.company_name || "",
                period: item.period || "",
                description: item.description || "",
              }))
              : [emptyExperience],
        });
      } catch {
        setError("Authentication failed");
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

  const handleExperienceChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
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

  const addExperienceRow = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { ...emptyExperience }],
    }));
  };

  const removeExperienceRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience:
        prev.experience.length === 1
          ? [{ ...emptyExperience }]
          : prev.experience.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSave = async () => {
    if (!storedUser?.id) {
      setError("Authentication failed");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        fullName: formData.fullName,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
        bannerUrl: formData.bannerUrl,
        skills: formData.skillsText.split(",").map((skill) => skill.trim()),
        experience: formData.experience,
      };

      const data = await updateCandidateProfile(storedUser.id, payload);
      setProfile(data.profile);
      persistProfile(data.profile);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch {
      setError("Authentication failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page-wrapper">
        <Navbar />
        <main className="profile-main container">
          <section className="profile-section-card">
            <p>Loading profile...</p>
          </section>
        </main>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-page-wrapper">
        <Navbar />
        <main className="profile-main container">
          <p className="auth-message auth-error">{error}</p>
        </main>
      </div>
    );
  }

  const displayProfile = profile || {};
  const headerBanner = isEditing
    ? formData.bannerUrl || displayProfile.banner_url
    : displayProfile.banner_url;
  const headerAvatar = isEditing
    ? formData.avatarUrl || displayProfile.avatar_url
    : displayProfile.avatar_url;
  const headerName = isEditing
    ? formData.fullName || displayProfile.full_name
    : displayProfile.full_name;

  return (
    <div className="profile-page-wrapper">
      <Navbar />
      <main className="profile-main container">
        {error ? <p className="auth-message auth-error">{error}</p> : null}
        {success ? (
          <p className="auth-message auth-success">{success}</p>
        ) : null}

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
                src={headerAvatar || DEFAULT_AVATAR}
                alt={headerName || "Candidate"}
                className="profile-avatar"
              />
            </div>
            <div className="profile-title-info">
              <h1>{headerName || "Candidate Profile"}</h1>
              <p className="profile-role">
                {storedUser?.email || "No email available"}
              </p>
            </div>
            <div className="profile-header-actions">
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                <i className="bx bx-edit-alt"></i>{" "}
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>
        </section>

        <div className="profile-grid">
          <div className="profile-content-left">
            <section className="profile-section-card">
              <h3>About Me</h3>
              {isEditing ? (
                <div className="profile-form-grid">
                  <label>
                    Full Name
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Location
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </label>
                  <div className="profile-form-field">
                    <span className="field-label">Profile Image</span>
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
                    />
                    <div className="file-action-row">
                      <label
                        htmlFor={avatarInputId}
                        className={`btn btn-outline file-picker-button ${isUploading ? "disabled" : ""}`}
                        aria-disabled={isUploading}
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
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="profile-form-field">
                    <span className="field-label">Banner Image</span>
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
                    />
                    <div className="file-action-row">
                      <label
                        htmlFor={bannerInputId}
                        className={`btn btn-outline file-picker-button ${isUploading ? "disabled" : ""}`}
                        aria-disabled={isUploading}
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
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <label className="profile-form-full">
                    Bio
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="5"
                    />
                  </label>
                  <label className="profile-form-full">
                    Skills (comma separated)
                    <input
                      name="skillsText"
                      value={formData.skillsText}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              ) : (
                <p className="text-content">
                  {displayProfile.bio || "No bio added yet."}
                </p>
              )}
            </section>

            <section className="profile-section-card">
              <div className="section-header-flex">
                <h3>Work Experience</h3>
                {isEditing ? (
                  <button
                    className="btn btn-outline"
                    onClick={addExperienceRow}
                  >
                    Add Experience
                  </button>
                ) : null}
              </div>

              {isEditing ? (
                <div className="experience-editor-list">
                  {formData.experience.map((item, index) => (
                    <div
                      key={index}
                      className="experience-editor-card"
                    >
                      <div className="profile-form-grid">
                        <label>
                          Role
                          <input
                            value={item.role}
                            onChange={(event) =>
                              handleExperienceChange(
                                index,
                                "role",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label>
                          Company
                          <input
                            value={item.company_name}
                            onChange={(event) =>
                              handleExperienceChange(
                                index,
                                "company_name",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label>
                          Period
                          <input
                            value={item.period}
                            onChange={(event) =>
                              handleExperienceChange(
                                index,
                                "period",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label className="profile-form-full">
                          Description
                          <textarea
                            rows="4"
                            value={item.description}
                            onChange={(event) =>
                              handleExperienceChange(
                                index,
                                "description",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      </div>
                      <button
                        className="btn btn-outline profile-remove-btn"
                        onClick={() => removeExperienceRow(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : displayProfile.experience?.length > 0 ? (
                <div className="experience-list">
                  {displayProfile.experience.map((exp) => (
                    <div key={exp.id} className="experience-item">
                      <div className="exp-icon">
                        <i className="bx bx-briefcase"></i>
                      </div>
                      <div className="exp-details">
                        <h4>{exp.role}</h4>
                        <p className="exp-meta">
                          {exp.company_name}
                          {exp.period ? ` • ${exp.period}` : ""}
                        </p>
                        <p className="text-content">
                          {exp.description || "No description added."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-content">No experience added yet.</p>
              )}
            </section>

            {isEditing ? (
              <button
                className="auth-btn profile-save-btn"
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
          </div>

          <aside className="profile-sidebar">
            <section className="profile-section-card">
              <h3>Contact Details</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="bx bx-envelope"></i>
                  <span>{storedUser?.email || "No email available"}</span>
                </div>
                <div className="contact-item">
                  <i className="bx bx-map"></i>
                  <span>{displayProfile.location || "Location not added"}</span>
                </div>
                <div className="contact-item">
                  <i className="bx bx-phone"></i>
                  <span>{displayProfile.phone || "Phone not added"}</span>
                </div>
              </div>
            </section>

            <section className="profile-section-card">
              <h3>Skills</h3>
              <div className="skill-tags">
                {displayProfile.skills?.length > 0 ? (
                  displayProfile.skills.map((skill) => (
                    <span key={skill.id || skill.skill_name} className="tag">
                      {skill.skill_name}
                    </span>
                  ))
                ) : (
                  <span className="tag">No skills added</span>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Profile;
