export default function HomePage() {
  return (
    <div className="page">
      <header className="header">
        <div className="container header-content">
          <div className="brand">
            <div className="logo-placeholder">
              <img src="/logo.png" alt="Open Minded Institute logo" />
            </div>
            <div className="brand-text">
              <h1>LH Open Minded Institute</h1>
              <p>Developing the next generation of IT professionals</p>
            </div>
          </div>
          <div className="header-cta">
            <a
              href="/register"
              className="button button-primary"
            >
              Apply Now
            </a>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <h2>Welcome to LH Open Minded Institute</h2>
              <p>
                Our mandate is to empower the next generation with future-focused
                IT skills that transform potential into professional excellence.
              </p>
              <p>
                We provide accredited IT qualifications through structured
                learnership programmes designed to bridge the gap between
                education, skills development, and sustainable employment.
              </p>
              <p>
                Our mission is to develop skilled, confident, and job-ready IT
                Technicians and IT Professionals who are equipped to thrive in
                the fast-evolving digital economy.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Our Programmes</h2>
            <p className="section-intro">
              LH Open Minded Institute offers industry-aligned IT qualifications
              and skills development programmes, including:
            </p>
            <div className="cards">
              <div className="card">
                <h3>Technical Support</h3>
                <p>
                  Build a strong foundation in computer hardware, software, and
                  user support for modern workplaces.
                </p>
              </div>
              <div className="card">
                <h3>Systems Support</h3>
                <p>
                  Learn to maintain and support IT systems, networks, and
                  infrastructure in professional environments.
                </p>
              </div>
              <div className="card">
                <h3>Computer Technician</h3>
                <p>
                  Gain hands-on skills in diagnosing, repairing, and maintaining
                  computers and related equipment.
                </p>
              </div>
              <div className="card">
                <h3>Data Science</h3>
                <p>
                  Develop analytical and data skills to extract insights and
                  support data-driven decisions.
                </p>
              </div>
              <div className="card">
                <h3>Artificial Intelligence (AI)</h3>
                <p>
                  Explore AI concepts and applications relevant to the modern
                  digital economy.
                </p>
              </div>
              <div className="card">
                <h3>Maths Support Programme</h3>
                <p>
                  Strengthen Mathematics performance through structured support
                  and mastery of key concepts.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <h2>Learnership Duration and Structure</h2>
            <p>
              Our learnership programmes run over a 12-month period, structured
              as follows:
            </p>
            <ul className="list">
              <li>4 Months Formal Theory and Practical Training</li>
              <li>8 Months Workplace Placement and Professional Development</li>
            </ul>
            <p>
              This integrated approach ensures that learners gain both
              theoretical knowledge and real industry exposure, significantly
              enhancing employability and long-term career prospects.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Entry Requirements</h2>
            <ul className="list">
              <li>Be a South African citizen</li>
              <li>Have Matric (Grade 12)</li>
              <li>Be between the ages of 18 – 35 years</li>
              <li>Demonstrate a strong interest in Information Technology</li>
            </ul>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <h2>Maths Support Programme</h2>
            <p>
              In addition to our IT qualifications, LH Open Minded Institute
              offers a Maths Support Programme designed to strengthen
              Mathematics performance.
            </p>
            <p>This programme is suitable for:</p>
            <ul className="list">
              <li>Learners rewriting Matric</li>
              <li>High school learners currently studying Mathematics</li>
            </ul>
            <p>
              The programme supports learners in mastering core Mathematics
              concepts, improving analytical thinking, and building a strong
              academic foundation for IT-related careers and further studies.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Why Choose LH Open Minded Institute?</h2>
            <ul className="list">
              <li>Industry-relevant and future-focused IT programmes</li>
              <li>Structured workplace exposure</li>
              <li>Career-oriented skills development</li>
              <li>Professional mentorship and learner support</li>
              <li>Clear pathway to employment within the IT sector</li>
              <li>Commitment to youth empowerment and skills transformation</li>
            </ul>
            <p>
              At LH Open Minded Institute, we are not just training learners —
              we are developing the next generation of IT professionals.
            </p>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <h2>Our Facilities & Activities</h2>
            <div className="gallery-grid">
              <div className="gallery-item">
                <img src="/images/facility-1.jpg" alt="Learners working on hardware" className="gallery-image" />
              </div>
              <div className="gallery-item">
                <img src="/images/facility-2.jpg" alt="Business Development team" className="gallery-image" />
              </div>
              <div className="gallery-item">
                <img src="/images/facility-3.jpg" alt="Student with institute banner" className="gallery-image" />
              </div>
              <div className="gallery-item">
                <img src="/images/facility-4.jpg" alt="Classroom full of students with laptops" className="gallery-image" />
              </div>
            </div>
          </div>
        </section>

        <section className="section section-highlight">
          <div className="container">
            <h2>Take the Next Step</h2>
            <p>
              Apply today and begin your journey toward becoming an IT
              professional. If you are interested in our Maths Support Programme
              and would like to improve your Mathematics marks, you can also
              apply here.
            </p>
            <a
              href="/register"
              className="button button-primary"
            >
              Click here to apply
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} LH Open Minded Institute</p>
        </div>
      </footer>
    </div>
  );
}
