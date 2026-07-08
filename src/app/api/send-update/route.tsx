import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin safely
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { subject, htmlContent } = await request.json();

        // 1. Grab all operators who opted into updates
        const usersSnapshot = await db
            .collection('users')
            .where('wantsUpdateNotifications', '==', true)
            .get();

        if (usersSnapshot.empty) {
            return NextResponse.json({ message: 'No subscribed operators found.' });
        }

        const recipients = [];
        usersSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.email) recipients.push(data.email);
        });

        // 2. Broadcast via Resend
        const { data, error } = await resend.emails.send({
            from: 'Vector System <updates@yourdomain.com>',
            to: 'operators-list@yourdomain.com', // Masked primary address
            bcc: recipients,                     // Hides user emails from one another
            subject: subject || "System Update // VECTOR",
            html: htmlContent || "<h3>System parameters have been updated. Log in to sync telemetry.</h3>",
        });

        if (error) return NextResponse.json({ error }, { status: 400 });

        return NextResponse.json({ success: true, count: recipients.length });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}