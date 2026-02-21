import { NextResponse } from "next/server";
import { createServerClient } from "../../../lib/supabaseServerClient";

const BUCKET = "learner-documents";

async function uploadDocument(supabase, learnerId, documentType, file) {
  if (!file) return null;
  const ext = ".pdf";
  const safeType = documentType.toLowerCase();
  const path = `${safeType}/${learnerId}/${Date.now()}${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: "application/pdf",
    });

  if (uploadError) {
    throw uploadError;
  }

  return path;
}

export async function POST(request) {
  const supabase = createServerClient();

  try {
    const formData = await request.formData();

    const stream = formData.get("stream") || "";
    const firstName = formData.get("first_name") || "";
    const surname = formData.get("surname") || "";
    const idNumber = formData.get("id_number") || "";
    const qualificationId = formData.get("qualification_id") || "";
    const courseName = formData.get("course_name") || "";
    const startDate = formData.get("start_date") || "";
    const endDate = formData.get("end_date") || "";

    if (
      !stream ||
      !firstName ||
      !surname ||
      !idNumber ||
      !qualificationId ||
      !courseName ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (endDate && startDate && endDate < startDate) {
      return NextResponse.json(
        { error: "End date cannot be before start date" },
        { status: 400 },
      );
    }

    const learnerPayload = {
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
        formData.get("previous_learnership_participation") === "true",
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

    const contactPayload = {
      learner_id: learnerId,
      contact_number: formData.get("contact_number") || "",
      personal_email: formData.get("personal_email") || "",
      work_email: formData.get("work_email") || "",
      home_address: formData.get("home_address") || "",
      street_address: formData.get("street_address") || "",
      area: formData.get("area") || "",
      province: formData.get("province") || "",
      postal_code: formData.get("postal_code") || "",
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

    const companyName = formData.get("company_name") || "";
    if (companyName) {
      const previousEmploymentPayload = {
        learner_id: learnerId,
        company_name: companyName,
        company_contact_person: formData.get("company_contact_person") || "",
        company_contact_number: formData.get("company_contact_number") || "",
        company_email: formData.get("company_email") || "",
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

    const matricFile = formData.get("matric_certificate");
    const idFile = formData.get("id_copy");
    const bankFile = formData.get("bank_proof");
    const tertiaryFile = formData.get("tertiary_document");
    const addressFile = formData.get("proof_of_address");

    const docsToUpload = [
      { type: "MATRIC", file: matricFile },
      { type: "ID", file: idFile },
      { type: "BANK", file: bankFile },
      { type: "TERTIARY", file: tertiaryFile },
      { type: "ADDRESS", file: addressFile },
    ];

    const documentRows = [];

    for (const doc of docsToUpload) {
      if (!doc.file) continue;
      const path = await uploadDocument(
        supabase,
        learnerId,
        doc.type,
        doc.file,
      );
      if (path) {
        documentRows.push({
          learner_id: learnerId,
          document_type: doc.type,
          file_path: path,
        });
      }
    }

    if (documentRows.length > 0) {
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

    return NextResponse.redirect(new URL("/register/success", request.url));
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected error processing registration" },
      { status: 500 },
    );
  }
}
