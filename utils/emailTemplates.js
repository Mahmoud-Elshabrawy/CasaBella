const OTP_EMAIL_TYPES = {
  PASSWORD_RESET: "password-reset",
  EMAIL_VERIFICATION: "email-verification",
};

const EMAIL_CONTENT = {
  [OTP_EMAIL_TYPES.PASSWORD_RESET]: {
    documentTitle: "CasaBella Password Reset OTP",
    heading: "Password Reset Verification",
    message:
      "We received a request to reset the password for your <strong>CasaBella</strong> account. Use the one-time verification code below to continue:",
    codeLabel: "Password Reset Code",
    securityNotice:
      "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.",
  },
  [OTP_EMAIL_TYPES.EMAIL_VERIFICATION]: {
    documentTitle: "CasaBella Email Verification OTP",
    heading: "Verify Your Email Address",
    message:
      "Thank you for creating a <strong>CasaBella</strong> account. Use the one-time verification code below to verify your email address:",
    codeLabel: "Email Verification Code",
    securityNotice:
      "If you didn't create a CasaBella account, you can safely ignore this email.",
  },
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const generateOtpEmail = (
  otp,
  userName = "Valued Customer",
  type = OTP_EMAIL_TYPES.PASSWORD_RESET,
  message,
) => {
  const content = EMAIL_CONTENT[type];

  if (!content) {
    throw new Error("INVALID_OTP_EMAIL_TYPE");
  }

  const currentYear = new Date().getFullYear();
  const safeOtp = escapeHtml(otp);
  const safeUserName = escapeHtml(userName);
  const emailMessage = message ? escapeHtml(message) : content.message;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.documentTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f8; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f8; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 122, 135, 0.08); border: 1px solid #e8eff1;">
          
          <!-- Top Accent Bar (Teal to Soft Rose Gradient) -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #007A87 0%, #009DAE 70%, #F4A5AE 100%);"></td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td align="center" style="padding: 40px 30px 25px 30px; text-align: center;">
              
              <!-- House & Brand Icon -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center" style="width: 64px; height: 64px; background: #eaf4f6; border-radius: 16px; border: 1px solid #c9e4e8;">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#007A87" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </td>
                </tr>
              </table>

              <!-- Arabic Brand Name -->
              <div style="font-size: 28px; font-weight: 800; color: #007A87; letter-spacing: 1px; line-height: 1.2; margin-bottom: 2px;">
                كـازابـيـلا
              </div>
              
              <!-- English Brand Name -->
              <div style="font-size: 16px; font-weight: 700; color: #1E242B; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 4px;">
                CASA BELLA
              </div>
              
              <!-- Subtitle -->
              <div style="font-size: 10px; font-weight: 600; color: #8C9BA5; letter-spacing: 2.5px; text-transform: uppercase;">
                Design & Home Decor
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #EEF2F4;"></div>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 35px 40px 30px 40px;">
              
              <!-- Title -->
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1E242B; text-align: center;">
                ${content.heading}
              </h1>

              <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #1E242B; text-align: center;">
                Hello <strong>${safeUserName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #5A6A75; text-align: center;">
                ${emailMessage}
              </p>

              <!-- OTP Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: #F0F8F9; border: 2px dashed #007A87; border-radius: 14px; padding: 18px 36px; text-align: center;">
                      <span style="display: block; font-size: 11px; font-weight: 700; color: #007A87; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
                        ${content.codeLabel}
                      </span>
                      <span style="font-family: 'Courier New', Courier, monospace, 'Segoe UI'; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #007A87; display: inline-block; padding-left: 10px;">
                        ${safeOtp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFF6F7; border-left: 4px solid #F4A5AE; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 10px; font-size: 16px;">⏱️</td>
                        <td style="font-size: 13px; color: #69383E; line-height: 1.5;">
                          This code will expire in <strong>10 minutes</strong>. Do not share this OTP with anyone.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #8C9BA5; text-align: center;">
                ${content.securityNotice}
              </p>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #F8FBFC; padding: 25px 40px; text-align: center; border-top: 1px solid #EEF2F4;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #007A87;">
                CasaBella — Elegant Living & Design
              </p>
              <p style="margin: 0; font-size: 11px; color: #A0ACB3;">
                © ${currentYear} CasaBella. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <!-- Small Email Footer Note -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin-top: 16px;">
          <tr>
            <td align="center" style="font-size: 11px; color: #A0ACB3;">
              This is an automated security message from CasaBella. Please do not reply directly to this email.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

exports.generateOtpEmail = generateOtpEmail;

exports.generatePasswordResetEmail = (otp, userName, message) =>
  generateOtpEmail(
    otp,
    userName,
    OTP_EMAIL_TYPES.PASSWORD_RESET,
    message,
  );

exports.generateEmailVerificationEmail = (otp, userName, message) =>
  generateOtpEmail(
    otp,
    userName,
    OTP_EMAIL_TYPES.EMAIL_VERIFICATION,
    message,
  );
