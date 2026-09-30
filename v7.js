// Tropa da Lan V7 — melhorias de UX, diagnóstico, PTT, PWA e atalhos.
const rt = window.TROPA_RUNTIME || await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("TROPA_RUNTIME não iniciou em 8 segundos.")), 8000);
  window.addEventListener("tropa-runtime-ready", (event) => { clearTimeout(timer); resolve(event.detail); }, { once: true });
});

const { state, ui, toast, openDialog, closeDialog, makeEl, applyScreenShareSettings } = rt;
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
  phoneoff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15c5-3 11-3 16 0"/><path d="m6 14-2 4M18 14l2 4"/></svg>',
  sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>'
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
setButtonIcon(ui.soundboardBtn, "sound");
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
  track.enabled = Boolean(enabled) && !state.hardMuted;
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
  if (state.hardMuted && track.enabled) setMicEnabled(false);
  else if (state.preferences.push_to_talk && !pttPressed && track.enabled) setMicEnabled(false);
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
  const candidateTypes = new Set();
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
      types.forEach((type) => candidateTypes.add(type));
      if (types.includes("relay")) { ice = "TURN"; iceDetail = `Relay • ${types.join(" ↔ ")}`; }
      else if (types.includes("srflx") || types.includes("prflx")) { ice = "P2P externo"; iceDetail = `STUN • ${types.join(" ↔ ")}`; }
      else if (types.includes("host")) { ice = "P2P direto"; iceDetail = types.join(" ↔ "); }
      else if (types.length) { ice = "P2P"; iceDetail = types.join(" ↔ "); }
    }
  }
  const total = lost + received; const lossPct = total ? (lost/total)*100 : 0;
  const net = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const networkType = [net?.type, net?.effectiveType].filter(Boolean).join(" / ") || (navigator.onLine ? "online" : "offline");
  return { rtt, jitter, lossPct, connected, peerCount: state.peers.size, ice, iceDetail, candidateTypes: [...candidateTypes], networkType };
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
  diag.webrtcDetail.textContent = state.voiceJoinedChannelId ? `${state.voiceJoinedChannelName || "Canal"} • ${stats.networkType}` : "Nenhum canal de voz";
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
$("#diagRestartP2PBtn")?.addEventListener("click", async () => {
  if (!state.voiceJoinedChannelId) return toast("Entre em uma chamada primeiro.");
  const button = $("#diagRestartP2PBtn"); if (button) button.disabled = true;
  try { await rt.recoverAllVoicePeers?.("manual-diagnostics", { force: true }); toast("Reconexão P2P iniciada."); }
  catch (error) { console.error(error); toast("Não foi possível reiniciar a rota P2P."); }
  finally { if (button) button.disabled = false; }
});
$("#diagTestMicBtn")?.addEventListener("click", async () => { await ensureDiagAnalyser(); toast(diagAnalyser ? "Fale normalmente e acompanhe o medidor de entrada." : "Não consegui acessar o microfone."); });
$("#diagMonitorMicBtn")?.addEventListener("click", async (event) => {
  if (diagMonitorAudio) { diagMonitorAudio.pause(); diagMonitorAudio.remove(); diagMonitorAudio=null; event.currentTarget.textContent="Ouvir microfone"; return; }
  let track = activeCallTrack(); if (!track) { try { if (!diagTempStream) diagTempStream = await rt.acquireMicrophone(state.preferences.audio_input_id || ""); track=diagTempStream.getAudioTracks()[0]; } catch (_) {} }
  if (!track) return toast("Não foi possível abrir o microfone.");
  diagMonitorAudio=document.createElement("audio"); diagMonitorAudio.autoplay=true; diagMonitorAudio.srcObject=new MediaStream([track]); document.body.appendChild(diagMonitorAudio);
  try { if (typeof diagMonitorAudio.setSinkId === "function") await diagMonitorAudio.setSinkId(state.preferences.audio_output_id || ""); await diagMonitorAudio.play(); event.currentTarget.textContent="Parar retorno"; } catch (_) { toast("O navegador bloqueou o retorno. Clique novamente após interagir com a página."); }
});
$("#copyDiagnosticsBtn")?.addEventListener("click", async () => {
  const stats=await collectRtcStats(); const report=[`Tropa da Lan ${rt.APP_VERSION}`,`Navegador: ${navigator.userAgent}`,`Canal: ${state.voiceJoinedChannelName || "nenhum"}`,`Microfone: ${activeCallTrack()?.label || selectedOptionLabel(ui.voiceMicSelect)}`,`Saída: ${selectedOptionLabel(ui.voiceOutputSelect)}`,`Peers: ${stats.connected}/${stats.peerCount}`,`Ping: ${stats.rtt!=null?Math.round(stats.rtt*1000)+" ms":"—"}`,`Jitter: ${stats.jitter!=null?Math.round(stats.jitter*1000)+" ms":"—"}`,`Perda: ${stats.lossPct.toFixed(1)}%`,`ICE: ${stats.ice} ${stats.iceDetail}`,`Rede: ${stats.networkType}`,`Candidatos: ${stats.candidateTypes.join(", ") || "—"}`].join("\n");
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
  for (const c of state.channels || []) items.push({ type:c.type==="voice"?"Voz":"Canal", label:`${c.type==="voice"?"🔊":"#"} ${c.name}`, hint:c.category||"Geral", icon:c.is_private?"🔒":(c.type==="voice"?"◉":"#"), action:()=>c.type==="voice"?(window.TROPA_OPEN_VOICE_LOBBY?window.TROPA_OPEN_VOICE_LOBBY(c.id):rt.joinVoice(c.id)):rt.selectTextChannel(c.id) });
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
let paletteIndex = 0;
let paletteVisibleItems = [];
function selectPaletteIndex(next) {
  const buttons=[...palette.results.querySelectorAll(".command-item")]; if(!buttons.length)return;
  paletteIndex=(next+buttons.length)%buttons.length;
  buttons.forEach((b,i)=>b.classList.toggle("selected",i===paletteIndex));
  buttons[paletteIndex]?.scrollIntoView({block:"nearest"});
}
function renderPalette() {
  const q=(palette.input?.value||"").trim().toLowerCase(); palette.results.replaceChildren();
  paletteVisibleItems=paletteItems().filter((i)=>!q || `${i.type} ${i.label} ${i.hint}`.toLowerCase().includes(q)).slice(0,28);
  paletteIndex=0;
  if (!paletteVisibleItems.length) return palette.results.appendChild(makeEl("div","command-empty","Nada encontrado."));
  paletteVisibleItems.forEach((item,index)=>{ const b=makeEl("button",`command-item${index===0?" selected":""}`); b.type="button"; b.dataset.paletteIndex=String(index); b.append(makeEl("span","command-icon",item.icon),makeEl("span","command-meta")); const meta=b.lastChild; meta.append(makeEl("strong","",item.label),makeEl("small","",`${item.type} • ${item.hint}`)); b.addEventListener("mouseenter",()=>selectPaletteIndex(index)); b.addEventListener("click",async()=>{closeDialog(palette.dialog); await item.action();}); palette.results.appendChild(b); });
}
function openPalette() { renderPalette(); openDialog(palette.dialog); setTimeout(()=>{palette.input?.focus(); palette.input?.select();},20); }
window.addEventListener("keydown", (event) => { if ((event.ctrlKey||event.metaKey) && event.key.toLowerCase()==="k") { event.preventDefault(); event.stopImmediatePropagation(); openPalette(); } }, true);
palette.input?.addEventListener("input",renderPalette);
palette.input?.addEventListener("keydown",async(event)=>{
  if(event.key==="ArrowDown"){event.preventDefault();selectPaletteIndex(paletteIndex+1);}
  if(event.key==="ArrowUp"){event.preventDefault();selectPaletteIndex(paletteIndex-1);}
  if(event.key==="Enter"&&paletteVisibleItems[paletteIndex]){event.preventDefault();const item=paletteVisibleItems[paletteIndex];closeDialog(palette.dialog);await item.action();}
});
palette.dialog?.addEventListener("close",()=>{ if(palette.input) palette.input.value=""; paletteIndex=0; paletteVisibleItems=[]; });

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
ui.mobileBottomNav?.addEventListener("click",async(event)=>{const btn=event.target.closest("button[data-mobile-action]");if(!btn)return;const action=btn.dataset.mobileAction;if(action==="call"&&!state.voiceJoinedChannelId){toast("Entre em um canal de voz primeiro.");return;}ui.mobileBottomNav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===btn));if(action==="servers")ui.mobileMenuBtn?.click();if(action==="chat"){rt.closeDrawers?.();if(state.activeTextChannelId)await rt.selectTextChannel(state.activeTextChannelId);}if(action==="call"){rt.toggleMediaExpanded?.(true);ui.mediaStage?.classList.remove("hidden");}if(action==="friends")ui.friendsBtn?.click();if(action==="profile")ui.profileButton?.click();});

// -----------------------------------------------------------------------------
// Dashboard inicial V7.1 — atividade e atalhos
// -----------------------------------------------------------------------------
function activeVoiceRooms() {
  return (state.channels || []).filter((c)=>c.type==="voice").map((c)=>({ channel:c, people:state.voicePresence.get(c.id)||[] })).filter((x)=>x.people.length>0);
}
function buildHomeQuickButton(label, icon, handler, cls="") {
  const b=makeEl("button",`home-quick-action ${cls}`); b.type="button"; b.append(makeEl("span","home-quick-icon",icon),makeEl("span","",label)); b.addEventListener("click",handler); return b;
}
function ensureDashboardSummary(){
  if(!ui.homeHub)return;
  let wrap=$("#v7HomeSummary");
  if(!wrap){ const host=ui.homeHub.querySelector(".home-hub-head"); if(!host)return; wrap=makeEl("section","v7-home-dashboard"); wrap.id="v7HomeSummary"; host.after(wrap); }
  refreshDashboardSummary();
}
function refreshDashboardSummary(){
  const wrap=$("#v7HomeSummary"); if(!wrap||!state.user)return; wrap.replaceChildren();
  const top=makeEl("div","home-dashboard-top");
  const stats=makeEl("div","v7-home-summary");
  const voiceRooms=activeVoiceRooms();
  const cards=[['Servidores',state.servers.length,'◫'],['Amigos',acceptedFriendProfiles().length,'♧'],['Online aqui',state.onlineUserIds?.size||0,'●'],['Calls ativas',voiceRooms.length,'◉']];
  for(const [label,value,icon] of cards){const c=makeEl("div","home-stat");c.append(makeEl("span","",icon),makeEl("strong","",String(value)),makeEl("small","",label));stats.appendChild(c);}
  const actions=makeEl("div","home-quick-actions");
  actions.append(
    buildHomeQuickButton("Buscar tudo","⌕",openPalette),
    buildHomeQuickButton("Adicionar amigo","＋",()=>ui.addFriendBtn?.click()),
    buildHomeQuickButton("Diagnóstico","◉",openDiagnostics),
    buildHomeQuickButton("Preferências","⚙",()=>ui.appearanceBtn?.click())
  );
  top.append(stats,actions); wrap.appendChild(top);

  const body=makeEl("div","home-dashboard-grid");
  const recent=makeEl("section","home-dashboard-card"); recent.appendChild(makeEl("div","home-card-title","Servidores recentes"));
  const serverList=makeEl("div","home-server-list");
  for(const server of (state.servers||[]).slice(0,6)){
    const b=makeEl("button","home-server-chip");b.type="button";const av=makeEl("span","server-chip-avatar",(server.name||"S").slice(0,2).toUpperCase()); if(server.icon_url){av.textContent="";av.style.backgroundImage=`url(${server.icon_url})`;}
    b.append(av,makeEl("span","",server.name));b.addEventListener("click",()=>rt.selectServer(server.id));serverList.appendChild(b);
  }
  if(!state.servers?.length)serverList.appendChild(makeEl("div","empty-mini","Crie ou entre em um servidor para começar."));
  recent.appendChild(serverList);

  const voice=makeEl("section","home-dashboard-card"); voice.appendChild(makeEl("div","home-card-title","Calls acontecendo agora"));
  const voiceList=makeEl("div","home-voice-list");
  for(const room of voiceRooms.slice(0,5)){
    const b=makeEl("button","home-voice-row");b.type="button";b.append(makeEl("span","home-live-dot",""),makeEl("span","home-voice-name",room.channel.name),makeEl("small","",`${room.people.length} pessoa${room.people.length===1?"":"s"}`));
    b.addEventListener("click",()=>window.TROPA_OPEN_VOICE_LOBBY?window.TROPA_OPEN_VOICE_LOBBY(room.channel.id):rt.joinVoice(room.channel.id));voiceList.appendChild(b);
  }
  if(!voiceRooms.length)voiceList.appendChild(makeEl("div","empty-mini","Nenhuma call ativa neste servidor agora."));
  voice.appendChild(voiceList);
  body.append(recent,voice); wrap.appendChild(body);
}
setInterval(()=>{if(state.homeMode){ensureDashboardSummary();refreshDashboardSummary();}},4000);
setTimeout(ensureDashboardSummary,900);

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
  await persistQuickPreference({ screen_quality: quickStreamQuality.value, low_bandwidth: false });
  if (ui.screenQualityInput) ui.screenQualityInput.value = quickStreamQuality.value;
  if (ui.lowBandwidthInput) ui.lowBandwidthInput.checked = false;
  if (state.screenTrack) await applyScreenShareSettings?.();
  else toast(`${quickStreamQuality.value} será usado na próxima transmissão.`, 1800);
});
quickStreamFps?.addEventListener("change", async () => {
  const value = Number(quickStreamFps.value || 30);
  await persistQuickPreference({ screen_fps: value, low_bandwidth: false });
  if (ui.screenFpsInput) ui.screenFpsInput.value = String(value);
  if (ui.lowBandwidthInput) ui.lowBandwidthInput.checked = false;
  if (state.screenTrack) await applyScreenShareSettings?.();
  else toast(`${value} FPS será usado na próxima transmissão.`, 1800);
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
    callQualityBadge.title = `${stats.ice} • ${stats.iceDetail}`;
  } catch (_) {}
}
setInterval(updateCompactCallQuality, 4000);


// -----------------------------------------------------------------------------
// V7.1 — Não lidos/menções por canal (local + realtime)
// -----------------------------------------------------------------------------
let unreadRealtime = null;
function unreadKey(channelId){ return `tropa_channel_unread_${state.activeServerId||"none"}_${channelId}`; }
function getChannelUnread(channelId){
  try { const raw=localStorage.getItem(unreadKey(channelId)); const value=raw?JSON.parse(raw):null; return {count:Math.max(0,Number(value?.count||0)),mentions:Math.max(0,Number(value?.mentions||0))}; } catch(_){ return {count:0,mentions:0}; }
}
function setChannelUnread(channelId,value){ try{localStorage.setItem(unreadKey(channelId),JSON.stringify(value));}catch(_){} }
function markChannelRead(channelId){ if(!channelId)return; setChannelUnread(channelId,{count:0,mentions:0}); rt.renderChannels?.(); updateMobileUnreadBadge(); }
window.TROPA_GET_CHANNEL_UNREAD=getChannelUnread;
window.TROPA_MARK_CHANNEL_READ=markChannelRead;
function isMentionForMe(content){ const user=(state.profile?.username||"").toLowerCase(); const display=(state.profile?.display_name||"").toLowerCase(); const text=String(content||"").toLowerCase(); return Boolean((user&&text.includes(`@${user}`))||(display&&text.includes(`@${display}`))); }
function bumpChannelUnread(channelId,row){
  if(!channelId||channelId===state.activeTextChannelId||row?.user_id===state.user?.id)return;
  if(!(state.channels||[]).some(c=>c.id===channelId&&c.type==="text"))return;
  const value=getChannelUnread(channelId); value.count=Math.min(999,value.count+1); if(isMentionForMe(row?.content))value.mentions=Math.min(99,value.mentions+1); setChannelUnread(channelId,value); rt.renderChannels?.(); updateMobileUnreadBadge();
}
async function ensureUnreadRealtime(){
  if(!state.supabase||!state.user||unreadRealtime)return;
  const ch=state.supabase.channel(`unread-global:${state.user.id}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"channel_messages"},({new:row})=>bumpChannelUnread(row?.channel_id,row));
  ch.subscribe(); unreadRealtime=ch;
}
function unreadTotals(){let count=0,mentions=0;for(const c of state.channels||[]){if(c.type!=="text")continue;const v=getChannelUnread(c.id);count+=v.count;mentions+=v.mentions;}return{count,mentions};}
function updateMobileUnreadBadge(){
  const chatBtn=ui.mobileBottomNav?.querySelector('[data-mobile-action="chat"]'); if(!chatBtn)return; let badge=chatBtn.querySelector('.mobile-nav-badge'); const t=unreadTotals();
  if(t.count<=0){badge?.remove();return;} if(!badge){badge=makeEl('span','mobile-nav-badge');chatBtn.appendChild(badge);} badge.textContent=t.mentions?String(Math.min(99,t.mentions)):String(Math.min(99,t.count)); badge.classList.toggle('mention',t.mentions>0);
}
setInterval(()=>{ensureUnreadRealtime();updateMobileUnreadBadge();},3500); setTimeout(ensureUnreadRealtime,1400);

// -----------------------------------------------------------------------------
// V7.1 — Lobby antes da call
// -----------------------------------------------------------------------------
const lobby={dialog:$("#voiceLobbyDialog"),title:$("#voiceLobbyTitle"),subtitle:$("#voiceLobbySubtitle"),mic:$("#voiceLobbyMicSelect"),camera:$("#voiceLobbyCameraToggle"),skip:$("#voiceLobbySkipToggle"),test:$("#voiceLobbyTestBtn"),join:$("#voiceLobbyJoinBtn"),level:$("#voiceLobbyLevel"),status:$("#voiceLobbyStatus")};
let lobbyChannelId=null,lobbyTestStream=null,lobbyAudioContext=null,lobbyRaf=0;
function stopLobbyTest(){cancelAnimationFrame(lobbyRaf);try{lobbyTestStream?.getTracks().forEach(t=>t.stop());}catch(_){} lobbyTestStream=null;try{lobbyAudioContext?.close();}catch(_){} lobbyAudioContext=null;if(lobby.level)lobby.level.style.transform='scaleY(.06)';}
async function fillLobbyDevices(){
  if(!lobby.mic)return; const current=lobby.mic.value||state.preferences.audio_input_id||""; lobby.mic.innerHTML='<option value="">Padrão do sistema</option>';
  try{const devices=await navigator.mediaDevices.enumerateDevices();let i=1;for(const d of devices.filter(x=>x.kind==='audioinput')){const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label||`Microfone ${i++}`;lobby.mic.appendChild(o);} lobby.mic.value=current;}catch(_){}
}
async function testLobbyMic(){
  stopLobbyTest(); if(!navigator.mediaDevices?.getUserMedia)return toast('Microfone não disponível neste navegador.');
  try{lobby.status.textContent='Pedindo acesso ao microfone…'; const device=lobby.mic?.value||''; lobbyTestStream=await navigator.mediaDevices.getUserMedia({audio:device?{deviceId:{exact:device}}:true,video:false}); const Ctx=window.AudioContext||window.webkitAudioContext;lobbyAudioContext=new Ctx();const src=lobbyAudioContext.createMediaStreamSource(lobbyTestStream),an=lobbyAudioContext.createAnalyser();an.fftSize=512;src.connect(an);const data=new Uint8Array(an.frequencyBinCount);lobby.status.textContent='Microfone funcionando';const tick=()=>{an.getByteFrequencyData(data);const avg=data.reduce((a,b)=>a+b,0)/(data.length*255);if(lobby.level)lobby.level.style.transform=`scaleY(${Math.max(.06,Math.min(1,avg*3.6))})`;lobbyRaf=requestAnimationFrame(tick)};tick();}catch(e){lobby.status.textContent='Não foi possível acessar o microfone';toast(e?.message||'Permissão de microfone negada.');}
}
async function openVoiceLobby(channelId){
  const channel=(state.channels||[]).find(c=>c.id===channelId&&c.type==='voice');if(!channel)return;
  if(state.voiceJoinedChannelId===channelId){rt.toggleMediaExpanded?.(true);return;}
  if(localStorage.getItem('tropa_skip_voice_lobby')==='1'){return rt.joinVoice(channelId);}
  lobbyChannelId=channelId;lobby.title.textContent=`Entrar em ${channel.name}`;lobby.subtitle.textContent='Confira seu microfone e escolha como entrar.';lobby.skip.checked=false;lobby.camera.checked=false;await fillLobbyDevices();openDialog(lobby.dialog);setTimeout(testLobbyMic,120);
}
window.TROPA_OPEN_VOICE_LOBBY=openVoiceLobby;
$("#resetVoiceLobbyBtn")?.addEventListener('click',()=>{localStorage.removeItem('tropa_skip_voice_lobby');toast('Lobby da call reativado.');});
lobby.test?.addEventListener('click',testLobbyMic);lobby.mic?.addEventListener('change',testLobbyMic);
lobby.dialog?.addEventListener('close',stopLobbyTest);
lobby.join?.addEventListener('click',async()=>{if(!lobbyChannelId)return;const id=lobbyChannelId;const micId=lobby.mic?.value||'';const camera=Boolean(lobby.camera?.checked);if(lobby.skip?.checked)localStorage.setItem('tropa_skip_voice_lobby','1');stopLobbyTest();closeDialog(lobby.dialog);if(micId)state.preferences.audio_input_id=micId;await rt.joinVoice(id);if(micId&&state.voiceJoinedChannelId===id)try{await rt.switchMicrophone(micId);}catch(_){}if(camera&&state.voiceJoinedChannelId===id&&!state.cameraTrack)ui.cameraBtn?.click();});

// -----------------------------------------------------------------------------
// V7.1 — Atualização PWA visível
// -----------------------------------------------------------------------------
const updateBanner=$("#pwaUpdateBanner"),updateNow=$("#pwaUpdateNowBtn"),updateLater=$("#pwaUpdateLaterBtn");
let waitingWorker=null;
function showUpdateBanner(worker){waitingWorker=worker||waitingWorker;updateBanner?.classList.remove('hidden');}
function hideUpdateBanner(){updateBanner?.classList.add('hidden');}
async function watchForUpdates(){
  if(!('serviceWorker' in navigator))return;try{const reg=await navigator.serviceWorker.getRegistration();if(!reg)return;if(reg.waiting)showUpdateBanner(reg.waiting);reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpdateBanner(w);});});}catch(_){}
}
updateNow?.addEventListener('click',()=>{if(waitingWorker)waitingWorker.postMessage({type:'SKIP_WAITING'});else location.reload();});updateLater?.addEventListener('click',hideUpdateBanner);navigator.serviceWorker?.addEventListener('controllerchange',()=>location.reload());setTimeout(watchForUpdates,2200);setInterval(async()=>{try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();}catch(_){}},15*60*1000);

// -----------------------------------------------------------------------------
// V7.1 — Mobile: atalho persistente para voltar à call
// -----------------------------------------------------------------------------
const mobileCallPill=makeEl('button','mobile-call-pill hidden');mobileCallPill.type='button';mobileCallPill.innerHTML='<span class="mobile-call-pulse"></span><strong>Call ativa</strong><small>Toque para voltar</small>';document.body.appendChild(mobileCallPill);mobileCallPill.addEventListener('click',()=>{rt.toggleMediaExpanded?.(true);ui.mediaStage?.classList.remove('hidden');});
setInterval(()=>{const on=Boolean(state.voiceJoinedChannelId);mobileCallPill.classList.toggle('hidden',!on);document.body.classList.toggle('mobile-call-active',on);if(on){mobileCallPill.querySelector('strong').textContent=state.voiceJoinedChannelName||'Call ativa';}},700);

// -----------------------------------------------------------------------------
// V7.1 — Primeiro acesso: dica curta, sem tutorial invasivo
// -----------------------------------------------------------------------------
setTimeout(()=>{if(!state.user||localStorage.getItem('tropa_v71_welcome'))return;localStorage.setItem('tropa_v71_welcome','1');toast('Dica: use Ctrl+K para abrir qualquer servidor, canal, amigo ou ferramenta.',6500);},5000);


// -----------------------------------------------------------------------------
// V7.2.1 — Instalação mobile PWA guiada
// -----------------------------------------------------------------------------
let tropaInstallPrompt = null;
const isStandaloneApp = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isMobileDevice = () => window.matchMedia?.('(max-width: 900px), (pointer: coarse)').matches;
const isIOSDevice = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function removeMobileInstallBanner(){
  document.getElementById('tropaMobileInstallBanner')?.remove();
}
function openMobileInstallHelp(){
  let dialog=document.getElementById('tropaMobileInstallHelp');
  if(!dialog){
    dialog=document.createElement('dialog');
    dialog.id='tropaMobileInstallHelp';
    dialog.className='tropa-install-dialog';
    dialog.innerHTML=`<form method="dialog" class="tropa-install-card">
      <div class="tropa-install-logo"><img src="./icon-192.png" alt="" /><div><strong>Instalar Tropa da Lan</strong><small>Adicionar como aplicativo</small></div></div>
      <div class="tropa-install-help-body"></div>
      <button class="primary-button wide" value="close">Entendi</button>
    </form>`;
    document.body.appendChild(dialog);
  }
  const body=dialog.querySelector('.tropa-install-help-body');
  if(body){
    body.innerHTML=isIOSDevice()
      ? `<p>No iPhone/iPad:</p><ol><li>Abra esta página no <b>Safari</b>.</li><li>Toque em <b>Compartilhar</b>.</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li></ol>`
      : `<p>Para instalar no Android:</p><ol><li>Abra esta página no <b>Chrome</b>.</li><li>Abra o menu <b>⋮</b>.</li><li>Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li></ol>`;
  }
  try{dialog.showModal();}catch(_){dialog.setAttribute('open','');}
}
async function requestTropaInstall(){
  if(isStandaloneApp()) return;
  if(tropaInstallPrompt){
    const prompt=tropaInstallPrompt;
    tropaInstallPrompt=null;
    try{
      await prompt.prompt();
      const choice=await prompt.userChoice;
      if(choice?.outcome==='accepted') removeMobileInstallBanner();
    }catch(_){ openMobileInstallHelp(); }
  }else{
    openMobileInstallHelp();
  }
}
function showMobileInstallBanner(){
  if(!isMobileDevice() || isStandaloneApp() || localStorage.getItem('tropa_install_banner_hidden')==='1') return;
  if(document.getElementById('tropaMobileInstallBanner')) return;
  const banner=document.createElement('aside');
  banner.id='tropaMobileInstallBanner';
  banner.className='tropa-mobile-install-banner';
  banner.innerHTML=`<img src="./icon-192.png" alt="" />
    <div><strong>Instalar Tropa da Lan</strong><small>Abrir como aplicativo no celular</small></div>
    <button type="button" class="tropa-install-action">Instalar</button>
    <button type="button" class="tropa-install-close" aria-label="Fechar">×</button>`;
  document.body.appendChild(banner);
  banner.querySelector('.tropa-install-action')?.addEventListener('click',requestTropaInstall);
  banner.querySelector('.tropa-install-close')?.addEventListener('click',()=>{
    localStorage.setItem('tropa_install_banner_hidden','1');
    removeMobileInstallBanner();
  });
}
window.addEventListener('beforeinstallprompt',(event)=>{
  event.preventDefault();
  tropaInstallPrompt=event;
  setTimeout(showMobileInstallBanner,350);
});
window.addEventListener('appinstalled',()=>{
  tropaInstallPrompt=null;
  removeMobileInstallBanner();
  try{localStorage.setItem('tropa_pwa_installed','1');}catch(_){}
  toast?.('Tropa da Lan instalado no celular.',2600);
});
setTimeout(()=>{
  if(isMobileDevice() && !isStandaloneApp()) showMobileInstallBanner();
},4200);
