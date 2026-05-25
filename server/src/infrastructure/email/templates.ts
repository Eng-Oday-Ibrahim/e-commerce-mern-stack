export function welcomeEmailTemplate(input: { name: string }) {
  const safeName = input.name?.trim() || 'there';
  const subject = `Welcome, ${safeName}!`;
  const text = `Hi ${safeName},\n\nWelcome to Sudanista.\n\n— Sudanista Team`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <p>Hi <b>${escapeHtml(safeName)}</b>,</p>
      <p>Welcome to Sudanista.</p>
      <p>— Sudanista Team</p>
    </div>
  `.trim();

  return { subject, text, html };
}

export function passwordResetTemplate(input: { code: string; minutes: number }) {
  const subject = `Your password reset code`;
  const text = `Use this code to reset your password: ${input.code}\n\nThis code expires in ${input.minutes} minutes.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <p>Use this code to reset your password:</p>
      <p style="font-size:20px;font-weight:700;letter-spacing:2px">${escapeHtml(input.code)}</p>
      <p style="color:#555">This code expires in ${input.minutes} minutes.</p>
    </div>
  `.trim();
  return { subject, text, html };
}

export function invitationTemplate(input: { name: string; code: string; hours: number }) {
  const safeName = input.name?.trim() || 'there';
  const subject = `You're invited to join Sudanista`;
  const text = `Hi ${safeName},\n\nYour invitation code is: ${input.code}\n\nThis code expires in ${input.hours} hours.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <p>Hi <b>${escapeHtml(safeName)}</b>,</p>
      <p>Your invitation code is:</p>
      <p style="font-size:20px;font-weight:700;letter-spacing:2px">${escapeHtml(input.code)}</p>
      <p style="color:#555">This code expires in ${input.hours} hours.</p>
    </div>
  `.trim();
  return { subject, text, html };
}

export function invitePasswordTemplate(input: { name: string; password: string }) {
  const safeName = input.name?.trim() || 'there';
  const subject = `Your Sudanista login password`;
  const text = `Hi ${safeName},\n\nYour account is ready. Use this password to sign in: ${input.password}\n\nPlease change it after first login.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <p>Hi <b>${escapeHtml(safeName)}</b>,</p>
      <p>Your admin account is ready. Use this password to sign in:</p>
      <p style="font-size:20px;font-weight:700;letter-spacing:1px">${escapeHtml(input.password)}</p>
      <p style="color:#555">Please change your password after signing in.</p>
    </div>
  `.trim();
  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

