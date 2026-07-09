import { NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured');
    }

    return new Resend(apiKey);
}

export async function POST(request) {
    try {
        const resend = getResendClient();
        const { email, displayName, wantsUpdates } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Build out the welcome email array
        const emailData = {
            from: 'Vector System <system@yourdomain.com>',
            to: email,
            subject: '🚀 Profile Initialized | VECTOR Physics',
            html: `
        <div style="font-family: monospace; background-color: #050510; color: #e8eaf6; padding: 40px; border-radius: 16px;">
          <h1 style="color: #4f8ef7; border-bottom: 1px solid #27272a; padding-bottom: 10px;">SYSTEM ACCESS GRANTED</h1>
          <p>Welcome, <strong>${displayName || 'Operator'}</strong>.</p>
          <p>Your profile has been successfully synced with the PHO-Guide telemetry dashboard. Your diagnostic logs are now active.</p>
          
          ${wantsUpdates ? `
            <div style="background-color: rgba(79, 142, 247, 0.1); border: 1px solid rgba(79, 142, 247, 0.3); padding: 15px; border-radius: 8px; margin-top: 20px;">
              <span style="color: #a78bfa; font-weight: bold;">[✓] NOTIFICATIONS ACTIVE</span>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #94a3b8;">You will receive high-priority transmissions regarding system updates and new training modules as they drop.</p>
            </div>
          ` : ''}
          
          <p style="margin-top: 30px; font-size: 11px; color: #52525b; border-top: 1px solid #27272a; padding-top: 15px;">
            Secure transmission // VECTOR Pre-College Physics Olympics
          </p>
        </div>
      `,
        };

        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}