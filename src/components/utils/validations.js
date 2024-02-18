// Custom validation function for Reddit Username field
export const validateRedditUsername = (value) => {
    // Check if value contains '/u/'
    if (value.includes('/u/')) {
        return false;
    }
    return true;
};

// Custom validation function for Email field
export const validateEmail = (value) => {
    // Regular expression for validating email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};

// Password strength validation function
export const isStrongPassword = (password) => {
    // Check if the password length is between 8 and 255 characters
    if (password.length < 8 || password.length > 255) {
        return false;
    }
    // Check if the password contains at least one special character
    const specialCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    if (!specialCharacters.test(password)) {
        return false;
    }
    // Return true if the password meets all criteria
    return true;
};