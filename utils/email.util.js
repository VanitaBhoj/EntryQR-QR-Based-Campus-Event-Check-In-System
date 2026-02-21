import nodemailer from "nodemailer";

let transporter;

// Initialize transporter with Ethereal (test email service)
// For production, you can switch to a real email service
const initializeTransporter = async () => {
  if (transporter) return transporter;

  // Check if using Ethereal (free test service) or real email service
  if (process.env.EMAIL_SERVICE === "ethereal" || !process.env.EMAIL_USER) {
    // Create a disposable Ethereal email account for testing
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log("📧 Using Ethereal test email service");
    console.log("Test credentials:", { user: testAccount.user, pass: testAccount.pass });
  } else {
    // Use real email service (Gmail, SendGrid, etc.)
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    console.log("📧 Using", process.env.EMAIL_SERVICE || "Gmail", "email service");
  }

  return transporter;
};

export const sendQRMail = async ({ to, name, qrImage, eventName = "Event" }) => {
  try {
    const transport = await initializeTransporter();
    
    const mailOptions = {
      from: `"QR Check-in System" <${transport.options.auth.user}>`,
      to,
      subject: `Your QR Code for ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); color: #fff; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0; color: #ffd700;">Event QR Check-in System</h2>
          </div>
          
          <div style="background: #f8f7f4; padding: 32px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #1a365d; margin-top: 0;">Hello ${name},</h3>
            
            <p style="color: #2d3748; font-size: 14px; line-height: 1.6;">
              Thank you for registering for <strong>${eventName}</strong>. 
              Please find your QR code below. Show this code at the event entrance for check-in.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <div style="background: #fff; padding: 16px; border-radius: 8px; border: 2px solid #d6d1c9; display: inline-block;">
                <img src="${qrImage}" alt="QR Code" style="max-width: 240px; max-height: 240px; display: block;">
              </div>
            </div>
            
            <div style="background: #fff; padding: 16px; border-radius: 8px; border-left: 4px solid #b8860b;">
              <p style="color: #2d3748; font-size: 13px; margin: 0;">
                <strong>Instructions:</strong><br>
                1. Keep this email or the QR code easily accessible<br>
                2. Arrive at the event venue<br>
                3. Show the QR code to a volunteer for scanning<br>
                4. You're checked in!
              </p>
            </div>
            
            <p style="color: #718096; font-size: 12px; margin: 24px 0 0; text-align: center; border-top: 1px solid #d6d1c9; padding-top: 16px;">
              If you have any questions, please contact the event organizer.
            </p>
          </div>
        </div>
      `,
      text: `Your QR Code for ${eventName}\n\nHello ${name},\n\nPlease show this QR code at the event entrance.`
    };

    const info = await transport.sendMail(mailOptions);
    
    // For Ethereal, log the preview URL
    if (process.env.EMAIL_SERVICE === "ethereal" || !process.env.EMAIL_USER) {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error("Error sending email to", to, ":", error.message);
    throw error;
  }
};

export const sendBulkQRMail = async (participants) => {
  const transport = await initializeTransporter();
  const results = {
    sent: [],
    failed: []
  };

  for (const participant of participants) {
    try {
      await sendQRMail({
        to: participant.email,
        name: participant.name,
        qrImage: participant.qrImage,
        eventName: participant.eventName || "Event"
      });
      results.sent.push(participant.email);
    } catch (error) {
      results.failed.push({
        email: participant.email,
        error: error.message
      });
    }
  }

  return results;
};

// Test the connection
export const testEmailConnection = async () => {
  try {
    const transport = await initializeTransporter();
    await transport.verify();
    console.log("✅ Email service is ready");
    return true;
  } catch (error) {
    console.error("❌ Email service error:", error.message);
    return false;
  }
};

export default { sendQRMail, sendBulkQRMail, testEmailConnection };
