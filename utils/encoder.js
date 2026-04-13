exports.encodeQuery = (obj) => {
    return Buffer.from(JSON.stringify(obj)).toString('base64');
};


exports.decodeQuery = (encodedStr) => {
    try {
        const decodedString = Buffer.from(encodedStr, 'base64').toString('utf-8');
        return JSON.parse(decodedString);
    } catch (error) {
        return null; // Return null if someone tampers with the string
    }
};