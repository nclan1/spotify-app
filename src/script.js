
const clientId = "4ab54dd4daf04c39976a847c9066ce5d";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

let accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");

if (!accessToken && !code) {
    redirectToAuthCodeFlow(clientId);
} else if (code) {
    const tokenData = await getAccessToken(clientId, code);
    accessToken = tokenData.access_token;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", tokenData.refresh_token);
    const profile = await fetchProfile(accessToken);
    console.log("have code");
    populateUI(profile);
} else if (accessToken) {
    try {
        const profile = await fetchProfile(accessToken);
        console.log("dont have code but have accessToken");
        populateUI(profile);
    } catch (e) {
        if (e.response.status === 401 && refreshToken) {
            const tokenData = await refreshAccessToken(clientId, refreshToken);
            accessToken = tokenData.access_token;
            localStorage.setItem("accessToken", accessToken);
            const profile = await fetchProfile(accessToken);
            console.log("ajsdffjsd");
            populateUI(profile);
        } else {
            redirectToAuthCodeFlow(clientId);
        }
    }
}



export async function redirectToAuthCodeFlow(clientId) {
    // TODO: Redirect to Spotify authorization page

    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible,length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

async function getAccessToken(clientId, code) {
    // TODO: Get access token for code
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded"},
        body: params
    });

    
    return await result.json();;
}

async function fetchProfile(token) {
    // TODO: Call Web API
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}`}
    });

    return await result.json();

}

async function refreshAccessToken(clientId, refreshToken) {
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded"},
        body: params
    });

    return await result.json();
}

function populateUI(profile) {
    // TODO: Update UI with profile data
    // setDisplayName(profile.display_name);

    document.getElementById("displayName").innerText = profile.display_name;
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);

    if (profile.images[0]) {
        const profileImage = new Image(600,600);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
        document.getElementById("imgUrl").innerText = profile.images[0].url;
    }


}