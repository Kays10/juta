"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedStream, setSelectedStream] = useState("");
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Client-side file validation
    const fileFields = [
      "matric_certificate",
      "id_copy",
      "bank_proof",
      "tertiary_document",
      "proof_of_address",
    ];
    let totalSize = 0;
    for (const name of fileFields) {
      const file = formData.get(name);
      if (file && file.size) {
        totalSize += file.size;
      }
    }
    const maxBytes = 25 * 1024 * 1024;
    if (totalSize > maxBytes) {
      setError(
        "Your documents are too large. Total size must be under 25MB in total. Please compress or reduce file sizes and try again.",
      );
      return;
    }

    const stream = formData.get("stream") || "";
    const firstName = formData.get("first_name") || "";
    const surname = formData.get("surname") || "";
    const idNumber = formData.get("id_number") || "";
    const qualificationId = formData.get("qualification_id") || "";
    const courseName = formData.get("course_name") || "";
    const startDate = formData.get("start_date") || "";
    const endDate = formData.get("end_date") || "";

    const isMaths = stream === "MATHS";
    const isIT = stream === "IT";

    if (
      !stream ||
      !firstName ||
      !surname ||
      !idNumber ||
      !startDate ||
      !endDate ||
      (isIT && (!qualificationId || !courseName))
    ) {
      setError("Please complete all required fields before submitting.");
      return;
    }

    if (endDate && startDate && endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Upload files directly to Supabase Storage (from browser)
      // This bypasses Next.js API route size limits
      const documentRows = [];
      
      const docsToUpload = [
        {
          type: stream === "MATHS" ? "MATRIC_STATEMENT" : "MATRIC",
          fieldName: "matric_certificate",
        },
        { type: "ID", fieldName: "id_copy" },
        {
          type: stream === "MATHS" ? "MOTIVATIONAL_LETTER" : "BANK",
          fieldName: "bank_proof",
        },
        { type: "TERTIARY", fieldName: "tertiary_document" },
        { type: "ADDRESS", fieldName: "proof_of_address" },
      ];

      // We'll generate a temporary learner ID for file paths
      const tempLearnerId = `temp_${Date.now()}`;

      for (const doc of docsToUpload) {
        const file = formData.get(doc.fieldName);
        if (!file || !file.size) continue;

        const safeType = doc.type.toLowerCase();
        const ext = ".pdf";
        const path = `${safeType}/${tempLearnerId}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("learner-documents")
          .upload(path, file, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload ${doc.type}: ${uploadError.message}`);
        }

        documentRows.push({
          document_type: doc.type,
          file_path: path,
        });
      }

      // Step 2: Send all data as JSON to API (no files, just metadata)
      const learnerData = {
        stream,
        first_name: firstName,
        middle_name: formData.get("middle_name") || "",
        surname,
        id_number: idNumber,
        tax_number: formData.get("tax_number") || "",
        date_of_birth: formData.get("date_of_birth") || null,
        race: formData.get("race") || "",
        gender: formData.get("gender") || "",
        previous_learnership_participation:
          formData.get("previous_learnership_participation") === "on",
        next_of_kin_name: formData.get("next_of_kin_name") || "",
        next_of_kin_age: Number(formData.get("next_of_kin_age") || 0),
        next_of_kin_contact_number:
          formData.get("next_of_kin_contact_number") || "",
        employment_status: formData.get("employment_status") || "",
        qualification_id: qualificationId,
        learnership_registration_number:
          formData.get("learnership_registration_number") || "",
        course_name: courseName,
        start_date: startDate,
        end_date: endDate,
        contact: {
          contact_number: formData.get("contact_number") || "",
          personal_email: formData.get("personal_email") || "",
          work_email: formData.get("work_email") || "",
          home_address: formData.get("home_address") || "",
          street_address: formData.get("street_address") || "",
          area: formData.get("area") || "",
          province: formData.get("province") || "",
          postal_code: formData.get("postal_code") || "",
        },
        company_name: formData.get("company_name") || "",
        company_contact_person: formData.get("company_contact_person") || "",
        company_contact_number: formData.get("company_contact_number") || "",
        company_email: formData.get("company_email") || "",
        documents: documentRows,
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(learnerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Registration failed (Status ${response.status})`);
      }

      router.push("/register/success");
    } catch (e) {
      setError(e.message || "Unexpected error processing registration. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <main className="main">
          <section className="section">
          <div className="container">
            <div className="page-heading">
              <div className="logo-placeholder">
                <img src="/logo.png" alt="LH Open Minded Institute logo" />
              </div>
              <h1>Learner Registration</h1>
            </div>
            <p>
              Please complete all required sections and upload the requested
              documents. Fields marked with * are required.
            </p>
            <form
              encType="multipart/form-data"
              onSubmit={handleSubmit}
              style={{ marginTop: "1.5rem" }}
            >
              <div className="form-section">
                <h2>Programme stream</h2>
                <label>
                  Stream*
                  <select
                    name="stream"
                    required
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                  >
                    <option value="">Select stream</option>
                    <option value="IT">IT</option>
                    <option value="MATHS">Maths</option>
                  </select>
                </label>
              </div>

              <div className="form-section">
                <h2>Personal information</h2>
                <label>
                  First name*
                  <input name="first_name" type="text" required />
                </label>
                <label>
                  Middle name
                  <input name="middle_name" type="text" />
                </label>
                <label>
                  Surname*
                  <input name="surname" type="text" required />
                </label>
                <label>
                  ID number*
                  <input name="id_number" type="text" required />
                </label>
                <label>
                  Tax number
                  <input name="tax_number" type="text" />
                </label>
                <label>
                  Date of birth*
                  <input name="date_of_birth" type="date" required />
                </label>
                <label>
                  Race
                  <input name="race" type="text" />
                </label>
                <label>
                  Gender*
                  <select name="gender" required>
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </label>
                <label>
                  Previously participated in a learnership?
                  <input
                    name="previous_learnership_participation"
                    type="checkbox"
                    value="true"
                  />
                </label>
              </div>

              <div className="form-section">
                <h2>Next of kin</h2>
                <label>
                  Next of kin name*
                  <input name="next_of_kin_name" type="text" required />
                </label>
                <label>
                  Next of kin age*
                  <input name="next_of_kin_age" type="number" min="0" required />
                </label>
                <label>
                  Next of kin contact number*
                  <input
                    name="next_of_kin_contact_number"
                    type="text"
                    required
                  />
                </label>
              </div>

              {selectedStream === "IT" && (
                <div className="form-section">
                  <h2>Employment status</h2>
                  <label>
                    Employment status
                    <select name="employment_status">
                      <option value="">Select status</option>
                      <option value="UNEMPLOYED">Unemployed</option>
                      <option value="EMPLOYED">Employed</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  </label>
                </div>
              )}

              <div className="form-section">
                <h2>Contact information</h2>
                <label>
                  Contact number*
                  <input name="contact_number" type="text" required />
                </label>
                <label>
                  Personal email*
                  <input name="personal_email" type="email" required />
                </label>
                <label>
                  Work email
                  <input name="work_email" type="email" />
                </label>
                <label>
                  Home address*
                  <input name="home_address" type="text" required />
                </label>
                <label>
                  Street address*
                  <input name="street_address" type="text" required />
                </label>
                <label>
                  Area*
                  <input name="area" type="text" required />
                </label>
                <label>
                  Province*
                  <input name="province" type="text" required />
                </label>
                <label>
                  Postal code*
                  <input name="postal_code" type="text" required />
                </label>
              </div>

              {selectedStream && (
                <div className="form-section">
                  <h2>Programme and training</h2>
                  {selectedStream === "IT" && (
                    <>
                      <label>
                        Qualification ID*
                        <input name="qualification_id" type="text" required />
                      </label>
                      <label>
                        Learnership registration number*
                        <input
                          name="learnership_registration_number"
                          type="text"
                          required
                        />
                      </label>
                      <label>
                        Course name*
                        <input name="course_name" type="text" required />
                      </label>
                    </>
                  )}
                  <label>
                    Start date*
                    <input name="start_date" type="date" required />
                  </label>
                  <label>
                    End date*
                    <input name="end_date" type="date" required />
                  </label>
                </div>
              )}

              {selectedStream === "IT" && (
                <div className="form-section">
                  <h2>Previous employment (optional)</h2>
                  <label>
                    Company name
                    <input name="company_name" type="text" />
                  </label>
                  <label>
                    Company contact person
                    <input name="company_contact_person" type="text" />
                  </label>
                  <label>
                    Company contact number
                    <input name="company_contact_number" type="text" />
                  </label>
                  <label>
                    Company email
                    <input name="company_email" type="email" />
                  </label>
                </div>
              )}

              <div className="form-section">
                <h2>Required documents (PDF only)</h2>
                <p style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                  Maximum combined file size: 25MB. If your documents are
                  larger, please compress them before uploading.
                  <br />
                  <span style={{ color: "#ef4444", fontWeight: "600" }}>
                    (Certified documents must not be older than three (3) months
                    from the date of submission.)
                  </span>
                </p>
                <label>
                  {selectedStream === "MATHS"
                    ? "Certified Matric Statement (PDF)*"
                    : "Certified Matric Certificate (PDF)*"}
                  <input
                    name="matric_certificate"
                    type="file"
                    accept="application/pdf"
                    required
                  />
                </label>
                <label>
                  Certified ID Copy (PDF)*
                  <input
                    name="id_copy"
                    type="file"
                    accept="application/pdf"
                    required
                  />
                </label>
                <label>
                  {selectedStream === "MATHS"
                    ? "Motivational Letter (PDF)*"
                    : "Proof of Bank Account (PDF)*"}
                  <input
                    name="bank_proof"
                    type="file"
                    accept="application/pdf"
                    required
                  />
                </label>
                {selectedStream === "IT" && (
                  <label>
                    Tertiary Qualification Document (PDF)
                    <input
                      name="tertiary_document"
                      type="file"
                      accept="application/pdf"
                    />
                  </label>
                )}
                <label>
                  Proof of Address (PDF)*
                  <input
                    name="proof_of_address"
                    type="file"
                    accept="application/pdf"
                    required
                  />
                </label>
              </div>

              <div className="form-section">
                {error && <p className="form-error">{error}</p>}
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit application"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
