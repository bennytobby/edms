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

# App will run at:
http://localhost:3000
```

## Project Structure

```
├── server.js              # Main Express server
├── views/                 # EJS templates
├── public/                # Static files
├── uploads/               # (Deprecated, replaced by AWS S3)
├── .env.example           # Environment config template
├── .github/workflows/     # CI workflow
```

## GitHub Actions

On push to `main`, the app:

- Lints the codebase
- Verifies environment variables
- Optionally runs tests

## Screenshots

_Add screenshots to the `/screenshots/` folder and reference them here._

## Security Notes

- `.env` file is **NOT** tracked in Git.
- All secrets are accessed via `process.env`
- Be sure to rotate AWS/Gmail credentials periodically.

## Future Roadmap

- [ ] Folder-style grouping
- [ ] Admin panel
- [ ] Public/private sharing
- [ ] Version control for files
