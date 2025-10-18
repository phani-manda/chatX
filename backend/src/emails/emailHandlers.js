import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Invalid email address');
  }
  if (!name || typeof name !== 'string') {
    throw new Error('Name is required');
  }
  if (!clientURL || typeof clientURL !== 'string') {
    throw new Error('Client URL is required');
  }

  try {
    const response = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to Chatify!",
      html: createWelcomeEmailTemplate(name, clientURL),
    });
    // Resend returns an object with id/data; log it for debugging
    console.log("Welcome Email API response:", response);
    return response;
  } catch (error) {
    console.error("Error sending welcome email (resend):", error);
    // Re-throw so callers can decide how to handle it
    throw error;
  }
};   