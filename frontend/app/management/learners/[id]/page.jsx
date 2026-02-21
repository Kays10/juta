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
      setCheckingAuth(false);
    }
    if (learnerId) {
      run();
    }
  }, [router, learnerId]);

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

              <div className="detail-card">
                <h2>Documents</h2>
                {documents.length > 0 ? (
                  <ul>
                    {documents.map((doc) => (
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
                  <p>No documents uploaded.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
