import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | FreshKart",
  description: "Privacy Policy for FreshKart - Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-dark-olive mb-8 text-center">Privacy Policy</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-600 mb-6">Last Updated: June 4, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to FreshKart. We respect your privacy and are committed to protecting your personal data. This
            privacy policy will inform you about how we look after your personal data when you visit our website and
            tell you about your privacy rights and how the law protects you.
          </p>
          <p>
            This privacy policy aims to give you information on how TazaTokri collects and processes your personal data
            through your use of this website, including any data you may provide through this website when you sign up
            for an account, purchase a product, or take part in any other feature on our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">2. Data We Collect</h2>
          <p className="mb-4">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped
            together as follows:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Identity Data</strong> includes first name, last name, username or similar identifier.
            </li>
            <li>
              <strong>Contact Data</strong> includes billing address, delivery address, email address and telephone
              numbers.
            </li>
            <li>
              <strong>Financial Data</strong> includes payment card details (stored securely through our payment
              processors).
            </li>
            <li>
              <strong>Transaction Data</strong> includes details about payments to and from you and other details of
              products you have purchased from us.
            </li>
            <li>
              <strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and
              version, time zone setting and location, browser plug-in types and versions, operating system and
              platform, and other technology on the devices you use to access this website.
            </li>
            <li>
              <strong>Profile Data</strong> includes your username and password, purchases or orders made by you, your
              interests, preferences, feedback and survey responses.
            </li>
            <li>
              <strong>Usage Data</strong> includes information about how you use our website, products and services.
            </li>
            <li>
              <strong>Marketing and Communications Data</strong> includes your preferences in receiving marketing from
              us and our third parties and your communication preferences.
            </li>
            <li>
              <strong>Location Data</strong> includes your current location disclosed by GPS technology to provide you
              with the nearest farmers and products.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">3. How We Use Your Data</h2>
          <p className="mb-4">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data
            in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>
              Where it is necessary for our legitimate interests (or those of a third party) and your interests and
              fundamental rights do not override those interests.
            </li>
            <li>Where we need to comply with a legal obligation.</li>
            <li>
              To provide you with personalized product recommendations based on your preferences and purchase history.
            </li>
            <li>To connect you with local farmers based on your location data.</li>
            <li>To process and deliver your orders including managing payments and collecting money owed to us.</li>
            <li>
              To manage our relationship with you including notifying you about changes to our terms or privacy policy.
            </li>
            <li>To enable you to participate in a review, survey, or other features of our service.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">4. Data Sharing</h2>
          <p className="mb-4">
            We may share your personal data with the parties set out below for the purposes set out in this privacy
            policy:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Farmers and sellers on our platform to fulfill your orders.</li>
            <li>Service providers who provide IT and system administration services.</li>
            <li>Professional advisers including lawyers, bankers, auditors, and insurers.</li>
            <li>Government bodies that require us to report processing activities.</li>
            <li>Third parties to whom we may choose to sell, transfer or merge parts of our business or our assets.</li>
          </ul>
          <p>
            We require all third parties to respect the security of your personal data and to treat it in accordance
            with the law. We do not allow our third-party service providers to use your personal data for their own
            purposes and only permit them to process your personal data for specified purposes and in accordance with
            our instructions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">5. Data Security</h2>
          <p className="mb-4">
            We have put in place appropriate security measures to prevent your personal data from being accidentally
            lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your
            personal data to those employees, agents, contractors, and other third parties who have a business need to
            know. They will only process your personal data on our instructions, and they are subject to a duty of
            confidentiality.
          </p>
          <p>
            We have put in place procedures to deal with any suspected personal data breach and will notify you and any
            applicable regulator of a breach where we are legally required to do so.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">6. Data Retention</h2>
          <p className="mb-4">
            We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we
            collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or
            reporting requirements. We may retain your personal data for a longer period in the event of a complaint or
            if we reasonably believe there is a prospect of litigation in respect to our relationship with you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">7. Your Legal Rights</h2>
          <p className="mb-4">
            Under certain circumstances, you have rights under data protection laws in relation to your personal data,
            including the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Request access</strong> to your personal data.
            </li>
            <li>
              <strong>Request correction</strong> of your personal data.
            </li>
            <li>
              <strong>Request erasure</strong> of your personal data.
            </li>
            <li>
              <strong>Object to processing</strong> of your personal data.
            </li>
            <li>
              <strong>Request restriction of processing</strong> your personal data.
            </li>
            <li>
              <strong>Request transfer</strong> of your personal data.
            </li>
            <li>
              <strong>Right to withdraw consent</strong> where we are relying on consent to process your personal data.
            </li>
          </ul>
          <p>
            If you wish to exercise any of the rights set out above, please contact us using the details provided below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">8. Cookies</h2>
          <p className="mb-4">
            Our website uses cookies to distinguish you from other users of our website. This helps us to provide you
            with a good experience when you browse our website and also allows us to improve our site. By continuing to
            browse the site, you are agreeing to our use of cookies.
          </p>
          <p>
            A cookie is a small file of letters and numbers that we store on your browser or the hard drive of your
            computer if you agree. Cookies contain information that is transferred to your computer's hard drive.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">9. Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new
            privacy policy on this page and updating the "Last Updated" date at the top of this privacy policy. You are
            advised to review this privacy policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">10. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <div className="bg-light-sage p-4 rounded-md">
            <p className="mb-2">
              <strong>FreshKart</strong>
            </p>
            <p className="mb-2">Email: freshkartapp@gmail.com</p>
            <p>Phone: +91 9958686941</p>
          </div>
        </section>
      </div>
    </div>
  )
}
