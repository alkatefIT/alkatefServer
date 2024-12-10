require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

async function sendEmail({ email, name,nationality, resume,mobile,gender,skills,job,city,expirience }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const mailConfigs = {
      to: "shaharban@alkatef.com",  // Your actual inbox email
      subject:" From Alkatef.com",
      html: `<p>Email : ${email}</p>
      <p>Name : ${name}</p>
      <p>Nationality : ${nationality}</p>
      <p>Mobile : ${mobile}</p>
      <p>Gender : ${gender}</p>
      <p>Skills : ${skills}</p>
      <p>Job : ${job}</p>
      <p>City : ${city}</p>
      <p>Expirience : ${expirience}</p>

      `,
      attachments: resume
        ? [
            {
              filename: resume.originalname, // Use the original name of the file
              content: resume.buffer, // Buffer content of the uploaded file
            },
          ]
        : [],
    };

    await transporter.sendMail(mailConfigs);
    return { message: "Email sent successfully" };
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while sending the email.");
  }
}

// Update your route to use multer middleware
app.post("/", upload.single("resume"), async (req, res) => {
  try {
    const response = await sendEmail({
      email: req.body.email,
      name: req.body.name,
      skills: req.body.skills,
      job: req.body.job,
      gender: req.body.gender,
      nationality: req.body.nationality,
      mobile: req.body.mobile,
      city: req.body.city,
      expirience: req.body.expirience,
      resume: req.file, // Access the uploaded file
    });
    res.send(response.message);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Nodemailer project is listening at http://localhost:${port}`);
});

