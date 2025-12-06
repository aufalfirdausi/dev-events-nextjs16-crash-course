import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
    try {
    await connectDB
    } catch (e) {
        console.error(e);
        return NextResponse.json({message: 'Event creation failded', error: e instanceof Error ? e.message : 'Unknown error'})
    }
}