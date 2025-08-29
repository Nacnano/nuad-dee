export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">NuadDee</h3>
            <p className="text-gray-300">
              Empowering visually impaired individuals through massage therapy
              training and employment opportunities.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="/booking" className="text-gray-300 hover:text-white">
                  Book a Massage
                </a>
              </li>
              <li>
                <a href="/training" className="text-gray-300 hover:text-white">
                  Training Programs
                </a>
              </li>
              <li>
                <a href="/partners" className="text-gray-300 hover:text-white">
                  Partner with Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>Email: contact@nuaddee.com</li>
              <li>Phone: +66 2 123 4567</li>
              <li>Bangkok, Thailand</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                Facebook
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                Instagram
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} NuadDee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
