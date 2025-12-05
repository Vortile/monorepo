import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Use the generic get method since emails.list() is not available in the SDK yet
    const { data, error } = await resend.get("/emails");

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
