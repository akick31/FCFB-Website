export const byteArrayToBase64 = (byteArray) => {
    return `data:image/png;base64,${btoa(
        new Uint8Array(byteArray).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )}`;
};
