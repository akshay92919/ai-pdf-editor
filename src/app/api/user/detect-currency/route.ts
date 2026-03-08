import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

/**
 * GET /api/user/detect-currency
 * Detects the user's currency based on timezone/locale headers.
 * If user is authenticated, saves the detected currency to their profile.
 * 
 * Logic: If the request originates from India (detected via timezone or Accept-Language),
 * set currency to INR. Otherwise, default to USD.
 */
export async function GET() {
  const headersList = await headers();
  
  // Detect India via common signals
  const acceptLanguage = headersList.get("accept-language") || "";
  const timezone = headersList.get("x-timezone") || "";
  
  let currency: "INR" | "USD" = "USD";
  
  // Check for Indian locale indicators
  if (
    acceptLanguage.includes("hi") ||     // Hindi
    acceptLanguage.includes("en-IN") ||  // English (India)
    acceptLanguage.includes("ta") ||     // Tamil
    acceptLanguage.includes("te") ||     // Telugu
    acceptLanguage.includes("mr") ||     // Marathi
    acceptLanguage.includes("bn") ||     // Bengali
    acceptLanguage.includes("gu") ||     // Gujarati
    acceptLanguage.includes("kn") ||     // Kannada
    acceptLanguage.includes("ml") ||     // Malayalam
    timezone.includes("Asia/Kolkata") ||
    timezone.includes("Asia/Calcutta")
  ) {
    currency = "INR";
  }

  // If authenticated, persist the detected currency
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      await prisma.user.update({
        where: { id: (session.user as any).id },
        data: { currency },
      });
    }
  } catch {
    // Non-critical: detection still works without persistence
  }

  return NextResponse.json({
    currency,
    symbol: currency === "INR" ? "₹" : "$",
    detected: true,
  });
}
