import { NextResponse } from "next/server";
import { createServerClient } from "../../../../lib/supabaseServerClient";

const VALID_STATUSES = ["NEW", "IN_REVIEW", "ACCEPTED", "DECLINED"];

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("learners")
      .update({ status, status_updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, learner: data });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error: " + (error?.message || "Unknown error") }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const supabase = createServerClient();
    const { data: docs } = await supabase
      .from("documents")
      .select("file_path")
      .eq("learner_id", id);
    if (docs && docs.length > 0) {
      const paths = docs.map((d) => d.file_path);
      await supabase.storage.from("learner-documents").remove(paths);
    }
    await supabase.from("contact_information").delete().eq("learner_id", id);
    await supabase.from("previous_employment").delete().eq("learner_id", id);
    await supabase.from("documents").delete().eq("learner_id", id);
    const { error } = await supabase.from("learners").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error: " + (error?.message || "Unknown error") }, { status: 500 });
  }
}
