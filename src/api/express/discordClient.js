const express = require("express");
const axios = require("axios");

const app = express();
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
const REDIRECT_URI = process.env.REACT_APP_EXPRESS_BASE_URL + "/register/complete";

app.get("/discord/redirect", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
        const tokenResponse = await axios.post("https://discord.com/api/oauth2/token", null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: "client_credentials",
                redirect_uri: REDIRECT_URI,
                scope: "identify",
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const { access_token } = tokenResponse.data;

        const userResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { username, discriminator } = userResponse.data;
        const discordTag = `${username}#${discriminator}`;
        console.log("Username:", username);
        console.log("Discord tag:", discordTag);

        // Redirect back to frontend with the Discord tag
        res.redirect(`${REDIRECT_URI}?discordTag=${encodeURIComponent(discordTag)}`);
    } catch (error) {
        console.error("Discord OAuth2 Error:", error);
        res.status(500).send("Error authenticating with Discord");
    }
});

app.listen(3001, () => console.log("Server running on port 3001"));