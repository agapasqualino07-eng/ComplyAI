import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ docId: string }> },
) {
  const { docId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { data: doc, error } = await supabase
    .from("documents")
    .select("title, rendered_html, language")
    .eq("id", docId)
    .maybeSingle();
  if (error || !doc) return NextResponse.json({ error: "Documento non trovato" }, { status: 404 });

  const html = `<!doctype html>
<html lang="${doc.language}">
<head>
<meta charset="utf-8" />
<title>${doc.title}</title>
<style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:780px;margin:40px auto;padding:0 20px;color:#111;line-height:1.55}
h1{font-size:26px;margin-bottom:6px}
h2{font-size:18px;margin-top:24px}
h3{font-size:16px;margin-top:18px}
table{border-collapse:collapse;width:100%;margin:12px 0}
th,td{border:1px solid #ccc;padding:8px;text-align:left}
hr{margin:30px 0;border:none;border-top:1px solid #ddd}
a{color:#5b21b6}
</style>
</head>
<body>
${doc.rendered_html}
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.title)}.html"`,
    },
  });
}
