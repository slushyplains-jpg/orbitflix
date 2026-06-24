import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/dmca")({
  head: () => ({
    meta: [
      { title: "DMCA Policy — ORBIT" },
      { name: "description", content: "ORBIT's DMCA policy and how to submit a copyright takedown notice." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="DMCA Policy"
      description="ORBIT respects intellectual property rights and responds promptly to valid copyright claims."
      updated="June 24, 2026"
      sections={[
        {
          h: "Important Notice",
          body: <p>ORBIT does not host, upload, or store any video files on its servers. All content displayed on this website is sourced from third-party video hosting providers. ORBIT acts solely as a search engine and link aggregator, indexing content freely available on the internet.</p>,
        },
        {
          h: "Filing a Takedown Notice",
          body: (
            <>
              <p>If you believe that content accessible through ORBIT infringes your copyright, you may submit a DMCA takedown notice containing the following information:</p>
              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>Identification of the material that is claimed to be infringing and where it is located on the site (URL).</li>
                <li>Your contact information, including address, telephone number, and email address.</li>
                <li>A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement, made under penalty of perjury, that the above information is accurate and that you are the copyright owner or are authorized to act on behalf of the owner.</li>
              </ul>
            </>
          ),
        },
        {
          h: "Contact",
          body: (
            <>
              <p>DMCA takedown requests can be sent to: <a href="mailto:dmca@orbit.stream" className="text-ice hover:underline">dmca@orbit.stream</a></p>
              <p className="mt-4">Upon receiving a valid DMCA notice, ORBIT will remove or disable access to the allegedly infringing content and make a good-faith effort to contact the content provider.</p>
            </>
          ),
        },
        {
          h: "Counter-Notification",
          body: <p>If you believe your content was removed in error, you may file a counter-notification with the required information under 17 U.S.C. § 512(g). Counter-notifications should be sent to the same contact address above.</p>,
        },
        {
          h: "Repeat Infringers",
          body: <p>ORBIT will terminate access for users or content sources that are found to be repeat infringers of copyright in appropriate circumstances.</p>,
        },
      ]}
    />
  ),
});
