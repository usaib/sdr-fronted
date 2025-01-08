import os
import json
from flask import Flask, redirect, url_for, request, session, render_template, jsonify
from requests_oauthlib import OAuth2Session
import tweepy
import requests
from flask_cors import CORS

# Initialize Flask App
app = Flask(__name__)

# Enable CORS for localhost:3000
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Secret key for session
# app.secret_key = 'your_secret_key'

# Store the currently logged-in platform
CURRENT_PLATFORM = None  # This will hold the platform the user is currently logged into

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# OAuth Configuration
OAUTH_CONFIG = {
    "facebook": {
        "client_id": "1325053911835506",
        "client_secret": "83bd8f3db7fde9f3d7d2503b7c2accfb",
        "auth_base_url": "https://www.facebook.com/v10.0/dialog/oauth",
        "token_url": "https://graph.facebook.com/v10.0/oauth/access_token",
        "redirect_uri": "http://localhost:5000/facebook/callback"
    },
    "instagram": {
        "client_id": "3780472698859721",
        "client_secret": "6b34a2083d99f3c428c690b10571098f",
        "auth_base_url": "https://api.instagram.com/oauth/authorize",
        "token_url": "https://api.instagram.com/oauth/access_token",
        "redirect_uri": "http://localhost:5000/instagram/callback"
    },
    "twitter": {
        "api_key": "ZXU8xH7b7CZrcuQpJsgwdYDG6",
        "api_key_secret": "hbS42eHhybbpv0lE29HZ1bUNvuhPsZJAc9jB2sMEro6mpNGfY1",
        "access_token": "1876558324575109120-WSsgFurrAqtnudC4jE34Btq4h38lF6",
        "access_token_secret": "7pJfvpSg4xh86RWtoRmvNGp39sZjxGKoF958W8D5pq3Lf",
        "redirect_uri": "http://localhost:5000/twitter/callback"
    },
    "linkedin": {
        "client_id": "7770hhssj667yp",
        "client_secret": "WPL_AP1.nrV2aNwCqpvCzURq.PKXRCQ==",
        "auth_base_url": "https://www.linkedin.com/oauth/v2/authorization",
        "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
        "redirect_uri": "http://localhost:5000/linkedin/callback"
    }
}

USER_CREDENTIALS = {}

def load_credentials():
    if os.path.exists("user_credentials.json"):
        with open("user_credentials.json", "r") as f:
            return json.load(f)
    return {}

def save_credentials(platform, credentials, user_name):
    # Dynamically set the filename based on the user's name and platform
    if user_name:
        file_name = f"{user_name}_{platform}_credentials.json"
    else:
        file_name = f"{platform}_credentials.json"
    
    # Save credentials in a file with the dynamic name
    with open(file_name, "w") as f:
        json.dump(credentials, f)

USER_CREDENTIALS = load_credentials()

def get_oauth_session(platform, scope=None):
    config = OAUTH_CONFIG[platform]
    return OAuth2Session(config["client_id"], redirect_uri=config["redirect_uri"], scope=scope)

@app.route('/twitter/login')
def twitter_login():
    auth = tweepy.OAuthHandler(
        OAUTH_CONFIG["twitter"]["api_key"],
        OAUTH_CONFIG["twitter"]["api_key_secret"],
        OAUTH_CONFIG["twitter"]["redirect_uri"]
    )
    try:
        redirect_url = auth.get_authorization_url()
        session['request_token'] = auth.request_token
        return redirect(redirect_url)
    except tweepy.TweepyException as e:
        return f"Error during Twitter login: {str(e)}", 500

@app.route('/twitter/callback')
def twitter_callback():
    request_token = session.pop('request_token', None)
    auth = tweepy.OAuthHandler(
        OAUTH_CONFIG["twitter"]["api_key"],
        OAUTH_CONFIG["twitter"]["api_key_secret"]
    )
    auth.request_token = request_token
    try:
        auth.get_access_token(request.args.get('oauth_verifier'))
        api = tweepy.API(auth)
        user_name = api.me().screen_name  # Get the authenticated user's screen name
        
        save_credentials("twitter", {
            "access_token": auth.access_token,
            "access_token_secret": auth.access_token_secret
        }, user_name)
        
        # Redirect to post page after login
        return redirect(url_for('create_post'))
    except tweepy.TweepyException as e:
        return f"Error during Twitter callback: {str(e)}", 500

def post_to_platform(platform, post_details):
    if platform not in USER_CREDENTIALS:
        raise ValueError(f"User not authenticated for {platform}.")

    if platform == "facebook":
        url = "https://graph.facebook.com/v10.0/me/feed"
        params = {
            "access_token": USER_CREDENTIALS["facebook"]["access_token"],
            "message": post_details.get("text"),
        }
        response = requests.post(url, params=params)
        return response.json()

    elif platform == "instagram":
        url = "https://graph.instagram.com/v10.0/me/media"
        params = {
            "access_token": USER_CREDENTIALS["instagram"]["access_token"],
            "caption": post_details.get("text"),
        }
        if "image_path" in post_details:
            params["image_url"] = post_details["image_path"]
        response = requests.post(url, params=params)
        return response.json()

    elif platform == "twitter":
        user_credentials = USER_CREDENTIALS["twitter"]
        auth = tweepy.OAuthHandler(
            OAUTH_CONFIG["twitter"]["api_key"],
            OAUTH_CONFIG["twitter"]["api_key_secret"]
        )
        auth.set_access_token(
            user_credentials["access_token"],
            user_credentials["access_token_secret"]
        )
        api = tweepy.API(auth)

        if "image_path" in post_details:
            return api.update_with_media(post_details["image_path"], post_details["text"])

        return api.update_status(post_details["text"])

    elif platform == "linkedin":
        url = "https://api.linkedin.com/v2/ugcPosts"
        headers = {
            "Authorization": f"Bearer {USER_CREDENTIALS['linkedin']['access_token']}",
            "Content-Type": "application/json",
        }
        data = {
            "author": f"urn:li:person:{USER_CREDENTIALS['linkedin']['access_token']}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": post_details.get("text")},
                    "shareMediaCategory": "NONE",
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }
        response = requests.post(url, headers=headers, json=data)
        return response.json()

    else:
        raise ValueError(f"Unsupported platform: {platform}")

@app.route('/')
def home():
    return render_template('index.html', platforms=OAUTH_CONFIG.keys())

@app.route('/<platform>/login')
def login(platform):
    if platform not in OAUTH_CONFIG:
        return f"Unsupported platform: {platform}", 400

    scope = None
    if platform == "linkedin":
        # Specify LinkedIn's required scopes
        scope = ["r_liteprofile", "r_emailaddress", "w_member_social"]

    oauth = get_oauth_session(platform, scope)

    # Get the authorization URL
    authorization_url, _ = oauth.authorization_url(OAUTH_CONFIG[platform]["auth_base_url"])
    return redirect(authorization_url)

@app.route('/<platform>/callback')
def callback(platform):
    global CURRENT_PLATFORM  # Declare this variable as global to modify it

    if platform not in OAUTH_CONFIG:
        return f"Unsupported platform: {platform}", 400

    oauth = get_oauth_session(platform)
    try:
        token = oauth.fetch_token(
            OAUTH_CONFIG[platform]["token_url"],
            authorization_response=request.url,
            client_secret=OAUTH_CONFIG[platform]["client_secret"]
        )
        user_name = None
        if platform == "twitter":
            api = tweepy.API(oauth)
            user_name = api.me().screen_name  # Get the authenticated user's screen name
        save_credentials(platform, token, user_name)

        # Set the current platform to the one the user logged into
        CURRENT_PLATFORM = platform

        # Redirect to post page for Instagram or success page for others
        if platform == "instagram":
            return redirect(url_for('create_post'))

        return render_template('success.html', platform=platform)
    except Exception as e:
        return f"Error during {platform} callback: {str(e)}", 500

@app.route('/post', methods=['GET', 'POST'])
def create_post():
    if request.method == 'POST':
        data = request.form
        platform = data.get("platform")
        post_details = {"text": data.get("text")}

        # File upload handling
        if 'image_file' in request.files:
            image_file = request.files['image_file']
            post_details["image_path"] = image_file.filename
            image_file.save(os.path.join("uploads", image_file.filename))

        if 'video_file' in request.files:
            video_file = request.files['video_file']
            post_details["video_path"] = video_file.filename
            video_file.save(os.path.join("uploads", video_file.filename))

        try:
            post_response = post_to_platform(platform, post_details)
            return f"Post successful: {post_response}"
        except Exception as e:
            return f"Error during post creation: {str(e)}"

    return render_template('create_post.html')

# New API endpoint to fetch current logged-in platform
@app.route('/api/current_platform', methods=['GET'])
def get_current_platform():
    if CURRENT_PLATFORM:
        return jsonify({"platform": CURRENT_PLATFORM})
    else:
        return jsonify({"platform": None})

if __name__ == '__main__':
    app.run(debug=True)







