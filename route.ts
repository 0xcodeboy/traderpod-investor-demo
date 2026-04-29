import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://dbfcmyxivvscruddionc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZmNteXhpdnZzY3J1ZGRpb25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTU4MTEsImV4cCI6MjA4NzYzMTgxMX0.OaUm14VXTKT8A6F2_sRj-MlwlZSduBpWmsZS-97a8nE"
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { error } = await supabase.from("survey_responses").insert([body]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
