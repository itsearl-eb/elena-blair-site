const { checkSubmission, rejectionResponse } = require("./lib/spam-guard");
// netlify/functions/submit-enquiry.js
// Client acknowledgment is owned by Sprout (lead-created email) — NOT sent here.
// This function: 1) creates the Sprout lead (critical path)
//                2) emails an internal copy with the RAW payload to sayhello@ (best-effort)
//
// Required env vars on the MAIN site's Netlify instance:
//   SPROUT_API_KEY        (copy from the forms site)
//   RESEND_API_KEY        (new — from resend.com)
//   TURNSTILE_SECRET_KEY  (SET 24 Sep 2026, all contexts — verification is live. Without it the honeypot alone runs; see lib/spam-guard.js)
// Resend requires elenablair.com verified (SPF/DKIM) to send from sayhello@.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);

    // ---------- 0. SPAM (before anything is written or emailed) ----------
    // §128 item 9. Honeypot always; Turnstile when TURNSTILE_SECRET_KEY is
    // set. A rejection returns 200/success so a bot stops retrying and a
    // false positive still reaches the thank-you page. Same lib, byte for
    // byte, as the forms site — see the note at the top of it.
    const guard = await checkSubmission(data, event);
    if (!guard.ok) return rejectionResponse(guard.reason);

    // ---------- 1. SPROUT LEAD (critical path) ----------
    const fields = new URLSearchParams();
    fields.append("apikey", process.env.SPROUT_API_KEY);
    if (data.first_name) { fields.append("label-first_name", "First Name"); fields.append("field-first_name", data.first_name); }
    if (data.last_name) { fields.append("label-last_name", "Last Name"); fields.append("field-last_name", data.last_name); }
    if (data.email) { fields.append("label-email", "Email"); fields.append("field-email", data.email); }
    if (data.phone) { fields.append("label-phone", "Phone Number"); fields.append("field-phone", data.phone); }
    fields.append("label-leadsource", "Source");
    fields.append("field-leadsource", "Elena Blair - Client Enquiry");

    const shootTypeMap = {
      "Editorial": "Editorial",
      "Campaign": "Campaign",
      "Collection": "Collection",
      "Other": "Editorial"
    };
    const shootType = shootTypeMap[data.project_type] || "Editorial";
    fields.append("label-type", "Event Type");
    fields.append("field-type", shootType);

    // Reads back like a filled-in form: every line carries its own question,
    // empty optionals show "—" so you can see what was skipped.
    function val(x) { return (x && String(x).trim()) ? x : "—"; }

    var comments = "";
    comments += "WHO THEY ARE\n";
    comments += "Name: " + val(data.first_name) + " " + val(data.last_name) + "\n";
    comments += "Email: " + val(data.email) + "\n";
    comments += "WhatsApp / Phone: " + val(data.phone) + "\n";
    comments += "Company / brand: " + val(data.company) + "\n";
    comments += "Your role: " + val(data.role) + "\n";
    comments += "Instagram: " + val(data.instagram) + "\n";
    comments += "Website: " + val(data.website) + "\n";
    comments += "How did you find us? " + val(data.how_found) + "\n";

    comments += "\nTHE PROJECT\n";
    comments += "Type of project: " + val(data.project_type) + "\n";
    comments += "Deliverables: " + val(data.deliverables) + "\n";
    comments += "Intended usage: " + val(data.usage) + "\n";
    comments += "Territory: " + val(data.territory) + "\n";
    comments += "Timeline: " + val(data.timeline) + "\n";
    comments += "Budget range: " + val(data.budget) + "\n";

    comments += "\nTHE BRIEF\n";
    comments += "Tell us about the project:\n" + val(data.brief) + "\n";
    comments += "\nReferences:\n" + val(data.references) + "\n";
    comments += "\nAnything else we should know:\n" + val(data.anything_else) + "\n";

    fields.append("label-comments", "Enquiry Notes");
    fields.append("field-comments", comments);

    const response = await fetch("https://api.sproutstudio.com/lead/new", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: fields.toString(),
    });

    if (!response.ok) {
      return { statusCode: 500, body: JSON.stringify({ success: false }) };
    }

    // ---------- 2. INTERNAL NOTIFICATION (best-effort) ----------
    // Does NOT affect the response. Lead is already safe in Sprout above.
    try {
      await sendInternalEmail(data);
    } catch (mailErr) {
      console.error("Internal notification failed:", mailErr.message);
    }

    // ---------- 3. DASHBOARD SYNC (best-effort) ----------
    // Does NOT affect the response. Lead is already safe in Sprout above.
    try {
      await syncToSupabase(data);
    } catch (supabaseErr) {
      console.error("Supabase sync failed (enquiry still saved to Sprout):", supabaseErr);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};

// --- Internal email: raw payload, structured the way the form asked it. ---
async function sendInternalEmail(data) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set — skipping internal email.");
    return;
  }

  var nm = ((data.first_name || "") + " " + (data.last_name || "")).trim();
  var subject = "New enquiry — " + (nm || "Unknown");
  if (data.company) subject += ", " + data.company;

  var L = "\n";
  var b = "New commission enquiry via elenablair.com/the-commission." + L + L;

  b += "WHO THEY ARE" + L;
  b += "Name: " + nm + L;
  if (data.email) b += "Email: " + data.email + L;
  if (data.phone) b += "Phone / WhatsApp: " + data.phone + L;
  if (data.company) b += "Company / Brand: " + data.company + L;
  if (data.role) b += "Role: " + data.role + L;
  if (data.instagram) b += "Instagram: " + data.instagram + L;
  if (data.website) b += "Website: " + data.website + L;
  if (data.how_found) b += "How they found us: " + data.how_found + L;

  b += L + "THE PROJECT" + L;
  if (data.project_type) b += "Type: " + data.project_type + L;
  if (data.deliverables) b += "Deliverables: " + data.deliverables + L;
  if (data.usage) b += "Usage: " + data.usage + L;
  if (data.territory) b += "Territory: " + data.territory + L;
  if (data.timeline) b += "Timeline: " + data.timeline + L;
  if (data.budget) b += "Budget: " + data.budget + L;

  b += L + "THE BRIEF" + L;
  if (data.brief) b += data.brief + L;
  if (data.references) b += L + "References: " + data.references + L;
  if (data.anything_else) b += L + "Anything else: " + data.anything_else + L;

  var payload = {
    from: "Elena Blair <sayhello@elenablair.com>",
    to: ["sayhello@elenablair.com"],
    subject: subject,
    text: b
  };
  if (data.email) payload.reply_to = data.email; // reply goes straight to the client

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    var t = await r.text();
    throw new Error("Resend " + r.status + ": " + t);
  }
}

// --- Dashboard sync: mirrors the enquiry into the internal ops dashboard (Supabase). ---
// Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseHeaders(extra) {
  return Object.assign(
    {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    extra || {}
  );
}

async function supabaseSelect(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: supabaseHeaders() });
  if (!res.ok) throw new Error(`Supabase select ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function supabaseInsert(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: supabaseHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase insert ${table}: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows[0];
}

async function findExistingContactId(email, phone) {
  for (const value of [email, phone].filter(Boolean)) {
    const rows = await supabaseSelect(
      `contact_details?value=eq.${encodeURIComponent(value)}&owner_type=eq.contact&select=owner_id&limit=1`
    );
    if (rows.length > 0) return rows[0].owner_id;
  }
  return null;
}

async function findOrCreateCompanyId(name) {
  if (!name) return null;
  const existing = await supabaseSelect(`companies?name=ilike.${encodeURIComponent(name)}&select=id&limit=1`);
  if (existing.length > 0) return existing[0].id;
  const created = await supabaseInsert("companies", { name });
  return created.id;
}

async function syncToSupabase(data) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
  let contactId = await findExistingContactId(data.email, data.phone);
  const matchedExisting = Boolean(contactId);

  if (!contactId) {
    const companyId = await findOrCreateCompanyId(data.company);
    const contact = await supabaseInsert("contacts", {
      brand: "EB",
      first_name: data.first_name || "Unknown",
      last_name: data.last_name || null,
      company_id: companyId,
      role: data.role || null,
      instagram: data.instagram || null,
      website: data.website || null,
      how_heard: data.how_found || null,
    });
    contactId = contact.id;

    const detailRows = [];
    if (data.email) detailRows.push({ owner_type: "contact", owner_id: contactId, type: "email", value: data.email });
    if (data.phone) detailRows.push({ owner_type: "contact", owner_id: contactId, type: "phone", value: data.phone });
    if (detailRows.length > 0) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_details`, {
        method: "POST",
        headers: supabaseHeaders(),
        body: JSON.stringify(detailRows),
      });
      if (!res.ok) throw new Error(`Supabase insert contact_details: ${res.status} ${await res.text()}`);
    }
  }

  const titleSubject = data.company || fullName || "New enquiry";
  const title = data.project_type ? `${titleSubject} — ${data.project_type}` : titleSubject;

  const project = await supabaseInsert("projects", {
    brand: "EB",
    contact_id: contactId,
    title,
    status: "Lead",
    shoot_type: data.project_type || null,
    deliverables: data.deliverables || null,
    intended_usage: data.usage ? data.usage.split(",").map((s) => s.trim()).filter(Boolean) : null,
    territory: data.territory || null,
    budget_range: data.budget || null,
    timeline_notes: data.timeline || null,
    brief: data.brief || null,
    reference_notes: data.references || null,
  });

  const notes = [];
  if (matchedExisting) notes.push("Repeat enquiry — matched to an existing contact by email/phone.");
  if (data.anything_else) notes.push(`From the enquiry form ("Anything else we should know"):\n\n${data.anything_else}`);
  for (const body of notes) {
    await supabaseInsert("project_notes", { project_id: project.id, author_id: null, body });
  }
}

