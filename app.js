import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const cfg = window.TROPA_CONFIG || {};
const isConfigured = Boolean(
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_PUBLISHABLE_KEY &&
  !cfg.SUPABASE_URL.includes("SEU-PROJETO") &&
  !cfg.SUPABASE_PUBLISHABLE_KEY.includes("COLE_SUA_CHAVE")
);

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const ui = {
  setupBanner: $("#setupBanner"),
  backendStatus: $("#backendStatus"),
  connectionText: $("#connectionText"),
  messages: $("#messages"),
  messageForm: $("#messageForm"),
  messageInput: $("#messageInput"),
  sendBtn: $("#sendBtn"),
  activeRoomTitle: $("#activeRoomTitle"),
  activeRoomSubtitle: $("#activeRoomSubtitle"),
  membersList: $("#membersList"),
  onlineCount: $("#onlineCount"),
  membersPanel: $("#membersPanel"),
  mobileMembersBtn: $("#mobileMembersBtn"),
  channelsPanel: $("#channelsPanel"),
  mobileMenuBtn: $("#mobileMenuBtn"),
  closeChannelsBtn: $("#closeChannelsBtn"),
  drawerBackdrop: $("#drawerBackdrop"),
  profileDialog: $("#profileDialog"),
  profileForm: $("#profileForm"),
  usernameInput: $("#usernameInput"),
  profileName: $("#profileName"),
  profileId: $("#profileId"),
  profileAvatar: $("#profileAvatar"),
  editProfileBtn: $("#editProfileBtn"),
  joinVoiceBtn: $("#joinVoiceBtn"),
  leaveVoiceBtn: $("#leaveVoiceBtn"),
  muteBtn: $("#muteBtn"),
  cameraBtn: $("#cameraBtn"),
  shareBtn: $("#shareBtn"),
  voiceIndicator: $("#voiceIndicator"),
  voiceStateText: $("#voiceStateText"),
  mediaStage: $("#mediaStage"),
  mediaGrid: $("#mediaGrid"),
  callStatusText: $("#callStatusText"),
  toast: $("#toast")
};

const roomDescriptions = {
  geral: "Conversa geral da Tropa",
  jogos: "Jogos, partidas e calls",
  "off-topic": "Assuntos aleatórios"
};


function safeStoredUsername() {
  try { return localStorage.getItem("tropa_username") || ""; } catch (_) { return ""; }
}

function createClientId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    if (globalThis.crypto?.getRandomValues) {
      const bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
      return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (_) {}
  return `client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
const state = {
  supabase: null,
  currentRoom: "geral",
  username: safeStoredUsername(),
  clientId: createClientId(),
  chatChannel: null,
  presenceChannel: null,
  voiceChannel: null,
  voiceRoom: "geral",
  voiceJoined: false,
  joiningVoice: false,
  localStream: null,
  cameraTrack: null,
  screenTrack: null,
  peers: new Map(),
  peerNames: new Map(),
  remoteMediaStates: new Map(),
  renderedMessages: new Set(),
  roomSwitchToken: 0,
  voiceSession: 0,
  cameraBusy: false,
  screenBusy: false,
  sendingMessage: false
};

let toastTimer = null;
function toast(message, ms = 3200) {
  ui.toast.textContent = message;
  ui.toast.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.add("hidden"), ms);
}

function initials(name = "TL") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "TL";
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 800px)").matches;
}

function isMembersDrawerLayout() {
  return window.matchMedia("(max-width: 1180px)").matches;
}

function syncDrawerBackdrop() {
  const channelsOpen = isMobileLayout() && ui.channelsPanel.classList.contains("open");
  const membersOpen = isMembersDrawerLayout() && ui.membersPanel.classList.contains("open");
  ui.drawerBackdrop.classList.toggle("hidden", !(channelsOpen || membersOpen));
}

function closeDrawers() {
  ui.channelsPanel.classList.remove("open");
  ui.membersPanel.classList.remove("open");
  syncDrawerBackdrop();
}

ui.mobileMenuBtn.addEventListener("click", () => {
  ui.membersPanel.classList.remove("open");
  ui.channelsPanel.classList.toggle("open");
  syncDrawerBackdrop();
});
ui.closeChannelsBtn.addEventListener("click", closeDrawers);
ui.mobileMembersBtn.addEventListener("click", () => {
  ui.channelsPanel.classList.remove("open");
  ui.membersPanel.classList.toggle("open");
  syncDrawerBackdrop();
});
ui.drawerBackdrop.addEventListener("click", closeDrawers);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawers();
});
window.addEventListener("resize", () => {
  if (!isMobileLayout()) ui.channelsPanel.classList.remove("open");
  if (!isMembersDrawerLayout()) ui.membersPanel.classList.remove("open");
  syncDrawerBackdrop();
});

function setProfileUI() {
  const name = state.username || "Visitante";
  ui.profileName.textContent = name;
  ui.profileAvatar.textContent = initials(name);
  ui.profileId.textContent = isConfigured ? `#${state.clientId.slice(0, 6)}` : "configure o Supabase";
}

function requireUsername() {
  if (!state.username && !ui.profileDialog.open) {
    ui.usernameInput.value = "";
    ui.profileDialog.showModal();
  }
}

ui.profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const next = ui.usernameInput.value.trim().replace(/\s+/g, " ");
  if (next.length < 2) return;
  state.username = next.slice(0, 24);
  try { localStorage.setItem("tropa_username", state.username); } catch (_) {}
  setProfileUI();
  ui.profileDialog.close();
  if (state.presenceChannel) await trackPresence();
  if (state.voiceJoined && state.voiceChannel) {
    try {
      await state.voiceChannel.track({ client_id: state.clientId, username: state.username, joined_at: new Date().toISOString() });
      await broadcastMediaState();
      ensureLocalCard();
    } catch (error) {
      console.warn("Falha ao atualizar nome na chamada", error);
    }
  }
  toast(`Você entrou como ${state.username}.`);
});

ui.editProfileBtn.addEventListener("click", () => {
  ui.usernameInput.value = state.username;
  ui.profileDialog.showModal();
  setTimeout(() => ui.usernameInput.focus(), 50);
});

function renderMessage(message) {
  const key = String(message.id ?? `${message.client_id}-${message.created_at}-${message.content}`);
  if (state.renderedMessages.has(key)) return;
  state.renderedMessages.add(key);

  const wrapper = document.createElement("article");
  wrapper.className = "message";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = initials(message.username);

  const content = document.createElement("div");
  const head = document.createElement("div");
  head.className = "message-head";
  const author = document.createElement("strong");
  author.textContent = message.username || "Usuário";
  const time = document.createElement("time");
  const date = new Date(message.created_at || Date.now());
  time.textContent = date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  head.append(author, time);

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = message.content || "";

  content.append(head, body);
  wrapper.append(avatar, content);
  ui.messages.appendChild(wrapper);
  ui.messages.scrollTop = ui.messages.scrollHeight;
}

function resetMessages() {
  state.renderedMessages.clear();
  ui.messages.replaceChildren();
  const welcome = document.createElement("div");
  welcome.className = "welcome-card";
  const icon = document.createElement("div");
  icon.className = "welcome-icon";
  icon.textContent = "#";
  const title = document.createElement("h2");
  title.textContent = `Bem-vindo a #${state.currentRoom}`;
  const p = document.createElement("p");
  p.textContent = "Este é o começo deste canal no Tropa da Lan.";
  welcome.append(icon, title, p);
  ui.messages.appendChild(welcome);
}

async function loadMessages(room, token) {
  if (!state.supabase) return;
  const { data, error } = await state.supabase
    .from("messages")
    .select("id, room, username, content, client_id, created_at")
    .eq("room", room)
    .order("created_at", { ascending: false })
    .limit(60);

  if (token !== state.roomSwitchToken || room !== state.currentRoom) return;

  if (error) {
    console.error(error);
    toast("Não consegui carregar o chat. Confira se você executou o arquivo supabase.sql.", 5000);
    return;
  }
  [...(data || [])].reverse().forEach(renderMessage);
}

async function subscribeChat(room, token) {
  if (!state.supabase || token !== state.roomSwitchToken) return;

  const channel = state.supabase
    .channel(`chat-db-${room}-${state.clientId}-${token}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `room=eq.${room}`
    }, (payload) => {
      if (token === state.roomSwitchToken && room === state.currentRoom) renderMessage(payload.new);
    });

  state.chatChannel = channel;
  channel.subscribe((status) => {
    if (token !== state.roomSwitchToken) return;
    if (["CHANNEL_ERROR", "TIMED_OUT"].includes(status)) {
      console.warn(`Canal de chat ${room}: ${status}`);
      toast("A atualização em tempo real do chat perdeu a conexão. Recarregue a página se não voltar.", 5000);
    }
  });
}

async function switchRoom(room) {
  if (!room) return;
  const token = ++state.roomSwitchToken;
  state.currentRoom = room;
  $$(".channel-item[data-room]").forEach((button) => button.classList.toggle("active", button.dataset.room === room));
  ui.activeRoomTitle.textContent = room;
  ui.activeRoomSubtitle.textContent = roomDescriptions[room] || "Canal de texto";
  ui.messageInput.placeholder = `Conversar em #${room}`;
  closeDrawers();
  resetMessages();

  const previousChannel = state.chatChannel;
  state.chatChannel = null;
  if (previousChannel && state.supabase) {
    try { await state.supabase.removeChannel(previousChannel); } catch (error) { console.warn("Falha ao fechar canal de chat anterior", error); }
  }
  if (token !== state.roomSwitchToken) return;

  await subscribeChat(room, token);
  await loadMessages(room, token);
}

$$(".channel-item[data-room]").forEach((button) => {
  button.addEventListener("click", () => switchRoom(button.dataset.room));
});

ui.messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.supabase || !state.username || state.sendingMessage) return;
  const content = ui.messageInput.value.trim();
  if (!content) return;

  const room = state.currentRoom;
  state.sendingMessage = true;
  ui.sendBtn.disabled = true;
  ui.messageInput.value = "";

  try {
    const { error } = await state.supabase.from("messages").insert({
      room,
      username: state.username,
      content: content.slice(0, 1000),
      client_id: state.clientId
    });
    if (error) throw error;
  } catch (error) {
    console.error(error);
    toast("Não foi possível enviar a mensagem.");
    if (state.currentRoom === room && !ui.messageInput.value) ui.messageInput.value = content;
  } finally {
    state.sendingMessage = false;
    ui.sendBtn.disabled = !state.supabase;
  }
});

async function trackPresence() {
  if (!state.presenceChannel || !state.username) return false;
  try {
    const result = await state.presenceChannel.track({
      client_id: state.clientId,
      username: state.username,
      online_at: new Date().toISOString()
    });
    if (result && result !== "ok") console.warn("Presence track:", result);
    return result === undefined || result === "ok";
  } catch (error) {
    console.warn("Falha ao atualizar presença", error);
    return false;
  }
}

function renderPresence() {
  if (!state.presenceChannel) return;
  const presence = state.presenceChannel.presenceState();
  const people = [];
  for (const entries of Object.values(presence)) {
    for (const entry of entries) {
      if (!entry?.client_id || !entry?.username) continue;
      if (!people.some((p) => p.client_id === entry.client_id)) people.push(entry);
    }
  }
  people.sort((a, b) => a.username.localeCompare(b.username, "pt-BR"));
  ui.onlineCount.textContent = String(people.length);
  ui.membersList.replaceChildren();
  people.forEach((person) => {
    const row = document.createElement("div");
    row.className = "member";
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = initials(person.username);
    const name = document.createElement("div");
    name.className = "member-name";
    name.textContent = person.username + (person.client_id === state.clientId ? " (você)" : "");
    const badge = document.createElement("span");
    badge.className = "online-badge";
    row.append(avatar, name, badge);
    ui.membersList.appendChild(row);
  });
}

async function startPresence() {
  if (!state.supabase) return;
  if (state.presenceChannel) {
    try { await state.supabase.removeChannel(state.presenceChannel); } catch (_) {}
  }

  const channel = state.supabase.channel("tropa-presence", {
    config: { presence: { key: state.clientId } }
  });
  state.presenceChannel = channel;

  channel
    .on("presence", { event: "sync" }, renderPresence)
    .on("presence", { event: "join" }, renderPresence)
    .on("presence", { event: "leave" }, renderPresence)
    .subscribe(async (status) => {
      if (channel !== state.presenceChannel) return;
      if (status === "SUBSCRIBED") {
        await trackPresence();
        ui.backendStatus.classList.remove("error");
        ui.backendStatus.classList.add("online");
        ui.connectionText.textContent = "Conectado ao Supabase";
      } else if (["CHANNEL_ERROR", "TIMED_OUT"].includes(status)) {
        ui.backendStatus.classList.remove("online");
        ui.backendStatus.classList.add("error");
        ui.connectionText.textContent = "Realtime instável";
      }
    });
}

function screenShareSupported() {
  return Boolean(navigator.mediaDevices?.getDisplayMedia);
}

function currentVideoTrack() {
  return state.screenTrack || state.cameraTrack || null;
}

function micTrack() {
  return state.localStream?.getAudioTracks()[0] || null;
}

function getIceServers() {
  if (Array.isArray(cfg.ICE_SERVERS)) {
    const valid = cfg.ICE_SERVERS.filter((server) => server && (typeof server.urls === "string" || Array.isArray(server.urls)));
    if (valid.length) return valid;
  }
  return [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ];
}

function ensureLocalCard() {
  if (!state.voiceJoined) return;
  let card = document.getElementById("media-local");
  if (!card) {
    card = document.createElement("div");
    card.className = "media-card audio-only";
    card.id = "media-local";
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    const label = document.createElement("span");
    label.className = "media-label";
    const status = document.createElement("span");
    status.className = "media-connection ok";
    status.textContent = "você";
    card.append(video, label, status);
    ui.mediaGrid.prepend(card);
  }

  card.dataset.initials = initials(state.username);
  const video = card.querySelector("video");
  const label = card.querySelector(".media-label");
  const videoTrack = currentVideoTrack();
  const preview = new MediaStream();
  if (videoTrack) preview.addTrack(videoTrack);
  const audioTrack = micTrack();
  if (audioTrack) preview.addTrack(audioTrack);
  video.srcObject = preview;
  card.classList.toggle("audio-only", !videoTrack);
  card.classList.toggle("screen", Boolean(state.screenTrack));
  label.textContent = `${state.username} (você)${state.screenTrack ? " • tela" : ""}`;
  ui.mediaStage.classList.remove("hidden");
}

function tryPlayRemote(video) {
  const promise = video.play?.();
  if (promise?.catch) {
    promise.catch(() => {
      const card = video.closest(".media-card");
      const status = card?.querySelector(".media-connection");
      if (status) status.textContent = "toque para ouvir";
    });
  }
}

function remoteHasVideo(peer) {
  const tracks = peer.remoteStream.getVideoTracks();
  return tracks.some((track) => track.readyState === "live" && !track.muted);
}

function makeRemoteCard(peerId) {
  const peer = state.peers.get(peerId);
  if (!peer) return;

  let card = document.getElementById(`media-${peerId}`);
  if (!card) {
    card = document.createElement("div");
    card.id = `media-${peerId}`;
    card.className = "media-card audio-only";
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    const label = document.createElement("span");
    label.className = "media-label";
    const status = document.createElement("span");
    status.className = "media-connection";
    status.textContent = "conectando";
    card.append(video, label, status);
    card.addEventListener("click", () => tryPlayRemote(video));
    ui.mediaGrid.appendChild(card);
  }

  const name = state.peerNames.get(peerId) || "Usuário";
  card.dataset.initials = initials(name);
  const video = card.querySelector("video");
  const label = card.querySelector(".media-label");
  if (video.srcObject !== peer.remoteStream) video.srcObject = peer.remoteStream;
  const hasVideo = remoteHasVideo(peer);
  card.classList.toggle("audio-only", !hasVideo);
  card.classList.toggle("screen", Boolean(peer.remoteMedia?.screen));
  label.textContent = `${name}${peer.remoteMedia?.screen ? " • tela" : ""}`;
  ui.mediaStage.classList.remove("hidden");
  tryPlayRemote(video);
  updatePeerCardStatus(peerId);
}

function updatePeerCardStatus(peerId) {
  const peer = state.peers.get(peerId);
  const card = document.getElementById(`media-${peerId}`);
  if (!peer || !card) return;
  const badge = card.querySelector(".media-connection");
  const status = peer.pc.connectionState;
  const labels = {
    new: "preparando",
    connecting: "conectando",
    connected: "conectado",
    disconnected: "reconectando",
    failed: "falha na conexão",
    closed: "desconectado"
  };
  badge.textContent = labels[status] || status;
  badge.classList.toggle("ok", status === "connected");
  updateCallStatus();
}

function removeRemoteCard(peerId) {
  document.getElementById(`media-${peerId}`)?.remove();
  updateCallStatus();
}

function updateCallStatus() {
  if (!state.voiceJoined) {
    ui.callStatusText.textContent = "Fora da chamada";
    return;
  }
  const peers = [...state.peers.values()];
  const total = peers.length;
  const connected = peers.filter((peer) => peer.pc.connectionState === "connected").length;
  const failed = peers.filter((peer) => peer.pc.connectionState === "failed").length;
  if (!total) ui.callStatusText.textContent = "Aguardando outra pessoa entrar…";
  else if (failed) ui.callStatusText.textContent = `${connected + 1} conectado${connected ? "s" : ""} • ${failed} conexão${failed === 1 ? "" : "ões"} com falha`;
  else if (connected === total) ui.callStatusText.textContent = `${connected + 1} participantes na chamada`;
  else ui.callStatusText.textContent = `Conectando ${total - connected} participante${total - connected === 1 ? "" : "s"}…`;
}

async function sendSignal(to, signal) {
  if (!state.voiceChannel) return;
  try {
    await state.voiceChannel.send({
      type: "broadcast",
      event: "signal",
      payload: { from: state.clientId, to, username: state.username, signal }
    });
  } catch (error) {
    console.warn("Falha ao enviar sinal WebRTC", error);
  }
}

async function broadcastMediaState() {
  if (!state.voiceChannel || !state.voiceJoined) return;
  try {
    await state.voiceChannel.send({
      type: "broadcast",
      event: "media-state",
      payload: {
        from: state.clientId,
        username: state.username,
        camera: Boolean(state.cameraTrack),
        screen: Boolean(state.screenTrack),
        muted: Boolean(micTrack() && !micTrack().enabled)
      }
    });
  } catch (error) {
    console.warn("Falha ao enviar estado de mídia", error);
  }
}

function handleMediaState(payload) {
  if (!payload?.from || payload.from === state.clientId) return;
  state.peerNames.set(payload.from, payload.username || state.peerNames.get(payload.from) || "Usuário");
  const mediaState = { camera: Boolean(payload.camera), screen: Boolean(payload.screen), muted: Boolean(payload.muted) };
  state.remoteMediaStates.set(payload.from, mediaState);
  const peer = state.peers.get(payload.from);
  if (!peer) return;
  peer.remoteMedia = mediaState;
  makeRemoteCard(payload.from);
}

async function negotiatePeer(peerId) {
  const peer = state.peers.get(peerId);
  if (!peer || peer.pc.signalingState === "closed" || peer.makingOffer) return;
  const { pc } = peer;
  try {
    peer.makingOffer = true;
    if (pc.signalingState !== "stable") return;
    const offer = await pc.createOffer();
    if (pc.signalingState !== "stable") return;
    await pc.setLocalDescription(offer);
    await sendSignal(peerId, { description: pc.localDescription });
  } catch (error) {
    console.warn("Falha na negociação WebRTC", error);
  } finally {
    peer.makingOffer = false;
  }
}


async function restartPeerIce(peerId) {
  const peer = state.peers.get(peerId);
  if (!peer || peer.pc.signalingState === "closed") return;
  if (peer.restartCount >= 3) {
    if (!peer.warningShown) {
      peer.warningShown = true;
      toast("Não foi possível criar uma rota direta para um participante. Algumas redes exigem um servidor TURN.", 6000);
    }
    return;
  }

  if (peer.pc.signalingState !== "stable") {
    clearTimeout(peer.restartTimer);
    peer.restartTimer = setTimeout(() => restartPeerIce(peerId), 1200);
    return;
  }

  try {
    peer.restartCount += 1;
    peer.pc.restartIce();
    await negotiatePeer(peerId);
  } catch (error) {
    console.warn("Falha ao reiniciar ICE", error);
  }
}

function schedulePeerIceRestart(peerId, delay = 1200) {
  const peer = state.peers.get(peerId);
  if (!peer) return;
  clearTimeout(peer.restartTimer);
  peer.restartTimer = setTimeout(() => restartPeerIce(peerId), delay);
}
function createPeer(peerId) {
  if (state.peers.has(peerId)) return state.peers.get(peerId);
  if (!state.localStream) return null;

  const pc = new RTCPeerConnection({
    iceServers: getIceServers(),
    iceCandidatePoolSize: 6
  });

  const remoteStream = new MediaStream();
  const peer = {
    pc,
    remoteStream,
    audioSender: null,
    videoSender: null,
    makingOffer: false,
    ignoreOffer: false,
    isSettingRemoteAnswerPending: false,
    pendingCandidates: [],
    polite: state.clientId.localeCompare(peerId) > 0,
    remoteMedia: state.remoteMediaStates.get(peerId) || { camera: false, screen: false, muted: false },
    restartTimer: null,
    connectTimer: null,
    restartCount: 0,
    warningShown: false
  };
  state.peers.set(peerId, peer);

  const audioTrack = micTrack();
  if (audioTrack) {
    const audioTransceiver = pc.addTransceiver(audioTrack, {
      direction: "sendrecv",
      streams: [state.localStream]
    });
    peer.audioSender = audioTransceiver.sender;
  } else {
    const audioTransceiver = pc.addTransceiver("audio", { direction: "recvonly" });
    peer.audioSender = audioTransceiver.sender;
  }

  const videoTransceiver = pc.addTransceiver("video", { direction: "sendrecv" });
  peer.videoSender = videoTransceiver.sender;
  const existingVideo = currentVideoTrack();
  if (existingVideo) peer.videoSender.replaceTrack(existingVideo).catch(console.warn);

  pc.onicecandidate = ({ candidate }) => {
    if (candidate) sendSignal(peerId, { candidate: candidate.toJSON ? candidate.toJSON() : candidate });
  };

  pc.ontrack = (event) => {
    const track = event.track;
    if (!remoteStream.getTracks().some((existing) => existing.id === track.id)) remoteStream.addTrack(track);
    const refresh = () => makeRemoteCard(peerId);
    track.addEventListener("unmute", refresh);
    track.addEventListener("mute", refresh);
    track.addEventListener("ended", refresh);
    makeRemoteCard(peerId);
  };

  pc.onnegotiationneeded = () => negotiatePeer(peerId);

  pc.onconnectionstatechange = () => {
    updatePeerCardStatus(peerId);
    if (pc.connectionState === "connected") {
      clearTimeout(peer.restartTimer);
      clearTimeout(peer.connectTimer);
      peer.restartCount = 0;
      peer.warningShown = false;
      return;
    }
    if (pc.connectionState === "failed") schedulePeerIceRestart(peerId, 600);
    else if (pc.connectionState === "disconnected") schedulePeerIceRestart(peerId, 3500);
  };

  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === "failed") schedulePeerIceRestart(peerId, 600);
  };

  peer.connectTimer = setTimeout(() => {
    if (["new", "connecting"].includes(pc.connectionState)) schedulePeerIceRestart(peerId, 0);
  }, 12000);

  makeRemoteCard(peerId);
  updateCallStatus();
  return peer;
}

async function flushPendingCandidates(peer) {
  if (!peer.pc.remoteDescription) return;
  const pending = peer.pendingCandidates.splice(0);
  for (const candidate of pending) {
    try {
      await peer.pc.addIceCandidate(candidate);
    } catch (error) {
      if (!peer.ignoreOffer) console.warn("ICE candidate rejeitado", error);
    }
  }
}

async function handleSignal(payload) {
  if (!payload || payload.to !== state.clientId || payload.from === state.clientId || !state.voiceJoined) return;
  const peerId = payload.from;
  state.peerNames.set(peerId, payload.username || "Usuário");
  const peer = createPeer(peerId);
  if (!peer) return;
  const { pc } = peer;
  const { description, candidate } = payload.signal || {};

  try {
    if (description) {
      const readyForOffer = !peer.makingOffer && (pc.signalingState === "stable" || peer.isSettingRemoteAnswerPending);
      const offerCollision = description.type === "offer" && !readyForOffer;
      peer.ignoreOffer = !peer.polite && offerCollision;
      if (peer.ignoreOffer) return;

      peer.isSettingRemoteAnswerPending = description.type === "answer";
      if (offerCollision && peer.polite && pc.signalingState !== "stable") {
        try { await pc.setLocalDescription({ type: "rollback" }); } catch (_) {}
      }

      await pc.setRemoteDescription(description);
      peer.isSettingRemoteAnswerPending = false;
      await flushPendingCandidates(peer);

      if (description.type === "offer") {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal(peerId, { description: pc.localDescription });
      }
    } else if (candidate) {
      if (peer.ignoreOffer) return;
      if (pc.remoteDescription?.type) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (error) {
          if (!peer.ignoreOffer) throw error;
        }
      } else {
        peer.pendingCandidates.push(candidate);
      }
    }
  } catch (error) {
    peer.isSettingRemoteAnswerPending = false;
    console.error("Erro de sinalização WebRTC", error);
  }
}

function voicePresencePeers() {
  if (!state.voiceChannel) return [];
  const presence = state.voiceChannel.presenceState();
  const peers = [];
  for (const entries of Object.values(presence)) {
    for (const item of entries) {
      if (!item?.client_id || item.client_id === state.clientId) continue;
      state.peerNames.set(item.client_id, item.username || "Usuário");
      if (!peers.includes(item.client_id)) peers.push(item.client_id);
    }
  }
  return peers;
}

function syncVoicePeers() {
  if (!state.voiceJoined) return;
  const active = new Set(voicePresencePeers());
  active.forEach((peerId) => createPeer(peerId));
  for (const peerId of [...state.peers.keys()]) {
    if (!active.has(peerId)) closePeer(peerId);
  }
  updateCallStatus();
  if (active.size) broadcastMediaState();
}

function closePeer(peerId) {
  const peer = state.peers.get(peerId);
  if (!peer) return;
  clearTimeout(peer.restartTimer);
  clearTimeout(peer.connectTimer);
  peer.pc.ontrack = null;
  peer.pc.onicecandidate = null;
  peer.pc.onconnectionstatechange = null;
  peer.pc.oniceconnectionstatechange = null;
  peer.pc.onnegotiationneeded = null;
  try { peer.pc.close(); } catch (_) {}
  peer.remoteStream.getTracks().forEach((track) => track.stop());
  state.peers.delete(peerId);
  state.peerNames.delete(peerId);
  state.remoteMediaStates.delete(peerId);
  removeRemoteCard(peerId);
}

function setVoiceUi(mode) {
  const joined = mode === "joined";
  const connecting = mode === "connecting";
  ui.voiceIndicator.classList.toggle("connected", joined);
  ui.voiceIndicator.classList.toggle("connecting", connecting);
  ui.voiceStateText.textContent = joined ? "Voz conectada" : connecting ? "Conectando…" : "Voz desconectada";
  ui.joinVoiceBtn.disabled = joined || connecting || !state.supabase;
  ui.leaveVoiceBtn.disabled = !joined && !connecting;
  ui.muteBtn.disabled = !joined;
  ui.cameraBtn.disabled = !joined || state.cameraBusy || state.screenBusy || Boolean(state.screenTrack);
  ui.shareBtn.disabled = !joined || !screenShareSupported() || state.screenBusy || state.cameraBusy;
  if (!screenShareSupported()) ui.shareBtn.title = "Compartilhamento de tela não disponível neste navegador";
}

function waitForVoiceSubscription(channel, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Tempo limite ao conectar ao canal de voz"));
    }, timeoutMs);

    channel.subscribe((status) => {
      if (settled) return;
      if (status === "SUBSCRIBED") {
        settled = true;
        clearTimeout(timer);
        resolve();
      } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`Canal de voz: ${status}`));
      }
    });
  });
}

async function cleanupCancelledJoin(session, channel, stream) {
  try { await channel?.untrack(); } catch (_) {}
  if (channel && state.supabase) {
    try { await state.supabase.removeChannel(channel); } catch (_) {}
  }
  stream?.getTracks().forEach((track) => {
    try { track.stop(); } catch (_) {}
  });
  if (state.voiceSession === session) return;
  if (state.voiceChannel === channel) state.voiceChannel = null;
  if (state.localStream === stream) state.localStream = null;
}

async function joinVoice() {
  if (!state.supabase || !state.username || state.voiceJoined || state.joiningVoice) return;
  if (!window.isSecureContext) {
    toast("A chamada precisa de HTTPS. Abra a versão publicada no GitHub Pages.", 5000);
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === "undefined" || typeof MediaStream === "undefined") {
    toast("Seu navegador não oferece os recursos WebRTC necessários para esta chamada.", 5000);
    return;
  }

  const session = ++state.voiceSession;
  state.joiningVoice = true;
  setVoiceUi("connecting");
  closeDrawers();

  let stream = null;
  let channel = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) throw new Error("Nenhuma faixa de áudio foi fornecida pelo microfone");
    audioTrack.addEventListener("ended", () => {
      if (session !== state.voiceSession || !state.voiceJoined) return;
      toast("O microfone foi desconectado. Saindo da chamada.", 5000);
      leaveVoice().catch((error) => console.warn("Falha ao sair após perda do microfone", error));
    }, { once: true });

    if (session !== state.voiceSession || !state.joiningVoice) {
      await cleanupCancelledJoin(session, channel, stream);
      return;
    }

    state.localStream = stream;
    channel = state.supabase.channel(`voice-${state.voiceRoom}`, {
      config: {
        broadcast: { self: false, ack: true },
        presence: { key: state.clientId }
      }
    });
    state.voiceChannel = channel;

    channel
      .on("broadcast", { event: "signal" }, ({ payload }) => {
        if (session === state.voiceSession) handleSignal(payload);
      })
      .on("broadcast", { event: "media-state" }, ({ payload }) => {
        if (session === state.voiceSession) handleMediaState(payload);
      })
      .on("presence", { event: "sync" }, () => {
        if (session === state.voiceSession) syncVoicePeers();
      })
      .on("presence", { event: "join" }, () => {
        if (session === state.voiceSession) syncVoicePeers();
      })
      .on("presence", { event: "leave" }, () => {
        if (session === state.voiceSession) syncVoicePeers();
      });

    await waitForVoiceSubscription(channel);
    if (session !== state.voiceSession || !state.joiningVoice) {
      await cleanupCancelledJoin(session, channel, stream);
      return;
    }

    state.voiceJoined = true;
    await channel.track({
      client_id: state.clientId,
      username: state.username,
      joined_at: new Date().toISOString()
    });

    if (session !== state.voiceSession || !state.voiceJoined) {
      await cleanupCancelledJoin(session, channel, stream);
      return;
    }

    setVoiceUi("joined");
    ensureLocalCard();
    syncVoicePeers();
    await broadcastMediaState();
    toast("Você entrou no canal de voz Geral.");
  } catch (error) {
    if (session !== state.voiceSession) {
      await cleanupCancelledJoin(session, channel, stream);
      return;
    }

    console.error(error);
    if (channel && state.supabase) {
      try { await state.supabase.removeChannel(channel); } catch (_) {}
    }
    if (state.voiceChannel === channel) state.voiceChannel = null;
    stream?.getTracks().forEach((track) => {
      try { track.stop(); } catch (_) {}
    });
    if (state.localStream === stream) state.localStream = null;
    state.voiceJoined = false;
    toast(error?.name === "NotAllowedError"
      ? "Permita o acesso ao microfone para entrar na chamada."
      : "Não foi possível conectar à chamada. Tente novamente.", 5000);
    setVoiceUi("idle");
  } finally {
    if (session === state.voiceSession) {
      state.joiningVoice = false;
      setVoiceUi(state.voiceJoined ? "joined" : "idle");
    }
  }
}

async function leaveVoice() {
  if (!state.voiceJoined && !state.joiningVoice && !state.voiceChannel && !state.localStream) return;

  ++state.voiceSession;
  state.voiceJoined = false;
  state.joiningVoice = false;
  state.cameraBusy = false;
  state.screenBusy = false;

  const channel = state.voiceChannel;
  const localStream = state.localStream;
  const cameraTrack = state.cameraTrack;
  const screenTrack = state.screenTrack;
  state.voiceChannel = null;
  state.localStream = null;
  state.cameraTrack = null;
  state.screenTrack = null;

  if (screenTrack) screenTrack.onended = null;
  for (const peerId of [...state.peers.keys()]) closePeer(peerId);

  if (channel && state.supabase) {
    try { await channel.untrack(); } catch (_) {}
    try { await state.supabase.removeChannel(channel); } catch (_) {}
  }

  localStream?.getTracks().forEach((track) => {
    try { track.stop(); } catch (_) {}
  });
  if (cameraTrack && cameraTrack.readyState !== "ended") {
    try { cameraTrack.stop(); } catch (_) {}
  }
  if (screenTrack && screenTrack.readyState !== "ended") {
    try { screenTrack.stop(); } catch (_) {}
  }

  ui.muteBtn.textContent = "🎙";
  ui.muteBtn.title = "Silenciar microfone";
  ui.muteBtn.classList.remove("active");
  ui.cameraBtn.classList.remove("active");
  ui.cameraBtn.title = "Ligar câmera";
  ui.shareBtn.classList.remove("active");
  ui.shareBtn.title = screenShareSupported() ? "Compartilhar tela" : "Compartilhamento de tela não disponível neste navegador";
  ui.mediaGrid.replaceChildren();
  ui.mediaStage.classList.add("hidden");
  updateCallStatus();
  setVoiceUi("idle");
}

async function replaceVideoForPeers(track) {
  const jobs = [];
  for (const peer of state.peers.values()) {
    if (peer.videoSender) jobs.push(peer.videoSender.replaceTrack(track || null));
  }
  await Promise.allSettled(jobs);
}

async function toggleMute() {
  const track = micTrack();
  if (!track) return;
  track.enabled = !track.enabled;
  ui.muteBtn.classList.toggle("active", !track.enabled);
  ui.muteBtn.textContent = track.enabled ? "🎙" : "🔇";
  ui.muteBtn.title = track.enabled ? "Silenciar microfone" : "Ativar microfone";
  await broadcastMediaState();
}

async function toggleCamera() {
  if (!state.voiceJoined || state.cameraBusy || state.screenBusy) return;
  if (state.screenTrack) {
    toast("Pare o compartilhamento de tela antes de alterar a câmera.");
    return;
  }

  const session = state.voiceSession;
  state.cameraBusy = true;
  setVoiceUi("joined");

  try {
    if (state.cameraTrack) {
      const old = state.cameraTrack;
      state.cameraTrack = null;
      await replaceVideoForPeers(null);
      if (old.readyState !== "ended") old.stop();
      ui.cameraBtn.classList.remove("active");
      ui.cameraBtn.title = "Ligar câmera";
      ensureLocalCard();
      await broadcastMediaState();
      return;
    }

    const camStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: "user"
      },
      audio: false
    });
    const track = camStream.getVideoTracks()[0];
    if (!track) throw new Error("Nenhuma faixa de vídeo foi fornecida pela câmera");

    if (!state.voiceJoined || session !== state.voiceSession || state.screenTrack) {
      camStream.getTracks().forEach((item) => item.stop());
      return;
    }

    state.cameraTrack = track;
    if ("contentHint" in track) track.contentHint = "motion";
    track.addEventListener("ended", () => {
      if (state.cameraTrack !== track) return;
      state.cameraTrack = null;
      const keepScreen = Boolean(state.screenTrack);
      Promise.resolve(keepScreen ? undefined : replaceVideoForPeers(null))
        .then(() => {
          ui.cameraBtn.classList.remove("active");
          ui.cameraBtn.title = "Ligar câmera";
          if (state.voiceJoined) ensureLocalCard();
          return state.voiceJoined ? broadcastMediaState() : undefined;
        })
        .catch((error) => console.warn("Falha ao tratar encerramento da câmera", error))
        .finally(() => setVoiceUi(state.voiceJoined ? "joined" : "idle"));
    }, { once: true });

    await replaceVideoForPeers(track);
    if (!state.voiceJoined || session !== state.voiceSession || state.cameraTrack !== track) {
      if (track.readyState !== "ended") track.stop();
      return;
    }

    ui.cameraBtn.classList.add("active");
    ui.cameraBtn.title = "Desligar câmera";
    ensureLocalCard();
    await broadcastMediaState();
  } catch (error) {
    console.error(error);
    if (state.voiceJoined && session === state.voiceSession) {
      toast(error?.name === "NotAllowedError"
        ? "Permita o acesso à câmera."
        : "Não foi possível acessar a câmera.");
    }
  } finally {
    if (session === state.voiceSession) {
      state.cameraBusy = false;
      setVoiceUi(state.voiceJoined ? "joined" : "idle");
    }
  }
}

async function stopScreenShare(stopTrack = true, expectedTrack = null) {
  const old = state.screenTrack;
  if (!old || (expectedTrack && old !== expectedTrack)) return;

  state.screenTrack = null;
  old.onended = null;
  if (state.voiceJoined) await replaceVideoForPeers(state.cameraTrack || null);
  if (stopTrack && old.readyState !== "ended") {
    try { old.stop(); } catch (_) {}
  }
  ui.shareBtn.classList.remove("active");
  ui.shareBtn.title = "Compartilhar tela";
  if (state.voiceJoined) {
    ensureLocalCard();
    await broadcastMediaState();
  }
}

async function toggleScreenShare() {
  if (!state.voiceJoined || state.screenBusy || state.cameraBusy) return;
  if (!screenShareSupported()) {
    toast("Este navegador não permite compartilhar a tela. No computador, use Chrome ou Edge atualizado.", 5000);
    return;
  }

  const session = state.voiceSession;
  state.screenBusy = true;
  setVoiceUi("joined");

  try {
    if (state.screenTrack) {
      await stopScreenShare(true);
      return;
    }

    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 30, max: 30 } },
      audio: false
    });
    const track = screen.getVideoTracks()[0];
    if (!track) throw new Error("Nenhuma faixa de vídeo foi fornecida pelo compartilhamento de tela");

    if (!state.voiceJoined || session !== state.voiceSession) {
      screen.getTracks().forEach((item) => item.stop());
      return;
    }

    state.screenTrack = track;
    if ("contentHint" in track) track.contentHint = "detail";
    track.onended = () => {
      if (state.screenTrack !== track) return;
      state.screenBusy = true;
      setVoiceUi(state.voiceJoined ? "joined" : "idle");
      stopScreenShare(false, track)
        .catch((error) => console.warn("Falha ao encerrar compartilhamento de tela", error))
        .finally(() => {
          if (session === state.voiceSession) {
            state.screenBusy = false;
            setVoiceUi(state.voiceJoined ? "joined" : "idle");
          }
        });
    };

    await replaceVideoForPeers(track);
    if (!state.voiceJoined || session !== state.voiceSession || state.screenTrack !== track) {
      track.onended = null;
      if (track.readyState !== "ended") track.stop();
      return;
    }

    ui.shareBtn.classList.add("active");
    ui.shareBtn.title = "Parar compartilhamento";
    ensureLocalCard();
    await broadcastMediaState();
  } catch (error) {
    if (error?.name !== "NotAllowedError" && error?.name !== "AbortError") {
      console.error(error);
      if (state.voiceJoined && session === state.voiceSession) toast("Não foi possível iniciar o compartilhamento de tela.");
    }
  } finally {
    if (session === state.voiceSession) {
      state.screenBusy = false;
      setVoiceUi(state.voiceJoined ? "joined" : "idle");
    }
  }
}

ui.joinVoiceBtn.addEventListener("click", joinVoice);
ui.leaveVoiceBtn.addEventListener("click", leaveVoice);
ui.muteBtn.addEventListener("click", toggleMute);
ui.cameraBtn.addEventListener("click", toggleCamera);
ui.shareBtn.addEventListener("click", toggleScreenShare);

window.addEventListener("pagehide", () => {
  ++state.voiceSession;
  state.voiceJoined = false;
  state.joiningVoice = false;
  for (const peerId of [...state.peers.keys()]) closePeer(peerId);

  try { state.voiceChannel?.untrack(); } catch (_) {}
  try { state.presenceChannel?.untrack(); } catch (_) {}
  try { if (state.voiceChannel && state.supabase) state.supabase.removeChannel(state.voiceChannel); } catch (_) {}

  state.localStream?.getTracks().forEach((track) => { try { track.stop(); } catch (_) {} });
  if (state.cameraTrack?.readyState !== "ended") { try { state.cameraTrack?.stop(); } catch (_) {} }
  if (state.screenTrack) {
    state.screenTrack.onended = null;
    if (state.screenTrack.readyState !== "ended") { try { state.screenTrack.stop(); } catch (_) {} }
  }
});

async function boot() {
  setProfileUI();
  requireUsername();
  setVoiceUi("idle");

  if (!isConfigured) {
    ui.setupBanner.classList.remove("hidden");
    ui.backendStatus.classList.add("error");
    ui.connectionText.textContent = "Configuração pendente";
    return;
  }

  try {
    state.supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY, {
      realtime: { params: { eventsPerSecond: 20 } }
    });
    ui.messageInput.disabled = false;
    ui.sendBtn.disabled = false;
    ui.backendStatus.classList.remove("online", "error");
    ui.connectionText.textContent = "Conectando ao Supabase…";
    setVoiceUi("idle");
    await startPresence();
    await switchRoom(state.currentRoom);
  } catch (error) {
    console.error(error);
    ui.backendStatus.classList.add("error");
    ui.connectionText.textContent = "Erro de conexão";
    toast("Erro ao iniciar. Confira config.js e o projeto Supabase.", 6000);
  }
}

boot();
