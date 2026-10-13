import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabaseAdmin } from "../lib/supabase-admin";
import { getRequestPrincipal } from "../lib/requestAuth";

// SVG is excluded: an uploaded SVG can carry script that runs when the file
// is opened directly from the public storage URL.
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const principal = await getRequestPrincipal(req);
  if (!principal) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const extension = EXTENSION_BY_TYPE[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WEBP are allowed." }, { status: 400 });
    }

    const maxSize = 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max size is 1MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${nanoid()}.${extension}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("bot-avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage error:", uploadError);
      return NextResponse.json({ error: "Failed to upload to cloud storage" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("bot-avatars")
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
