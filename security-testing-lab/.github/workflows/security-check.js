const https = require("https");
const http = require("http");

const target = process.argv[2];
if (!target) process.exit(1);

let url;
try { url = new URL(target); } catch { console.error("Invalid URL"); process.exit(1); }
if (!["http:","https:"].includes(url.protocol)) {
  console.error("Only HTTP/HTTPS targets are supported.");
  process.exit(1);
}

function request(url, redirects=0) {
  return new Promise((resolve,reject)=>{
    if(redirects>3) return reject(new Error("Too many redirects"));
    const lib=url.protocol==="https:"?https:http;
    const req=lib.get(url,{timeout:10000,headers:{"User-Agent":"Authorized-Security-Lab/1.0"}},res=>{
      if(res.statusCode>=300 && res.statusCode<400 && res.headers.location){
        const next=new URL(res.headers.location,url);
        res.resume();
        return request(next,redirects+1).then(resolve,reject);
      }
      res.resume();
      resolve({status:res.statusCode,headers:res.headers,url});
    });
    req.on("timeout",()=>req.destroy(new Error("Timeout")));
    req.on("error",reject);
  });
}

(async()=>{
  console.log(`\n=== Authorized Security Check ===`);
  console.log(`Target: ${url.href}\n`);
  let r;
  try { r=await request(url); } catch(e){ console.error("Request failed:",e.message); process.exit(1); }

  const required = [
    ["strict-transport-security","HSTS"],
    ["content-security-policy","Content-Security-Policy"],
    ["x-content-type-options","X-Content-Type-Options"],
    ["referrer-policy","Referrer-Policy"],
    ["permissions-policy","Permissions-Policy"]
  ];

  let score=0;
  for(const [key,name] of required){
    if(r.headers[key]){ console.log(`PASS  ${name}`); score++; }
    else console.log(`WARN  ${name} missing`);
  }

  if(r.headers.server) console.log(`WARN  Server disclosure: ${r.headers.server}`);
  else { console.log("PASS  Server header not exposed"); score++; }

  if(r.headers["access-control-allow-origin"]==="*")
    console.log("WARN  CORS wildcard (*) detected");
  else
    console.log("INFO  CORS is not wildcard (*)");

  if(r.headers["set-cookie"]){
    console.log("INFO  Cookies detected. Verify Secure, HttpOnly and SameSite attributes on the server.");
  } else {
    console.log("INFO  No Set-Cookie header detected.");
  }

  console.log(`\nHTTP: ${r.status}`);
  console.log(`Baseline score: ${score}/6`);
  console.log("\nThis is a lightweight defensive check, not a full penetration test.");
})().catch(e=>{console.error(e);process.exit(1)});
