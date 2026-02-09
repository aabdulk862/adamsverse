# README

# Adams Verse

A personal portfolio and branding platform demonstrating React frontend, interactive UI, and email contact functionality. Includes sections for work, pricing, contact, social links, and support.

---

## 🚀 Demo

> Check out the site deployed here: [https://adamsverse.com/](https://adamsverse.com/)

---

## ✨ Features

- Fully responsive **banner** and **profile header**
- **Development section** with project portfolio links
- **Pricing section** with detailed rates and toggles
- **Contact section** with a form integrated with EmailJS
- Social and payment links section
- Smooth **hover effects** and **dark gradient UI**
- Mobile-first design with adaptive layouts

---

## 🛠 Tech Stack

- **Frontend:** React, JSX, CSS variables, FontAwesome icons
- **Email Integration:** EmailJS (client-side email form)
- **Hosting:** Netlify
- **Design:** Mobile-responsive, gradient backgrounds, glassmorphism cards

---

## ⚡ Setup & Installation

1. Clone the repo:

```bash
git clone https://github.com/yourusername/adams-verse.git
cd adams-verse
```

1. Install dependencies:

```bash
npm install
```

1. Create a `.env` file at the project root for EmailJS keys:

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

> Make sure to prefix with `VITE_` if using Vite.

1. Start the development server:

```bash
npm run dev
```

---

## 💡 Usage

- Navigate to the `Development` section to see project links.
- `Pricing` section shows your rates and optional add-ons.
- `Contact Me` section uses EmailJS to send messages directly to your email.
- Social links are clickable cards for YouTube, Twitch, TikTok, X (Twitter), Instagram.
- Support section links to CashApp and Venmo.

---

## 📧 Email Contact Integration

This project uses [EmailJS](https://www.emailjs.com/) for handling form submissions without a backend.

1. Configure your EmailJS **service**, **template**, and **public key** in `.env`.
2. Update your form fields to match the template variables (`name`, `email`, `message`, `reason`).
3. Example code snippet in `App.jsx`:

```jsx
emailjs.sendForm(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  e.target,
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
);
```

1. Optional: include an auto-reply template for users.

**Note:** Make sure your sending email (Outlook/Gmail) is active and verified.

---

## 🚀 Deployment

- Deployed on **Netlify**:
  1. Connect GitHub repo to Netlify.
  2. Set the build command:

```bash
npm run build
```

1. Set the publish directory:

```
dist/
```

1. Add environment variables (`VITE_EMAILJS_*`) in Netlify dashboard.
2. Deploy and verify EmailJS form works.

---

## 📜 License

This project is **MIT licensed** — see the `LICENSE` file for details.

---
