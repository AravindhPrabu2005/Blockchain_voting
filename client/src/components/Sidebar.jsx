import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg p-6 z-50"
    >
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Panel</h1>
      <ul className="space-y-6">
        <li>
          <Link to="/admin" className="text-blue-600 font-semibold transition-all duration-200 hover:scale-105 block">
            Start Election
          </Link>
        </li>
        <li>
          <Link to="/admin/results" className="text-gray-700 font-medium hover:text-blue-600 transition-all duration-200 hover:translate-x-1 block">
            View Results
          </Link>
        </li>
        <li className="text-gray-700 font-medium hover:text-blue-600 transition-all duration-200 hover:translate-x-1 cursor-pointer">Logout</li>
      </ul>
    </motion.div>
  );
}
