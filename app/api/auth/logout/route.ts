import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.set("nexis_session", "", { path: "/", maxAge: 0 });

    return NextResponse.json({ success: true });
}
