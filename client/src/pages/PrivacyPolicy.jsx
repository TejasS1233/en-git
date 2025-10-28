import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
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
                GitHub profile information (username, repositories, contributions) accessed through
                GitHub's public API
              </li>
              <li>Usage data and analytics to improve our service</li>
              <li>Authentication tokens when you sign in with GitHub (stored securely)</li>
            </ul>

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

            <h2 className="text-xl font-semibold mt-6">4. GitHub API Usage</h2>
            <p>
              en-git uses GitHub's public API to fetch repository and user data. We comply with
              GitHub's API terms of service and rate limits. All data accessed is publicly available
              on GitHub.
            </p>

            <h2 className="text-xl font-semibold mt-6">5. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain your session and authentication state</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns to improve our service</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of data collection</li>
              <li>Revoke GitHub authentication at any time</li>
            </ul>

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
