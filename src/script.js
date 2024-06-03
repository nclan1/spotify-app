
const clientId = "4ab54dd4daf04c39976a847c9066ce5d";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");



if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    await getAccessToken(clientId, code);
    const accessToken = localStorage.getItem("accessing_t");
    console.log(accessToken)
    const profile = await fetchProfile(accessToken);
    console.log(profile);
    populateUI(profile);
}


export async function redirectToAuthCodeFlow(clientId) {
 

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

    const { access_token } = await result.json();
    localStorage.setItem("accessing_t", access_token)
    console.log("can get accesskey")
    console.log(localStorage.getItem("accessing_t"),"ajfsd")
   
}

// const getRefreshToken = async () => {

//     const refreshToken = localStorage.getItem('refresh_token');
//     const url = "https://accounts.spotify.com/api/token";

//     const payload = {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www.form-urlencoded'
//         },
//         body: new URLSearchParams({
//             grant_type: 'refresh_token',
//             refresh_token: refreshToken,
//             client_id: clientId
//         }),
//     }
//     const body = await fetch(url, payload);
//     const response await body.json();

//     localStorage.setItem('access_token', response.accessToken);
//     localStorage.setItem('refresh_token', response.refreshToken);
// }

async function fetchProfile(token) {

    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}`}
    });

    return await result.json();

}


function populateUI(profile) {


    document.getElementById("displayName").innerText = profile.display_name;
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);

    if (profile.images[1]) {
        const profileImage = new Image(600,600);
        profileImage.src = profile.images[1].url;
        document.getElementById("avatar").appendChild(profileImage);
        document.getElementById("imgUrl").innerText = profile.images[1].url;
    }


}