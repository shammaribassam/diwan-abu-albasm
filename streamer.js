
const cats=[...new Set(questions.map(q=>q[0]))];
$('cat').innerHTML='<option value="الكل">كل الفئات — 350 سؤال</option>'+cats.map(c=>`<option>${c} — 50 سؤالًا</option>`).join('');
function notice(s){$('gameStatus').textContent=s}
let ws=null,tick=null;
const answeredThisRound=new Set();
function log(name,msg){state.chat.push([name,msg]);state.chat=state.chat.slice(-100);broadcast()}
function handle(name,msg,platform="twitch"){name=String(name||'').trim();msg=String(msg||'').trim();if(!name)return;log(name,msg);const id=platform+":"+name.toLowerCase();
if(/^!انضم$/u.test(msg)){if(!state.joined[id]){state.joined[id]=name;state.scores[id]=0;broadcast()}return}
if(!state.joined[id]||!state.active||state.correct<0)return;
if(!/^[1-4١٢٣٤]$/.test(msg))return;
let n='١٢٣٤'.includes(msg)?'١٢٣٤'.indexOf(msg)+1:Number(msg);
if(answeredThisRound.has(id))return;
answeredThisRound.add(id);
if(n-1!==state.correct)return;
if(state.winners.length<3){const pts=[10,7,5][state.winners.length];state.winners.push(id);state.scores[id]=(state.scores[id]||0)+pts;broadcast();log('النظام',`${name} حصل على ${pts} نقاط`)}
if(state.winners.length>=3)finish()
}
function finish(){clearInterval(tick);tick=null;if(state.active){state.active=false;state.revealed=true;broadcast()}$('start').disabled=false}
function next(){finish();answeredThisRound.clear();let cat=$('cat').value.split(' — ')[0];let pool=questions.filter(q=>cat==='الكل'||q[0]===cat);
let available=pool.filter(q=>!state.seen.includes(q[1]));if(!available.length){const poolKeys=new Set(pool.map(q=>q[1]));state.seen=state.seen.filter(x=>!poolKeys.has(x));available=pool}
let q=available[Math.floor(Math.random()*available.length)];if(!q)return;
state.seen.push(q[1]);state.round++;state.category=q[0];state.question=q[1];state.answers=q.slice(2,6);state.correct=q[6];state.remaining=30;state.winners=[];state.active=false;state.revealed=false;broadcast();notice('السؤال جاهز — اضغط بدء الجولة')}
function start(){if(!state.round)next();if(state.active)return;answeredThisRound.clear();state.winners=[];state.remaining=30;state.active=true;state.revealed=false;broadcast();$('start').disabled=true;notice('الجولة جارية');tick=setInterval(()=>{if(!state.active){clearInterval(tick);return}state.remaining--;if(state.remaining<=0){state.remaining=0;finish()}else broadcast()},1000)}
$('next').onclick=next;$('start').onclick=start;$('stop').onclick=finish;
$('reset').onclick=()=>{if(confirm('تصفير جميع النقاط والمشاركين؟')){state.joined={};state.scores={};state.winners=[];broadcast()}};
$('send').onclick=()=>{handle($('tester').value,$('testmsg').value,'test');$('testmsg').value=''};
$('testmsg').onkeydown=e=>{if(e.key==='Enter')$('send').click()};
function disconnect(){if(ws){ws.onclose=null;ws.close();ws=null}$('connection').textContent='غير متصل'}
$('disconnect').onclick=disconnect;
$('connect').onclick=()=>{disconnect();const channel=$('channel').value.trim().replace(/^@/,'').toLowerCase();if(!/^[a-z0-9_]{3,25}$/.test(channel))return notice('اسم القناة غير صالح');
$('connection').textContent='جارٍ الاتصال...';
try{let s=new WebSocket('wss://irc-ws.chat.twitch.tv:443');ws=s;
s.onopen=()=>{s.send('CAP REQ :twitch.tv/tags twitch.tv/commands');s.send('PASS SCHMOOPIIE');s.send('NICK justinfan'+Math.floor(Math.random()*80000+10000));s.send('JOIN #'+channel);$('connection').textContent='متصل بشات '+channel};
s.onmessage=e=>{for(let line of String(e.data).split('\r\n')){if(line.startsWith('PING')){s.send(line.replace('PING','PONG'));continue}const m=line.match(/(?:^| ):(\w+)!\S+ PRIVMSG #\w+ :([\s\S]*)$/);if(m)handle(m[1],m[2],'twitch')}};
s.onerror=()=>{$('connection').textContent='فشل اتصال Twitch'};s.onclose=()=>{if(ws===s){ws=null;$('connection').textContent='انقطع الاتصال'}}}catch(e){$('connection').textContent=e.message}};
render();

function receive(name,msg,platform){handle(name,msg,platform||'tiktok')}
