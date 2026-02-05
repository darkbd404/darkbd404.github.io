async function runLookup() {
  const number = document.getElementById("number").value.trim();
  const status = document.getElementById("status");
  const output = document.getElementById("output");

  if (!number) {
    status.innerText = "Number required";
    return;
  }

  status.innerText = "Fetching data...";
  output.textContent = "";

  const url =
    "https://turecaller.pikaapis0.workers.dev/?number=" +
    encodeURIComponent(number);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    // IMPORTANT: fetch fail না, data আসে
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    status.innerText = "Response received";
    output.textContent = JSON.stringify(data, null, 2);

  } catch (err) {
    status.innerText = "Network error";
    output.textContent = err.toString();
  }
      }
