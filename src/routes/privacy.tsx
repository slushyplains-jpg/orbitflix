import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — ORBIT" },
      { name: "description", content: "How ORBIT collects, uses, and protects your data." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Privacy"
      description="What we collect, why we collect it, and the controls you have."
      updated="June 2026"
      sections={[
        {
          h: "What We Collect",
          body: (
            <>
              <p>Account details (name, email, billing method), your viewing activity, your device information, and basic interaction telemetry to keep the player smooth.</p>
              <p>We do not sell your personal information.</p>
            </>
          ),
        },
        {
          h: "How We Use It",
          body: <p>To run the service, personalize recommendations, prevent fraud, and meet our legal obligations. That's it.</p>,
        },
        {
          h: "Your Controls",
          body: (
            <>
              <p>You can edit your profile and preferences any time from the Profile page, remove devices from the Devices page, and cancel your subscription from Subscription.</p>
              <p>For data export or deletion, email <a href="mailto:privacy@orbit.tv" className="text-ice hover:underline">privacy@orbit.tv</a>.</p>
            </>
          ),
        },
        {
          h: "Sharing",
          body: <p>We share data with vendors that help us run the service (payments, CDN, analytics) under strict data-processing agreements, and with authorities when legally required.</p>,
        },
        {
          h: "Retention",
          body: <p>We keep account data while your account is active and for a limited period afterward, as required by tax and accounting law.</p>,
        },
        {
          h: "Contact",
          body: <p>Questions? Reach our privacy team at <a href="mailto:privacy@orbit.tv" className="text-ice hover:underline">privacy@orbit.tv</a>.</p>,
        },
      ]}
    />
  ),
});
