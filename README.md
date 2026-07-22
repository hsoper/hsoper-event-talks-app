# BigQuery Release Hub & X/Tweet Sharer 🚀

A modern web application built with **Python Flask**, **Vanilla JavaScript**, **HTML5**, and **CSS3** that aggregates official [Google Cloud BigQuery Release Notes](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml) and enables one-click sharing of updates to X (Twitter).

![BigQuery Release Hub](https://img.shields.io/badge/BigQuery-Release%20Hub-38bdf8?style=for-the-badge&logo=googlecloud)
![Python Flask](https://img.shields.io/badge/Python-Flask-000000?style=for-the-badge&logo=flask)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## ✨ Features

- 🔄 **Live Feed Synchronization**: Fetches and parses official BigQuery Atom/XML release note feeds in real-time.
- ⚡ **Interactive UI & Search**: Filter release notes by keyword (e.g. *Iceberg*, *SQL*, *Spark*) instantly without reloading.
- 🎨 **Modern Dark Aesthetics**: Sleek glassmorphism UI with smooth animations, loading state skeletons, and crisp typography.
- 🐦 **One-Click X / Tweet Composer**: Select any update to auto-fill a tweet draft complete with formatted title, plain-text summary, documentation link, character counter, and hashtags (`#BigQuery #GoogleCloud #DataEngineering`).
- 🔗 **Direct Documentation Links**: Quick jump to official Google Cloud documentation for every release item.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12+, Flask, Requests, Feedparser
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Custom CSS3 (CSS Variables, Flexbox, Grid)
- **Deployment & Tooling**: Git, GitHub CLI (`gh`)

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.9+ installed on your machine.
- Git installed.

### 2. Installation & Setup

Clone the repository:
```bash
git clone https://github.com/hsoper/hsoper-event-talks-app.git
cd hsoper-event-talks-app
```

Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install flask requests feedparser
```

### 3. Running the Server

Start the Flask application:
```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 📡 API Endpoints

### `GET /api/notes`
Fetches and cleans the latest BigQuery release notes.

**Response Structure**:
```json
{
  "status": "success",
  "count": 30,
  "feed_title": "BigQuery - Release notes",
  "feed_updated": "2026-07-20T00:00:00-07:00",
  "notes": [
    {
      "id": "tag:google.com,2016:bigquery-release-notes#July_20_2026",
      "index": 0,
      "title": "July 20, 2026",
      "link": "https://docs.cloud.google.com/bigquery/docs/release-notes#July_20_2026",
      "published": "2026-07-20T00:00:00-07:00",
      "content_html": "<h3>Feature</h3><p>...",
      "clean_text": "Feature\nLakehouse for Apache Iceberg..."
    }
  ]
}
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
