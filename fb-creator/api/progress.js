const fs = require('fs').promises;
const crypto = require('crypto');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    try {
        console.log('Received request:', req.method, req.query);

        // Set JSON header
        res.setHeader('Content-Type', 'application/json');

        // Function to load names from username.txt
        async function load_names_from_file(filename = 'public/username.txt') {
            try {
                const content = await fs.readFile(filename, 'utf-8');
                const male_names = [];
                const female_names = [];
                let current_section = null;

                for (let line of content.split('\n')) {
                    line = line.trim();
                    if (line === '# Male Names') {
                        current_section = 'male';
                        continue;
                    } else if (line === '# Female Names') {
                        current_section = 'female';
                        continue;
                    }
                    if (current_section === 'male' && line) {
                        male_names.push(line);
                    } else if (current_section === 'female' && line) {
                        female_names.push(line);
                    }
                }
                return {
                    male: [...new Set(male_names)],
                    female: [...new Set(female_names)]
                };
            } catch (err) {
                console.error('Error reading username.txt:', err.message);
                return { male: [], female: [] };
            }
        }

        // Generate random string
        function generate_random_string(length) {
            const letters_and_digits = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += letters_and_digits[Math.floor(Math.random() * letters_and_digits.length)];
            }
            return result;
        }

        // Generate random password
        function generate_password() {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
            let password = '';
            for (let i = 0; i < 12; i++) {
                password += chars[Math.floor(Math.random() * chars.length)];
            }
            return password;
        }

        // Generate random birthday
        function generate_birthday() {
            const min_age = 18;
            const max_age = 45;
            const current_year = new Date().getFullYear();
            const year = Math.floor(Math.random() * (max_age - min_age + 1)) + (current_year - max_age);
            const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Get mail domains
        async function get_mail_domains() {
            const url = "https://api.mail.tm/domains";
            try {
                const response = await fetch(url, { timeout: 10000 });
                if (!response.ok) {
                    console.error('mail.tm domains failed:', response.status);
                    return { error: "Unable to fetch email domains" };
                }
                const data = await response.json();
                if (data['hydra:member']) {
                    return data['hydra:member'];
                }
                return { error: "Invalid email domain response" };
            } catch (err) {
                console.error('mail.tm error:', err.message);
                return { error: "Unable to fetch email domains" };
            }
        }

        // Create mail.tm account
        async function create_mail_tm_account(gender, names) {
            const male_names = names.male;
            const female_names = names.female;

            if (gender === 'M' && male_names.length === 0) {
                return [null, null, null, null, null, "No male names found in username.txt"];
            }
            if (gender === 'F' && female_names.length === 0) {
                return [null, null, null, null, null, "No female names found in username.txt"];
            }

            const mail_domains = await get_mail_domains();
            if (mail_domains.error) {
                return [null, null, null, null, null, mail_domains.error];
            }
            const domain = mail_domains[Math.floor(Math.random() * mail_domains.length)].domain;
            const username = generate_random_string(10);
            const password = generate_password();
            const birthday = generate_birthday();

            let first_name, last_name;
            if (gender === 'M') {
                const available_names = male_names.filter(name => name);
                if (available_names.length < 2) {
                    return [null, null, null, null, null, "Insufficient male names"];
                }
                const first_index = Math.floor(Math.random() * available_names.length);
                first_name = available_names[first_index];
                available_names.splice(first_index, 1);
                last_name = available_names[Math.floor(Math.random() * available_names.length)];
            } else if (gender === 'F') {
                const available_names = female_names.filter(name => name);
                if (available_names.length < 2) {
                    return [null, null, null, null, null, "Insufficient female names"];
                }
                const first_index = Math.floor(Math.random() * available_names.length);
                first_name = available_names[first_index];
                available_names.splice(first_index, 1);
                last_name = available_names[Math.floor(Math.random() * available_names.length)];
            } else {
                return [null, null, null, null, null, "Invalid gender specified"];
            }

            const url = "https://api.mail.tm/accounts";
            const headers = { "Content-Type": "application/json" };
            const data = {
                address: `${username}@${domain}`,
                password: password
            };
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data),
                    timeout: 10000
                });
                const status = response.status;
                if (status === 201) {
                    return [`${username}@${domain}`, password, first_name, last_name, birthday, ""];
                }
                const errorText = await response.text();
                console.error('mail.tm account creation failed:', errorText);
                return [null, null, null, null, null, `Email creation failed: ${errorText}`];
            } catch (err) {
                console.error('mail.tm POST error:', err.message);
                return [null, null, null, null, null, "Email creation failed"];
            }
        }

        // Register Facebook account
        async function register_facebook_account(email, password, first_name, last_name, birthday, gender) {
            const api_key = '882a8490361da98702bf97a021ddc14d';
            const secret = '62f8ce9f74b12f84c123cc23437a4a32';
            const req = {
                'api_key': api_key,
                'attempt_login': true,
                'birthday': birthday,
                'client_country_code': 'EN',
                'fb_api_caller_class': 'com.facebook.registration.protocol.RegisterAccountMethod',
                'fb_api_req_friendly_name': 'registerAccount',
                'firstname': first_name,
                'format': 'json',
                'gender': gender,
                'lastname': last_name,
                'email': email,
                'locale': 'en_US',
                'method': 'user.register',
                'password': password,
                'reg_instance': generate_random_string(32),
                'return_multiple_errors': true
            };
            const sortedKeys = Object.keys(req).sort();
            let sig = '';
            for (const k of sortedKeys) {
                sig += `${k}=${req[k]}`;
            }
            sig += secret;
            req['sig'] = crypto.createHash('md5').update(sig).digest('hex');
            const api_url = 'https://b-api.facebook.com/method/user.register';
            const reg = await _call(api_url, req);
            if (reg && reg.new_user_id && reg.session_info && reg.session_info.access_token) {
                return {
                    success: true,
                    name: `${first_name} ${last_name}`,
                    email: email,
                    id: reg.new_user_id,
                    password: password,
                    birthday: birthday,
                    gender: gender,
                    token: reg.session_info.access_token
                };
            }
            console.error('Facebook API failed:', reg);
            return { success: false, error: "Account creation failed" };
        }

        // Make API call
        async function _call(url, params, post = true) {
            const headers = {
                'User-Agent': '[FBAN/FB4A;FBAV/35.0.0.48.273;FBDM/{density=1.33125,width=800,height=1205};FBLC/en_US;FBCR/;FBPN/com.facebook.katana;FBDV/Nexus 7;FBSV/4.1.1;FBBK/0;]'
            };
            const queryString = new URLSearchParams(params).toString();
            try {
                const response = await fetch(post ? url : `${url}?${queryString}`, {
                    method: post ? 'POST' : 'GET',
                    headers: headers,
                    body: post ? queryString : undefined,
                    timeout: 10000
                });
                return await response.json();
            } catch (err) {
                console.error('API call error:', err.message);
                return null;
            }
        }

        // Handle GET request with amount parameter
        if (req.method === 'GET' && req.query.amount) {
            const amount = parseInt(req.query.amount, 10);
            if (isNaN(amount) || amount < 1 || amount > 50) {
                return res.status(400).json({ error: 'Invalid amount. Must be between 1 and 50.' });
            }

            const names = await load_names_from_file();
            const results = [];

            for (let i = 0; i < amount; i++) {
                const gender = Math.random() < 0.5 ? 'M' : 'F';
                const [email, password, first_name, last_name, birthday, mail_error] = await create_mail_tm_account(gender, names);
                
                if (mail_error) {
                    results.push({ success: false, error: mail_error });
                    continue;
                }

                const result = await register_facebook_account(email, password, first_name, last_name, birthday, gender);
                results.push(result);
            }

            return res.status(200).json(results);
        }

        return res.status(400).json({ error: 'Invalid request. Use ?amount=<number>' });
    } catch (err) {
        console.error('Server error:', err.message);
        return res.status(500).json({ error: 'Server error' });
    }
};
