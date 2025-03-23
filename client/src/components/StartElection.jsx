import React, { useState } from "react";
import axios from "axios";

export default function StartElection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [choices, setChoices] = useState([""]);
  const [message, setMessage] = useState("");

  const handleAddChoice = () => setChoices([...choices, ""]);

  const handleChoiceChange = (index, value) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = value;
    setChoices(updatedChoices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validChoices = choices.filter((c) => c.trim() !== "");
    const electionData = { title, description, startDate, endDate, choices: validChoices };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${process.env.REACT_APP_Backend_URI}/api/create-poll`, electionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(response.data.message);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("Error creating poll. Please try again.");
      }
    }
  };

  return (
    <div className="ml-[240px] px-8 py-6 w-full min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Start New Election</h2>
        {message && <p className="mb-4 text-green-600">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Election Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded h-24"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Choices / Candidates</label>
            {choices.map((choice, index) => (
              <input
                key={index}
                type="text"
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded mb-2"
                required
              />
            ))}
            <button
              type="button"
              onClick={handleAddChoice}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add Choice
            </button>
          </div>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded">
            Create Election
          </button>
        </form>
      </div>
    </div>
  );
}
