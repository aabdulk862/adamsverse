// EmailForm.jsx
import React, { useState } from "react";

export default function EmailForm() {
  const [formData, setFormData] = useState({
    email: "",
    topic: "general",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Email: ${formData.email}\nTopic: ${formData.topic}`);
    // Here you can add your actual submission logic
  };

  return (
    <form className="email-form" onSubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Topic
        <select name="topic" value={formData.topic} onChange={handleChange}>
          <option value="general">General Inquiry</option>
          <option value="support">Support</option>
          <option value="collaboration">Collaboration</option>
        </select>
      </label>
      <button type="submit">Send</button>
    </form>
  );
}
