import React, { useState } from "react";

export default function EmailForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    // Reason validation
    if (!formData.reason) {
      newErrors.reason = "Please select a reason";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // If valid, you can submit via EmailJS or your backend
    alert(
      `Name: ${formData.name}\nEmail: ${formData.email}\nReason: ${formData.reason}\nMessage: ${formData.message}`,
    );

    setFormData({ name: "", email: "", reason: "", message: "" });
    setErrors({});
  };

  return (
    <form className="email-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label>
          Name
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </label>
      </div>

      <label>
        Reason
        <select name="reason" value={formData.reason} onChange={handleChange}>
          <option value="">Select a reason</option>
          <option value="Work-Inquiry">Work Inquiry</option>
          <option value="Collaboration">Collaboration</option>
          <option value="Feedback">Feedback</option>
          <option value="Other">Other</option>
        </select>
        {errors.reason && <p className="error">{errors.reason}</p>}
      </label>

      <label>
        Message
        <textarea
          name="message"
          placeholder="Write your message here..."
          rows={5}
          value={formData.message}
          onChange={handleChange}
        />
        {errors.message && <p className="error">{errors.message}</p>}
      </label>

      <button type="submit">
        <i className="fas fa-paper-plane"></i> Send Message
      </button>
    </form>
  );
}
