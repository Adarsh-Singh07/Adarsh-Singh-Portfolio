import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ContactEmailProps {
  name?: string;
  subject?: string;
  message?: string;
}

export const ContactAutoReplyEmail = ({
  name = "{{name}}",
  subject = "{{subject}}",
  message = "{{message}}",
}: ContactEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your message has been received. Here's what happens next.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header / Logo */}
          <Section style={headerSection}>
            <Text style={logo}>A S</Text>
          </Section>

          {/* Main Card */}
          <Section style={card}>
            <Heading style={heroHeading}>Thanks for reaching out 👋</Heading>
            <Text style={bodyText}>Hi {name},</Text>
            <Text style={bodyText}>
              Thank you for contacting me through my portfolio. I've successfully received your message and will personally review it as soon as possible.
            </Text>

            {/* Status Info Grid */}
            <Section style={infoGrid}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tr>
                  <td style={infoLabel}>Status</td>
                  <td style={infoValue}>
                    <span style={{ color: "#10B981" }}>●</span> Received Successfully
                  </td>
                </tr>
                <tr>
                  <td style={infoLabel}>Expected Response</td>
                  <td style={infoValue}>Within 24 hours</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Direct Email</td>
                  <td style={infoValue}>
                    <Link href="mailto:hello@adarshsingh.in" style={inlineLink}>hello@adarshsingh.in</Link>
                  </td>
                </tr>
              </table>
            </Section>

            <Hr style={divider} />

            {/* Message Preview Section */}
            <Heading style={sectionHeading}>Your Message</Heading>
            <Section style={messageBox}>
              <Text style={messageSubject}><strong>Sub:</strong> {subject}</Text>
              <Text style={messageBody}>"{message}"</Text>
            </Section>

            <Hr style={divider} />

            {/* Focus Section */}
            <Heading style={sectionHeading}>Current Focus</Heading>
            <Text style={bodyText}>
              I'm an AI & Data Engineer passionate about building production-ready AI systems, RAG pipelines, multi-agent workflows, and intelligent automation.
            </Text>
            
            <table style={{ width: "100%", marginTop: "16px" }}>
              <tr>
                <td style={tag}>Agentic AI</td>
                <td style={tag}>Data Engineering</td>
              </tr>
              <tr>
                <td style={tag}>LangGraph & LangChain</td>
                <td style={tag}>Python</td>
              </tr>
              <tr>
                <td style={tag}>Azure & Databricks</td>
                <td style={tag}>Cloud Architecture</td>
              </tr>
            </table>

            {/* Call To Actions */}
            <Section style={ctaContainer}>
              <Button href="https://adarshsingh.in" style={primaryButton}>
                Explore My Work
              </Button>
              <Button href="https://adarshsingh.in/resume" style={secondaryButton}>
                View Resume
              </Button>
              <Button href="https://linkedin.com/in/adarshsingh45" style={secondaryButton}>
                Connect on LinkedIn
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerMainText}>
              Looking forward to connecting with you.
            </Text>
            <Text style={signatureText}>
              <strong>Adarsh Singh</strong><br />
              AI & Data Engineer • Capgemini
            </Text>
            <Hr style={footerDivider} />
            <table style={{ width: "100%" }}>
              <tr>
                <td>
                  <Link href="https://adarshsingh.in" style={footerLink}>adarshsingh.in</Link>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Text style={footerSubtext}>Made with ❤️ using Resend</Text>
                </td>
              </tr>
            </table>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactAutoReplyEmail;

/* -------------------------------------------------------------------------- */
/*                                Styling System                              */
/* -------------------------------------------------------------------------- */

const main = {
  backgroundColor: "#F8FAFC",
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: "80px 0",
};

const container = {
  margin: "0 auto",
  maxWidth: "580px",
  padding: "0 20px",
};

const headerSection = {
  marginBottom: "32px",
  textAlign: "center" as const,
};

const logo = {
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "2px",
  color: "#111827",
  margin: "0",
};

const card = {
  backgroundColor: "#FFFFFF",
  borderRadius: "18px",
  padding: "40px",
  border: "1px solid #E5E7EB",
  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.06)",
};

const heroHeading = {
  fontSize: "26px",
  fontWeight: "700",
  color: "#111827",
  lineHeight: "1.3",
  marginBottom: "24px",
};

const sectionHeading = {
  fontSize: "14px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  fontWeight: "700",
  color: "#6B7280",
  marginBottom: "16px",
};

const bodyText = {
  fontSize: "15px",
  color: "#374151",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const infoGrid = {
  backgroundColor: "#F8FAFC",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #E5E7EB",
};

const infoLabel = {
  fontSize: "13px",
  color: "#6B7280",
  paddingBottom: "8px",
  fontWeight: "500",
};

const infoValue = {
  fontSize: "13px",
  color: "#111827",
  paddingBottom: "8px",
  textAlign: "right" as const,
  fontWeight: "600",
};

const inlineLink = {
  color: "#2563EB",
  textDecoration: "none",
};

const divider = {
  borderColor: "#E5E7EB",
  margin: "32px 0",
};

const messageBox = {
  backgroundColor: "#FAFAFA",
  borderRadius: "12px",
  padding: "20px",
  borderLeft: "4px solid #2563EB",
};

const messageSubject = {
  fontSize: "14px",
  color: "#111827",
  margin: "0 0 8px 0",
};

const messageBody = {
  fontSize: "14px",
  color: "#4B5563",
  fontStyle: "italic",
  lineHeight: "1.5",
  margin: "0",
};

const tag = {
  fontSize: "13px",
  color: "#4B5563",
  padding: "6px 0",
  fontWeight: "500",
};

const ctaContainer = {
  marginTop: "40px",
  textAlign: "center" as const,
};

const primaryButton = {
  backgroundColor: "#2563EB",
  borderRadius: "12px",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 0",
  marginBottom: "12px",
};

const secondaryButton = {
  backgroundColor: "#F1F5F9",
  borderRadius: "12px",
  color: "#334155",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 0",
  marginBottom: "12px",
  border: "1px solid #E2E8F0",
};

const footerSection = {
  marginTop: "32px",
  padding: "0 20px",
};

const footerMainText = {
  fontSize: "14px",
  color: "#4B5563",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
};

const signatureText = {
  fontSize: "14px",
  color: "#6B7280",
  textAlign: "center" as const,
  lineHeight: "1.5",
  margin: "0",
};

const footerDivider = {
  borderColor: "#E5E7EB",
  margin: "24px 0 16px 0",
};

const footerLink = {
  fontSize: "12px",
  color: "#9CA3AF",
  textDecoration: "none",
};

const footerSubtext = {
  fontSize: "12px",
  color: "#9CA3AF",
  margin: "0",
};
