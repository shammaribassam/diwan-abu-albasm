
const $=id=>document.getElementById(id);
// Every browser tab begins with a clean state; only the active room synchronizes viewers.
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={round:0,category:'',question:'',answers:[],correct:-1,active:false,revealed:false,remaining:30,joined:{},scores:{},winners:[],chat:[],seen:[],exclusions:{},exileEvent:null};
function broadcast(){render()}
function showRanks(){let arr=Object.entries(state.scores).sort((a,b)=>b[1]-a[1]);return arr.slice(0,12).map(([id,score],i)=>`<div class="rank"><span>${i+1}. ${escapeHtml(state.joined[id]||id)}</span><strong>${score} نقطة</strong></div>`).join('')||'لا يوجد متصدرون'}
function showQuestion(){ $('round').textContent='السؤال '+state.round;$('categoryLabel').textContent=state.category||'ديوان الشعر';$('question').textContent=state.question||'أهلاً بكم في ديوان أبي البسم';$('answers').innerHTML=state.answers.map((a,i)=>`<div class="answer ${state.revealed&&state.correct===i&&state.round?'correct':''}">${i+1} — ${escapeHtml(a)}</div>`).join('');$('timer').textContent=state.remaining;$('leaders').innerHTML=showRanks();$('winners').innerHTML=state.winners.map((id,i)=>`<div class="rank"><span>🏆 ${escapeHtml(state.joined[id]||id)}</span><strong>+${[10,7,5][i]}</strong></div>`).join('')||'بانتظار الإجابات الصحيحة'}
function renderExile(){
 const banner=$('exileBanner');
 if(banner){const e=state.exileEvent;banner.textContent=e&&Date.now()-e.at<9000?'📜 نُفي من الديوان: '+e.name+' — '+e.duration+' جولة':'';banner.hidden=!banner.textContent;}
 const list=$('exileList');
 if(list){list.innerHTML=Object.entries(state.exclusions||{}).filter(([id,e])=>state.round<e.untilRound).map(([id,e])=>'<div class="rank"><span>'+escapeHtml(state.joined[id]||id)+'</span><strong>مستبعد حتى الجولة '+e.untilRound+'</strong></div>').join('')||'لا يوجد مستبعدون';}
}
function render(){showQuestion();renderExile();if($('count'))$('count').textContent=Object.keys(state.joined).length;if($('chat')){$('chat').innerHTML=state.chat.slice(-100).map(m=>`<div class="message"><b>${escapeHtml(m[0])}</b> ${escapeHtml(m[1])}</div>`).join('');$('chat').scrollTop=$('chat').scrollHeight}}
