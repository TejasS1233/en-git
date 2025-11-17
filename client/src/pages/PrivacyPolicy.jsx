import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function PrivacyPolicy() {
  usePageTitle("Privacy Policy");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <Shield className="h-8 w-8 text-primary" />
            Privacy Policy
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Last updated: October 2025</p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p>en-git collects and processes the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Public GitHub Data:</strong> Username, public repositories, contributions,
                and profile information accessed through GitHub's public API
              </li>
              <li>
                <strong>Private Repository Data (with your permission):</strong> When you authorize
                access, we collect statistics from your private repositories and organization
                repositories to provide accurate analytics. This includes commit counts, language
                usage, and contribution patterns.
              </li>
              <li>
                <strong>Organization Membership:</strong> Information about organizations you belong
                to (read-only access)
              </li>
              <li>Usage data and analytics to improve our service</li>
              <li>
                Authentication tokens when you sign in with GitHub (stored securely and encrypted)
              </li>
            </ul>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 my-4">
              <p className="text-sm font-medium">
                <strong>🔒 Privacy Guarantee:</strong> Private repository names, code, and sensitive
                information are NEVER displayed publicly. We only use private repo data for
                calculating your personal statistics and achievements, which remain visible only to
                you when logged in.
              </p>
            </div>

            <h2 className="text-xl font-semibold mt-6">2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide GitHub analytics and insights</li>
              <li>Generate profile scores and recommendations</li>
              <li>Compare user profiles and repositories</li>
              <li>Improve our service and user experience</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">3. Data Storage and Security</h2>
            <p>We take data security seriously. Your data is:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stored securely using industry-standard encryption</li>
              <li>Never sold or shared with third parties</li>
              <li>Accessible only to you and our secure systems</li>
              <li>Retained only as long as necessary to provide our services</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">4. GitHub API Usage & Permissions</h2>
            <p>
              en-git uses GitHub's API to fetch repository and user data. We comply with GitHub's
              API terms of service and rate limits.
            </p>
            <p className="mt-2">
              <strong>Permissions We Request:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>user:email</strong> - Access to your email address for account creation and
                notifications
              </li>
              <li>
                <strong>repo</strong> - Access to public and private repositories (only for
                calculating your personal statistics)
              </li>
              <li>
                <strong>read:org</strong> - Read-only access to organization membership and
                repositories
              </li>
            </ul>
            <p className="mt-2">
              <strong>Important:</strong> Private repository data is used ONLY for your personal
              analytics and is never shared publicly or with other users. Public profiles and
              widgets only display information from public repositories.
            </p>

            <h2 className="text-xl font-semibold mt-6">5. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain your session and authentication state</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns to improve our service</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">6. Your Rights & Data Control</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data at any time through your profile</li>
              <li>Request deletion of your data (contact us or delete your account)</li>
              <li>Opt-out of data collection by not authorizing private repo access</li>
              <li>
                Revoke GitHub authentication at any time through GitHub settings or your profile
              </li>
              <li>Control what data is publicly visible (private repo data is never public)</li>
              <li>
                Choose to only share public repository data by not granting private repo permissions
              </li>
            </ul>

            <p className="mt-4 text-sm bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
              <strong>Note:</strong> You can revoke our access to your private repositories at any
              time through your GitHub account settings → Applications → Authorized OAuth Apps →
              en-git → Revoke.
            </p>

            <h2 className="text-xl font-semibold mt-6">7. Chrome Extension</h2>
            <p>Our Chrome extension:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only accesses GitHub pages when you're browsing them</li>
              <li>Stores preferences locally in your browser</li>
              <li>Does not track your browsing activity outside of GitHub</li>
              <li>Requires minimal permissions to function</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-xl font-semibold mt-6">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our{" "}
              <a href="/contact" className="text-primary hover:underline">
                Contact page
              </a>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
