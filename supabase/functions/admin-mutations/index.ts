import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin by checking their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    // Create a client with the user's token to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Use service_role client to check admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return jsonResponse({ error: "Forbidden: admin role required" }, 403);
    }

    // Parse the request body
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "update_project_status":
        return await handleUpdateProjectStatus(adminClient, body, user.id);
      case "create_invoice":
        return await handleCreateInvoice(adminClient, body);
      case "update_invoice":
        return await handleUpdateInvoice(adminClient, body);
      case "send_invoice":
        return await handleSendInvoice(adminClient, body);
      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err) {
    return jsonResponse(
      { error: (err as Error).message || "Internal server error" },
      500
    );
  }
});

// --- Update project status ---
async function handleUpdateProjectStatus(
  client: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
  adminUserId: string
) {
  const { project_id, status } = body;

  if (!project_id || !status) {
    return jsonResponse({ error: "project_id and status are required" }, 400);
  }

  const validStatuses = [
    "Discovery",
    "In Progress",
    "Review",
    "Revision",
    "Delivered",
    "Closed",
  ];
  if (!validStatuses.includes(status as string)) {
    return jsonResponse({ error: `Invalid status: ${status}` }, 400);
  }

  // Update the project
  const { data: project, error: updateError } = await client
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", project_id)
    .select("id, name, client_id, status")
    .single();

  if (updateError) {
    return jsonResponse({ error: updateError.message }, 500);
  }

  // Record status change in history
  await client.from("project_status_history").insert({
    project_id,
    status,
    description: `Status updated to ${status}`,
    changed_by: adminUserId,
  });

  // Trigger notification to client (fire-and-forget)
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        type: "UPDATE",
        table: "projects",
        record: project,
        old_record: { status: body.old_status || "" },
      }),
    });
  } catch {
    // Notification failure should not block the status update
  }

  return jsonResponse({ message: "Project status updated", project });
}

// --- Create invoice ---
async function handleCreateInvoice(
  client: ReturnType<typeof createClient>,
  body: Record<string, unknown>
) {
  const { project_id, client_id, status, line_items, total_amount, tax_amount, due_date } = body;

  if (!project_id || !due_date) {
    return jsonResponse({ error: "project_id and due_date are required" }, 400);
  }

  // Resolve client_id from project if not provided
  let resolvedClientId = client_id;
  if (!resolvedClientId) {
    const { data: project } = await client
      .from("projects")
      .select("client_id")
      .eq("id", project_id)
      .single();
    resolvedClientId = project?.client_id;
  }

  if (!resolvedClientId) {
    return jsonResponse({ error: "Could not determine client for this project" }, 400);
  }

  const { data: invoice, error: insertError } = await client
    .from("invoices")
    .insert({
      project_id,
      client_id: resolvedClientId,
      status: status || "Draft",
      line_items: line_items || [],
      total_amount: total_amount || 0,
      tax_amount: tax_amount || 0,
      due_date,
    })
    .select()
    .single();

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500);
  }

  return jsonResponse({ message: "Invoice created", invoice });
}

// --- Update invoice ---
async function handleUpdateInvoice(
  client: ReturnType<typeof createClient>,
  body: Record<string, unknown>
) {
  const { invoice_id, status, line_items, total_amount, tax_amount, due_date, project_id, client_id } = body;

  if (!invoice_id) {
    return jsonResponse({ error: "invoice_id is required" }, 400);
  }

  const updateData: Record<string, unknown> = {};
  if (status !== undefined) updateData.status = status;
  if (line_items !== undefined) updateData.line_items = line_items;
  if (total_amount !== undefined) updateData.total_amount = total_amount;
  if (tax_amount !== undefined) updateData.tax_amount = tax_amount;
  if (due_date !== undefined) updateData.due_date = due_date;
  if (project_id !== undefined) updateData.project_id = project_id;
  if (client_id !== undefined) updateData.client_id = client_id;

  const { data: invoice, error: updateError } = await client
    .from("invoices")
    .update(updateData)
    .eq("id", invoice_id)
    .select()
    .single();

  if (updateError) {
    return jsonResponse({ error: updateError.message }, 500);
  }

  return jsonResponse({ message: "Invoice updated", invoice });
}

// --- Send invoice (change status from Draft to Sent) ---
async function handleSendInvoice(
  client: ReturnType<typeof createClient>,
  body: Record<string, unknown>
) {
  const { invoice_id } = body;

  if (!invoice_id) {
    return jsonResponse({ error: "invoice_id is required" }, 400);
  }

  const { data: invoice, error: updateError } = await client
    .from("invoices")
    .update({ status: "Sent" })
    .eq("id", invoice_id)
    .select("id, project_id, client_id, total_amount, due_date, status")
    .single();

  if (updateError) {
    return jsonResponse({ error: updateError.message }, 500);
  }

  // Trigger notification for new invoice (fire-and-forget)
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        type: "INSERT",
        table: "invoices",
        record: invoice,
      }),
    });
  } catch {
    // Notification failure should not block the send
  }

  return jsonResponse({ message: "Invoice sent", invoice });
}

// --- Helper: JSON response ---
function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
