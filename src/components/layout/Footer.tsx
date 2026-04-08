import React from 'react';
import { Waypoints as BridgeIcon, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <BridgeIcon size={24} />
              </div>
              <span className="text-2xl font-bold text-white">WisdomBridge</span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
              Empowering the next generation through disciplined 1-on-1 mentoring. 
              Transforming character, building confidence, and mastering the art of correct work.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                <Linkedin size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                <Github size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link to="/mentors" className="hover:text-indigo-400 transition-colors">Find a Mentor</Link></li>
              <li><Link to="/signup?role=mentor" className="hover:text-indigo-400 transition-colors">Become a Mentor</Link></li>
              <li><Link to="/how-it-works" className="hover:text-indigo-400 transition-colors">How it Works</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/help" className="hover:text-indigo-400 transition-colors">Help Center</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} WisdomBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
