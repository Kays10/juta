export default function RegisterPage() {
  return (
    <div className="page">
      <main className="main">
        <section className="section">
          <div className="container">
            <h1>Learner Registration</h1>
            <p>
              Please complete all required sections and upload the requested
              documents. Fields marked with * are required.
            </p>
            <form
              method="POST"
              action="/api/register"
              encType="multipart/form-data"
              style={{ marginTop: "1.5rem" }}
            >
              <div className="form-section">
                <h2>Programme stream</h2>
                <label>
                  Stream*
                  <select name="stream" required>
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

              <div className="form-section">
                <h2>Programme and training</h2>
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
                <label>
                  Start date*
                  <input name="start_date" type="date" required />
                </label>
                <label>
                  End date*
                  <input name="end_date" type="date" required />
                </label>
              </div>

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

              <div className="form-section">
                <h2>Required documents (PDF only)</h2>
                <label>
                  Certified Matric Certificate (PDF)*
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
                  Proof of Bank Account (PDF)*
                  <input
                    name="bank_proof"
                    type="file"
                    accept="application/pdf"
                    required
                  />
                </label>
                <label>
                  Tertiary Qualification Document (PDF)
                  <input
                    name="tertiary_document"
                    type="file"
                    accept="application/pdf"
                  />
                </label>
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
                <button type="submit" className="button button-primary">
                  Submit application
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
