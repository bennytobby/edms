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

# 3. Create a .env file with your configuration
$ touch .env
# Add your MongoDB, AWS S3, and email credentials to .env

# 4. Run the app
$ node server.js

# App will be available at:
http://localhost:3000
```

## Deploy to Heroku

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
$ heroku login

# 3. Create Heroku app
$ heroku create your-edms-app-name

# 4. Set environment variables
$ heroku config:set MONGO_CONNECTION_STRING="your_mongo_connection_string"
$ heroku config:set MONGO_DB_USERNAME="your_mongo_username"
$ heroku config:set MONGO_DB_PASSWORD="your_mongo_password"
$ heroku config:set MONGO_DB_NAME="your_database_name"
$ heroku config:set MONGO_FILECOLLECTION="files"
$ heroku config:set MONGO_USERCOLLECTION="users"
$ heroku config:set SECRET_KEY="your_secret_key"
$ heroku config:set EMAIL_USER="your_email@gmail.com"
$ heroku config:set EMAIL_PASS="your_app_password"
$ heroku config:set AWS_ACCESS_KEY_ID="your_aws_access_key"
$ heroku config:set AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
$ heroku config:set AWS_REGION="us-east-1"
$ heroku config:set AWS_S3_BUCKET="your-bucket-name"

# 5. Deploy to Heroku
$ git add .
$ git commit -m "Deploy to Heroku"
$ git push heroku main
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
