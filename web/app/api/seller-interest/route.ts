// FILE: /web/app/api/seller-interest/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error(
    "[seller-interest] Missing RESEND_API_KEY. Set it in .env.local in the web app."
  );
}

const resend = apiKey ? new Resend(apiKey) : null;

// Small helper: normalize various body types (JSON or form)
async function parseBody(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  // JSON (e.g. from fetch with application/json)
  if (contentType.includes("application/json")) {
    return await req.json();
  }

  // Classic browser form: application/x-www-form-urlencoded
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }

  // multipart/form-data (file uploads etc.)
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    return Object.fromEntries(formData.entries());
  }

  // Fallback
  return {};
}

export async function POST(req: Request) {
  try {
    if (!resend) {
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const body = await parseBody(req);

    const {
      name,
      email,
      instagram,
      country,
      heritage,
      category,
      notes,
    } = body as Record<string, string | undefined>;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      // Use Resend's default domain for now so it Just Works™
      from: "Our Arab Heritage <onboarding@resend.dev>",
      to: "abouhashemahmed2@gmail.com",
      subject: "New Seller Interest Submission",
      html: `
        <h2>New Seller Interest</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Instagram/Website:</strong> ${instagram || "—"}</p>
        <p><strong>Based in:</strong> ${country || "—"}</p>
        <p><strong>Heritage:</strong> ${heritage || "—"}</p>
        <p><strong>Sells:</strong> ${category || "—"}</p>
        <p><strong>Notes:</strong> ${notes || "—"}</p>
      `,
    });

    if (error) {
      console.error("[seller-interest] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[seller-interest] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to send." },
      { status: 500 }
    );
  }
}
