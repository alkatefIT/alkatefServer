require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Resend } = require("resend");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));

// Set up multer for file uploads
const storage = multer.memoryStorage(); // store files in memory
const upload = multer({ storage });

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to send email
async function sendEmail({
  email,
  name,
  nationality,
  resume,
  mobile,
  gender,
  skills,
  job,
  city,
  experience,
}) {
  try {
    const html = `
      <h3>New Job Application from Alkatef.com</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Nationality:</strong> ${nationality}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Gender:</strong> ${gender}</p>
      <p><strong>Skills:</strong> ${skills}</p>
      <p><strong>Job:</strong> ${job}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Experience:</strong> ${experience}</p>
    `;

    // Handle attachments if resume is provided
    const attachments = resume
      ? [
          {
            filename: resume.originalname,
            content: resume.buffer.toString("base64"),
          },
        ]
      : [];

    // Send the email using Resend
    await resend.emails.send({
      from: "Website <website@resend.dev>",
      to: "web.alkatef@gmail.com",
      subject: "New Job Application from Alkatef.com",
      html,
      attachments,
    });

    return { message: "Email sent successfully" };
  } catch (error) {
    console.error("Resend API error:", error);
    throw new Error("An error occurred while sending the email.");
  }
}

// API route
app.post("/", upload.single("resume"), async (req, res) => {
  try {
    const response = await sendEmail({
      email: req.body.email,
      name: req.body.name,
      nationality: req.body.nationality,
      mobile: req.body.mobile,
      gender: req.body.gender,
      skills: req.body.skills,
      job: req.body.job,
      city: req.body.city,
      experience: req.body.experience,
      resume: req.file,
    });

    res.status(200).send(response.message);
  } catch (error) {
    console.error("Error in POST /:", error);
    res.status(500).send(error.message);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
