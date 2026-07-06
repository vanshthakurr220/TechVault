export const sendEmailWithBrevo = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          name: "TechVault",
          email: "vanshthakurr220@gmail.com",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo email error:", data);
      return false;
    }

    console.log("Brevo email sent:", data);
    return true;
  } catch (error) {
    console.error("Brevo send failed:", error);
    return false;
  }
};
