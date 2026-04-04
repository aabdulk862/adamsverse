import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://adverse.dev",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface WebhookPayload {
  type: "INSERT" | "UPDATE";
  table: string;
  record: Record<string, unknown>;
  old_record?: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: WebhookPayload = await req.json();
    const { type, table, record, old_record } = payload;

    let clientId: string | null = null;
    let subject = "";
    let htmlBody = "";
    let preferenceKey: "project_updates" | "invoice_updates" | "message_updates" | null = null;

    // --- Project status change ---
    if (table === "projects" && type === "UPDATE" && record.status !== old_record?.status) {
      clientId = record.client_id as string;
      preferenceKey = "project_updates";
      const projectName = record.name as string;
      const newStatus = record.status as string;

      subject = `Project Update: ${projectName} is now "${newStatus}"`;
      htmlBody = buildEmail({
        heading: "Project Status Update",
        body: `<p>Your project <strong>${projectName}</strong> has been updated to <strong>${newStatus}</strong>.</p>
               <p>Log in to your dashboard to view details and next steps.</p>`,
        ctaUrl: `${supabaseUrl.replace(".supabase.co", ".netlify.app")}/dashboard/projects/${record.id}`,
        ctaText: "View Project",
        clientId: clientId,
        supabaseUrl,
      });
    }

    // --- New invoice ---
    if (table === "invoices" && type === "INSERT") {
      clientId = record.client_id as string;
      preferenceKey = "invoice_updates";
      const amount = Number(record.total_amount).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      const dueDate = record.due_date
        ? new Date(record.due_date as string).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "N/A";

      // Fetch project name for context
      let projectName = "your project";
      if (record.project_id) {
        const { data: project } = await supabase
          .from("projects")
          .select("name")
          .eq("id", record.project_id)
          .single();
        if (project) projectName = project.name;
      }

      subject = `New Invoice: ${amount} for ${projectName}`;
      htmlBody = buildEmail({
        heading: "New Invoice",
        body: `<p>A new invoice has been created for <strong>${projectName}</strong>.</p>
               <p><strong>Amount:</strong> ${amount}<br/>
               <strong>Due Date:</strong> ${dueDate}</p>`,
        ctaUrl: `${supabaseUrl.replace(".supabase.co", ".netlify.app")}/dashboard/billing`,
        ctaText: "View Invoice",
        clientId: clientId,
        supabaseUrl,
      });
    }

    // --- New message ---
    if (table === "messages" && type === "INSERT") {
      preferenceKey = "message_updates";
      const senderId = record.sender_id as string;
      const projectId = record.project_id as string;

      // Fetch project to find the other party
      const { data: project } = await supabase
        .from("projects")
        .select("name, client_id")
        .eq("id", projectId)
        .single();

      if (!project) {
        return new Response(
          JSON.stringify({ error: "Project not found for message" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Determine recipient: if sender is the client, notify admin; otherwise notify client
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", senderId)
        .single();

      const senderName = senderProfile?.display_name || "Someone";

      if (senderProfile?.role === "admin") {
        // Admin sent message → notify client
        clientId = project.client_id;
      } else {
        // Client sent message → notify admin(s)
        const { data: admins } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("role", "admin");

        if (admins && admins.length > 0) {
          // Send to first admin (primary)
          clientId = admins[0].id;
        }
      }

      subject = `New Message from ${senderName} on "${project.name}"`;
      htmlBody = buildEmail({
        heading: "New Message",
        body: `<p><strong>${senderName}</strong> sent a message on project <strong>${project.name}</strong>.</p>
               <p style="padding: 12px 16px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #0066ff;">
                 ${truncate(record.content as string, 200)}
               </p>`,
        ctaUrl: `${supabaseUrl.replace(".supabase.co", ".netlify.app")}/dashboard/projects/${projectId}`,
        ctaText: "View Conversation",
        clientId: clientId,
        supabaseUrl,
      });
    }

    // If we couldn't determine a notification to send, exit
    if (!clientId || !subject || !htmlBody) {
      return new Response(
        JSON.stringify({ message: "No notification needed for this event" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check notification preferences before sending
    if (preferenceKey) {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select(preferenceKey)
        .eq("client_id", clientId)
        .single();

      if (prefs && prefs[preferenceKey] === false) {
        return new Response(
          JSON.stringify({ message: "Notification suppressed by user preferences" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch recipient email
    const { data: recipient } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", clientId)
      .single();

    if (!recipient?.email) {
      return new Response(
        JSON.stringify({ error: "Recipient email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Adverse LLC <notifications@adverse.dev>",
        to: [recipient.email],
        subject,
        html: htmlBody,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Notification sent", id: resendResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// --- Helper: truncate text ---
function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

// --- Helper: build HTML email with unsubscribe link ---
function buildEmail(opts: {
  heading: string;
  body: string;
  ctaUrl: string;
  ctaText: string;
  clientId: string | null;
  supabaseUrl: string;
}): string {
  const unsubscribeUrl = `${opts.supabaseUrl.replace(".supabase.co", ".netlify.app")}/dashboard/settings?unsubscribe=true`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;font-family:'Inter',Arial,sans-serif;background:#f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
    <tr>
      <td style="padding:32px 28px 0;">
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a2e;">${opts.heading}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;">
        <div style="font-size:14px;line-height:1.6;color:#4a4a68;">
          ${opts.body}
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 28px 28px;">
        <a href="${opts.ctaUrl}" style="display:inline-block;padding:10px 24px;background:#0066ff;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:600;">
          ${opts.ctaText}
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">
          You're receiving this because you have an account with Adverse LLC.<br/>
          <a href="${unsubscribeUrl}" style="color:#0066ff;text-decoration:underline;">Manage notification preferences</a> or
          <a href="${unsubscribeUrl}" style="color:#0066ff;text-decoration:underline;">unsubscribe from non-essential emails</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
