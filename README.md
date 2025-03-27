# EDMS: Electronic Document Management System

A web-based document management system built with **Node.js**, **Express**, **MongoDB**, and **AWS S3**. Securely upload, view, download, and manage documents in the cloud with tagging, search, and email notifications.

## Features

- ✅ Secure registration & login (bcrypt + sessions)
- ✅ File uploads to AWS S3
- ✅ File descriptions & tags (e.g. `finance`, `resume`)
- ✅ Search by name, uploader, or tag
- ✅ Email notifications on upload, delete, registration
- ✅ GitHub Actions CI/CD enabled

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- File Storage: AWS S3
- Email: Nodemailer (Gmail)
- Templating: EJS
- CI/CD: GitHub Actions

## How to Run Locally

```bash
# 1. Clone the repo
$ git clone https://github.com/YOUR_USERNAME/edms.git
$ cd edms

# 2. Install dependencies
$ npm install

# 3. Create a .env file using the template
$ cp .env.example .env

# 4. Run the app
$ node server.js

# Default port 3000:
$ node server.js

# OR specify a custom port:
$ node server.js 5000

# App will be available at:
http://localhost:3000 (default)
http://localhost:<custom_port> (if specified)
```

## Project Structure

```
├── server.js              # Main Express server
├── views/                 # EJS templates (frontend)
├── public/                # Static assets (CSS, JS)
├── styles/                # CSS stylesheets
├── .env.example           # Environment config template
├── .github/workflows/     # GitHub Actions workflow
├── test/                  # Testing setup (optional)
```

## Security Notes

- `.env` file is **NOT** tracked in Git.
- All secrets are accessed via `process.env`
- Be sure to rotate AWS/Gmail credentials periodically.

## Future Roadmap

- [ ] Add thorough testing framework
- [ ] Folder-style grouping
- [ ] Admin panel
- [ ] Public/private sharing
- [ ] Version control for files
