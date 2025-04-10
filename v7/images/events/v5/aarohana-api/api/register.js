// api/register.js - Deploy as Render Web Service
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const sgMail = require('@sendgrid/mail');

const app = express();

// --- Config ---
const PORT = process.env.PORT || 10000;
const connectionString = process.env.DATABASE_URL;
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const senderEmail = process.env.SENDER_EMAIL;
const frontendUrl = process.env.FRONTEND_URL || '*'; // For CORS, default to allow all

let dbConfigured = true;
let emailConfigured = true;

if (!connectionString) {
    console.error("DATABASE_URL not set. Database operations will fail.");
    dbConfigured = false;
}
if (!sendgridApiKey || !senderEmail) {
    console.warn("SENDGRID_API_KEY or SENDER_EMAIL not set. Emails will not be sent.");
    emailConfigured = false;
}
if(emailConfigured) {
    sgMail.setApiKey(sendgridApiKey);
}

const pool = dbConfigured ? new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
}) : null;

// --- Middleware ---
app.use(cors({ origin: frontendUrl })); // Use env var for allowed origin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Event Fees ---
const eventFees = { /* ... Your full event fees map ... */
    GroupDance: 500, GroupSinging: 400, SoloSinging: 100, SoloDance: 150,
    Quiz: 100, Debate: 100, Essay: 50, Photography: 100, TreasureHunt: 200,
    GuestLecture: 0, OpenMic: 0, FacultyFunGames: 0,
};

function calculateTotalFee(selectedEvents = []) { /* ... calculation logic ... */ }

// --- Routes ---
app.post('/api/register', async (req, res) => {
    console.log("API: Received registration request");
    const { name, usn, email, phone, semester, branch, events } = req.body;

    // Basic Input Validation
    if (!name || !usn || !email || !phone || !semester || !branch) return res.status(400).json({ success: false, message: 'Missing required fields.' });
    const selectedEventsArray = Array.isArray(events) ? events : (events ? [events] : []);
    if (selectedEventsArray.length === 0) return res.status(400).json({ success: false, message: 'Please select at least one event.' });

    // Check if DB is configured
    if (!dbConfigured || !pool) {
        console.error("API: Cannot process registration, database not configured.");
        return res.status(503).json({ success: false, message: 'Registration system temporarily unavailable (DB).' }); // 503 Service Unavailable
    }


    const registrationToken = `AARO25-${uuidv4().substring(0, 8).toUpperCase()}`;
    const totalFee = calculateTotalFee(selectedEventsArray);
    const registrationTimestamp = new Date();

    let client;
    try {
        client = await pool.connect();
        console.log("API: DB Connected");

        const insertQuery = `
            INSERT INTO registrations (name, usn, email, phone, semester, branch, events, total_fee, token, registered_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (usn) DO UPDATE SET -- Update existing record if USN matches
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                semester = EXCLUDED.semester,
                branch = EXCLUDED.branch,
                events = EXCLUDED.events,
                total_fee = EXCLUDED.total_fee,
                token = EXCLUDED.token, -- Regenerate token on update
                registered_at = EXCLUDED.registered_at,
                paid = FALSE -- Reset paid status on re-registration
            RETURNING id, (xmax = 0) AS inserted; -- xmax=0 indicates INSERT, otherwise UPDATE
        `;
        const values = [name, usn, email, phone, semester, branch, selectedEventsArray, totalFee, registrationToken, registrationTimestamp];
        const result = await client.query(insertQuery, values);

        const insertedId = result.rows[0].id;
        const wasInserted = result.rows[0].inserted; // True if new row, False if updated
        console.log(`API: DB ${wasInserted ? 'Insert' : 'Update'} successful, ID:`, insertedId, "Fee:", totalFee);

        // --- Send Confirmation Email ---
        let successMessage = '';
        let emailSubject = '';
        let emailBodyHTML = '';

        // ... (Conditional email body generation based on totalFee as before) ...
        // REMEMBER TO ADD THE HTML BODY CONTENT HERE
        if (totalFee > 0) {
             successMessage = `Registration ${wasInserted ? 'received' : 'updated'}! Total Fee: ₹${totalFee}. Please check email for payment details.`;
             emailSubject = `AAROHANA 2K25 Registration ${wasInserted ? 'Received' : 'Updated'} - Payment Required`;
             emailBodyHTML = `<h1>Thank you for ${wasInserted ? 'registering for' : 'updating your registration for'} AAROHANA 2K25, ${name}!</h1>... (include token, fee, payment details) ...`;
         } else {
             successMessage = `Registration ${wasInserted ? 'complete' : 'updated'} for free events! Please check email for confirmation.`;
             emailSubject = `AAROHANA 2K25 Registration ${wasInserted ? 'Confirmed' : 'Updated'} (Free Events)`;
             emailBodyHTML = `<h1>Thank you for ${wasInserted ? 'registering for' : 'updating your registration for'} AAROHANA 2K25, ${name}!</h1>... (include token, mention no fee) ...`;
         }


        if (emailConfigured) {
            const msg = { to: email, from: senderEmail, subject: emailSubject, html: emailBodyHTML };
            try {
                 await sgMail.send(msg);
                 console.log('API: Confirmation email sent successfully to', email);
            } catch (emailError) {
                 console.error('API: Error sending confirmation email:', emailError.response ? emailError.response.body : emailError);
            }
        } else {
             console.warn("API: Email not sent because email service is not configured.");
             successMessage += " (Email confirmation skipped due to system config)"; // Inform user if email fails
        }

        res.status(200).json({ success: true, message: successMessage, token: registrationToken, fee: totalFee });

    } catch (dbError) {
         console.error('API: Database error:', dbError);
         res.status(500).json({ success: false, message: 'Database error during registration.' });
    } finally {
        if (client) client.release();
        console.log("API: DB Client Released");
    }
});

app.get('/api/register', (req, res) => res.status(200).json({ message: 'Aarohana Registration API is running.' }));

// --- Start Server ---
app.listen(PORT, () => console.log(`Aarohana API Server listening on port ${PORT}`));

module.exports = app;