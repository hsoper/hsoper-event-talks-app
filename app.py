from flask import Flask, render_template, jsonify, request
import requests
import feedparser
import re
from html import unescape

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def clean_html(raw_html):
    """Clean and strip HTML tags to get plain text for tweeting."""
    if not raw_html:
        return ""
    text = re.sub(r'<br\s*/?>', '\n', raw_html, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n\n', text, flags=re.IGNORECASE)
    clean_text = re.sub(r'<[^>]+>', '', text)
    clean_text = unescape(clean_text)
    clean_text = re.sub(r'\n\s*\n', '\n\n', clean_text).strip()
    return clean_text

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/notes")
def get_notes():
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        resp = requests.get(FEED_URL, headers=headers, timeout=10)
        resp.raise_for_status()
        
        feed = feedparser.parse(resp.content)
        
        notes = []
        for idx, entry in enumerate(feed.entries):
            content_html = ""
            if "content" in entry and entry.content:
                content_html = entry.content[0].value
            elif "summary" in entry:
                content_html = entry.summary
            
            clean_text = clean_html(content_html)
            
            title = entry.get("title", "BigQuery Release Note")
            link = entry.get("link", "https://docs.cloud.google.com/bigquery/docs/release-notes")
            published = entry.get("published", entry.get("updated", ""))
            
            notes.append({
                "id": entry.get("id", f"note-{idx}"),
                "index": idx,
                "title": title,
                "link": link,
                "published": published,
                "content_html": content_html,
                "clean_text": clean_text
            })
            
        return jsonify({
            "status": "success",
            "count": len(notes),
            "feed_title": feed.feed.get("title", "BigQuery Release Notes"),
            "feed_updated": feed.feed.get("updated", ""),
            "notes": notes
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
