import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
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