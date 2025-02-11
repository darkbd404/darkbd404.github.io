<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Integration</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        h1 {
            text-align: center;
            color: #333;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        input[type="number"] {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        button {
            padding: 10px;
            background-color: #5cb85c;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        button:hover {
            background-color: #4cae4c;
        }

        #results {
            margin-top: 20px;
            padding: 10px;
            background: #e9e9e9;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>API Integration</h1>
        <form id="apiForm">
            <label for="numberInput">Number:</label>
            <input type="number" id="numberInput" name="numberInput" required>

            <label for="limitInput">API Request Limit:</label>
            <input type="number" id="limitInput" name="limitInput" required>
            
            <button type="button" onclick="makeApiRequests()">Submit</button>
        </form>
        <div id="results"></div>
    </div>

    <script>
        function makeApiRequests() {
            const numberInput = document.getElementById('numberInput').value;
            const limitInput = document.getElementById('limitInput').value;

            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';

            for (let i = 0; i < limitInput; i++) {
                fetch(`https://mohammadahad.com/ahad/main.php?num=${numberInput}`)
                    .then(response => response.text())
                    .then(data => {
                        const p = document.createElement('p');
                        p.textContent = `API Response ${i + 1}: ${data}`;
                        resultsDiv.appendChild(p);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        }
    </script>
</body>
</html>
