import React from 'react';
import Sidebar from './Sidebar';
import StartElection from './StartElection';


export default function AdminPage() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <StartElection />
    </div>
  );
}
