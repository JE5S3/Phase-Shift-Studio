import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://phaseshiftstudio.com.au",
  "https://www.phaseshiftstudio.com.au",
]);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
);

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowedOrigins.has(origin)
      ? origin
      : "https://phaseshiftstudio.com.au",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const clean = (value: unknown, max = 1000) =>
  String(value ?? "").trim().slice(0, max);
const reply = (
  req: Request,
  body: Record<string, unknown>,
  status = 200,
) => new Response(JSON.stringify(body), { status, headers: cors(req) });
const escapeHtml = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const PSS_OWNER_ID = "5594c87e-2491-4761-95fb-c9ff473eb8e7";

async function ownerId() {
  const owner = await supabase.auth.admin.getUserById(PSS_OWNER_ID);
  if (owner.error || !owner.data.user || owner.data.user.id !== PSS_OWNER_ID) {
    throw new Error("Verified PSS owner is not available");
  }
  return PSS_OWNER_ID;
}

async function nextQuoteNumber() {
  const result = await supabase.from("quotes").select("quote_number")
    .like("quote_number", "PSS-%").limit(1000);
  if (result.error) throw result.error;
  const highest = (result.data || []).reduce((max, row) => {
    const match = String(row.quote_number || "").match(/PSS-(\d+)/i);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);
  return `PSS-${String(highest + 1).padStart(4, "0")}`;
}

async function sendEnquiryNotification(details: {
  quoteNumber: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  projectType: string;
  message: string;
}) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("QUOTE_FROM_EMAIL");
  const notificationEmail = Deno.env.get("ENQUIRY_NOTIFICATION_EMAIL") ||
    Deno.env.get("QUOTE_REPLY_TO");
  if (!resendApiKey || !fromEmail || !notificationEmail) {
    throw new Error("Enquiry email configuration is incomplete");
  }

  const html = `
    <div style="background:#f4f2ed;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #111">
        <div style="padding:20px 24px;background:#111;color:#fff;font-weight:800">PHASE SHIFT STUDIO</div>
        <div style="padding:28px">
          <div style="font:12px monospace;color:#d71920">[ NEW WEBSITE ENQUIRY · ${escapeHtml(details.quoteNumber)} ]</div>
          <h1 style="margin:14px 0 24px;font-size:30px">${escapeHtml(details.projectType)}</h1>
          <p><strong>Name:</strong> ${escapeHtml(details.name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(details.email)}">${escapeHtml(details.email)}</a></p>
          <p><strong>Business:</strong> ${escapeHtml(details.company || "Not supplied")}</p>
          <p><strong>Phone:</strong> ${escapeHtml(details.phone || "Not supplied")}</p>
          <div style="margin-top:24px;padding:20px;background:#f4f2ed;white-space:pre-wrap;line-height:1.6">${escapeHtml(details.message)}</div>
          <p style="margin-top:24px;font-size:13px;color:#555">A draft quote has been created automatically in the quote portal.</p>
        </div>
      </div>
    </div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Phase Shift Studio <${fromEmail}>`,
      to: [notificationEmail],
      reply_to: details.email,
      subject: `New website enquiry — ${details.projectType} — ${details.name}`,
      html,
      tags: [{ name: "category", value: "website-enquiry" }],
    }),
  });
  if (!response.ok) {
    console.error("Resend enquiry notification failed", response.status, await response.text());
    throw new Error("Could not send enquiry notification");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(req) });
  }
  if (req.method !== "POST") {
    return reply(req, { error: "Method not allowed" }, 405);
  }

  const origin = req.headers.get("origin") || "";
  if (!allowedOrigins.has(origin)) {
    return reply(req, { error: "Origin not allowed" }, 403);
  }

  try {
    const input = await req.json();
    if (clean(input.botcheck)) return reply(req, { ok: true });

    const submissionId = clean(input.submissionId, 100);
    const name = clean(input.name, 150);
    const email = clean(input.email, 320).toLowerCase();
    const company = clean(input.company, 200);
    const phone = clean(input.phone, 50);
    const projectType = clean(input.type, 120);
    const message = clean(input.message, 5000);
    if (
      !submissionId || !name || !email || !projectType || !message ||
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      return reply(req, { error: "Required enquiry details are missing" }, 400);
    }

    const notification = { name, email, company, phone, projectType, message };
    const duplicate = await supabase.from("enquiries").select("id")
      .eq("source_submission_id", submissionId).maybeSingle();
    if (duplicate.error) throw duplicate.error;
    if (duplicate.data) {
      const quote = await supabase.from("quotes").select("quote_number")
        .eq("enquiry_id", duplicate.data.id).maybeSingle();
      if (quote.error) throw quote.error;
      const quoteNumber = quote.data?.quote_number || "Existing draft";
      await sendEnquiryNotification({ ...notification, quoteNumber });
      return reply(req, { ok: true, quoteNumber, duplicate: true });
    }

    const userId = await ownerId();
    const services = Array.isArray(input.services)
      ? input.services.map((item: unknown) => clean(item, 150)).filter(Boolean)
        .slice(0, 20)
      : [];
    const paymentPreference = clean(input.payment, 40);
    const paymentPlan = paymentPreference === "monthly" ? "monthly" : "one_time";
    const hasWebsite = clean(input.hasWebsite, 10) === "Yes";

    let customerResult = await supabase.from("customers").select("id")
      .eq("user_id", userId).ilike("email", email).limit(1).maybeSingle();
    if (customerResult.error) throw customerResult.error;
    let customerId = customerResult.data?.id;
    if (customerId) {
      const updated = await supabase.from("customers").update({
        business_name: company || name,
        contact_name: name,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      }).eq("id", customerId);
      if (updated.error) throw updated.error;
    } else {
      const created = await supabase.from("customers").insert({
        user_id: userId,
        business_name: company || name,
        contact_name: name,
        email,
        phone: phone || null,
      }).select("id").single();
      if (created.error) throw created.error;
      customerId = created.data.id;
    }

    const enquiry = await supabase.from("enquiries").insert({
      user_id: userId,
      source_submission_id: submissionId,
      name,
      company: company || null,
      email,
      project_type: projectType,
      payment_preference: paymentPreference,
      has_website: hasWebsite,
      current_website: hasWebsite ? clean(input.currentWebsite, 500) || null : null,
      services,
      budget: clean(input.budget, 150) || null,
      timeline: clean(input.timeline, 100) || null,
      message,
      status: "CONVERTED",
    }).select("id").single();
    if (enquiry.error) throw enquiry.error;

    const today = new Date();
    const notes = [
      "AUTO-CREATED FROM WEBSITE ENQUIRY",
      `Project type: ${projectType}`,
      `Budget: ${clean(input.budget, 150) || "Not supplied"}`,
      `Timeline: ${clean(input.timeline, 100) || "Not supplied"}`,
      `Existing website: ${
        hasWebsite ? clean(input.currentWebsite, 500) || "Yes" : "No"
      }`,
      `Payment preference: ${paymentPreference || "Not supplied"}`,
      "",
      message,
    ].join("\n");

    let quote: { id: string; quote_number: string } | null = null;
    for (let attempt = 0; attempt < 5 && !quote; attempt++) {
      const quoteNumber = await nextQuoteNumber();
      const created = await supabase.from("quotes").insert({
        user_id: userId,
        customer_id: customerId,
        enquiry_id: enquiry.data.id,
        quote_number: quoteNumber,
        project_name: `${projectType} — ${company || name}`,
        status: "DRAFT",
        issue_date: today.toISOString().slice(0, 10),
        expiry_date: null,
        gst_rate: 0,
        deposit_rate: 50,
        payment_plan: paymentPlan,
        client_name: company || name,
        client_contact_name: name,
        client_email: email,
        client_phone: phone || null,
        notes,
      }).select("id,quote_number").single();
      if (!created.error) quote = created.data;
      else if (created.error.code !== "23505") throw created.error;
    }
    if (!quote) throw new Error("Could not allocate a quote number");

    const itemNames = services.length ? services : [projectType];
    const items = await supabase.from("quote_items").insert(itemNames.map(
      (description: string, index: number) => ({
        quote_id: quote!.id,
        description,
        quantity: 1,
        rate: 0,
        amount: 0,
        sort_order: index,
      }),
    ));
    if (items.error) throw items.error;

    await supabase.from("enquiries").update({
      ai_draft_generated: true,
      updated_at: new Date().toISOString(),
    }).eq("id", enquiry.data.id);
    await sendEnquiryNotification({
      ...notification,
      quoteNumber: quote.quote_number,
    });
    return reply(req, { ok: true, quoteNumber: quote.quote_number }, 201);
  } catch (error) {
    console.error("Enquiry intake failed", error);
    return reply(req, { error: "Could not process enquiry" }, 500);
  }
});
