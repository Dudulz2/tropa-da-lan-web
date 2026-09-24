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
  welcomeTitle: $("#welcomeTitle"),
  membersList: $("#membersList"),
  onlineCount: $("#onlineCount"),
  membersPanel: $("#membersPanel"),
  mobileMembersBtn: $("#mobileMembersBtn"),
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
  toast: $("#toast")
};

const roomDescriptions = {
  "geral": "Conversa geral da Tropa",
  "jogos": "Jogos, partidas e calls",
  "off-topic": "Assuntos aleatórios"
};

const state = {
  supabase: null,
  currentRoom: "geral",
  username: localStorage.getItem("tropa_username") || "",
  clientId: sessionStorage.getItem("tropa_client_id") || crypto.randomUUID(),
  chatChannel: null,
  presenceChannel: null,
  voiceChannel: null,
  voiceRoom: "geral",
  voiceJoined: false,
  localStream: null,
  cameraTrack: null,
  screenTrack: null,
  peers: new Map(),
  peerNames: new Map(),
  renderedMessages: new Set()
};
sessionStorage.setItem("tropa_client_id", state.clientId);

function toast(message, ms = 3200) {
  ui.toast.textContent = message;
  ui.toast.classList.remove("hidden");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => ui.toast.classList.add("hidden"), ms);
}

function initials(name = "TL") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "TL";
}

function setProfileUI() {
  const name = state.username || "Visitante";
  ui.profileName.textContent = name;
  ui.profileAvatar.textContent = initials(name);
  ui.profileId.textContent = isConfigured ? `#${state.clientId.slice(0, 6)}` : "configure o Supabase";
}

function requireUsername() {
  if (!state.username) {
    ui.usernameInput.value = "";
    ui.profileDialog.showModal();
  }
}

ui.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const next = ui.usernameInput.value.trim().replace(/\s+/g, " ");
  if (next.length < 2) return;
  state.username = next.slice(0, 24);
  localStorage.setItem("tropa_username", state.username);
  setProfileUI();
  ui.profileDialog.close();
  if (state.presenceChannel) trackPresence();
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

async function loadMessages() {
  resetMessages();
  if (!state.supabase) return;
  const { data, error } = await state.supabase
    .from("messages")
    .select("id, room, username, content, client_id, created_at")
    .eq("room", state.currentRoom)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error(error);
    toast("Não consegui carregar o chat. Confira se você executou o arquivo supabase.sql.", 5000);
    return;
  }
  [...(data || [])].reverse().forEach(renderMessage);
}

async function subscribeChat() {
  if (!state.supabase) return;
  if (state.chatChannel) await state.supabase.removeChannel(state.chatChannel);

  state.chatChannel = state.supabase
    .channel(`chat-db-${state.currentRoom}-${state.clientId}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `room=eq.${state.currentRoom}`
    }, (payload) => renderMessage(payload.new))
    .subscribe();
}

async function switchRoom(room) {
  state.currentRoom = room;
  $$(".channel-item[data-room]").forEach((button) => button.classList.toggle("active", button.dataset.room === room));
  ui.activeRoomTitle.textContent = room;
  ui.activeRoomSubtitle.textContent = roomDescriptions[room] || "Canal de texto";
  ui.messageInput.placeholder = `Conversar em #${room}`;
  await loadMessages();
  await subscribeChat();
}

$$(".channel-item[data-room]").forEach((button) => {
  button.addEventListener("click", () => switchRoom(button.dataset.room));
});

ui.messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.supabase || !state.username) return;
  const content = ui.messageInput.value.trim();
  if (!content) return;
  ui.messageInput.value = "";

  const { error } = await state.supabase.from("messages").insert({
    room: state.currentRoom,
    username: state.username,
    content: content.slice(0, 1000),
    client_id: state.clientId
  });
  if (error) {
    console.error(error);
    toast("Não foi possível enviar a mensagem.");
    ui.messageInput.value = content;
  }
});

async function trackPresence() {
  if (!state.presenceChannel || !state.username) return;
  await state.presenceChannel.track({
    client_id: state.clientId,
    username: state.username,
    online_at: new Date().toISOString()
  });
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
  state.presenceChannel = state.supabase.channel("tropa-presence", {
    config: { presence: { key: state.clientId } }
  });
  state.presenceChannel
    .on("presence", { event: "sync" }, renderPresence)
    .on("presence", { event: "join" }, renderPresence)
    .on("presence", { event: "leave" }, renderPresence)
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") await trackPresence();
    });
}

function currentVideoTrack() {
  return state.screenTrack || state.cameraTrack || null;
}

function ensureLocalCard() {
  let card = document.getElementById("media-local");
  if (!card) {
    card = document.createElement("div");
    card.className = "media-card audio-only";
    card.id = "media-local";
    card.dataset.initials = initials(state.username);
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    const label = document.createElement("span");
    label.className = "media-label";
    label.textContent = `${state.username} (você)`;
    card.append(video, label);
    ui.mediaGrid.prepend(card);
  }
  const video = card.querySelector("video");
  const videoTrack = currentVideoTrack();
  const stream = new MediaStream();
  if (videoTrack) stream.addTrack(videoTrack);
  if (state.localStream?.getAudioTracks()[0]) stream.addTrack(state.localStream.getAudioTracks()[0]);
  video.srcObject = stream;
  card.classList.toggle("audio-only", !videoTrack);
  ui.mediaStage.classList.remove("hidden");
}

function makeRemoteCard(peerId, stream) {
  let card = document.getElementById(`media-${peerId}`);
  if (!card) {
    card = document.createElement("div");
    card.id = `media-${peerId}`;
    card.className = "media-card audio-only";
    card.dataset.initials = initials(state.peerNames.get(peerId) || "TL");
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    const label = document.createElement("span");
    label.className = "media-label";
    label.textContent = state.peerNames.get(peerId) || "Usuário";
    card.append(video, label);
    ui.mediaGrid.appendChild(card);
  }
  const video = card.querySelector("video");
  video.srcObject = stream;
  const hasVideo = stream.getVideoTracks().some((track) => track.readyState === "live");
  card.classList.toggle("audio-only", !hasVideo);
  card.dataset.initials = initials(state.peerNames.get(peerId) || "TL");
  card.querySelector(".media-label").textContent = state.peerNames.get(peerId) || "Usuário";
  ui.mediaStage.classList.remove("hidden");
}

function updateRemoteCard(peerId) {
  const peer = state.peers.get(peerId);
  if (!peer) return;
  makeRemoteCard(peerId, peer.remoteStream);
}

function removeRemoteCard(peerId) {
  document.getElementById(`media-${peerId}`)?.remove();
  if (!state.voiceJoined && ui.mediaGrid.children.length === 0) ui.mediaStage.classList.add("hidden");
}

function createPeer(peerId) {
  if (state.peers.has(peerId)) return state.peers.get(peerId);

  const pc = new RTCPeerConnection({
    iceServers: Array.isArray(cfg.ICE_SERVERS) && cfg.ICE_SERVERS.length ? cfg.ICE_SERVERS : [{ urls: "stun:stun.l.google.com:19302" }]
  });
  const remoteStream = new MediaStream();
  const peer = { pc, remoteStream, makingOffer: false, ignoreOffer: false, polite: state.clientId > peerId };
  state.peers.set(peerId, peer);

  state.localStream?.getAudioTracks().forEach((track) => pc.addTrack(track, state.localStream));
  const videoTrack = currentVideoTrack();
  if (videoTrack) pc.addTrack(videoTrack, new MediaStream([videoTrack]));

  pc.onicecandidate = ({ candidate }) => {
    if (candidate) sendSignal(peerId, { candidate });
  };

  pc.ontrack = (event) => {
    event.streams[0]?.getTracks().forEach((track) => {
      if (!remoteStream.getTracks().some((existing) => existing.id === track.id)) remoteStream.addTrack(track);
      track.addEventListener("ended", () => updateRemoteCard(peerId));
    });
    makeRemoteCard(peerId, remoteStream);
  };

  pc.onconnectionstatechange = () => {
    if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
      if (pc.connectionState === "failed") pc.restartIce?.();
      if (pc.connectionState === "closed") removeRemoteCard(peerId);
    }
  };

  pc.onnegotiationneeded = async () => {
    try {
      peer.makingOffer = true;
      await pc.setLocalDescription();
      await sendSignal(peerId, { description: pc.localDescription });
    } catch (error) {
      console.warn("Falha na negociação WebRTC", error);
    } finally {
      peer.makingOffer = false;
    }
  };

  return peer;
}

async function sendSignal(to, signal) {
  if (!state.voiceChannel) return;
  await state.voiceChannel.send({
    type: "broadcast",
    event: "signal",
    payload: { from: state.clientId, to, username: state.username, signal }
  });
}

async function handleSignal(payload) {
  if (!payload || payload.to !== state.clientId || payload.from === state.clientId) return;
  const peerId = payload.from;
  state.peerNames.set(peerId, payload.username || "Usuário");
  const peer = createPeer(peerId);
  const { pc } = peer;
  const { description, candidate } = payload.signal || {};

  try {
    if (description) {
      const offerCollision = description.type === "offer" && (peer.makingOffer || pc.signalingState !== "stable");
      peer.ignoreOffer = !peer.polite && offerCollision;
      if (peer.ignoreOffer) return;

      await pc.setRemoteDescription(description);
      if (description.type === "offer") {
        await pc.setLocalDescription();
        await sendSignal(peerId, { description: pc.localDescription });
      }
    } else if (candidate) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (error) {
        if (!peer.ignoreOffer) throw error;
      }
    }
  } catch (error) {
    console.error("Erro de sinalização", error);
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
  const active = new Set(voicePresencePeers());
  active.forEach((peerId) => createPeer(peerId));
  for (const peerId of state.peers.keys()) {
    if (!active.has(peerId)) closePeer(peerId);
  }
}

function closePeer(peerId) {
  const peer = state.peers.get(peerId);
  if (!peer) return;
  peer.pc.ontrack = null;
  peer.pc.onicecandidate = null;
  peer.pc.close();
  state.peers.delete(peerId);
  state.peerNames.delete(peerId);
  removeRemoteCard(peerId);
}

async function joinVoice() {
  if (!state.supabase || !state.username || state.voiceJoined) return;
  try {
    state.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (error) {
    console.error(error);
    toast("Permita o acesso ao microfone para entrar na chamada.", 5000);
    return;
  }

  state.voiceChannel = state.supabase.channel(`voice-${state.voiceRoom}`, {
    config: {
      broadcast: { self: false },
      presence: { key: state.clientId }
    }
  });

  state.voiceChannel
    .on("broadcast", { event: "signal" }, ({ payload }) => handleSignal(payload))
    .on("presence", { event: "sync" }, syncVoicePeers)
    .on("presence", { event: "join" }, syncVoicePeers)
    .on("presence", { event: "leave" }, syncVoicePeers)
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await state.voiceChannel.track({ client_id: state.clientId, username: state.username });
        syncVoicePeers();
      }
    });

  state.voiceJoined = true;
  ui.voiceIndicator.classList.add("connected");
  ui.voiceStateText.textContent = "Voz conectada";
  ui.joinVoiceBtn.disabled = true;
  ui.leaveVoiceBtn.disabled = false;
  ui.muteBtn.disabled = false;
  ui.cameraBtn.disabled = false;
  ui.shareBtn.disabled = false;
  ensureLocalCard();
  toast("Você entrou no canal de voz Geral.");
}

async function leaveVoice() {
  if (!state.voiceJoined) return;
  for (const peerId of [...state.peers.keys()]) closePeer(peerId);
  if (state.voiceChannel && state.supabase) {
    try { await state.voiceChannel.untrack(); } catch (_) {}
    await state.supabase.removeChannel(state.voiceChannel);
  }
  state.voiceChannel = null;
  state.localStream?.getTracks().forEach((track) => track.stop());
  state.cameraTrack?.stop();
  state.screenTrack?.stop();
  state.localStream = null;
  state.cameraTrack = null;
  state.screenTrack = null;
  state.voiceJoined = false;

  ui.voiceIndicator.classList.remove("connected");
  ui.voiceStateText.textContent = "Voz desconectada";
  ui.joinVoiceBtn.disabled = false;
  ui.leaveVoiceBtn.disabled = true;
  ui.muteBtn.disabled = true;
  ui.cameraBtn.disabled = true;
  ui.shareBtn.disabled = true;
  ui.muteBtn.classList.remove("active");
  ui.cameraBtn.classList.remove("active");
  ui.shareBtn.classList.remove("active");
  ui.mediaGrid.replaceChildren();
  ui.mediaStage.classList.add("hidden");
}

async function replaceVideoForPeers(track) {
  for (const { pc } of state.peers.values()) {
    const sender = pc.getSenders().find((s) => s.track?.kind === "video" || (!s.track && s.__tropaVideo));
    if (sender) {
      sender.__tropaVideo = true;
      await sender.replaceTrack(track || null);
    } else if (track) {
      const newSender = pc.addTrack(track, new MediaStream([track]));
      newSender.__tropaVideo = true;
    }
  }
}

async function toggleMute() {
  const track = state.localStream?.getAudioTracks()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  ui.muteBtn.classList.toggle("active", !track.enabled);
  ui.muteBtn.textContent = track.enabled ? "🎙" : "🔇";
}

async function toggleCamera() {
  if (!state.voiceJoined) return;
  if (state.screenTrack) {
    toast("Pare o compartilhamento de tela antes de alterar a câmera.");
    return;
  }

  if (state.cameraTrack) {
    state.cameraTrack.stop();
    state.cameraTrack = null;
    await replaceVideoForPeers(null);
    ui.cameraBtn.classList.remove("active");
    ensureLocalCard();
    return;
  }

  try {
    const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
    state.cameraTrack = camStream.getVideoTracks()[0];
    state.cameraTrack.addEventListener("ended", async () => {
      state.cameraTrack = null;
      await replaceVideoForPeers(null);
      ui.cameraBtn.classList.remove("active");
      ensureLocalCard();
    }, { once: true });
    await replaceVideoForPeers(state.cameraTrack);
    ui.cameraBtn.classList.add("active");
    ensureLocalCard();
  } catch (error) {
    console.error(error);
    toast("Não foi possível acessar a câmera.");
  }
}

async function stopScreenShare() {
  if (!state.screenTrack) return;
  const old = state.screenTrack;
  state.screenTrack = null;
  old.onended = null;
  old.stop();
  await replaceVideoForPeers(state.cameraTrack || null);
  ui.shareBtn.classList.remove("active");
  ensureLocalCard();
}

async function toggleScreenShare() {
  if (!state.voiceJoined) return;
  if (state.screenTrack) {
    await stopScreenShare();
    return;
  }
  try {
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    state.screenTrack = screen.getVideoTracks()[0];
    state.screenTrack.onended = () => stopScreenShare();
    await replaceVideoForPeers(state.screenTrack);
    ui.shareBtn.classList.add("active");
    ensureLocalCard();
  } catch (error) {
    if (error?.name !== "NotAllowedError") console.error(error);
  }
}

ui.joinVoiceBtn.addEventListener("click", joinVoice);
ui.leaveVoiceBtn.addEventListener("click", leaveVoice);
ui.muteBtn.addEventListener("click", toggleMute);
ui.cameraBtn.addEventListener("click", toggleCamera);
ui.shareBtn.addEventListener("click", toggleScreenShare);
ui.mobileMembersBtn.addEventListener("click", () => ui.membersPanel.classList.toggle("open"));

window.addEventListener("beforeunload", () => {
  state.localStream?.getTracks().forEach((track) => track.stop());
  state.cameraTrack?.stop();
  state.screenTrack?.stop();
});

async function boot() {
  setProfileUI();
  requireUsername();

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
    ui.joinVoiceBtn.disabled = false;
    ui.backendStatus.classList.add("online");
    ui.connectionText.textContent = "Conectado ao Supabase";
    await startPresence();
    await loadMessages();
    await subscribeChat();
  } catch (error) {
    console.error(error);
    ui.backendStatus.classList.add("error");
    ui.connectionText.textContent = "Erro de conexão";
    toast("Erro ao iniciar. Confira config.js e o projeto Supabase.", 6000);
  }
}

boot();
