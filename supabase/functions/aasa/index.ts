import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const aasaPayload = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "R2KP28N6MD.com.slippytoad.JFWViolationsApp",
        paths: ["*"],
      },
      {
        appIDs: ["R2KP28N6MD.com.slippytoad.JFWViolationsApp"],
        components: [
          {
            "/": "*",
          },
        ],
      },
    ],
  },
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const commonHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    // Apple recommends no caching during setup; adjust later if desired
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  };

  if (req.method === "HEAD") {
    return new Response(null, { headers: commonHeaders });
  }

  return new Response(JSON.stringify(aasaPayload), {
    headers: commonHeaders,
  });
});
