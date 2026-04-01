// EmployaLingua® — confirmation-email Edge Function
// Triggered by Supabase Database Webhook on INSERT to commissioner_interest
// Calls Resend API to send a branded confirmation email
//
// Deploy: supabase functions deploy confirmation-email --no-verify-jwt
// Secret: supabase secrets set RESEND_API_KEY=re_yourKey

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Update FROM_EMAIL once employalingua.com is verified in Resend
const FROM_EMAIL  = 'support@employalingua.com';      // → 'support@employalingua.com' after DNS
const FROM_NAME   = 'EmployaLingua®';
const REPLY_TO    = 'support@employalingua.com';
const RESEND_URL  = 'https://api.resend.com/emails';
// ─────────────────────────────────────────────────────────────────────────────

const NAVY   = '#0C2A5C';
const TEAL   = '#00897B';
const WHITE  = '#FFFFFF';
const LIGHT  = '#F8FAFB';
const TEXT   = '#374151';
const MUTED  = '#6B7280';

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>EmployaLingua®</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F1F5F9;padding:40px 16px;">
    <tr><td align="center">

      <!-- card -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
        style="max-width:600px;background:${WHITE};border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">

        <!-- header -->
        <tr>
          <td style="background:${NAVY};padding:32px 40px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:400;color:${WHITE};letter-spacing:-0.01em;">Employa<span style="font-style:italic;">L</span>ingua&#174;</p>
            <p style="margin:6px 0 0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Vocational Fluency Platform</p>
          </td>
        </tr>

        <!-- body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${content}
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="background:${LIGHT};border-top:1px solid #E5E7EB;padding:24px 40px;">
            <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.6;">
              EmployaLingua® is a registered trademark of Pathfinder Educational Limited (UK00004293596).
              This email was sent because you submitted a form at
              <a href="https://employalingua.com" style="color:${TEAL};text-decoration:none;">employalingua.com</a>.
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:${MUTED};">
              &copy; 2025 Pathfinder Educational Limited &nbsp;·&nbsp; Manchester, England
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function interestEmail(record: Record<string, unknown>): { subject: string; html: string } {
  const name        = `${record.first_name} ${record.last_name}`;
  const org         = record.organisation as string;
  const sectors     = (record.sectors as string[] | null)?.join(', ') || 'Not specified';
  const cohort      = (record.cohort_size as string | null) || 'Not specified';
  const cohortType  = (record.cohort_type as string | null) || null;

  const content = `
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:${NAVY};">Thank you, ${record.first_name}.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};line-height:1.7;">
      We've received your commissioning enquiry for <strong>${org}</strong>.
      A member of the EmployaLingua® team will be in touch within 48 hours
      to arrange an initial conversation.
    </p>

    <!-- summary box -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:${LIGHT};border-radius:8px;border:1px solid #E5E7EB;margin-bottom:28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">
          Your submission
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;width:130px;">Name</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${name}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;">Organisation</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${org}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;">Role</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${record.role}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;">Sectors</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${sectors}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;">Cohort size</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${cohort}</td>
          </tr>
          ${cohortType ? `
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;">Cohort type</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${cohortType}</td>
          </tr>` : ''}
        </table>
      </td></tr>
    </table>

    <!-- what happens next -->
    <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">
      What happens next
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${['We contact you within 48 hours — by email, from the EmployaLingua® team directly.',
         'A live demo or discovery call — your choice — to walk through the platform and discuss your cohort.',
         'A tailored commissioning proposal scoped to your cohort size, sectors, and delivery model.'
        ].map((step, i) => `
      <tr>
        <td valign="top" style="width:32px;padding:6px 0;">
          <div style="width:24px;height:24px;background:${TEAL};border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:${WHITE};">${i + 1}</div>
        </td>
        <td style="font-size:14px;color:${TEXT};line-height:1.6;padding:6px 0 6px 8px;">${step}</td>
      </tr>`).join('')}
    </table>

    <p style="margin:28px 0 0;font-size:14px;color:${MUTED};line-height:1.65;">
      In the meantime, you can review the platform overview at
      <a href="https://employalingua.com" style="color:${TEAL};text-decoration:none;">employalingua.com</a>
      or forward this email to a colleague who may be interested.
    </p>`;

  return {
    subject: `EmployaLingua® — Commissioner interest received`,
    html:    baseLayout(content)
  };
}

function demoEmail(record: Record<string, unknown>): { subject: string; html: string } {
  const name    = `${record.first_name} ${record.last_name}`;
  const org     = record.organisation as string;
  const time    = (record.demo_time as string | null) || 'Flexible';
  const notes   = record.demo_notes as string | null;

  const content = `
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:${NAVY};">Demo request received, ${record.first_name}.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};line-height:1.7;">
      We'll confirm a time within 48 hours. The demo covers the full
      learner path, the partner portal, and the CEFR Passport and Smart
      CV outputs — tailored to your sector of interest.
    </p>

    <!-- summary box -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:${LIGHT};border-radius:8px;border:1px solid #E5E7EB;margin-bottom:28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">
          Your request
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;width:130px;">Name</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${name}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;">Organisation</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${org}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;">Role</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${record.role}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;">Preferred time</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${time}</td>
          </tr>
          ${notes ? `
          <tr>
            <td style="font-size:13px;color:${MUTED};padding:4px 0;vertical-align:top;">Focus areas</td>
            <td style="font-size:13px;color:${NAVY};padding:4px 0;font-weight:500;">${notes}</td>
          </tr>` : ''}
        </table>
      </td></tr>
    </table>

    <!-- what you'll see -->
    <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">
      What the demo covers
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${['The learner path — push delivery, CEFR-tracked progression, and dignity-infused AI conversation simulations.',
         'The partner portal — live cohort tracking, employment-readiness indicators, and Smart CV access.',
         'The CEFR Passport and Smart CV outputs — how they build automatically and what an employer sees.',
         'Sector pathways: Healthcare, Construction, Digital, and Teaching — and how each is configured.',
         'Commissioning options, pricing, and how EmployaLingua® fits your existing programme structure.'
        ].map(item => `
      <tr>
        <td valign="top" style="width:16px;padding:5px 0;">
          <div style="width:6px;height:6px;background:${TEAL};border-radius:50%;margin-top:5px;"></div>
        </td>
        <td style="font-size:14px;color:${TEXT};line-height:1.6;padding:5px 0 5px 10px;">${item}</td>
      </tr>`).join('')}
    </table>

    <p style="margin:28px 0 0;font-size:14px;color:${MUTED};line-height:1.65;">
      If you need to reach us before then, reply directly to this email.
    </p>`;

  return {
    subject: `EmployaLingua® — Your demo request`,
    html:    baseLayout(content)
  };
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY secret not set');
    return new Response('Server configuration error', { status: 500 });
  }

  let body: { record?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const record = body?.record;
  if (!record?.email) {
    console.error('No record or email in payload', body);
    return new Response('Missing record', { status: 400 });
  }

  const isDemo  = record.submission_type === 'demo';
  const { subject, html } = isDemo ? demoEmail(record) : interestEmail(record);

  const payload = {
    from:     `${FROM_NAME} <${FROM_EMAIL}>`,
    reply_to: REPLY_TO,
    to:       [record.email as string],
    subject,
    html,
  };

  const resendRes = await fetch(RESEND_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const resendBody = await resendRes.json();

  if (!resendRes.ok) {
    console.error('Resend API error:', resendBody);
    return new Response(JSON.stringify({ error: resendBody }), {
      status: resendRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log('Email sent:', resendBody.id, '→', record.email);
  return new Response(JSON.stringify({ success: true, id: resendBody.id }), {
    status:  200,
    headers: { 'Content-Type': 'application/json' },
  });
});