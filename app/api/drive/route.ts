import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");

    if (!fileId) {
        return new NextResponse("Missing fileId", { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    try {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`);

        if (!response.ok) {
            return new NextResponse(`Drive API Error: ${response.status}`, { status: response.status });
        }

        const buffer = await response.arrayBuffer();
        
        const headers = new Headers();
        const contentType = response.headers.get("Content-Type");
        if (contentType) {
            headers.set("Content-Type", contentType);
        }
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new NextResponse(buffer, {
            status: 200,
            headers
        });
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
