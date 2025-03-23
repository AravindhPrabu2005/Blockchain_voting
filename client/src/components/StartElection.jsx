import React, { useState } from 'react'
import axios from 'axios'

export default function StartElection() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [choices, setChoices] = useState([''])

  const handleAddChoice = () => {
    setChoices([...choices, ''])
  }

  const handleChoiceChange = (index, value) => {
    const updatedChoices = [...choices]
    updatedChoices[index] = value
    setChoices(updatedChoices)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const electionData = { title, description, startDate, endDate, choices }
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:5000/api/create-poll', electionData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex-1 p-10">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Start New Election</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Election Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 h-24 resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Choices / Candidates</label>
            {choices.map((choice, index) => (
              <input key={index} type="text" value={choice} onChange={(e) => handleChoiceChange(index, e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 mb-2" required />
            ))}
            <button type="button" onClick={handleAddChoice} className="bg-blue-500 text-white px-4 py-2 rounded-xl mt-2">Add Choice</button>
          </div>
          <button type="submit" className="bg-green-600 text-white w-full py-2 rounded-xl mt-4">Create Election</button>
        </form>
      </div>
    </div>
  )
}
