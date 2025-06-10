import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-natural-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="text-xl">🌾</div>
              <span className="text-xl font-bold">TazaTokri</span>
            </div>
            <p className="text-green-100 mb-3 text-sm">
              Connecting farmers directly with consumers for fresh, organic produce.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-green-100 hover:text-sunny-yellow transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-green-100 hover:text-sunny-yellow transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-green-100 hover:text-sunny-yellow transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-sunny-yellow">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/products" className="text-green-100 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/" className="text-green-100 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-green-100 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-green-100 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-green-100 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-sunny-yellow">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3 text-sunny-yellow" />
                <span className="text-green-100">+91 9958686941</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3 text-sunny-yellow" />
                <span className="text-green-100">tazatokri.in@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-3 w-3 text-sunny-yellow mt-1" />
                <span className="text-green-100">New Kondli, Delhi 110096</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-600 mt-6 pt-4 text-center text-xs text-green-100">
          © 2024 TazaTokri. All rights reserved. Developed by Abhinav Pratap Singh.
        </div>
      </div>
    </footer>
  )
}
