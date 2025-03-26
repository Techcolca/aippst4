import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-primary-600 dark:text-primary-400 text-xl font-bold cursor-pointer">AIPI</span>
            </Link>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">v1.0.0</span>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Contact Us
            </Link>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} AIPI AI Assistant. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
