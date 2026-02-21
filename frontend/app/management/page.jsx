"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ManagementDashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [learners, setLearners] = useState([]);
  const [streamFilter, setStreamFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function run() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("learners")
        .select(
          "id, first_name, surname, stream, id_number, course_name, start_date, end_date",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      setLearners(data || []);
      setCheckingAuth(false);
    }
    run();
  }, [router]);

  const filteredLearners = learners.filter((learner) => {
    const matchesStream =
      !streamFilter || learner.stream === streamFilter.toUpperCase();
    const fullName = `${learner.first_name} ${learner.surname}`.toLowerCase();
    const matchesSearch =
      !search ||
      fullName.includes(search.toLowerCase()) ||
      (learner.id_number || "").toLowerCase().includes(search.toLowerCase());
    return matchesStream && matchesSearch;
  });

  if (checkingAuth) {
    return (
      <div className="page">
        <main className="main">
          <section className="section">
            <div className="container">
              <p>Checking access...</p>
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
            <h1>Management Portal</h1>
            <p>
              Review learner registrations captured through the online
              application form.
            </p>

            <div className="management-filters">
              <label>
                Stream
                <select
                  value={streamFilter}
                  onChange={(event) => setStreamFilter(event.target.value)}
                >
                  <option value="">All</option>
                  <option value="IT">IT</option>
                  <option value="MATHS">Maths</option>
                </select>
              </label>
              <label>
                Name or ID search
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or ID number"
                />
              </label>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Stream</th>
                    <th>ID Number</th>
                    <th>Course</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLearners.length === 0 && (
                    <tr>
                      <td colSpan={7}>No learners found for the filters.</td>
                    </tr>
                  )}
                  {filteredLearners.map((learner) => (
                    <tr key={learner.id}>
                      <td>
                        {learner.first_name} {learner.surname}
                      </td>
                      <td>{learner.stream}</td>
                      <td>{learner.id_number}</td>
                      <td>{learner.course_name}</td>
                      <td>{learner.start_date}</td>
                      <td>{learner.end_date}</td>
                      <td>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() =>
                            router.push(`/management/learners/${learner.id}`)
                          }
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
