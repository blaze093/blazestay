import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | TazaTokri",
  description: "Terms of Service for TazaTokri - The legal agreement between you and our marketplace.",
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-dark-olive mb-8 text-center">Terms of Service</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-600 mb-6">Last Updated: June 4, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to TazaTokri. These Terms of Service ("Terms") govern your use of the TazaTokri website, mobile
            applications, and services (collectively, the "Service") operated by TazaTokri ("we," "us," or "our").
          </p>
          <p className="mb-4">
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of
            the Terms, then you may not access the Service.
          </p>
          <p>
            TazaTokri is a platform that connects farmers directly with consumers, allowing for the purchase and sale of
            fresh agricultural products. These Terms apply to all users of the Service, including buyers, sellers, and
            any other users who access or use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">2. Accounts</h2>
          <p className="mb-4">
            When you create an account with us, you must provide information that is accurate, complete, and current at
            all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of
            your account on our Service.
          </p>
          <p className="mb-4">
            You are responsible for safeguarding the password that you use to access the Service and for any activities
            or actions under your password, whether your password is with our Service or a third-party service.
          </p>
          <p>
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming
            aware of any breach of security or unauthorized use of your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">3. User Types and Responsibilities</h2>

          <h3 className="text-xl font-semibold text-dark-olive mb-3">3.1 Buyers</h3>
          <p className="mb-4">As a buyer on TazaTokri, you agree to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide accurate and complete information when creating an account and making purchases.</li>
            <li>Make timely payments for products purchased through the Service.</li>
            <li>Communicate respectfully with sellers and other users of the Service.</li>
            <li>Not engage in any fraudulent activities or misrepresentations.</li>
            <li>Provide accurate delivery information for order fulfillment.</li>
          </ul>

          <h3 className="text-xl font-semibold text-dark-olive mb-3">3.2 Sellers (Farmers)</h3>
          <p className="mb-4">As a seller on TazaTokri, you agree to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide accurate and complete information about yourself and your products.</li>
            <li>List only products that you are legally allowed to sell.</li>
            <li>Accurately describe your products, including quality, quantity, and freshness.</li>
            <li>Fulfill orders in a timely manner as agreed upon with buyers.</li>
            <li>Comply with all applicable laws and regulations related to food safety, agriculture, and commerce.</li>
            <li>Maintain appropriate licenses and permits required for selling agricultural products.</li>
            <li>Pay all applicable service fees, taxes, and other charges related to your sales.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">4. Products and Transactions</h2>

          <h3 className="text-xl font-semibold text-dark-olive mb-3">4.1 Product Listings</h3>
          <p className="mb-4">
            Sellers are responsible for the accuracy of their product listings, including descriptions, prices,
            quantities, and images. TazaTokri reserves the right to remove any product listings that violate these Terms
            or applicable laws.
          </p>

          <h3 className="text-xl font-semibold text-dark-olive mb-3">4.2 Pricing and Payments</h3>
          <p className="mb-4">
            All prices are listed in the local currency and include applicable taxes unless otherwise stated. Buyers
            agree to pay the full amount for products purchased through the Service, including any applicable delivery
            fees, taxes, or other charges.
          </p>
          <p className="mb-4">
            TazaTokri uses secure third-party payment processors to handle transactions. By making a purchase, you agree
            to the terms and conditions of these payment processors.
          </p>

          <h3 className="text-xl font-semibold text-dark-olive mb-3">4.3 Order Fulfillment</h3>
          <p className="mb-4">
            Sellers are responsible for fulfilling orders as described in their product listings and in accordance with
            the delivery options selected by buyers. TazaTokri is not responsible for the quality, safety, or delivery
            of products sold through the Service.
          </p>

          <h3 className="text-xl font-semibold text-dark-olive mb-3">4.4 Cancellations and Refunds</h3>
          <p>
            Cancellation and refund policies are set by individual sellers. Buyers should review these policies before
            making a purchase. TazaTokri may facilitate dispute resolution between buyers and sellers but is not
            obligated to provide refunds or compensation for unsatisfactory transactions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">5. Prohibited Activities</h2>
          <p className="mb-4">You agree not to engage in any of the following prohibited activities:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              Using the Service for any illegal purpose or in violation of any local, state, national, or international
              law.
            </li>
            <li>Violating or infringing upon the rights of others, including intellectual property rights.</li>
            <li>Attempting to circumvent, disable, or interfere with security-related features of the Service.</li>
            <li>Engaging in any automated use of the system, such as using scripts to send comments or messages.</li>
            <li>Attempting to impersonate another user or person.</li>
            <li>Using the Service in a manner inconsistent with any applicable laws or regulations.</li>
            <li>Engaging in any form of harassment, hate speech, or abusive behavior toward other users.</li>
            <li>Selling counterfeit, stolen, or illegal products.</li>
            <li>Manipulating prices, feedback, or ratings.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">6. Intellectual Property</h2>
          <p className="mb-4">
            The Service and its original content, features, and functionality are and will remain the exclusive property
            of TazaTokri and its licensors. The Service is protected by copyright, trademark, and other laws of both the
            local country and foreign countries. Our trademarks and trade dress may not be used in connection with any
            product or service without the prior written consent of TazaTokri.
          </p>
          <p>
            Users retain ownership of content they submit to the Service, such as product listings, reviews, and profile
            information. By submitting content to the Service, you grant TazaTokri a worldwide, non-exclusive,
            royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such content in
            connection with the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">7. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall TazaTokri, nor its directors, employees, partners, agents, suppliers, or affiliates, be
            liable for any indirect, incidental, special, consequential, or punitive damages, including without
            limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Your access to or use of or inability to access or use the Service.</li>
            <li>Any conduct or content of any third party on the Service.</li>
            <li>Any content obtained from the Service.</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
            <li>
              Transactions between buyers and sellers, including the quality, safety, or legality of products sold.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">8. Disclaimer</h2>
          <p className="mb-4">
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE"
            basis. The Service is provided without warranties of any kind, whether express or implied, including, but
            not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement,
            or course of performance.
          </p>
          <p>
            TazaTokri does not warrant that the Service will be uninterrupted, timely, secure, or error-free, or that
            defects will be corrected. TazaTokri does not make any warranties or representations regarding the quality,
            accuracy, reliability, or safety of any products sold through the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">9. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Bangladesh, without regard to its
            conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be
            considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable
            by a court, the remaining provisions of these Terms will remain in effect.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">10. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
            material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What
            constitutes a material change will be determined at our sole discretion. By continuing to access or use our
            Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-dark-olive mb-4">11. Contact Us</h2>
          <p className="mb-4">If you have any questions about these Terms, please contact us at:</p>
          <div className="bg-light-sage p-4 rounded-md">
            <p className="mb-2">
              <strong>TazaTokri</strong>
            </p>
            <p className="mb-2">Email: legal@tazatokri.com</p>
            <p>Phone: +880 1234 567890</p>
          </div>
        </section>
      </div>
    </div>
  )
}
