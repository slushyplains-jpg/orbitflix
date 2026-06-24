import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ORBIT" },
      { name: "description", content: "Terms governing your use of the ORBIT streaming platform." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      description="By using ORBIT, you agree to the following terms. Please read them carefully."
      updated="June 24, 2026"
      sections={[
        {
          h: "Acceptance of Terms",
          body: <p>By accessing and using ORBIT, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.</p>,
        },
        {
          h: "Description of Service",
          body: <p>ORBIT is a content discovery platform that indexes and organizes links to video content hosted by third-party providers. ORBIT does not host, upload, or store any video files on its servers. All content is sourced from independent third-party embed services freely available on the internet.</p>,
        },
        {
          h: "User Responsibilities",
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for complying with all applicable local, state, national, and international laws and regulations.</li>
              <li>You agree not to use the service for any unlawful purpose.</li>
              <li>You agree not to attempt to gain unauthorized access to any part of the service.</li>
              <li>You agree not to use automated systems (bots, scrapers) to access the service without prior written permission.</li>
            </ul>
          ),
        },
        {
          h: "Intellectual Property",
          body: <p>All content metadata (titles, descriptions, images) is sourced from The Movie Database (TMDb) API. TMDb is not affiliated with ORBIT. Video content is provided by independent third-party embed services. ORBIT claims no ownership over any third-party content.</p>,
        },
        {
          h: "Disclaimer of Warranties",
          body: <p>ORBIT is provided "as is" and "as available" without any warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free. Content availability may change at any time without notice.</p>,
        },
        {
          h: "Limitation of Liability",
          body: <p>In no event shall ORBIT be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, including but not limited to loss of data, revenue, or goodwill.</p>,
        },
        {
          h: "Changes to Terms",
          body: <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes your acceptance of the new terms. We will post updates on this page with a revised date.</p>,
        },
      ]}
    />
  ),
});
