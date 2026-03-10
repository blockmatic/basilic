import { PolicyPageShell } from 'components/policy-page-shell'
import { env } from '@/lib/env'

export default function PrivacyPage() {
  return (
    <PolicyPageShell
      title="Privacy Policy"
      updatedAt="March 2026"
      contactEmail={env.NEXT_PUBLIC_LEGAL_EMAIL}
    >
      <section>
        <h2 className="font-heading mb-2 text-base font-semibold">1. Information We Collect</h2>
        <p>
          We collect information you provide when creating an account (email, name, username), data
          from sign-in methods (Google, GitHub, Facebook, Twitter, passkeys, magic links, or
          wallets), and usage data such as requests and session information.
        </p>
      </section>
      <section>
        <h2 className="font-heading mb-2 text-base font-semibold">2. How We Use It</h2>
        <p>
          We use this information to provide, operate, and improve the Service, authenticate users,
          communicate with you, and comply with legal obligations.
        </p>
      </section>
      <section>
        <h2 className="font-heading mb-2 text-base font-semibold">
          3. OAuth and Third-Party Login
        </h2>
        <p>
          When you sign in with Google, GitHub, Facebook, or Twitter, we receive basic profile
          information (e.g., email, name) as permitted by the provider. Each provider has its own
          privacy policy governing how they handle your data.
        </p>
      </section>
      <section>
        <h2 className="font-heading mb-2 text-base font-semibold">4. Cookies</h2>
        <p>
          We use cookies and similar technologies to maintain your session and preferences. You can
          control cookies through your browser settings.
        </p>
      </section>
      <section>
        <h2 className="font-heading mb-2 text-base font-semibold">5. Data Retention</h2>
        <p>
          We retain your account data for as long as your account is active. You may request
          deletion of your data by contacting us.
        </p>
      </section>
      <section>
        <h2 className="font-heading mb-2 text-base font-semibold">6. Your Rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or export your
          data. Contact us to exercise these rights.
        </p>
      </section>
      <section>
        <h2 className="font-heading mb-2 text-base font-semibold">7. Security</h2>
        <p>
          We use reasonable measures to protect your data. No method of transmission over the
          internet is completely secure.
        </p>
      </section>
      <section>
        <h2 className="font-heading mb-2 text-base font-semibold">8. Changes</h2>
        <p>
          We may update this policy from time to time. We will notify you of material changes by
          posting the updated policy or by other reasonable means.
        </p>
      </section>
    </PolicyPageShell>
  )
}
