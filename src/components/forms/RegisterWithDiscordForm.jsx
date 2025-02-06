import React from "react";
import {Button, Box, Typography, useTheme, Card, Container, Link} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {Person} from "@mui/icons-material";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const BASE_URL = process.env.REACT_APP_BASE_URL;
const REDIRECT_URI = `${BASE_URL}`;

const RegisterWithDiscordForm = () => {
    const theme = useTheme();

    const discordOAuthURL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify`;

    return (
        <Box sx={theme.root}>
            <Container maxWidth="sm">
                <Card
                    sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: 4,
                        boxShadow: 3,
                        p: 4,
                        textAlign: "center",
                    }}
                >
                    <Person fontSize="large" sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 2 }}>
                        Register for Fake CFB
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
                        Join the community and experience the thrill of college football like never before. Sign up with Discord to get started!
                    </Typography>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{
                            mt: 2,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: "1rem",
                            backgroundColor: "#7289da",
                            "&:hover": { backgroundColor: "#5b6eae" },
                        }}
                        href={discordOAuthURL}
                        startIcon={<FontAwesomeIcon icon={faDiscord} />}
                    >
                        Register with Discord
                    </Button>
                    <Typography variant="body2" sx={{ mt: 3, color: "text.secondary" }}>
                        By registering, you agree to our{" "}
                        <Link
                            href="https://docs.google.com/document/d/1Cl7Z1l0821B1UK93sVPWPTUYxC9Li7yhp9cgja7QS9k/edit?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: "primary.main", textDecoration: "none" }}
                        >
                            Rules
                        </Link>
                        .
                    </Typography>
                </Card>
            </Container>
        </Box>
    );
};

export default RegisterWithDiscordForm;