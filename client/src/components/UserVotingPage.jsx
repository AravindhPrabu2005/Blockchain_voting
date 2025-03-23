import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

export default function UserVotingPage() {
  const [election, setElection] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState('');

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/elections/latest');
        setElection(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchElection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const voteData = {
      electionTitle: election.title,
      selectedChoice
    };
    try {
      const response = await axios.post('http://localhost:5000/api/votes', voteData);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-10">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">{election?.title}</h2>
          <p className="text-gray-700 mb-6 text-center">{election?.description}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {election?.choices.map((choice, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="vote"
                  value={choice}
                  checked={selectedChoice === choice}
                  onChange={(e) => setSelectedChoice(e.target.value)}
                  className="accent-blue-600"
                  required
                />
                <label className="text-gray-800">{choice}</label>
              </div>
            ))}
            <button type="submit" className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">
              Submit Vote
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
