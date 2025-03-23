import React from 'react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md p-6 min-h-screen">
      <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
      <ul className="space-y-4">
        <li className="text-blue-600 font-semibold">Start Election</li>
        <li className="text-gray-700 cursor-pointer hover:text-blue-600">Manage Elections</li>
        <li className="text-gray-700 cursor-pointer hover:text-blue-600">View Results</li>
        <li className="text-gray-700 cursor-pointer hover:text-blue-600">Logout</li>
      </ul>
    </div>
  );
}
