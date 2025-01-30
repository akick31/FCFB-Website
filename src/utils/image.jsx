export const byteArrayToBase64 = (byteArray) => {
    return `data:image/png;base64,${btoa(
        new Uint8Array(byteArray).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )}`;
};

const byteArrayToImageUrl = (byteArray) => {
    if (!byteArray) return null;
    const blob = new Blob([byteArray], { type: 'image/png' });
    return URL.createObjectURL(blob);
};
