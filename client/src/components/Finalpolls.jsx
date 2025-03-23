import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from './Sidebar'
import { motion } from 'framer-motion'

function Finalpoll() {
  const [polls, setPolls] = useState([])
  const [voteCounts, setVoteCounts] = useState({})

  useEffect(() => {
    axios.get('http://localhost:7000/api/get-polls')
      .then(res => {
        setPolls(res.data)
        res.data.forEach(poll => {
          axios.get(`http://localhost:7000/api/vote-count/${poll._id}`)
            .then(voteRes => {
              setVoteCounts(prev => ({ ...prev, [poll._id]: voteRes.data }))
            })
        })
      })
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-[250px] bg-white shadow-lg z-10">
        <Sidebar />
      </div>
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Admin Vote Dashboard</h1>
        <div className="space-y-6">
          {polls.map(poll => (
            <motion.div
              key={poll._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
            >
              <h2 className="text-xl font-bold text-gray-700 mb-2">{poll.title}</h2>
              <p className="text-gray-600 mb-4">{poll.description}</p>
              <ul className="space-y-2">
                {poll.choices.map(choice => (
                  <li key={choice} className="flex justify-between border-b pb-1 text-gray-700">
                    <span>{choice}</span>
                    <span className="font-semibold">
                      {voteCounts[poll._id] ? voteCounts[poll._id][choice] || 0 : 0} votes
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Finalpoll
