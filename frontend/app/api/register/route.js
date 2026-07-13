import { NextResponse } from "next/server";
import { createServerClient } from "../../../lib/supabaseServerClient";

export async function POST(request) {
  try {
    // Initialize Supabase server client
    const supabase = createServerClient();

    // Parse JSON data from request body
    const data = await request.json();
    
    const {
      stream,
      first_name,
      middle_name,
      surname,
      id_number,
      tax_number,
      date_of_birth,
      race,
      gender,
      previous_learnership_participation,
      next_of_kin_name,
      next_of_kin_age,
      next_of_kin_contact_number,
      employment_status,
      qualification_id,
      learnership_registration_number,
      course_name,
      start_date,
      end_date,
      contact,
      company_name,
      company_contact_person,
      company_contact_number,
      company_email,
      documents,
    } = data;

    console.log("Registration data:", { stream, first_name, surname, id_number, start_date, end_date });

    // Validation
    if (
      !stream ||
      !first_name ||
      !surname ||
      !id_number ||
      !start_date ||
      !end_date
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (end_date && start_date && end_date < start_date) {
      return NextResponse.json(
        { error: "End date cannot be before start date" },
        { status: 400 },
      );
    }

    // Create learner record
    const learnerPayload = {
      stream,
      first_name,
      middle_name: middle_name || "",
      surname,
      id_number,
      tax_number: tax_number || "",
      date_of_birth: date_of_birth || null,
      race: race || "",
      gender: gender || "",
      previous_learnership_participation: previous_learnership_participation || false,
      next_of_kin_name: next_of_kin_name || "",
      next_of_kin_age: Number(next_of_kin_age || 0),
      next_of_kin_contact_number: next_of_kin_contact_number || "",
      employment_status: employment_status || "",
      qualification_id: qualification_id || "",
      learnership_registration_number: learnership_registration_number || "",
      course_name: course_name || "",
      start_date,
      end_date,
    };

    const { data: learner, error: learnerError } = await supabase
      .from("learners")
      .insert([learnerPayload])
      .select("id")
      .single();

    if (learnerError) {
      return NextResponse.json(
        { error: learnerError.message },
        { status: 500 },
      );
    }

    const learnerId = learner.id;

    // Create contact information record
    if (contact) {
      const contactPayload = {
        learner_id: learnerId,
        contact_number: contact.contact_number || "",
        personal_email: contact.personal_email || "",
        work_email: contact.work_email || "",
        home_address: contact.home_address || "",
        street_address: contact.street_address || "",
        area: contact.area || "",
        province: contact.province || "",
        postal_code: contact.postal_code || "",
      };

      const { error: contactError } = await supabase
        .from("contact_information")
        .insert([contactPayload]);

      if (contactError) {
        return NextResponse.json(
          { error: contactError.message },
          { status: 500 },
        );
      }
    }

    // Create previous employment record if company name is provided
    if (company_name) {
      const previousEmploymentPayload = {
        learner_id: learnerId,
        company_name: company_name,
        company_contact_person: company_contact_person || "",
        company_contact_number: company_contact_number || "",
        company_email: company_email || "",
      };

      const { error: employmentError } = await supabase
        .from("previous_employment")
        .insert([previousEmploymentPayload]);

      if (employmentError) {
        return NextResponse.json(
          { error: employmentError.message },
          { status: 500 },
        );
      }
    }

    // Move uploaded documents from their temp path to the real learner ID
    // path in Storage, then record the NEW path in the database. Simply
    // rewriting the DB string (old behaviour) left the DB pointing at a
    // path that never existed in Storage, causing "Object not found".
    if (documents && documents.length > 0) {
      const documentRows = [];

      for (const doc of documents) {
        const oldPath = doc.file_path;
        const newPath = oldPath.replace(/temp_\d+/, learnerId);

        if (newPath !== oldPath) {
          const { error: moveError } = await supabase.storage
            .from("learner-documents")
            .move(oldPath, newPath);

          if (moveError) {
            return NextResponse.json(
              { error: `Failed to relocate ${doc.document_type}: ${moveError.message}` },
              { status: 500 },
            );
          }
        }

        documentRows.push({
          learner_id: learnerId,
          document_type: doc.document_type,
          file_path: newPath,
        });
      }

      const { error: docsError } = await supabase
        .from("documents")
        .insert(documentRows);

      if (docsError) {
        return NextResponse.json(
          { error: docsError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected registration error:", error);
    return NextResponse.json(
      { error: "Unexpected error processing registration: " + (error?.message || "Unknown error") },
      { status: 500 },
    );
  }
}