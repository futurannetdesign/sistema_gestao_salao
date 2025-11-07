// Supabase Edge Function para hash de senhas usando bcrypt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Importar bcrypt para Deno
import { compare, hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { senha, hash } = await req.json();

    // Se hash for fornecido, verificar senha
    if (hash) {
      const isValid = await compare(senha, hash);
      return new Response(
        JSON.stringify({ valid: isValid }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Se não, fazer hash da senha
    const hashedPassword = await hash(senha);

    return new Response(
      JSON.stringify({ hash: hashedPassword }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

