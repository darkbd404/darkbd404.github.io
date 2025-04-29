<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Error Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #0f0326;
            height: 100vh;
            overflow: hidden;
            font-family: 'Arial', sans-serif;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            background: radial-gradient(circle at center, rgba(255, 77, 128, 0.1) 0%, transparent 70%);
            animation: backgroundPulse 20s ease-in-out infinite;
        }

        .nebula {
            position: absolute;
            width: 100%;
            height: 100%;
            background: url('https://www.transparenttextures.com/patterns/stardust.png') repeat;
            opacity: 0.3;
            animation: nebulaDrift 60s linear infinite;
        }

        .galaxy {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(0, 230, 255, 0.2) 10%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: galaxySpin 40s linear infinite;
            box-shadow: 0 0 50px rgba(0, 230, 255, 0.3);
        }

        .container {
            text-align: center;
            color: #fff;
            position: relative;
            z-index: 2;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
        }

        h1 {
            font-size: 80px;
            text-transform: uppercase;
            letter-spacing: 6px;
            background: linear-gradient(90deg, #ff4d80, #00e6ff);
            -webkit-background-clip: text;
            color: transparent;
            animation: neonPulse 2s ease-in-out infinite alternate, glitch 3s infinite, textFloat 5s ease-in-out infinite;
            transform: perspective(500px) rotateX(20deg);
        }

        p {
            font-size: 14px;
            margin: 15px 0;
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
            animation: fadeIn 2.5s ease-in, textGlow 3s ease-in-out infinite alternate;
        }

        .btn {
            display: inline-block;
            padding: 12px 35px;
            background: linear-gradient(45deg, #ff4d80, #ff80b3);
            color: #fff;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            transition: all 0.4s ease;
            box-shadow: 0 0 25px rgba(255, 77, 128, 0.7);
            margin-bottom: 15px;
            position: relative;
            overflow: hidden;
            animation: buttonPulse 2s ease-in-out infinite;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: 0.5s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .btn:hover {
            background: linear-gradient(45deg, #00e6ff, #80f0ff);
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 0 35px rgba(0, 230, 255, 0.8);
        }

        .contact-box {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-top: 15px;
        }

        .contact-item img {
            width: 24px;
            height: 24px;
            transition: transform 0.3s ease;
            animation: iconGlow 2s ease-in-out infinite alternate;
        }

        .contact-item img:hover {
            transform: scale(1.2);
        }

        .contact-item a {
            text-decoration: none;
        }

        .stars {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 12px #fff;
            animation: twinkle 3s infinite, starMove 10s linear infinite;
        }

        .error-animation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
        }

        .cpanel-error .error-animation {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255, 77, 128, 0.2) 10%, transparent 70%);
            border-radius: 50%;
            animation: pulse 4s ease-in-out infinite, particleBurst 6s infinite;
        }

        .hosting-error .error-animation {
            width: 350px;
            height: 350px;
            background: radial-gradient(circle, rgba(0, 230, 255, 0.2) 10%, transparent 70%);
            border-radius: 50%;
            animation: ripple 5s linear infinite, waveDistort 3s ease-in-out infinite;
        }

        .server-error .error-animation {
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 10%, transparent 70%);
            border-radius: 50%;
            animation: glitchEffect 2s infinite, electricSpark 4s infinite;
        }

        .error-icon {
            position: absolute;
            width: 80px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: float 6s ease-in-out infinite, rotate3D 10s linear infinite;
            z-index: 3;
        }

        .random-logo {
            position: absolute;
            width: 60px;
            animation: spin 15s linear infinite, glow 2s ease-in-out infinite alternate, orbit 20s linear infinite;
            z-index: 3;
        }

        @keyframes backgroundPulse {
            0% { background: radial-gradient(circle at center, rgba(255, 77, 128, 0.1) 0%, transparent 70%); }
            50% { background: radial-gradient(circle at center, rgba(0, 230, 255, 0.1) 0%, transparent 70%); }
            100% { background: radial-gradient(circle at center, rgba(255, 77, 128, 0.1) 0%, transparent 70%); }
        }

        @keyframes nebulaDrift {
            0% { background-position: 0 0; }
            100% { background-position: 1000px 1000px; }
        }

        @keyframes galaxySpin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes neonPulse {
            from { text-shadow: 0 0 10px #fff, 0 0 20px #ff4d80, 0 0 30px #00e6ff; }
            to { text-shadow: 0 0 20px #fff, 0 0 40px #ff4d80, 0 0 60px #00e6ff; }
        }

        @keyframes glitch {
            2%, 64% { transform: translate(3px, 0) skew(0deg); }
            4%, 60% { transform: translate(-3px, 0) skew(0deg); }
            62% { transform: translate(0, 0) skew(5deg); }
        }

        @keyframes textFloat {
            0%, 100% { transform: perspective(500px) rotateX(20deg) translateY(0); }
            50% { transform: perspective(500px) rotateX(20deg) translateY(-20px); }
        }

        @keyframes textGlow {
            from { text-shadow: 0 0 5px #fff, 0 0 10px #ff4d80; }
            to { text-shadow: 0 0 10px #fff, 0 0 20px #00e6ff; }
        }

        @keyframes buttonPulse {
            0% { transform: scale(1); box-shadow: 0 0 25px rgba(255, 77, 128, 0.7); }
            50% { transform: scale(1.05); box-shadow: 0 0 35px rgba(255, 77, 128, 1); }
            100% { transform: scale(1); box-shadow: 0 0 25px rgba(255, 77, 128, 0.7); }
        }

        @keyframes iconGlow {
            from { filter: drop-shadow(0 0 5px #ff4d80); }
            to { filter: drop-shadow(0 0 10px #00e6ff); }
        }

        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.3; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }

        @keyframes ripple {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        @keyframes glitchEffect {
            0% { transform: translate(-50%, -50%) scale(1); }
            20% { transform: translate(-50%, -50%) scale(1.05) skew(2deg); }
            40% { transform: translate(-50%, -50%) scale(0.95) skew(-2deg); }
            60% { transform: translate(-50%, -50%) scale(1.1); }
            80% { transform: translate(-50%, -50%) scale(0.9); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes particleBurst {
            0% { box-shadow: 0 0 0 0 rgba(255, 77, 128, 0.5); }
            50% { box-shadow: 0 0 50px 20px rgba(255, 77, 128, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 77, 128, 0); }
        }

        @keyframes waveDistort {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1) skew(5deg); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes electricSpark {
            0% { box-shadow: 0 0 10px #fff; }
            20% { box-shadow: 0 0 20px #00e6ff, 0 0 30px #00e6ff; }
            40% { box-shadow: 0 0 10px #fff; }
            60% { box-shadow: 0 0 20px #ff4d80, 0 0 30px #ff4d80; }
            100% { box-shadow: 0 0 10px #fff; }
        }

        @keyframes float {
            0%, 100% { transform: translate(-50%, -50%) translateY(0); }
            50% { transform: translate(-50%, -50%) translateY(-30px); }
        }

        @keyframes rotate3D {
            0% { transform: translate(-50%, -50%) rotateX(0deg) rotateY(0deg); }
            100% { transform: translate(-50%, -50%) rotateX(360deg) rotateY(360deg); }
        }

        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.7); }
            50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes starMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-100vw, 100vh); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes glow {
            from { filter: drop-shadow(0 0 5px #ff4d80); }
            to { filter: drop-shadow(0 0 15px #00e6ff); }
        }

        @keyframes orbit {
            0% { transform: translateX(-50%) rotate(0deg) translateX(150px) rotate(0deg); }
            100% { transform: translateX(-50%) rotate(360deg) translateX(150px) rotate(-360deg); }
        }
    </style>
</head>
<body>
    <div class="background">
        <div class="nebula"></div>
        <div class="galaxy"></div>
    </div>
    <div class="error-animation"></div>
    <div class="container">
        <h1 id="error-title">Cpanel Error</h1>
        <p id="error-message">Oops! Something broke in the control panel.</p>
        <a href="/" class="btn">Back to Home</a>
        <div class="contact-box">
            <div class="contact-item">
                <a href="https://www.facebook.com/dark.king45" target="_blank">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook Logo">
                </a>
            </div>
            <div class="contact-item">
                <a href="https://m.me/dark.king45" target="_blank">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger Logo">
                </a>
            </div>
            <div class="contact-item">
                <a href="https://t.me/Darknet_Team410" target="_blank">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram Logo">
                </a>
            </div>
            <div class="contact-item">
                <a href="https://t.me/+7qsZzsNx75M3MmRl" target="_blank">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram Logo">
                </a>
            </div>
            <div class="contact-item">
                <a href="mailto:cpanel410@gmail.com">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Mail_%28iOS%29.svg" alt="Mail Logo">
                </a>
            </div>
        </div>
    </div>

    <div class="error-icon">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ff4d80" stroke-width="5"/>
            <path d="M30 70 L50 30 L70 70" fill="#00e6ff"/>
            <circle cx="50" cy="50" r="10" fill="#fff"/>
        </svg>
    </div>

    <div class="random-logo" style="top: 15%; left: 50%;">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke="#ff4d80" stroke-width="6"/>
            <circle cx="50" cy="50" r="15" fill="#00e6ff"/>
            <path d="M50 35 L65 50 L50 65 L35 50 Z" fill="none" stroke="#fff" stroke-width="3"/>
        </svg>
    </div>

    <div class="random-logo" style="bottom: 15%; left: 50%;">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 30 Q50 70 70 30" fill="none" stroke="#00e6ff" stroke-width="6"/>
            <rect x="40" y="40" width="20" height="20" fill="#ff4d80" transform="rotate(45 50 50)"/>
            <circle cx="50" cy="50" r="5" fill="#fff"/>
        </svg>
    </div>

    <script>
        function createStars() {
            for (let i = 0; i < 300; i++) {
                let star = document.createElement('div');
                star.className = 'stars';
                star.style.left = Math.random() * 100 + 'vw';
                star.style.top = Math.random() * 100 + 'vh';
                star.style.animationDelay = Math.random() * 3 + 's';
                document.body.appendChild(star);
            }
        }

        const errors = [
            { class: 'cpanel-error', title: 'Cpanel Error', message: 'Oops! Something broke in the control panel.' },
            { class: 'hosting-error', title: 'Hosting Error', message: 'Oops! The hosting service is down.' },
            { class: 'server-error', title: 'Server Error', message: 'Oops! The server has crashed.' }
        ];

        let currentErrorIndex = 0;

        function updateError() {
            const error = errors[currentErrorIndex];
            document.body.className = error.class;
            document.getElementById('error-title').textContent = error.title;
            document.getElementById('error-message').textContent = error.message;

            currentErrorIndex = (currentErrorIndex + 1) % errors.length;
        }

        window.onload = () => {
            createStars();
            updateError();
            setInterval(updateError, 5000);
        };
    </script>
</body>
</html>
