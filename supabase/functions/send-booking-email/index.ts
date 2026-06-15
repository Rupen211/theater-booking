const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingRef, movieTitle, date, time, hall, seats, tickets, total, name, email } =
      await req.json()

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')

    const ticketRows = tickets
      .map(
        ({ type, qty, price }: { type: string; qty: number; price: number }) => `
          <tr>
            <td style="padding:8px 0;color:#9ca3af;text-transform:capitalize;">${type} × ${qty}</td>
            <td style="padding:8px 0;color:#e5e7eb;text-align:right;">£${(qty * price).toFixed(2)}</td>
          </tr>`
      )
      .join('')

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:40px auto;background:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#92400e 0%,#78350f 100%);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fbbf24;font-size:30px;font-weight:900;letter-spacing:-0.5px;">CineBook</h1>
      <p style="margin:6px 0 0;color:#fde68a;font-size:14px;letter-spacing:1px;">BOOKING CONFIRMED</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="margin:0 0 24px;color:#d1d5db;font-size:16px;">Hi ${name.split(' ')[0]},</p>
      <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.6;">
        Your booking is confirmed — we look forward to seeing you at the cinema!
      </p>

      <!-- Booking reference -->
      <div style="background:#1c1c1c;border:1px solid #fbbf24;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 6px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:3px;">Booking Reference</p>
        <p style="margin:0;color:#fbbf24;font-size:34px;font-weight:900;letter-spacing:5px;">${bookingRef}</p>
      </div>

      <!-- Film details -->
      <div style="background:#1a1a1a;border:1px solid #262626;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 14px;color:#f9fafb;font-weight:700;font-size:15px;">Film Details</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:7px 0;color:#6b7280;width:38%;">Film</td>
            <td style="padding:7px 0;color:#f9fafb;font-weight:600;">${movieTitle}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;border-top:1px solid #262626;color:#6b7280;">Date</td>
            <td style="padding:7px 0;border-top:1px solid #262626;color:#f9fafb;">${date}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;border-top:1px solid #262626;color:#6b7280;">Time</td>
            <td style="padding:7px 0;border-top:1px solid #262626;color:#f9fafb;">${time}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;border-top:1px solid #262626;color:#6b7280;">Hall</td>
            <td style="padding:7px 0;border-top:1px solid #262626;color:#f9fafb;">${hall}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;border-top:1px solid #262626;color:#6b7280;">Seats</td>
            <td style="padding:7px 0;border-top:1px solid #262626;color:#f9fafb;">${seats}</td>
          </tr>
        </table>
      </div>

      <!-- Ticket breakdown -->
      <div style="background:#1a1a1a;border:1px solid #262626;border-radius:12px;padding:20px;margin-bottom:28px;">
        <p style="margin:0 0 14px;color:#f9fafb;font-weight:700;font-size:15px;">Tickets</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${ticketRows}
          <tr>
            <td style="padding:14px 0 0;border-top:1px solid #2a2a2a;color:#f9fafb;font-weight:700;font-size:16px;">Total Paid</td>
            <td style="padding:14px 0 0;border-top:1px solid #2a2a2a;color:#fbbf24;font-weight:900;font-size:22px;text-align:right;">£${total}</td>
          </tr>
        </table>
      </div>

      <p style="color:#4b5563;font-size:13px;text-align:center;margin:0;line-height:1.6;">
        Please present this email or your booking reference at the box office.<br/>
        Enjoy the show! 🎬
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #1f1f1f;text-align:center;">
      <p style="margin:0;color:#374151;font-size:12px;">CineBook — Your local cinema booking service</p>
    </div>
  </div>
</body>
</html>`

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CineBook <booking@cineBook.com>',
        to: [email],
        subject: 'Booking Confirmed',
        html,
      }),
    })

    const result = await resendRes.json()

    return new Response(JSON.stringify(result), {
      status: resendRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
