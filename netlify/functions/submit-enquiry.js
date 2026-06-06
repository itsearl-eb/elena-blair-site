// netlify/functions/submit-enquiry.js
// Client acknowledgment is owned by Sprout (lead-created email) — NOT sent here.
// This function: 1) creates the Sprout lead (critical path)
//                2) emails an internal copy with the RAW payload to sayhello@ (best-effort)
//
// Required env vars on the MAIN site's Netlify instance:
//   SPROUT_API_KEY   (copy from the forms site)
//   RESEND_API_KEY   (new — from resend.com)
// Resend requires elenablair.com verified (SPF/DKIM) to send from sayhello@.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);

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
