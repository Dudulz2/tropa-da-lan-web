// Tropa da Lan V7 — melhorias de UX, diagnóstico, PTT, PWA e atalhos.
const rt = window.TROPA_RUNTIME || await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("TROPA_RUNTIME não iniciou em 8 segundos.")), 8000);
  window.addEventListener("tropa-runtime-ready", (event) => { clearTimeout(timer); resolve(event.detail); }, { once: true });
});

const { state, ui, toast, openDialog, closeDialog, makeEl } = rt;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// -----------------------------------------------------------------------------
// Ícones SVG consistentes
// -----------------------------------------------------------------------------
const ICONS = {
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>',
  headphones: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5a1 1 0 0 1-1-1v-5ZM20 14h-3v6h2a1 1 0 0 0 1-1v-5Z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3Z"/></svg>',
  screen: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5"/><path d="M19 11a7 7 0 1 0 .4 5"/></svg>',
  diag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18V9M9 18V5M14 18v-7M19 18V3"/></svg>',
  phoneoff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15c5-3 11-3 16 0"/><path d="m6 14-2 4M18 14l2 4"/></svg>'
};
function setButtonIcon(button, name) {
  if (!button || !ICONS[name]) return;
  button.innerHTML = ICONS[name];
  button.classList.add("svg-icon-button");
}
setButtonIcon(ui.muteBtn, "mic");
setButtonIcon(ui.deafenBtn, "headphones");
setButtonIcon(ui.cameraBtn, "camera");
setButtonIcon(ui.shareBtn, "screen");
setButtonIcon(ui.voiceReconnectBtn, "refresh");
setButtonIcon(ui.voiceDiagnosticsBtn, "diag");
setButtonIcon(ui.leaveVoiceBtn, "phoneoff");

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function activeCallTrack() { return rt.micTrack?.() || null; }
function selectedOptionLabel(select) { return select?.selectedOptions?.[0]?.textContent?.trim() || "Padrão"; }
function keyMatches(event, configured) {
  const wanted = String(configured || "Space").toLowerCase();
  return event.code?.toLowerCase() === wanted || event.key?.toLowerCase() === wanted || (wanted === "space" && event.code === "Space");
}
function typingTarget(target) { return target?.matches?.('input, textarea, select, [contenteditable="true"]'); }
function setMicEnabled(enabled) {
  const track = activeCallTrack();
  if (!track) return;
  track.enabled = Boolean(enabled);
  rt.updateVoiceDock?.("joined");
  rt.retrackVoicePresence?.().catch(() => {});
}

// -----------------------------------------------------------------------------
// Push-to-talk e sensibilidade visual
// -----------------------------------------------------------------------------
let pttPressed = false;
let pttTrackId = null;
let localAudioCtx = null;
let localAnalyser = null;
let localMeterRaf = 0;

function enforcePttIdle() {
  const track = activeCallTrack();
  if (!track || !state.voiceJoinedChannelId) return;
  if (state.preferences.push_to_talk && !pttPressed && track.enabled) setMicEnabled(false);
  if (track.id !== pttTrackId) { pttTrackId = track.id; restartLocalMeter(); }
}
setInterval(enforcePttIdle, 450);

window.addEventListener("keydown", (event) => {
  if (!state.preferences.push_to_talk || !state.voiceJoinedChannelId || typingTarget(event.target)) return;
  if (!keyMatches(event, state.preferences.push_to_talk_key)) return;
  event.preventDefault();
  if (event.repeat) return;
  pttPressed = true;
  setMicEnabled(true);
  document.body.classList.add("ptt-active");
}, true);
window.addEventListener("keyup", (event) => {
  if (!state.preferences.push_to_talk || !state.voiceJoinedChannelId || !keyMatches(event, state.preferences.push_to_talk_key)) return;
  event.preventDefault(); pttPressed = false; setMicEnabled(false); document.body.classList.remove("ptt-active");
}, true);
window.addEventListener("blur", () => { if (state.preferences.push_to_talk) { pttPressed = false; setMicEnabled(false); document.body.classList.remove("ptt-active"); } });

ui.pushToTalkKeyInput?.addEventListener("keydown", (event) => {
  event.preventDefault(); ui.pushToTalkKeyInput.value = event.code || event.key || "Space";
});
ui.voiceSensitivityInput?.addEventListener("input", () => { if (ui.voiceSensitivityValue) ui.voiceSensitivityValue.textContent = ui.voiceSensitivityInput.value; });

function stopLocalMeter() {
  cancelAnimationFrame(localMeterRaf); localMeterRaf = 0;
  try { localAudioCtx?.close(); } catch (_) {}
  localAudioCtx = null; localAnalyser = null;
}
function restartLocalMeter() {
  stopLocalMeter();
  const track = activeCallTrack(); if (!track) return;
  try {
    localAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = localAudioCtx.createMediaStreamSource(new MediaStream([track]));
    localAnalyser = localAudioCtx.createAnalyser(); localAnalyser.fftSize = 256; localAnalyser.smoothingTimeConstant = .75; source.connect(localAnalyser);
    const data = new Uint8Array(localAnalyser.frequencyBinCount);
    const tick = () => {
      if (!localAnalyser || track.readyState === "ended") return;
      localAnalyser.getByteTimeDomainData(data); let sum = 0;
      for (const v of data) { const n = (v - 128) / 128; sum += n*n; }
      const rms = Math.sqrt(sum/data.length); const pct = Math.min(100, rms*320);
      const sensitivity = Number(state.preferences.voice_sensitivity ?? 45);
      const threshold = Math.max(3, (100-sensitivity)*.32);
      document.getElementById("media-local")?.classList.toggle("speaking", track.enabled && pct > threshold);
      document.documentElement.style.setProperty("--local-voice-level", `${pct}%`);
      localMeterRaf = requestAnimationFrame(tick);
    };
    localMeterRaf = requestAnimationFrame(tick);
  } catch (_) {}
}

// -----------------------------------------------------------------------------
// Reconexão rápida do áudio
// -----------------------------------------------------------------------------
async function reconnectAudio() {
  if (!state.voiceJoinedChannelId) return toast("Entre em uma chamada primeiro.");
  const button = ui.voiceReconnectBtn; if (button) button.disabled = true;
  try {
    await rt.switchMicrophone(state.preferences.audio_input_id || "", { persist: true, announce: false });
    await rt.applyAudioOutputToAll?.();
    restartLocalMeter(); toast("Áudio reconectado.");
  } catch (error) { console.error(error); toast("Não foi possível reconectar o áudio. Confira a permissão do microfone.", 5200); }
  finally { if (button) button.disabled = false; }
}
ui.voiceReconnectBtn?.addEventListener("click", reconnectAudio);

// -----------------------------------------------------------------------------
// Diagnóstico WebRTC / dispositivos
// -----------------------------------------------------------------------------
const diag = {
  dialog: $("#diagnosticsDialog"), quality: $("#diagQualityBadge"), headline: $("#diagHeadline"), subline: $("#diagSubline"),
  mic: $("#diagMic"), micDetail: $("#diagMicDetail"), output: $("#diagOutput"), outputDetail: $("#diagOutputDetail"),
  webrtc: $("#diagWebrtc"), webrtcDetail: $("#diagWebrtcDetail"), ping: $("#diagPing"), jitter: $("#diagJitter"), loss: $("#diagLoss"), ice: $("#diagIce"), iceDetail: $("#diagIceDetail"), level: $("#diagLevel"), levelBar: $("#diagLevelBar")
};
let diagTimer = 0, diagTempStream = null, diagCtx = null, diagAnalyser = null, diagMonitorAudio = null;

async function collectRtcStats() {
  let rtt = null, jitter = null, lost = 0, received = 0, ice = "—", iceDetail = "Sem conexão", connected = 0;
  for (const peer of state.peers.values()) {
    const pc = peer.pc; if (!pc) continue;
    if (["connected","completed"].includes(pc.iceConnectionState) || pc.connectionState === "connected") connected++;
    let report; try { report = await pc.getStats(); } catch (_) { continue; }
    let pair = null;
    report.forEach((s) => {
      if (s.type === "candidate-pair" && s.state === "succeeded" && (s.nominated || !pair)) pair = s;
      if (s.type === "inbound-rtp" && (s.kind === "audio" || s.mediaType === "audio")) {
        if (Number.isFinite(s.jitter)) jitter = Math.max(jitter || 0, s.jitter);
        lost += Number(s.packetsLost || 0); received += Number(s.packetsReceived || 0);
      }
    });
    if (pair) {
      if (Number.isFinite(pair.currentRoundTripTime)) rtt = Math.max(rtt || 0, pair.currentRoundTripTime);
      const local = report.get(pair.localCandidateId), remote = report.get(pair.remoteCandidateId);
      const types = [local?.candidateType, remote?.candidateType].filter(Boolean);
      if (types.includes("relay")) { ice = "TURN"; iceDetail = "Relay ativo"; }
      else if (types.includes("srflx") || types.includes("prflx")) { ice = "STUN / P2P"; iceDetail = types.join(" ↔ "); }
      else if (types.length) { ice = "P2P"; iceDetail = types.join(" ↔ "); }
    }
  }
  const total = lost + received; const lossPct = total ? (lost/total)*100 : 0;
  return { rtt, jitter, lossPct, connected, peerCount: state.peers.size, ice, iceDetail };
}

function classifyQuality(stats) {
  if (!state.voiceJoinedChannelId) return ["Sem chamada","neutral","Entre em um canal de voz para medir a rede."];
  if (!stats.peerCount) return ["Aguardando","neutral","Aguardando outro participante para medir a conexão."];
  if (!stats.connected) return ["Conectando","warn","A conexão WebRTC ainda está sendo negociada."];
  const ms = (stats.rtt || 0)*1000, jit = (stats.jitter || 0)*1000, loss = stats.lossPct || 0;
  if ((!ms || ms < 120) && jit < 25 && loss < 2) return ["Excelente","good","Áudio em boas condições."];
  if (ms < 220 && jit < 45 && loss < 5) return ["Boa","good","Conexão adequada para voz e vídeo."];
  if (ms < 400 && jit < 80 && loss < 10) return ["Instável","warn","Pode haver cortes ou atraso no áudio."];
  return ["Ruim","bad","Priorize áudio, reduza vídeo ou verifique sua rede."];
}

async function ensureDiagAnalyser() {
  const existing = activeCallTrack();
  if (existing && diagAnalyser) return;
  if (diagCtx) { try { await diagCtx.close(); } catch (_) {} diagCtx = null; diagAnalyser = null; }
  if (diagTempStream) { diagTempStream.getTracks().forEach((t)=>t.stop()); diagTempStream = null; }
  let track = existing;
  if (!track) {
    try { diagTempStream = await rt.acquireMicrophone(state.preferences.audio_input_id || ""); track = diagTempStream.getAudioTracks()[0]; } catch (_) { return; }
  }
  try {
    diagCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = diagCtx.createMediaStreamSource(new MediaStream([track])); diagAnalyser = diagCtx.createAnalyser(); diagAnalyser.fftSize = 256; src.connect(diagAnalyser);
  } catch (_) {}
}

async function updateDiagnostics() {
  if (!diag.dialog?.open) return;
  const track = activeCallTrack();
  diag.mic.textContent = track?.label || selectedOptionLabel(ui.voiceMicSelect) || "Padrão";
  diag.micDetail.textContent = track ? `${track.readyState === "live" ? "Ativo" : track.readyState} • ${track.enabled ? "transmitindo" : "mudo"}` : "Fora da chamada";
  diag.output.textContent = selectedOptionLabel(ui.voiceOutputSelect || ui.audioOutputPreference);
  diag.outputDetail.textContent = typeof HTMLMediaElement?.prototype?.setSinkId === "function" ? "Seleção suportada" : "Saída padrão do sistema";
  const stats = await collectRtcStats();
  diag.webrtc.textContent = state.voiceJoinedChannelId ? `${stats.connected}/${stats.peerCount} conectado(s)` : "Inativo";
  diag.webrtcDetail.textContent = state.voiceJoinedChannelName || "Nenhum canal de voz";
  diag.ping.textContent = stats.rtt != null ? `${Math.round(stats.rtt*1000)} ms` : "—";
  diag.jitter.textContent = stats.jitter != null ? `${Math.round(stats.jitter*1000)} ms` : "—";
  diag.loss.textContent = `${stats.lossPct.toFixed(1)}%`;
  diag.ice.textContent = stats.ice; diag.iceDetail.textContent = stats.iceDetail;
  const [label, cls, headline] = classifyQuality(stats);
  diag.quality.textContent = label; diag.quality.className = `diag-quality ${cls}`; diag.headline.textContent = headline;
  if (diagAnalyser) {
    const data = new Uint8Array(diagAnalyser.frequencyBinCount); diagAnalyser.getByteTimeDomainData(data); let sum=0;
    for (const v of data) { const n=(v-128)/128; sum+=n*n; } const pct=Math.min(100,Math.sqrt(sum/data.length)*320);
    diag.level.textContent = `${Math.round(pct)}%`; diag.levelBar.style.width = `${pct}%`;
  } else { diag.level.textContent = "—"; diag.levelBar.style.width = "0%"; }
}

async function openDiagnostics() {
  openDialog(diag.dialog); await rt.refreshMediaDevices?.({ preserveUi: true }); await ensureDiagAnalyser(); await updateDiagnostics();
  clearInterval(diagTimer); diagTimer = setInterval(updateDiagnostics, 1000);
}
async function closeDiagnosticResources() {
  clearInterval(diagTimer); diagTimer=0;
  if (diagMonitorAudio) { diagMonitorAudio.pause(); diagMonitorAudio.srcObject=null; diagMonitorAudio.remove(); diagMonitorAudio=null; }
  if (diagTempStream) { diagTempStream.getTracks().forEach((t)=>t.stop()); diagTempStream=null; }
  if (diagCtx) { try { await diagCtx.close(); } catch (_) {} diagCtx=null; diagAnalyser=null; }
}
ui.voiceDiagnosticsBtn?.addEventListener("click", openDiagnostics);
ui.openDiagnosticsFromPrefsBtn?.addEventListener("click", () => { closeDialog(ui.preferencesDialog); openDiagnostics(); });
diag.dialog?.addEventListener("close", closeDiagnosticResources);
$("#diagReconnectBtn")?.addEventListener("click", reconnectAudio);
$("#diagTestMicBtn")?.addEventListener("click", async () => { await ensureDiagAnalyser(); toast(diagAnalyser ? "Fale normalmente e acompanhe o medidor de entrada." : "Não consegui acessar o microfone."); });
$("#diagMonitorMicBtn")?.addEventListener("click", async (event) => {
  if (diagMonitorAudio) { diagMonitorAudio.pause(); diagMonitorAudio.remove(); diagMonitorAudio=null; event.currentTarget.textContent="Ouvir microfone"; return; }
  let track = activeCallTrack(); if (!track) { try { if (!diagTempStream) diagTempStream = await rt.acquireMicrophone(state.preferences.audio_input_id || ""); track=diagTempStream.getAudioTracks()[0]; } catch (_) {} }
  if (!track) return toast("Não foi possível abrir o microfone.");
  diagMonitorAudio=document.createElement("audio"); diagMonitorAudio.autoplay=true; diagMonitorAudio.srcObject=new MediaStream([track]); document.body.appendChild(diagMonitorAudio);
  try { if (typeof diagMonitorAudio.setSinkId === "function") await diagMonitorAudio.setSinkId(state.preferences.audio_output_id || ""); await diagMonitorAudio.play(); event.currentTarget.textContent="Parar retorno"; } catch (_) { toast("O navegador bloqueou o retorno. Clique novamente após interagir com a página."); }
});
$("#copyDiagnosticsBtn")?.addEventListener("click", async () => {
  const stats=await collectRtcStats(); const report=[`Tropa da Lan ${rt.APP_VERSION}`,`Navegador: ${navigator.userAgent}`,`Canal: ${state.voiceJoinedChannelName || "nenhum"}`,`Microfone: ${activeCallTrack()?.label || selectedOptionLabel(ui.voiceMicSelect)}`,`Saída: ${selectedOptionLabel(ui.voiceOutputSelect)}`,`Peers: ${stats.connected}/${stats.peerCount}`,`Ping: ${stats.rtt!=null?Math.round(stats.rtt*1000)+" ms":"—"}`,`Jitter: ${stats.jitter!=null?Math.round(stats.jitter*1000)+" ms":"—"}`,`Perda: ${stats.lossPct.toFixed(1)}%`,`ICE: ${stats.ice} ${stats.iceDetail}`].join("\n");
  try { await navigator.clipboard.writeText(report); toast("Relatório copiado."); } catch (_) { toast("Não foi possível copiar o relatório."); }
});

// -----------------------------------------------------------------------------
// PWA: instalar, atualizar e versão
// -----------------------------------------------------------------------------
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredInstallPrompt=event; ui.installAppBtn?.classList.remove("hidden"); });
ui.installAppBtn?.addEventListener("click", async () => { if (!deferredInstallPrompt) return toast("A instalação não está disponível neste navegador ou o app já está instalado."); deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice; deferredInstallPrompt=null; ui.installAppBtn.classList.add("hidden"); });
ui.checkUpdateBtn?.addEventListener("click", async () => {
  if (!("serviceWorker" in navigator)) return toast("Service Worker não disponível neste navegador.");
  const reg=await navigator.serviceWorker.getRegistration(); if (!reg) return toast("O aplicativo ainda não possui cache instalado.");
  await reg.update();
  if (reg.waiting) { reg.waiting.postMessage({ type:"SKIP_WAITING" }); toast("Atualização encontrada. Recarregando…"); setTimeout(()=>location.reload(),900); }
  else toast(`Você está usando a versão ${rt.APP_VERSION}.`);
});

// -----------------------------------------------------------------------------
// Paleta de comandos Ctrl+K
// -----------------------------------------------------------------------------
const palette = { dialog: $("#commandPaletteDialog"), input: $("#commandPaletteInput"), results: $("#commandPaletteResults") };
function acceptedFriendProfiles() {
  if (!state.user) return [];
  return (state.friendships || []).filter((f)=>f.status==="accepted").map((f)=>{ const id=f.requester_id===state.user.id?f.addressee_id:f.requester_id; return { id, profile: state.socialProfiles.get(id) }; }).filter((x)=>x.profile);
}
function paletteItems() {
  const items=[];
  for (const s of state.servers || []) items.push({ type:"Servidor", label:s.name, hint:"Abrir servidor", icon:"◫", action:()=>rt.selectServer(s.id) });
  for (const c of state.channels || []) items.push({ type:c.type==="voice"?"Voz":"Canal", label:`${c.type==="voice"?"🔊":"#"} ${c.name}`, hint:c.category||"Geral", icon:c.is_private?"🔒":(c.type==="voice"?"◉":"#"), action:()=>c.type==="voice"?rt.joinVoice(c.id):rt.selectTextChannel(c.id) });
  for (const f of acceptedFriendProfiles()) items.push({ type:"Amigo", label:f.profile.display_name||f.profile.username, hint:`@${f.profile.username}`, icon:"◎", action:()=>rt.openDm?.(f.id) });
  items.push(
    {type:"Comando",label:"Diagnóstico da chamada",hint:"Testar rede e dispositivos",icon:"◉",action:openDiagnostics},
    {type:"Comando",label:"Preferências",hint:"Tema, áudio e transmissão",icon:"⚙",action:()=>ui.appearanceBtn?.click()},
    {type:"Comando",label:"Amigos e mensagens",hint:"Central social",icon:"♧",action:()=>ui.friendsBtn?.click()},
    {type:"Comando",label:"Criar canal",hint:"Servidor atual",icon:"+",action:()=>ui.quickCreateChannelBtn?.click()},
    {type:"Comando",label:"Criar convite",hint:"Servidor atual",icon:"↗",action:()=>ui.quickInviteBtn?.click()}
  );
  return items;
}
function renderPalette() {
  const q=(palette.input?.value||"").trim().toLowerCase(); palette.results.replaceChildren();
  const items=paletteItems().filter((i)=>!q || `${i.type} ${i.label} ${i.hint}`.toLowerCase().includes(q)).slice(0,28);
  if (!items.length) return palette.results.appendChild(makeEl("div","command-empty","Nada encontrado."));
  for (const item of items) { const b=makeEl("button","command-item"); b.type="button"; b.append(makeEl("span","command-icon",item.icon),makeEl("span","command-meta")); const meta=b.lastChild; meta.append(makeEl("strong","",item.label),makeEl("small","",`${item.type} • ${item.hint}`)); b.addEventListener("click",async()=>{closeDialog(palette.dialog); await item.action();}); palette.results.appendChild(b); }
}
function openPalette() { renderPalette(); openDialog(palette.dialog); setTimeout(()=>{palette.input?.focus(); palette.input?.select();},20); }
window.addEventListener("keydown", (event) => { if ((event.ctrlKey||event.metaKey) && event.key.toLowerCase()==="k") { event.preventDefault(); event.stopImmediatePropagation(); openPalette(); } }, true);
palette.input?.addEventListener("input",renderPalette);
palette.dialog?.addEventListener("close",()=>{ if(palette.input) palette.input.value=""; });

// -----------------------------------------------------------------------------
// Slash commands
// -----------------------------------------------------------------------------
ui.messageForm?.addEventListener("submit", async (event) => {
  const raw=ui.messageInput?.value?.trim()||""; if(!raw.startsWith("/")) return;
  const [cmd,...parts]=raw.split(/\s+/); const name=cmd.toLowerCase(); const rest=parts.join(" ").trim();
  if (name==="/shrug") { ui.messageInput.value=`${rest}${rest?" ":""}¯\\_(ツ)_/¯`; return; }
  if (name==="/me") { ui.messageInput.value=rest?`*${rest}*`:""; return; }
  event.preventDefault(); event.stopImmediatePropagation();
  if(name==="/help") return toast("Comandos: /poll /invite /nick /status /diag /clear /shrug /me",6500);
  if(name==="/poll") return openDialog(ui.pollDialog);
  if(name==="/invite") return ui.quickInviteBtn?.click();
  if(name==="/diag") return openDiagnostics();
  if(name==="/clear") { ui.messages?.querySelectorAll(".message").forEach((n)=>n.remove()); ui.messageInput.value=""; return toast("Mensagens ocultadas apenas nesta tela. Reabra o canal para recarregar."); }
  if(name==="/nick") {
    if(!state.activeServer) return toast("Abra um servidor primeiro.");
    const nickname=rest.slice(0,32)||null; const {error}=await state.supabase.from("server_members").update({nickname}).eq("server_id",state.activeServer.id).eq("user_id",state.user.id);
    if(error) return toast(error.message||"Não foi possível alterar o apelido."); ui.messageInput.value=""; await rt.loadServerBundle(); return toast("Apelido atualizado.");
  }
  if(name==="/status") {
    const value=rest.slice(0,64); const {error}=await state.supabase.from("profiles").update({custom_status:value}).eq("user_id",state.user.id); if(error)return toast("Não foi possível alterar o status."); state.profile.custom_status=value; ui.messageInput.value=""; return toast("Status atualizado.");
  }
  toast(`Comando desconhecido: ${cmd}`);
}, true);

// -----------------------------------------------------------------------------
// Drag & drop / Ctrl+V para anexos
// -----------------------------------------------------------------------------
function queueAttachment(file) {
  if(!file) return; if(file.size>25*1024*1024)return toast("O arquivo precisa ter até 25 MB.");
  try { const dt=new DataTransfer(); dt.items.add(file); ui.messageFileInput.files=dt.files; ui.messageFileInput.dispatchEvent(new Event("change",{bubbles:true})); }
  catch(_) { state.pendingAttachment=file; toast(`Arquivo selecionado: ${file.name}`); }
}
const dropZone=ui.composerWrap || ui.messages;
for(const target of [ui.messages, ui.composerWrap].filter(Boolean)) {
  target.addEventListener("dragover",(e)=>{e.preventDefault();document.body.classList.add("dragging-file");});
  target.addEventListener("dragleave",()=>document.body.classList.remove("dragging-file"));
  target.addEventListener("drop",(e)=>{e.preventDefault();document.body.classList.remove("dragging-file");queueAttachment(e.dataTransfer?.files?.[0]);});
}
ui.messageInput?.addEventListener("paste",(e)=>{const file=[...(e.clipboardData?.files||[])][0];if(file){e.preventDefault();queueAttachment(file);}});

// -----------------------------------------------------------------------------
// Mensagens: link, marcar não lida e carregar antigas
// -----------------------------------------------------------------------------
let unreadCount=0;
function updateUnreadTitle(){document.title=unreadCount?`(${unreadCount}) Tropa da Lan`:`Tropa da Lan`;}
document.addEventListener("visibilitychange",()=>{if(!document.hidden){unreadCount=0;updateUnreadTitle();}});
const messageObserver=new MutationObserver((mutations)=>{
  for(const m of mutations){for(const node of m.addedNodes){if(!(node instanceof HTMLElement))continue;const articles=node.matches?.(".message")?[node]:[...node.querySelectorAll?.(".message")||[]];for(const article of articles){enhanceMessageArticle(article);if(document.hidden){unreadCount++;updateUnreadTitle();}}}}
});
if(ui.messages)messageObserver.observe(ui.messages,{childList:true,subtree:true});
function enhanceMessageArticle(article){
  if(article.dataset.v7Enhanced)return; article.dataset.v7Enhanced="1"; const actions=article.querySelector(".message-actions"); if(!actions)return; const id=article.dataset.messageId;
  const copy=makeEl("button","message-action","⛓");copy.type="button";copy.title="Copiar link";copy.addEventListener("click",async()=>{const u=new URL(location.href);u.searchParams.set("server",state.activeServerId||"");u.searchParams.set("channel",state.activeTextChannelId||"");u.searchParams.set("message",id);try{await navigator.clipboard.writeText(u.toString());toast("Link da mensagem copiado.");}catch(_){toast("Não foi possível copiar.");}});actions.appendChild(copy);
  const unread=makeEl("button","message-action","◌");unread.type="button";unread.title="Marcar como não lida a partir daqui";unread.addEventListener("click",()=>{document.querySelector(".manual-unread-separator")?.remove();const sep=makeEl("div","manual-unread-separator","NÃO LIDAS");article.before(sep);rt.safeLocalStorageSet(`unread_${state.activeTextChannelId}`,id);toast("Marcado como não lido.");});actions.appendChild(unread);
}
setTimeout(()=>ui.messages?.querySelectorAll(".message").forEach(enhanceMessageArticle),1200);

async function loadOlderMessages(){
  if(!state.activeTextChannelId)return;const rows=[...state.messageMap.values()].filter(m=>m.channel_id===state.activeTextChannelId);const earliest=rows.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at))[0];if(!earliest)return;
  const btn=$("#loadOlderMessagesBtn");if(btn){btn.disabled=true;btn.textContent="Carregando…";}
  const {data,error}=await state.supabase.from("channel_messages").select("id,channel_id,user_id,content,reply_to,created_at,edited_at,attachments,kind,metadata,pinned,pinned_by,pinned_at").eq("channel_id",state.activeTextChannelId).lt("created_at",earliest.created_at).order("created_at",{ascending:false}).limit(100);
  if(error){toast("Não foi possível carregar mensagens antigas.");if(btn)btn.disabled=false;return;}
  const older=[...(data||[])].reverse();
  const ids=older.map(m=>m.id);
  if(ids.length){
    const [rr,vv]=await Promise.all([
      state.supabase.from("message_reactions").select("message_id,user_id,emoji,created_at").in("message_id",ids),
      state.supabase.from("poll_votes").select("message_id,user_id,option_index,created_at").in("message_id",ids)
    ]);
    if(!rr.error)for(const row of rr.data||[]){const k=String(row.message_id);const cur=state.reactionMap.get(k)||[];if(!cur.some(x=>x.user_id===row.user_id&&x.emoji===row.emoji))cur.push(row);state.reactionMap.set(k,cur);}
    if(!vv.error)for(const row of vv.data||[]){const k=String(row.message_id);const cur=state.pollVotes.get(k)||[];if(!cur.some(x=>x.user_id===row.user_id&&Number(x.option_index)===Number(row.option_index)))cur.push(row);state.pollVotes.set(k,cur);}
  }
  const first=ui.messages.querySelector(".message");for(const row of older){state.messageMap.set(String(row.id),row);rt.renderMessage(row,{force:true});const el=ui.messages.querySelector(`[data-message-id="${row.id}"]`);if(first&&el)ui.messages.insertBefore(el,first);}if(btn){btn.disabled=false;btn.textContent=older.length?"Carregar mensagens anteriores":"Não há mensagens anteriores";if(!older.length)btn.disabled=true;}
}
function ensureOlderButton(){if(!ui.messages||$("#loadOlderMessagesBtn"))return;const b=makeEl("button","load-older-button","Carregar mensagens anteriores");b.id="loadOlderMessagesBtn";b.type="button";b.addEventListener("click",loadOlderMessages);ui.messages.prepend(b);}
setInterval(()=>{if(state.activeTextChannelId)ensureOlderButton();else $("#loadOlderMessagesBtn")?.remove();},1200);

// Abrir links profundos de mensagem/canal.
setTimeout(async()=>{const q=new URL(location.href).searchParams;const sid=q.get("server"),cid=q.get("channel"),mid=q.get("message");if(sid&&state.servers.some(s=>s.id===sid)){await rt.selectServer(sid);if(cid&&state.channels.some(c=>c.id===cid&&c.type==="text")){await rt.selectTextChannel(cid);if(mid)setTimeout(()=>document.querySelector(`[data-message-id="${CSS.escape(mid)}"]`)?.scrollIntoView({behavior:"smooth",block:"center"}),600);}}},1800);

// -----------------------------------------------------------------------------
// Mobile bottom navigation
// -----------------------------------------------------------------------------
ui.mobileBottomNav?.addEventListener("click",async(event)=>{const btn=event.target.closest("button[data-mobile-action]");if(!btn)return;ui.mobileBottomNav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===btn));const action=btn.dataset.mobileAction;if(action==="servers")ui.mobileMenuBtn?.click();if(action==="chat"){rt.closeDrawers?.();if(state.activeTextChannelId)await rt.selectTextChannel(state.activeTextChannelId);}if(action==="call"){if(!state.voiceJoinedChannelId)return toast("Entre em um canal de voz primeiro.");rt.toggleMediaExpanded?.(true);ui.mediaStage?.classList.remove("hidden");}if(action==="friends")ui.friendsBtn?.click();if(action==="profile")ui.profileButton?.click();});

// -----------------------------------------------------------------------------
// Dashboard inicial resumido
// -----------------------------------------------------------------------------
function ensureDashboardSummary(){
  if(!ui.homeHub||$("#v7HomeSummary"))return;const host=ui.homeHub.querySelector(".home-hub-head");if(!host)return;const wrap=makeEl("div","v7-home-summary");wrap.id="v7HomeSummary";host.after(wrap);refreshDashboardSummary();
}
function refreshDashboardSummary(){const wrap=$("#v7HomeSummary");if(!wrap)return;wrap.replaceChildren();const cards=[['Servidores',state.servers.length,'◫'],['Amigos',acceptedFriendProfiles().length,'♧'],['Na call',state.voiceJoinedChannelId?'1':'0','◉'],['Versão',`V${rt.APP_VERSION}`,'✓']];for(const [label,value,icon] of cards){const c=makeEl("div","home-stat");c.append(makeEl("span","",icon),makeEl("strong","",String(value)),makeEl("small","",label));wrap.appendChild(c);}}
setInterval(()=>{ensureDashboardSummary();refreshDashboardSummary();},1800);

// -----------------------------------------------------------------------------
// Status PTT visual
// -----------------------------------------------------------------------------
const pttBadge=makeEl("span","ptt-badge hidden","PTT");ui.voiceDock?.querySelector(".voice-dock-meta")?.appendChild(pttBadge);
setInterval(()=>{pttBadge.classList.toggle("hidden",!state.voiceJoinedChannelId||!state.preferences.push_to_talk);pttBadge.classList.toggle("active",pttPressed);},250);

console.info(`[Tropa da Lan] V${rt.APP_VERSION} enhancements loaded.`);

// -----------------------------------------------------------------------------
// Lembretes de eventos enquanto o PWA/site estiver aberto
// -----------------------------------------------------------------------------
async function checkUpcomingEvents() {
  if (!state.supabase || !state.user || !state.activeServerId || state.preferences.notification_level === "none") return;
  const now = new Date(); const until = new Date(now.getTime() + 15*60000);
  try {
    const { data, error } = await state.supabase.from("server_events").select("id,title,starts_at").eq("server_id",state.activeServerId).gte("starts_at",now.toISOString()).lte("starts_at",until.toISOString()).order("starts_at").limit(5);
    if (error) return;
    for (const event of data || []) {
      const key=`event_reminded_${event.id}`; if(rt.safeLocalStorageGet(key)) continue;
      rt.safeLocalStorageSet(key,"1");
      const mins=Math.max(0,Math.round((new Date(event.starts_at)-now)/60000));
      if (state.preferences.browser_notifications && "Notification" in window && Notification.permission === "granted" && document.visibilityState !== "visible") {
        try { new Notification(`Evento em ${mins} min`, { body: event.title, icon: "./icon-192.png" }); } catch (_) {}
      }
      if(document.visibilityState==="visible") toast(`Evento “${event.title}” começa em ${mins} min.`,5500);
    }
  } catch (_) {}
}
setInterval(checkUpcomingEvents,120000); setTimeout(checkUpcomingEvents,8000);

// Relatório técnico rápido para feedback
$("#reportProblemBtn")?.addEventListener("click", async () => {
  const report = [
    `Tropa da Lan V${rt.APP_VERSION}`,
    `URL: ${location.href}`,
    `Navegador: ${navigator.userAgent}`,
    `Servidor: ${state.activeServer?.name || "nenhum"}`,
    `Canal: ${rt.activeTextChannel?.()?.name || state.voiceJoinedChannelName || "nenhum"}`,
    `Microfone: ${activeCallTrack()?.label || selectedOptionLabel(ui.voiceMicSelect)}`,
    `Online: ${navigator.onLine ? "sim" : "não"}`,
    `Data: ${new Date().toISOString()}`
  ].join("\n");
  try { await navigator.clipboard.writeText(report); toast("Relatório técnico copiado. Cole junto da descrição do problema.", 5200); }
  catch (_) { toast("Não consegui copiar o relatório."); }
});

// Botão para voltar ao fim do chat quando o usuário sobe no histórico.
const latestBtn = makeEl("button", "scroll-latest hidden", "↓ Mensagens recentes");
latestBtn.type = "button";
ui.composerWrap?.appendChild(latestBtn);
latestBtn.addEventListener("click", () => ui.messages?.scrollTo({ top: ui.messages.scrollHeight, behavior: "smooth" }));
ui.messages?.addEventListener("scroll", () => {
  const distance = ui.messages.scrollHeight - ui.messages.scrollTop - ui.messages.clientHeight;
  latestBtn.classList.toggle("hidden", distance < 360);
});

// -----------------------------------------------------------------------------
// Controles rápidos da call (V7.0.1)
// -----------------------------------------------------------------------------
const quickPttToggle = $("#pushToTalkToggle");
const quickPttKey = $("#pttKeyLabel");
const quickSensitivity = $("#micSensitivityRange");
const quickSensitivityValue = $("#micSensitivityValue");
const quickStreamQuality = $("#streamQualitySelect");
const quickStreamFps = $("#streamFpsSelect");
const callQualityBadge = $("#callQualityBadge");

async function persistQuickPreference(patch) {
  state.preferences = { ...state.preferences, ...patch };
  try { localStorage.setItem("tropa_preferences", JSON.stringify(state.preferences)); } catch (_) {}
  if (state.supabase && state.user) {
    try { await state.supabase.from("user_preferences").upsert({ user_id: state.user.id, ...patch }, { onConflict: "user_id" }); } catch (_) {}
  }
}
function syncQuickCallControls() {
  if (quickPttToggle) quickPttToggle.checked = Boolean(state.preferences.push_to_talk);
  if (quickPttKey) quickPttKey.textContent = state.preferences.push_to_talk_key || "Space";
  if (quickSensitivity) quickSensitivity.value = String(state.preferences.voice_sensitivity ?? 45);
  if (quickSensitivityValue) quickSensitivityValue.textContent = String(state.preferences.voice_sensitivity ?? 45);
  if (quickStreamQuality) quickStreamQuality.value = state.preferences.screen_quality || "1080p";
  if (quickStreamFps) quickStreamFps.value = String(state.preferences.screen_fps || 30);
}
quickPttToggle?.addEventListener("change", async () => {
  await persistQuickPreference({ push_to_talk: quickPttToggle.checked });
  if (ui.pushToTalkInput) ui.pushToTalkInput.checked = quickPttToggle.checked;
  if (state.voiceJoinedChannelId && activeCallTrack()) setMicEnabled(!quickPttToggle.checked);
});
quickSensitivity?.addEventListener("input", () => { if (quickSensitivityValue) quickSensitivityValue.textContent = quickSensitivity.value; });
quickSensitivity?.addEventListener("change", async () => {
  const value = Math.max(5, Math.min(95, Number(quickSensitivity.value || 45)));
  await persistQuickPreference({ voice_sensitivity: value });
  if (ui.voiceSensitivityInput) ui.voiceSensitivityInput.value = String(value);
  if (ui.voiceSensitivityValue) ui.voiceSensitivityValue.textContent = String(value);
});
quickStreamQuality?.addEventListener("change", async () => {
  await persistQuickPreference({ screen_quality: quickStreamQuality.value });
  if (ui.screenQualityInput) ui.screenQualityInput.value = quickStreamQuality.value;
});
quickStreamFps?.addEventListener("change", async () => {
  const value = Number(quickStreamFps.value || 30);
  await persistQuickPreference({ screen_fps: value });
  if (ui.screenFpsInput) ui.screenFpsInput.value = String(value);
});
setInterval(syncQuickCallControls, 1200);

async function updateCompactCallQuality() {
  if (!callQualityBadge) return;
  if (!state.voiceJoinedChannelId || !state.peers.size) { callQualityBadge.textContent = "WebRTC"; callQualityBadge.className = "secure-badge"; return; }
  try {
    const stats = await collectRtcStats();
    const [label, cls] = classifyQuality(stats);
    callQualityBadge.textContent = label;
    callQualityBadge.className = `secure-badge ${cls}`;
  } catch (_) {}
}
setInterval(updateCompactCallQuality, 4000);
