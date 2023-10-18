import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const user = await currentProfile();
    if (user?.length === 0)
      return new NextResponse("User not found", { status: 401 });
    const payload = await req.json();
    const res = await axios.post("http://localhost:6000/tag", payload);
    return NextResponse.json({ data: res.data });
  } catch (e) {
    // console.log("AUTH FAILED", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
