const $=s=>document.querySelector(s);
const target=$('#target'), scanBtn=$('#scanBtn'), results=$('#results'), summary=$('#summary');

$('#themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.theme=document.body.classList.contains('dark')?'dark':'light'};
if(localStorage.theme==='dark') document.body.classList.add('dark');

function add(title,status,detail,cls='neutral'){
  const el=document.createElement('article'); el.className='result';
  el.innerHTML=`<div class="resultHead"><div><h3>${title}</h3><p>${detail}</p></div><span class="badge ${cls}">${status}</span></div>`;
  results.appendChild(el);
}
function normalize(v){let u=v.trim(); if(!/^https?:\/\//i.test(u))u='https://'+u; return new URL(u)}
async function scan(){
  results.innerHTML=''; summary.classList.remove('hidden');
  let u; try{u=normalize(target.value)}catch{add('Target URL','ERROR','Enter a valid URL.','bad');return}
  let ok=0,warn=0,bad=0;
  const pass=()=>{ok++}, warning=()=>{warn++}, fail=()=>{bad++};

  if(u.protocol==='https:'){add('HTTPS','PASS','Target uses HTTPS.','good');pass()}
  else{add('HTTPS','RISK','HTTP is not encrypted. Use HTTPS for production.','bad');fail()}

  try{
    const r=await fetch(u.href,{method:'GET',redirect:'follow',cache:'no-store'});
    const h=r.headers;
    const headers=[
      ['Content-Security-Policy','CSP helps reduce XSS and injection impact.'],
      ['X-Content-Type-Options','Prevents MIME-type sniffing.'],
      ['Referrer-Policy','Controls referrer information sent to other sites.'],
      ['Permissions-Policy','Limits access to browser capabilities.'],
      ['Strict-Transport-Security','HSTS tells browsers to prefer HTTPS.']
    ];
    for(const [name,why] of headers){
      if(h.get(name)){add(name,'PASS',why,'good');pass()}
      else{add(name,'WARN',`Header is missing. ${why}`,'warn');warning()}
    }
    const server=h.get('server');
    if(server){add('Server header disclosure','WARN',`Server identifies itself as "${server}". Consider minimizing version disclosure.`,'warn');warning()}
    else{add('Server header disclosure','PASS','No Server header was exposed to this browser request.','good');pass()}

    const acao=h.get('access-control-allow-origin');
    if(acao==='*'){add('CORS','WARN','Access-Control-Allow-Origin is wildcard (*). Review whether public cross-origin access is really required.','warn');warning()}
    else if(acao){add('CORS','INFO',`CORS policy is present: ${acao}`,'neutral')}
    else{add('CORS','INFO','No CORS response header was visible.','neutral')}

    const cookies=h.get('set-cookie');
    if(cookies){add('Cookies','INFO','Set-Cookie was returned, but browser JavaScript normally cannot inspect full Set-Cookie values. Verify Secure, HttpOnly and SameSite on the server.','neutral')}
    else{add('Cookies','INFO','No Set-Cookie header was visible in this browser response.','neutral')}

    add('HTTP status','INFO',`${r.status} ${r.statusText||''}`,'neutral');
  }catch(e){
    add('Browser access','WARN','The browser could not read the target response. This is commonly caused by CORS or network restrictions. Use the included GitHub Actions scanner for server-side checks.','warn');warning()
  }

  const total=ok+warn+bad, score=total?Math.max(0,Math.round((ok/total)*100-(bad*8))):0;
  $('#score').textContent=score;
  $('#scoreText').textContent=score>=80?'Good baseline':score>=55?'Needs review':'High priority review';
  $('#stats').innerHTML=`<div class="stat"><b>${ok}</b><span>Pass</span></div><div class="stat"><b>${warn}</b><span>Warnings</span></div><div class="stat"><b>${bad}</b><span>Risks</span></div>`;
}
scanBtn.onclick=scan;
target.addEventListener('keydown',e=>{if(e.key==='Enter')scan()});
