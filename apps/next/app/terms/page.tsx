import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-svh p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/auth/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to login
        </Link>
        <h1 className="font-heading text-lg font-semibold md:text-xl">Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Last updated: March 2025</p>
        <div className="space-y-6 text-sm">
          <section>
            <h2 className="font-heading mb-2 text-base font-semibold">1. Acceptance</h2>
            <p>
              By accessing or using Basilic (&quot;the Service&quot;), you agree to these Terms of
              Service. If you do not agree, do not use the Service.
            </p>
          </section>
          <section>
            <h2 className="font-heading mb-2 text-base font-semibold">2. Use of Service</h2>
            <p>
              You may use the Service only for lawful purposes. You are responsible for maintaining
              the confidentiality of your account and for all activity under your account.
            </p>
          </section>
          <section>
            <h2 className="font-heading mb-2 text-base font-semibold">3. User Content</h2>
            <p>
              You retain ownership of content you submit. By submitting content, you grant us a
              limited license to use, store, and process it as necessary to provide the Service.
            </p>
          </section>
          <section>
            <h2 className="font-heading mb-2 text-base font-semibold">4. Prohibited Conduct</h2>
            <p>
              You may not misuse the Service, violate laws, infringe rights, transmit malware, or
              attempt to gain unauthorized access to our systems or other accounts.
            </p>
          </section>
          <section>
            <h2 className="font-heading mb-2 text-base font-semibold">5. Termination</h2>
            <p>
              We may suspend or terminate your access at any time for violation of these terms or
              for any other reason. You may stop using the Service at any time.
            </p>
          </section>
          <section>
            <h2 className="font-heading mb-2 text-base font-semibold">6. Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We do not
              warrant that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>
          <section>
            <h2 className="font-heading mb-2 text-base font-semibold">
              7. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, we are not liable for any indirect,
              incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>
          <section>
            <h2 className="font-heading mb-2 text-base font-semibold">8. Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the Service after
              changes constitutes acceptance of the updated terms.
            </p>
          </section>
          <section>
            <h2 className="font-heading mb-2 text-base font-semibold">9. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a
                href="mailto:legal@example.com"
                className="text-primary underline underline-offset-4"
              >
                legal@example.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
