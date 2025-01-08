import os
from flask import Flask, redirect, url_for, request, session, render_template
from requests_oauthlib import OAuth2Session
import tweepy
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/post', methods=['POST'])
def api_create_post():
    data = request.json
    platform = data.get("platform")
    post_details = {"text": data.get("text")}

    # Handle media files (optional)
    if "image_path" in data:
        post_details["image_path"] = data["image_path"]
    elif "video_path" in data:
        post_details["video_path"] = data["video_path"]

    try:
        result = post_to_platform(platform, post_details)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}, 500


os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
app.secret_key = 'your_secret_key'

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


def save_credentials(platform, credentials):
    USER_CREDENTIALS[platform] = credentials


def get_oauth_session(platform):
    config = OAUTH_CONFIG[platform]
    return OAuth2Session(config["client_id"], redirect_uri=config["redirect_uri"])


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
        save_credentials("twitter", {
            "access_token": auth.access_token,
            "access_token_secret": auth.access_token_secret
        })
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


def get_oauth_session(platform, scope=None):
    config = OAUTH_CONFIG[platform]
    return OAuth2Session(config["client_id"], redirect_uri=config["redirect_uri"], scope=scope)


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
    if platform not in OAUTH_CONFIG:
        return f"Unsupported platform: {platform}", 400

    oauth = get_oauth_session(platform)
    try:
        token = oauth.fetch_token(
            OAUTH_CONFIG[platform]["token_url"],
            authorization_response=request.url,
            client_secret=OAUTH_CONFIG[platform]["client_secret"]
        )
        save_credentials(platform, token)

        # Redirect to post page for Instagram
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
            # Save or process image file
            post_details["image_path"] = image_file.filename
        elif 'video_file' in request.files:
            video_file = request.files['video_file']
            # Save or process video file
            post_details["video_path"] = video_file.filename

        try:
            result = post_to_platform(platform, post_details)
            return render_template('result.html', result=result)
        except Exception as e:
            return render_template('result.html', error=str(e))
    return render_template('post.html', platforms=USER_CREDENTIALS.keys())


if __name__ == "__main__":
    app.run(debug=True)




