"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

function buildDocumentUrl(path) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/learner-documents/${path}`;
}

export default function LearnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const learnerId = params.id;
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [learner, setLearner] = useState(null);
  const [contact, setContact] = useState(null);
  const [employment, setEmployment] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [poeFiles, setPoeFiles] = useState([]);
  const [uploadingPoe, setUploadingPoe] = useState(false);
  const [poeCategory, setPoeCategory] = useState("FORMATIVE");
  const [progress, setProgress] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  useEffect(() => {
    async function run() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: learnerRow } = await supabase
        .from("learners")
        .select("*")
        .eq("id", learnerId)
        .single();

      const { data: contactRow } = await supabase
        .from("contact_information")
        .select("*")
        .eq("learner_id", learnerId)
        .single();

      const { data: employmentRows } = await supabase
        .from("previous_employment")
        .select("*")
        .eq("learner_id", learnerId);

      const { data: documentRows } = await supabase
        .from("documents")
        .select("*")
        .eq("learner_id", learnerId);

      setLearner(learnerRow);
      setContact(contactRow);
      setEmployment(employmentRows || []);
      setDocuments(documentRows || []);
      setProgress(learnerRow?.completion_percentage || 0);
      setCheckingAuth(false);
    }
    if (learnerId) {
      run();
    }
  }, [router, learnerId]);

  async function updateStatus(newStatus) {
    if (!learner) return;
    setUpdatingStatus(true);
    const { error } = await supabase
      .from("learners")
      .update({
        status: newStatus,
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", learnerId);
    setUpdatingStatus(false);
    if (error) {
      alert("Could not update status. Please try again.");
      return;
    }
    setLearner({ ...learner, status: newStatus });
  }

  async function updateProgress() {
    if (!learner) return;
    setUpdatingProgress(true);
    const { error } = await supabase
      .from("learners")
      .update({
        completion_percentage: progress,
      })
      .eq("id", learnerId);
    setUpdatingProgress(false);
    if (error) {
      alert("Could not update progress. Please try again.");
      return;
    }
    alert("Progress updated successfully!");
  }

  function handleOpenEmailApp() {
    if (!contact?.personal_email) {
      alert("No email address found for this learner.");
      return;
    }

    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBody);
    window.location.href = `mailto:${contact.personal_email}?subject=${subject}&body=${body}`;
  }

  async function handlePoeUpload() {
    if (poeFiles.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    setUploadingPoe(true);
    const BUCKET = "learner-documents";
    const uploadRows = [];

    try {
      for (const file of poeFiles) {
        const path = `poe/${poeCategory.toLowerCase()}/${learnerId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file);

        if (uploadError) throw uploadError;

        uploadRows.push({
          learner_id: learnerId,
          document_type: `POE_${poeCategory}`,
          file_path: path,
        });
      }

      const { error: dbError } = await supabase
        .from("documents")
        .insert(uploadRows);

      if (dbError) throw dbError;

      // Refresh documents
      const { data: updatedDocs } = await supabase
        .from("documents")
        .select("*")
        .eq("learner_id", learnerId);
      setDocuments(updatedDocs || []);

      setPoeFiles([]);
      alert("POE documents uploaded successfully!");
    } catch (error) {
      console.error("POE upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingPoe(false);
    }
  }

  async function handleDeleteLearner() {
    if (
      !window.confirm(
        "Are you sure you want to delete this learner and all related information?",
      )
    ) {
      return;
    }
    const { error } = await supabase
      .from("learners")
      .delete()
      .eq("id", learnerId);
    if (error) {
      alert("Could not delete learner. Please try again.");
      return;
    }
    router.push("/management");
  }

  if (checkingAuth || !learner) {
    return (
      <div className="page">
        <main className="main">
          <section className="section">
            <div className="container">
              <p>Loading learner details...</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="main">
        <section className="section">
          <div className="container">
            <button
              type="button"
              className="link-button"
              onClick={() => router.push("/management")}
            >
              ← Back to list
            </button>

            <h1>
              {learner.first_name} {learner.middle_name} {learner.surname}
            </h1>

            <div className="status-actions-row">
              <span
                className={`status-pill status-${(learner.status || "NEW")
                  .toLowerCase()
                  .replace(" ", "_")}`}
              >
                {(learner.status || "NEW")
                  .toLowerCase()
                  .replace("_", " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              <div className="status-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={updatingStatus}
                  onClick={() => updateStatus("IN_REVIEW")}
                >
                  Mark in review
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={updatingStatus}
                  onClick={() => updateStatus("ACCEPTED")}
                >
                  Mark accepted
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={updatingStatus}
                  onClick={() => updateStatus("DECLINED")}
                >
                  Mark declined
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={handleDeleteLearner}
                >
                  Delete learner
                </button>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                <h2>Personal information</h2>
                <p>
                  <strong>Stream:</strong> {learner.stream}
                </p>
                <p>
                  <strong>ID number:</strong> {learner.id_number}
                </p>
                <p>
                  <strong>Tax number:</strong> {learner.tax_number}
                </p>
                <p>
                  <strong>Date of birth:</strong> {learner.date_of_birth}
                </p>
                <p>
                  <strong>Race:</strong> {learner.race}
                </p>
                <p>
                  <strong>Gender:</strong> {learner.gender}
                </p>
                <p>
                  <strong>Previous learnership participation:</strong>{" "}
                  {learner.previous_learnership_participation ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Next of kin:</strong> {learner.next_of_kin_name} (
                  {learner.next_of_kin_age}),{" "}
                  {learner.next_of_kin_contact_number}
                </p>
                <p>
                  <strong>Employment status:</strong> {learner.employment_status}
                </p>

                <div className="progress-section">
                  <h3>Completion Progress</h3>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="progress-input-group">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="form-input"
                    />
                    <span>%</span>
                    <button
                      onClick={updateProgress}
                      disabled={updatingProgress}
                      className="button button-secondary"
                    >
                      {updatingProgress ? "Saving..." : "Update Progress"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h2>Contact information</h2>
                {contact ? (
                  <>
                    <p>
                      <strong>Contact number:</strong> {contact.contact_number}
                    </p>
                    <p>
                      <strong>Personal email:</strong> {contact.personal_email}
                    </p>
                    <p>
                      <strong>Work email:</strong> {contact.work_email}
                    </p>
                    <p>
                      <strong>Home address:</strong> {contact.home_address}
                    </p>
                    <p>
                      <strong>Street address:</strong> {contact.street_address}
                    </p>
                    <p>
                      <strong>Area:</strong> {contact.area}
                    </p>
                    <p>
                      <strong>Province:</strong> {contact.province}
                    </p>
                    <p>
                      <strong>Postal code:</strong> {contact.postal_code}
                    </p>
                  </>
                ) : (
                  <p>No contact information captured.</p>
                )}
              </div>

              <div className="detail-card">
                <h2>Email Learner</h2>
                <div className="form-section">
                  <label>
                    Subject
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="form-input"
                      placeholder="Enter email subject"
                    />
                  </label>
                  <label style={{ marginTop: "1rem" }}>
                    Message
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="form-input"
                      rows="5"
                      placeholder="Type your message here..."
                    ></textarea>
                  </label>
                  <button
                    onClick={handleOpenEmailApp}
                    className="button button-primary"
                    style={{ marginTop: "1rem" }}
                  >
                    Open in Email App
                  </button>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.5rem" }}>
                    This will open your default email application (like Outlook or Gmail) 
                    with the learner's email, subject, and message pre-filled.
                  </p>
                </div>
              </div>

              {learner.stream === "IT" && (
                <div className="detail-card">
                  <h2>Programme and training</h2>
                  <p>
                    <strong>Qualification ID:</strong> {learner.qualification_id}
                  </p>
                  <p>
                    <strong>Learnership registration number:</strong>{" "}
                    {learner.learnership_registration_number}
                  </p>
                  <p>
                    <strong>Course name:</strong> {learner.course_name}
                  </p>
                  <p>
                    <strong>Start date:</strong> {learner.start_date}
                  </p>
                  <p>
                    <strong>End date:</strong> {learner.end_date}
                  </p>
                </div>
              )}

              {learner.stream === "IT" && (
                <div className="detail-card">
                  <h2>Previous employment</h2>
                  {employment.length > 0 ? (
                    <ul>
                      {employment.map((job) => (
                        <li key={job.id}>
                          <strong>{job.company_name}</strong> –{" "}
                          {job.company_contact_person},{" "}
                          {job.company_contact_number}, {job.company_email}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No previous employment information captured.</p>
                  )}
                </div>
              )}

              <div className="detail-card">
                <h2>Documents</h2>
                {documents.filter(d => !d.document_type.startsWith("POE_")).length > 0 ? (
                  <ul>
                    {documents.filter(d => !d.document_type.startsWith("POE_")).map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={buildDocumentUrl(doc.file_path)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {doc.document_type} – View / Download
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No registration documents uploaded.</p>
                )}
              </div>

              <div className="detail-card poe-card">
                <h2>POE Documents</h2>
                <div className="poe-upload-section">
                  <select
                    value={poeCategory}
                    onChange={(e) => setPoeCategory(e.target.value)}
                    className="form-input"
                  >
                    <option value="FORMATIVE">Formative Assessments</option>
                    <option value="SUMMATIVE">Summative Assessments</option>
                    <option value="CONTINUOUS">Continuous Assessments</option>
                  </select>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf"
                    onChange={(e) => setPoeFiles(Array.from(e.target.files))}
                    className="form-input"
                  />
                  <button
                    onClick={handlePoeUpload}
                    disabled={uploadingPoe}
                    className="button button-primary"
                  >
                    {uploadingPoe ? "Uploading..." : "Upload POE"}
                  </button>
                </div>

                <div className="poe-list">
                  {["FORMATIVE", "SUMMATIVE", "CONTINUOUS"].map(cat => {
                    const catDocs = documents.filter(d => d.document_type === `POE_${cat}`);
                    if (catDocs.length === 0) return null;
                    return (
                      <div key={cat} className="poe-category-section">
                        <h3>{cat.charAt(0) + cat.slice(1).toLowerCase()} Assessments</h3>
                        <ul>
                          {catDocs.map(doc => (
                            <li key={doc.id}>
                              <a href={buildDocumentUrl(doc.file_path)} target="_blank" rel="noreferrer">
                                {doc.file_path.split("_").slice(1).join("_") || doc.document_type}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
