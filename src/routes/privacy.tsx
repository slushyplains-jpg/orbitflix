import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ORBIT" },
      { name: "description", content: "How ORBIT handles your data, cookies, and privacy." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="ORBIT is designed with privacy as a core principle. Here's exactly what we collect and why."
      updated="June 24, 2026"
      sections={[
        {
          h: "Information We Collect",
          body: (
            <>
              <p>ORBIT does not require user registration to browse content. We do not collect personal information such as names, email addresses, or payment details from anonymous visitors.</p>
              <p>If you create an account, we store your email address solely for authentication purposes.</p>
            </>
          ),
        },
        {
          h: "Local Storage",
          body: <p>We use your browser's localStorage to save your watchlist and viewing preferences. This data is stored entirely on your device and is never transmitted to our servers. You can clear this data at any time through your browser settings.</p>,
        },
        {
          h: "Cookies",
          body: <p>ORBIT does not use tracking cookies. Third-party embed providers may set their own cookies when you play video content. We have no control over these third-party cookies. You can manage or block them via your browser settings.</p>,
        },
        {
          h: "Analytics",
          body: <p>We use Google Analytics to understand aggregated site traffic patterns. This data is anonymized — no personally identifiable information is collected or stored. You can opt out via the <a href="/cookies" className="text-ice hover:underline">Cookie Preferences</a> page.</p>,
        },
        {
          h: "Third-Party Services",
          body: <p>Video content is provided by third-party embed services. These services operate under their own privacy policies. ORBIT is not responsible for the privacy practices of third-party providers. Content metadata is sourced from The Movie Database (TMDb) API.</p>,
        },
        {
          h: "Data Security",
          body: <p>All connections to ORBIT are encrypted via HTTPS/TLS. We implement security headers (HSTS, X-Content-Type-Options, X-Frame-Options) to protect against common web vulnerabilities.</p>,
        },
        {
          h: "Children's Privacy",
          body: <p>ORBIT does not knowingly collect information from children under 13. If you are a parent or guardian and believe your child has provided personal information, please contact us immediately.</p>,
        },
        {
          h: "Changes to This Policy",
          body: <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of ORBIT after changes constitutes your acceptance.</p>,
        },
      ]}
    />
  ),
});
