<?php
header('Content-Type: application/json');

// Function to load names from username.txt
function load_names_from_file($filename = 'username.txt') {
    if (!file_exists($filename)) {
        return ['male' => [], 'female' => []];
    }
    $content = file_get_contents($filename);
    $male_names = [];
    $female_names = [];
    $current_section = null;

    foreach (explode("\n", $content) as $line) {
        $line = trim($line);
        if ($line === '# Male Names') {
            $current_section = 'male';
            continue;
        } elseif ($line === '# Female Names') {
            $current_section = 'female';
            continue;
        }
        if ($current_section === 'male' && !empty($line)) {
            $male_names[] = $line;
        } elseif ($current_section === 'female' && !empty($line)) {
            $female_names[] = $line;
        }
    }

    return ['male' => array_unique($male_names), 'female' => array_unique($female_names)];
}

// Function to generate random string
function generate_random_string($length) {
    $letters_and_digits = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $result = '';
    for ($i = 0; $i < $length; $i++) {
        $result .= $letters_and_digits[rand(0, strlen($letters_and_digits) - 1)];
    }
    return $result;
}

// Generate random password
function generate_password() {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    $password = '';
    for ($i = 0; $i < 12; $i++) {
        $password .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $password;
}

// Generate random birthday
function generate_birthday() {
    $min_age = 18;
    $max_age = 45;
    $current_year = date('Y');
    $year = rand($current_year - $max_age, $current_year - $min_age);
    $month = sprintf("%02d", rand(1, 12));
    $day = sprintf("%02d", rand(1, 28));
    return "$year-$month-$day";
}

// Get mail domains
function get_mail_domains() {
    $url = "https://api.mail.tm/domains";
    $response = @file_get_contents($url);
    if ($response === false) {
        return ["error" => "Unable to fetch email domains"];
    }
    $data = json_decode($response, true);
    if (isset($data['hydra:member'])) {
        return $data['hydra:member'];
    }
    return ["error" => "Invalid email domain response"];
}

// Create mail.tm account
function create_mail_tm_account($gender) {
    $names = load_names_from_file();
    $male_names = $names['male'];
    $female_names = $names['female'];
    
    if ($gender === 'M' && empty($male_names)) {
        return [null, null, null, null, null, "No male names found in username.txt"];
    }
    if ($gender === 'F' && empty($female_names)) {
        return [null, null, null, null, null, "No female names found in username.txt"];
    }

    $mail_domains = get_mail_domains();
    if (isset($mail_domains['error'])) {
        return [null, null, null, null, null, $mail_domains['error']];
    }
    $domain = $mail_domains[array_rand($mail_domains)]['domain'];
    $username = generate_random_string(10);
    $password = generate_password();
    $birthday = generate_birthday();

    // Select names based on gender
    if ($gender === 'M') {
        $available_names = array_filter($male_names, function($name) { return !empty($name); });
        if (count($available_names) < 2) {
            return [null, null, null, null, null, "Insufficient male names"];
        }
        $first_index = array_rand($available_names);
        $first_name = $available_names[$first_index];
        unset($available_names[$first_index]);
        $available_names = array_values($available_names);
        $last_name = $available_names[array_rand($available_names)];
    } elseif ($gender === 'F') {
        $available_names = array_filter($female_names, function($name) { return !empty($name); });
        if (count($available_names) < 2) {
            return [null, null, null, null, null, "Insufficient female names"];
        }
        $first_index = array_rand($available_names);
        $first_name = $available_names[$first_index];
        unset($available_names[$first_index]);
        $available_names = array_values($available_names);
        $last_name = $available_names[array_rand($available_names)];
    } else {
        return [null, null, null, null, null, "Invalid gender specified"];
    }

    $url = "https://api.mail.tm/accounts";
    $headers = ["Content-Type: application/json"];
    $data = [
        "address" => "$username@$domain",
        "password" => $password
    ];
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => json_encode($data)
        ]
    ];
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    if ($response !== false) {
        $http_response_header = $http_response_header ?? [];
        $status_line = $http_response_header[0] ?? '';
        if (strpos($status_line, '201') !== false) {
            return [$username . "@" . $domain, $password, $first_name, $last_name, $birthday, ""];
        }
        return [null, null, null, null, null, "Email creation failed: $response"];
    }
    return [null, null, null, null, null, "Email creation failed"];
}

// Register Facebook account
function register_facebook_account($email, $password, $first_name, $last_name, $birthday, $gender) {
    $api_key = '882a8490361da98702bf97a021ddc14d';
    $secret = '62f8ce9f74b12f84c123cc23437a4a32';
    $req = [
        'api_key' => $api_key,
        'attempt_login' => true,
        'birthday' => $birthday,
        'client_country_code' => 'EN',
        'fb_api_caller_class' => 'com.facebook.registration.protocol.RegisterAccountMethod',
        'fb_api_req_friendly_name' => 'registerAccount',
        'firstname' => $first_name,
        'format' => 'json',
        'gender' => $gender,
        'lastname' => $last_name,
        'email' => $email,
        'locale' => 'en_US',
        'method' => 'user.register',
        'password' => $password,
        'reg_instance' => generate_random_string(32),
        'return_multiple_errors' => true
    ];
    ksort($req);
    $sig = '';
    foreach ($req as $k => $v) {
        $sig .= "$k=$v";
    }
    $sig .= $secret;
    $req['sig'] = md5($sig);
    $api_url = 'https://b-api.facebook.com/method/user.register';
    $reg = _call($api_url, $req);
    if (isset($reg['new_user_id']) && isset($reg['session_info']['access_token'])) {
        $id = $reg['new_user_id'];
        $token = $reg['session_info']['access_token'];
        $output = "<p class=\"success\">✅ Account Created Successfully</p>";
        $output .= "<p><strong>Facebook Account Name:</strong> $first_name $last_name</p>";
        $output .= "<p><strong>Email Address:</strong> $email</p>";
        $output .= "<p><strong>Url /ID:</strong> <a href=\"https://www.facebook.com/profile.php?id=$id\">https://www.facebook.com/profile.php?id=$id</a></p>";
        $output .= "<p><strong>Password:</strong> $password</p>";
        $output .= "<p><strong>Date of Birth:</strong> $birthday</p>";
        $output .= "<p><strong>Gender:</strong> $gender</p>";
        $output .= "<p><strong>Token:</strong> $token</p>";
        return ['success' => true, 'output' => $output];
    }
    return ['success' => false, 'output' => "Account creation failed"];
}

// Make API call
function _call($url, $params, $post = true) {
    $headers = [
        'User-Agent: [FBAN/FB4A;FBAV/35.0.0.48.273;FBDM/{density=1.33125,width=800,height=1205};FBLC/en_US;FBCR/;FBPN/com.facebook.katana;FBDV/Nexus 7;FBSV/4.1.1;FBBK/0;]'
    ];
    $options = [
        'http' => [
            'method' => $post ? 'POST' : 'GET',
            'header' => implode("\r\n", $headers),
            'content' => http_build_query($params)
        ]
    ];
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    return json_decode($response, true);
}

// Handle AJAX request
if (isset($_POST['action']) && $_POST['action'] === 'create') {
    $gender = rand(0, 1) ? 'M' : 'F';
    list($email, $password, $first_name, $last_name, $birthday, $mail_output) = create_mail_tm_account($gender);
    if ($email && $password && $first_name && $last_name && $birthday) {
        $result = register_facebook_account($email, $password, $first_name, $last_name, $birthday, $gender);
        echo json_encode($result);
    } else {
        echo json_encode(['success' => false, 'output' => $mail_output]);
    }
    exit;
}

echo json_encode(['success' => false, 'output' => 'Invalid request']);
?>