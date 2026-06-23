import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — ORBIT" },
      { name: "description", content: "The terms that govern your use of the ORBIT streaming service." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Use"
      description="The terms that govern your account, your subscription, and your access to the ORBIT service."
      updated="June 2026"
      sections={[
        {
          h: "Your Account",
          body: (
            <>
              <p>You're responsible for the activity on your ORBIT account, including keeping your password safe and the people you share access with.</p>
              <p>Accounts are for personal, non-commercial use. You must be the age of majority in your country to subscribe.</p>
            </>
          ),
        },
        {
          h: "Subscription & Billing",
          body: (
            <>
              <p>Your subscription continues until you cancel. Cancellation takes effect at the end of the current billing period — no partial refunds.</p>
              <p>Prices may change. We'll always notify you ahead of any change to the rate you pay.</p>
            </>
          ),
        },
        {
          h: "Content & Catalogue",
          body: <p>The ORBIT catalogue changes over time. Titles may be added or removed as our licensing agreements evolve. Availability also varies by region.</p>,
        },
        {
          h: "Acceptable Use",
          body: <p>Don't try to circumvent our security, scrape our streams, redistribute our content, or use the service in any way that violates the law. We may suspend accounts that do.</p>,
        },
        {
          h: "Termination",
          body: <p>You can cancel at any time from your Subscription page. We may also terminate accounts that violate these terms.</p>,
        },
        {
          h: "Liability",
          body: <p>ORBIT is provided "as is." To the fullest extent allowed by law, we limit our liability for indirect or incidental damages arising from your use of the service.</p>,
        },
      ]}
    />
  ),
});
