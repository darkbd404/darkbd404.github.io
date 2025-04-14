const axios = require('axios');
const crypto = require('crypto');

// Function to generate random string
function generateRandomString(length) {
    const lettersAndDigits = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += lettersAndDigits.charAt(Math.floor(Math.random() * lettersAndDigits.length));
    }
    return result;
}

// Generate random password
function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Generate random first name
function generateFirstName() {
    const names = ['John', 'Emma', 'Michael', 'Sophia', 'James', 'Olivia', 'William', 'Ava', 'Alexander', 'Isabella', 'Farzana', 'Mithila'];
    return names[Math.floor(Math.random() * names.length)];
}

// Generate random last name
function generateLastName() {
    const surnames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Wilson', 'Davis', 'Clark', 'Harris', 'Lewis', 'Walker', 'Mithila'];
    return surnames[Math.floor(Math.random() * surnames.length)];
}

// Generate random birthday
function generateBirthday() {
    const minAge = 18;
    const maxAge = 45;
    const currentYear = new Date().getFullYear();
    const year = Math.floor(Math.random() * (maxAge - minAge + 1)) + (currentYear - maxAge);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get mail domains
async function getMailDomains() {
    try {
        const response = await axios.get('https://api.mail.tm/domains');
        if (response.data['hydra:member']) {
            return response.data['hydra:member'];
        }
        return { error: 'E-mail Error: Invalid response format' };
    } catch (error) {
        return { error: 'E-mail Error: Unable to fetch domains' };
    }
}

// Create mail.tm account
async function createMailTmAccount() {
    const mailDomains = await getMailDomains();
    if (mailDomains.error) {
        return [null, null, null, null, null, mailDomains.error];
    }
    const domain = mailDomains[Math.floor(Math.random() * mailDomains.length)].domain;
    const username = generateRandomString(10);
    const password = generatePassword();
    const birthday = generateBirthday();
    const firstName = generateFirstName();
    const lastName = generateLastName();
    const url = 'https://api.mail.tm/accounts';
    const data = {
        address: `${username}@${domain}`,
        password: password
    };

    try {
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.status === 201) {
            return [`${username}@${domain}`, password, firstName, lastName, birthday, null];
        }
        return [null, null, null, null, null, `Email Error: ${response.data}`];
    } catch (error) {
        return [null, null, null, null, null, 'Email Error: Failed to create account'];
    }
}

// Register Facebook account
async function registerFacebookAccount(email, password, firstName, lastName, birthday) {
    const apiKey = '882a8490361da98702bf97a021ddc14d';
    const secret = '62f8ce9f74b12f84c123cc23437a4a32';
    const gender = Math.random() > 0.5 ? 'M' : 'F';
    const req = {
        api_key: apiKey,
        attempt_login: true,
        birthday: birthday,
        client_country_code: 'EN',
        fb_api_caller_class: 'com.facebook.registration.protocol.RegisterAccountMethod',
        fb_api_req_friendly_name: 'registerAccount',
        firstname: firstName,
        format: 'json',
        gender: gender,
        lastname: lastName,
        email: email,
        locale: 'en_US',
        method: 'user.register',
        password: password,
        reg_instance: generateRandomString(32),
        return_multiple_errors: true
    };

    const sortedKeys = Object.keys(req).sort();
    let sig = '';
    for (const key of sortedKeys) {
        sig += `${key}=${req[key]}`;
    }
    sig += secret;
    req.sig = crypto.createHash('md5').update(sig).digest('hex');

    const apiUrl = 'https://b-api.facebook.com/method/user.register';
    try {
        const response = await axios.post(apiUrl, new URLSearchParams(req), {
            headers: {
                'User-Agent': '[FBAN/FB4A;FBAV/35.0.0.48.273;FBDM/{density=1.33125,width=800,height=1205};FBLC/en_US;FBCR/;FBPN/com.facebook.katana;FBDV/Nexus 7;FBSV/4.1.1;FBBK/0;]'
            }
        });
        const reg = response.data;
        if (reg.new_user_id && reg.session_info && reg.session_info.access_token) {
            const id = reg.new_user_id;
            const token = reg.session_info.access_token;
            return {
                status: 'success',
                message: 'Account Created Successfully ✅',
                details: {
                    account_name: `👥 ${firstName} ${lastName}`,
                    email_address: `📧 ${email}`,
                    'ID-Link': `🌐 https://www.facebook.com/profile.php?id=${id}`,
                    password: `🔒 ${password}`,
                    date_of_birth: `🎂 ${birthday}`,
                    gender: gender === 'M' ? '👨 Male' : '👩 Female',
                    token: `🔑 ${token}`,
                    Api_Owners: '📢 Darkbd404 ( Rajvir)'
                }
            };
        }
        return {
            status: 'error',
            message: 'Facebook Error: Registration failed'
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Facebook Error: Registration failed'
        };
    }
}

// Vercel Serverless Function
module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const limit = parseInt(req.query.limit);
    if (!isNaN(limit) && limit > 0) {
        const maxLimit = Math.min(limit, 50); // Cap at 50 to prevent abuse
        const successfulAccounts = [];
        let totalAttempts = 0;
        let successfulCount = 0;
        let failedCount = 0;

        for (let i = 0; i < maxLimit; i++) {
            totalAttempts++;
            const [email, password, firstName, lastName, birthday, mailError] = await createMailTmAccount();
            if (email && password && firstName && lastName && birthday) {
                const result = await registerFacebookAccount(email, password, firstName, lastName, birthday);
                if (result.status === 'success') {
                    successfulAccounts.push(result);
                    successfulCount++;
                } else {
                    failedCount++;
                }
            } else {
                failedCount++;
            }
        }

        res.status(200).json({
            response: {
                summary: `Accounts Created👥: ${successfulCount}/${totalAttempts} ➜ Fail❌ ${failedCount}/${totalAttempts} ➜ Success✅ ${successfulCount}/${totalAttempts}`,
                status: 'success',
                accounts: successfulAccounts
            }
        });
    } else {
        res.status(400).json({
            response: {
                summary: 'Accounts Created👥: 0/0 ➜ Fail❌ 0/0 ➜ Success✅ 0/0',
                status: 'error',
                message: 'Invalid or missing limit parameter'
            }
        });
    }
};function generateBirthday() {
    const minAge = 18;
    const maxAge = 45;
    const currentYear = new Date().getFullYear();
    const year = Math.floor(Math.random() * (maxAge - minAge + 1)) + (currentYear - maxAge);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get mail domains
async function getMailDomains() {
    try {
        const response = await axios.get('https://api.mail.tm/domains');
        if (response.data['hydra:member']) {
            return response.data['hydra:member'];
        }
        return { error: 'E-mail Error: Invalid response format' };
    } catch (error) {
        return { error: 'E-mail Error: Unable to fetch domains' };
    }
}

// Create mail.tm account
async function createMailTmAccount() {
    const mailDomains = await getMailDomains();
    if (mailDomains.error) {
        return [null, null, null, null, null, mailDomains.error];
    }
    const domain = mailDomains[Math.floor(Math.random() * mailDomains.length)].domain;
    const username = generateRandomString(10);
    const password = generatePassword();
    const birthday = generateBirthday();
    const firstName = generateFirstName();
    const lastName = generateLastName();
    const url = 'https://api.mail.tm/accounts';
    const data = {
        address: `${username}@${domain}`,
        password: password
    };

    try {
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.status === 201) {
            return [`${username}@${domain}`, password, firstName, lastName, birthday, null];
        }
        return [null, null, null, null, null, `Email Error: ${response.data}`];
    } catch (error) {
        return [null, null, null, null, null, 'Email Error: Failed to create account'];
    }
}

// Register Facebook account
async function registerFacebookAccount(email, password, firstName, lastName, birthday) {
    const apiKey = '882a8490361da98702bf97a021ddc14d';
    const secret = '62f8ce9f74b12f84c123cc23437a4a32';
    const gender = Math.random() > 0.5 ? 'M' : 'F';
    const req = {
        api_key: apiKey,
        attempt_login: true,
        birthday: birthday,
        client_country_code: 'EN',
        fb_api_caller_class: 'com.facebook.registration.protocol.RegisterAccountMethod',
        fb_api_req_friendly_name: 'registerAccount',
        firstname: firstName,
        format: 'json',
        gender: gender,
        lastname: lastName,
        email: email,
        locale: 'en_US',
        method: 'user.register',
        password: password,
        reg_instance: generateRandomString(32),
        return_multiple_errors: true
    };

    // Sort keys for signature
    const sortedKeys = Object.keys(req).sort();
    let sig = '';
    for (const key of sortedKeys) {
        sig += `${key}=${req[key]}`;
    }
    sig += secret;
    req.sig = crypto.createHash('md5').update(sig).digest('hex');

    const apiUrl = 'https://b-api.facebook.com/method/user.register';
    try {
        const response = await axios.post(apiUrl, new URLSearchParams(req), {
            headers: {
                'User-Agent': '[FBAN/FB4A;FBAV/35.0.0.48.273;FBDM/{density=1.33125,width=800,height=1205};FBLC/en_US;FBCR/;FBPN/com.facebook.katana;FBDV/Nexus 7;FBSV/4.1.1;FBBK/0;]'
            }
        });
        const reg = response.data;
        if (reg.new_user_id && reg.session_info && reg.session_info.access_token) {
            const id = reg.new_user_id;
            const token = reg.session_info.access_token;
            return {
                status: 'success',
                message: 'Account Created Successfully ✅',
                details: {
                    account_name: `👥 ${firstName} ${lastName}`,
                    email_address: `📧 ${email}`,
                    'ID-Link': `🌐 https://www.facebook.com/profile.php?id=${id}`,
                    password: `🔒 ${password}`,
                    date_of_birth: `🎂 ${birthday}`,
                    gender: gender === 'M' ? '👨 Male' : '👩 Female',
                    token: `🔑 ${token}`,
                    Api_Owners: '📢 Darkbd404 ( Rajvir)'
                }
            };
        }
        return {
            status: 'error',
            message: 'Facebook Error: Registration failed'
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Facebook Error: Registration failed'
        };
    }
}

// Express server to handle GET requests
const express = require('express');
const app = express();

app.get('/', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const limit = parseInt(req.query.limit);
    if (!isNaN(limit) && limit > 0) {
        const maxLimit = Math.min(limit, 50); // Cap at 50 to prevent abuse
        const successfulAccounts = [];
        let totalAttempts = 0;
        let successfulCount = 0;
        let failedCount = 0;

        for (let i = 0; i < maxLimit; i++) {
            totalAttempts++;
            const [email, password, firstName, lastName, birthday, mailError] = await createMailTmAccount();
            if (email && password && firstName && lastName && birthday) {
                const result = await registerFacebookAccount(email, password, firstName, lastName, birthday);
                if (result.status === 'success') {
                    successfulAccounts.push(result);
                    successfulCount++;
                } else {
                    failedCount++;
                }
            } else {
                failedCount++;
            }
        }

        res.json({
            response: {
                summary: `Accounts Created👥: ${successfulCount}/${totalAttempts} ➜ Fail❌ ${failedCount}/${totalAttempts} ➜ Success✅ ${successfulCount}/${totalAttempts}`,
                status: 'success',
                accounts: successfulAccounts
            }
        }, null, 2);
    } else {
        res.json({
            response: {
                summary: 'Accounts Created👥: 0/0 ➜ Fail❌ 0/0 ➜ Success✅ 0/0',
                status: 'error',
                message: 'Invalid or missing limit parameter'
            }
        }, null, 2);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
