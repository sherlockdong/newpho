import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import {
    getAdminFirestore,
    verifyFirebaseToken,
} from "../../../middleware/auth";

export const runtime = "nodejs";

type SendUpdateBody = {
    subject?: string;
    htmlContent?: string;
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(
    request: NextRequest,
): Promise<Response> {

    try {
        /*
         * This route sends email to every subscribed user, so it must be
         * restricted. This example expects an `admin: true` Firebase custom claim.
         */
        const authResult = await verifyFirebaseToken(request);

        if (authResult.response) {
            return authResult.response;
        }

        if (authResult.user.admin !== true) {
            return NextResponse.json(
                { error: "Administrator access required" },
                { status: 403 },
            );
        }

        const resendApiKey = process.env.RESEND_API_KEY;

        if (!resendApiKey) {
            console.error("RESEND_API_KEY is not configured");

            return NextResponse.json(
                { error: "Email service is not configured" },
                { status: 500 },
            );
        }

        const rawBody: unknown = await request.json();

        if (
            typeof rawBody !== "object" ||
            rawBody === null ||
            Array.isArray(rawBody)
        ) {
            return NextResponse.json(
                { error: "Request body must be a JSON object" },
                { status: 400 },
            );
        }

        const body = rawBody as SendUpdateBody;

        const subject =
            typeof body.subject === "string" && body.subject.trim()
                ? body.subject.trim()
                : "System Update // VECTOR";

        const htmlContent =
            typeof body.htmlContent === "string" &&
                body.htmlContent.trim()
                ? body.htmlContent
                : "<h3>System parameters have been updated. Log in to sync telemetry.</h3>";

        if (subject.length > 200) {
            return NextResponse.json(
                { error: "Subject is too long" },
                { status: 400 },
            );
        }

        if (htmlContent.length > 100_000) {
            return NextResponse.json(
                { error: "Email content is too large" },
                { status: 400 },
            );
        }

        const usersSnapshot = await getAdminFirestore()
            .collection("users")
            .where("wantsUpdateNotifications", "==", true)
            .get();

        const recipients = usersSnapshot.docs
            .map((document) => document.data().email)
            .filter(
                (email): email is string =>
                    typeof email === "string" && email.includes("@"),
            );

        const uniqueRecipients = [...new Set(recipients)];

        if (uniqueRecipients.length === 0) {
            return NextResponse.json({
                message: "No subscribed operators found.",
                count: 0,
            });
        }

        const resend = new Resend(resendApiKey);

        const result = await resend.emails.send({
            // Replace with a sender address on a domain verified in Resend.
            from: "Vector System <updates@yourdomain.com>",

            // Replace with a real internal address.
            to: "operators-list@yourdomain.com",

            bcc: uniqueRecipients,
            subject,
            html: htmlContent,
        });

        if (result.error) {
            console.error("Resend broadcast failed:", result.error);

            return NextResponse.json(
                { error: "Email broadcast failed" },
                { status: 502 },
            );
        }

        return NextResponse.json({
            success: true,
            count: uniqueRecipients.length,
            emailId: result.data?.id ?? null,
        });
    } catch (error: unknown) {
        console.error("POST /api/send-update failed:", error);

        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
