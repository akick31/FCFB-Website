export const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};

export const isStrongPassword = (password) => {
    if (password.length < 8 || password.length > 255) {
        return false;
    }
    const specialCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    if (!specialCharacters.test(password)) {
        return false;
    }
    return true;
};
