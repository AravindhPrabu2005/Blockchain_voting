import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './Sidebar'

export default function UserVotingPage() {
  const [polls, setPolls] = useState([])
  const [selectedChoices, setSelectedChoices] = useState({})

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_Backend_URI}/api/get-polls`)
        if (response.data && response.data.length > 0) {
          setPolls(response.data.reverse())
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchPolls()
  }, [])

  const handleChoiceChange = (pollId, choice) => {
    setSelectedChoices({ ...selectedChoices, [pollId]: choice })
  }

  const handleSubmit = async (e, pollId) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${process.env.REACT_APP_Backend_URI}/api/vote`, {
        pollId: pollId,
        choice: selectedChoices[pollId]
      })
      console.log(response.data)
      alert('Vote submitted successfully')
    } catch (error) {
      console.error(error)
      alert('Vote submission failed')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-10">
        <div className="space-y-10">
          {polls.map((poll) => (
            <div key={poll._id} className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-center">{poll.title}</h2>
              <p className="text-gray-700 mb-6 text-center">{poll.description}</p>
              <form onSubmit={(e) => handleSubmit(e, poll._id)} className="space-y-4">
                {poll.choices.map((choice, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`vote-${poll._id}`}
                      value={choice}
                      checked={selectedChoices[poll._id] === choice}
                      onChange={() => handleChoiceChange(poll._id, choice)}
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
          ))}
        </div>
      </div>
    </div>
  )
}
