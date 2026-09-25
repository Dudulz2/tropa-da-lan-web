import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const cfg = window.TROPA_CONFIG || {};
const isConfigured = Boolean(
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_PUBLISHABLE_KEY &&
  !cfg.SUPABASE_URL.includes("SEU-PROJETO") &&
  !cfg.SUPABASE_PUBLISHABLE_KEY.includes("COLE_SUA_CHAVE")
);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ui = {
  setupBanner: $("#setupBanner"), authScreen: $("#authScreen"), appShell: $("#appShell"),
  loginTab: $("#loginTab"), registerTab: $("#registerTab"), loginForm: $("#loginForm"), registerForm: $("#registerForm"),
  loginEmail: $("#loginEmail"), loginPassword: $("#loginPassword"), loginBtn: $("#loginBtn"), forgotPasswordBtn: $("#forgotPasswordBtn"),
  registerEmail: $("#registerEmail"), registerUsername: $("#registerUsername"), registerPassword: $("#registerPassword"), registerPassword2: $("#registerPassword2"), registerBtn: $("#registerBtn"),
  invitePreviewAuth: $("#invitePreviewAuth"),
  serversRail: $("#serversRail"), serverButtons: $("#serverButtons"), createServerBtn: $("#createServerBtn"), joinServerBtn: $("#joinServerBtn"),
  emptyCreateServerBtn: $("#emptyCreateServerBtn"), emptyJoinServerBtn: $("#emptyJoinServerBtn"), homeServerBtn: $("#homeServerBtn"),
  channelsPanel: $("#channelsPanel"), activeServerName: $("#activeServerName"), serverMenuBtn: $("#serverMenuBtn"), closeNavBtn: $("#closeNavBtn"),
  serverQuickMenu: $("#serverQuickMenu"), quickInviteBtn: $("#quickInviteBtn"), quickCreateChannelBtn: $("#quickCreateChannelBtn"), quickSettingsBtn: $("#quickSettingsBtn"), quickNicknameBtn: $("#quickNicknameBtn"), quickEventsBtn: $("#quickEventsBtn"), quickLeaveServerBtn: $("#quickLeaveServerBtn"),
  channelList: $("#channelList"), profileButton: $("#profileButton"), profileSettingsBtn: $("#profileSettingsBtn"), logoutBtn: $("#logoutBtn"),
  profileAvatar: $("#profileAvatar"), profileName: $("#profileName"), profileUsername: $("#profileUsername"),
  mobileMenuBtn: $("#mobileMenuBtn"), mobileMembersBtn: $("#mobileMembersBtn"), closeMembersBtn: $("#closeMembersBtn"), drawerBackdrop: $("#drawerBackdrop"),
  activeChannelIcon: $("#activeChannelIcon"), activeChannelName: $("#activeChannelName"), activeChannelTopic: $("#activeChannelTopic"), connectionText: $("#connectionText"),
  topbarSearchInput: $("#topbarSearchInput"), pinnedMessagesBtn: $("#pinnedMessagesBtn"), notificationsBtn: $("#notificationsBtn"), friendsBtn: $("#friendsBtn"), appearanceBtn: $("#appearanceBtn"),
  homeHub: $("#homeHub"), contentArea: $(".content-area"), friendRequestCount: $("#friendRequestCount"), friendRequestsList: $("#friendRequestsList"), friendsCount: $("#friendsCount"), friendsList: $("#friendsList"), dmContactsList: $("#dmContactsList"), addFriendBtn: $("#addFriendBtn"),
  dmEmpty: $("#dmEmpty"), dmConversation: $("#dmConversation"), dmBackBtn: $("#dmBackBtn"), dmAvatar: $("#dmAvatar"), dmName: $("#dmName"), dmStatus: $("#dmStatus"), dmMessages: $("#dmMessages"), dmForm: $("#dmForm"), dmInput: $("#dmInput"), dmAttachBtn: $("#dmAttachBtn"), dmFileInput: $("#dmFileInput"),
  emptyState: $("#emptyState"), messages: $("#messages"), composerWrap: $("#composerWrap"), messageForm: $("#messageForm"), messageInput: $("#messageInput"), sendBtn: $("#sendBtn"), attachBtn: $("#attachBtn"), messageFileInput: $("#messageFileInput"), attachmentPreview: $("#attachmentPreview"), replyBar: $("#replyBar"), replyLabel: $("#replyLabel"), replyPreview: $("#replyPreview"), cancelReplyBtn: $("#cancelReplyBtn"), editBar: $("#editBar"), cancelEditBtn: $("#cancelEditBtn"), typingIndicator: $("#typingIndicator"), quickPollBtn: $("#quickPollBtn"),
  membersPanel: $("#membersPanel"), membersList: $("#membersList"), membersSearchInput: $("#membersSearchInput"),
  voiceDock: $("#voiceDock"), voiceIndicator: $("#voiceIndicator"), voiceStateText: $("#voiceStateText"), voiceRoomLabel: $("#voiceRoomLabel"),
  leaveVoiceBtn: $("#leaveVoiceBtn"), muteBtn: $("#muteBtn"), deafenBtn: $("#deafenBtn"), cameraBtn: $("#cameraBtn"), shareBtn: $("#shareBtn"),
  mediaStage: $("#mediaStage"), mediaStageTitle: $("#mediaStageTitle"), callStatusText: $("#callStatusText"), mediaGrid: $("#mediaGrid"), collapseMediaBtn: $("#collapseMediaBtn"),
  profileDialog: $("#profileDialog"), profileForm: $("#profileForm"), profileAvatarPreview: $("#profileAvatarPreview"), avatarFileInput: $("#avatarFileInput"),
  displayNameInput: $("#displayNameInput"), profileUsernameInput: $("#profileUsernameInput"), customStatusInput: $("#customStatusInput"), bioInput: $("#bioInput"), saveProfileBtn: $("#saveProfileBtn"),
  serverDialog: $("#serverDialog"), serverForm: $("#serverForm"), serverNameInput: $("#serverNameInput"),
  joinServerDialog: $("#joinServerDialog"), joinServerForm: $("#joinServerForm"), joinInviteInput: $("#joinInviteInput"), joinInvitePreview: $("#joinInvitePreview"), acceptInviteBtn: $("#acceptInviteBtn"),
  inviteDialog: $("#inviteDialog"), inviteDialogTitle: $("#inviteDialogTitle"), inviteExpiry: $("#inviteExpiry"), inviteMaxUses: $("#inviteMaxUses"), generateInviteBtn: $("#generateInviteBtn"), inviteResult: $("#inviteResult"), inviteLinkOutput: $("#inviteLinkOutput"), copyInviteBtn: $("#copyInviteBtn"),
  channelDialog: $("#channelDialog"), channelForm: $("#channelForm"), channelNameInput: $("#channelNameInput"), channelTopicInput: $("#channelTopicInput"), channelTopicLabel: $("#channelTopicLabel"),
  serverSettingsDialog: $("#serverSettingsDialog"), settingsServerName: $("#settingsServerName"), settingsOverviewPane: $("#settingsOverviewPane"), settingsRolesPane: $("#settingsRolesPane"), settingsMembersPane: $("#settingsMembersPane"),
  serverIconPreview: $("#serverIconPreview"), serverIconFileInput: $("#serverIconFileInput"), settingsServerNameInput: $("#settingsServerNameInput"), settingsServerDescription: $("#settingsServerDescription"), saveServerOverviewBtn: $("#saveServerOverviewBtn"), deleteServerBtn: $("#deleteServerBtn"),
  rolesList: $("#rolesList"), newRoleBtn: $("#newRoleBtn"), roleEditor: $("#roleEditor"), roleEditorTitle: $("#roleEditorTitle"), deleteRoleBtn: $("#deleteRoleBtn"), roleNameInput: $("#roleNameInput"), roleColorInput: $("#roleColorInput"), roleColorText: $("#roleColorText"), rolePermissions: $("#rolePermissions"),
  settingsMemberCount: $("#settingsMemberCount"), settingsMembersList: $("#settingsMembersList"),
  settingsEventsPane: $("#settingsEventsPane"), settingsModerationPane: $("#settingsModerationPane"), eventsList: $("#eventsList"), newEventBtn: $("#newEventBtn"), bansList: $("#bansList"), auditLogList: $("#auditLogList"),
  forgotPasswordDialog: $("#forgotPasswordDialog"), forgotPasswordForm: $("#forgotPasswordForm"), forgotEmailInput: $("#forgotEmailInput"), recoveryDialog: $("#recoveryDialog"), recoveryForm: $("#recoveryForm"), recoveryPasswordInput: $("#recoveryPasswordInput"), recoveryPassword2Input: $("#recoveryPassword2Input"),
  addFriendDialog: $("#addFriendDialog"), addFriendForm: $("#addFriendForm"), friendUsernameInput: $("#friendUsernameInput"),
  preferencesDialog: $("#preferencesDialog"), preferencesForm: $("#preferencesForm"), accentColorInput: $("#accentColorInput"), themeModeInput: $("#themeModeInput"), densityInput: $("#densityInput"), audioInputSelect: $("#audioInputSelect"), videoInputSelect: $("#videoInputSelect"), refreshDevicesBtn: $("#refreshDevicesBtn"), testMicBtn: $("#testMicBtn"), micMeter: $("#micMeter"), exportDataBtn: $("#exportDataBtn"), signOutAllBtn: $("#signOutAllBtn"), reduceMotionInput: $("#reduceMotionInput"), browserNotificationsInput: $("#browserNotificationsInput"), soundsInput: $("#soundsInput"),
  pollDialog: $("#pollDialog"), pollForm: $("#pollForm"), pollQuestionInput: $("#pollQuestionInput"), pollOptionsInput: $("#pollOptionsInput"),
  eventDialog: $("#eventDialog"), eventForm: $("#eventForm"), eventTitleInput: $("#eventTitleInput"), eventDescriptionInput: $("#eventDescriptionInput"), eventStartsAtInput: $("#eventStartsAtInput"),
  pinnedDialog: $("#pinnedDialog"), pinnedList: $("#pinnedList"),
  profileBannerPreview: $("#profileBannerPreview"), bannerFileInput: $("#bannerFileInput"), presenceModeInput: $("#presenceModeInput"),
  toast: $("#toast")
};

const PERMISSIONS = [
  ["VIEW_CHANNEL", "Ver canais", "Permite visualizar os canais do servidor."],
  ["SEND_MESSAGES", "Enviar mensagens", "Permite conversar nos canais de texto."],
  ["CONNECT", "Conectar", "Permite entrar em canais de voz."],
  ["SPEAK", "Falar", "Permite transmitir áudio na chamada."],
  ["CREATE_INSTANT_INVITE", "Criar convites", "Permite gerar links de convite."],
  ["MANAGE_MESSAGES", "Gerenciar mensagens", "Permite apagar mensagens de outros membros."],
  ["MANAGE_CHANNELS", "Gerenciar canais", "Permite criar, editar e excluir canais."],
  ["MANAGE_NICKNAMES", "Gerenciar apelidos", "Permite alterar apelidos dos membros."],
  ["KICK_MEMBERS", "Expulsar membros", "Permite remover membros do servidor."],
  ["MANAGE_ROLES", "Gerenciar cargos", "Permite criar cargos e atribuí-los."],
  ["MANAGE_SERVER", "Gerenciar servidor", "Permite alterar nome, descrição e ícone."],
  ["ADMINISTRATOR", "Administrador", "Concede todas as permissões. Use com cuidado."]
];

function uuidish() {
  try { return crypto.randomUUID(); } catch (_) { return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
}

const state = {
  supabase: null,
  user: null,
  profile: null,
  servers: [],
  activeServerId: null,
  activeServer: null,
  channels: [],
  activeTextChannelId: null,
  serverMembers: [],
  profiles: new Map(),
  roles: [],
  memberRoles: [],
  onlineUserIds: new Set(),
  serverPresence: null,
  serverDataChannel: null,
  chatChannel: null,
  renderedMessages: new Set(),
  serverLoadToken: 0,
  messageLoadToken: 0,
  pendingInviteToken: null,
  invitePreview: null,
  realtimeRefreshTimer: null,
  voiceWatchers: new Map(),
  voicePresence: new Map(),
  voiceClientId: uuidish(),
  voiceJoinedChannelId: null,
  voiceJoinedChannelName: null,
  joiningVoice: false,
  voiceSession: 0,
  localStream: null,
  cameraTrack: null,
  screenTrack: null,
  deafen: false,
  peers: new Map(),
  peerNames: new Map(),
  peerProfiles: new Map(),
  remoteMediaStates: new Map(),
  cameraBusy: false,
  screenBusy: false,
  sendingMessage: false,
  selectedRoleId: null,
  roleDraftPermissions: new Set(),
  messageMap: new Map(),
  reactionMap: new Map(),
  pollVotes: new Map(),
  replyToMessageId: null,
  editingMessageId: null,
  pendingAttachment: null,
  typingUsers: new Map(),
  typingBroadcastTimer: null,
  homeMode: false,
  friendships: [],
  socialProfiles: new Map(),
  activeDmUserId: null,
  dmChannel: null,
  dmMessagesMap: new Map(),
  dmContacts: [],
  preferences: { theme_mode: 'neon', accent_color: '#1D8DFF', density: 'comfortable', reduce_motion: false, browser_notifications: false, sounds_enabled: true, audio_input_id: null, video_input_id: null },
  selectedBannerFile: null,
  events: [],
  bans: [],
  auditLog: [],
  audioMeters: new Map()
};

let toastTimer = null;
function toast(message, ms = 3400) {
  ui.toast.textContent = message;
  ui.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.add("hidden"), ms);
}

function initials(name = "TL") {
  return String(name || "TL").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "TL";
}

function slugifyChannel(value) {
  return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function validUsername(value) {
  return /^[a-z0-9][a-z0-9._-]{1,18}[a-z0-9]$/.test(value) && !value.includes("..");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validEmail(value) {
  const email = normalizeEmail(value);
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function makeEl(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== "") node.textContent = text;
  return node;
}

function appendRichText(node, value = "") {
  const text = String(value || "");
  const tokenRe = /(https?:\/\/[^\s<>]+|@[a-z0-9][a-z0-9._-]{1,18}[a-z0-9]|`[^`\n]{1,200}`)/gi;
  let last = 0;
  for (const match of text.matchAll(tokenRe)) {
    const index = match.index ?? 0;
    if (index > last) node.appendChild(document.createTextNode(text.slice(last, index)));
    const token = match[0];
    if (/^https?:\/\//i.test(token)) {
      const a = makeEl("a", "message-link", token); a.href = token; a.target = "_blank"; a.rel = "noopener noreferrer"; node.appendChild(a);
    } else if (token.startsWith("@")) {
      node.appendChild(makeEl("span", "message-mention", token));
    } else if (token.startsWith("`") && token.endsWith("`")) {
      node.appendChild(makeEl("code", "message-inline-code", token.slice(1, -1)));
    }
    last = index + token.length;
  }
  if (last < text.length) node.appendChild(document.createTextNode(text.slice(last)));
}

function setAvatar(node, profileOrName, sizeClass) {
  if (!node) return;
  if (sizeClass) node.className = `avatar ${sizeClass}`;
  node.replaceChildren();
  node.style.backgroundImage = "";
  const profile = typeof profileOrName === "object" && profileOrName ? profileOrName : null;
  const name = profile?.display_name || profile?.username || String(profileOrName || "TL");
  if (profile?.avatar_url) {
    const img = document.createElement("img");
    img.src = profile.avatar_url;
    img.alt = "";
    img.loading = "lazy";
    img.onerror = () => { img.remove(); node.textContent = initials(name); };
    node.appendChild(img);
  } else node.textContent = initials(name);
}

function setBusy(button, busy, busyText = "Aguarde…") {
  if (!button) return;
  if (busy) {
    button.dataset.oldText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
  } else {
    if (button.dataset.oldText) button.textContent = button.dataset.oldText;
    delete button.dataset.oldText;
    button.disabled = false;
  }
}

function openDialog(dialog) {
  if (!dialog) return;
  if (!dialog.open) dialog.showModal();
}
function closeDialog(dialog) { if (dialog?.open) dialog.close(); }

function isMobileNav() { return matchMedia("(max-width: 850px)").matches; }
function isMembersDrawer() { return matchMedia("(max-width: 1120px)").matches; }
function syncBackdrop() {
  const nav = isMobileNav() && ui.appShell.classList.contains("nav-open");
  const members = isMembersDrawer() && ui.membersPanel.classList.contains("open");
  ui.drawerBackdrop.classList.toggle("hidden", !(nav || members));
}
function closeDrawers() {
  ui.appShell.classList.remove("nav-open");
  ui.membersPanel.classList.remove("open");
  ui.serverQuickMenu.classList.add("hidden");
  syncBackdrop();
}

function connectionStatus(text, mode = "") {
  ui.connectionText.textContent = text;
  ui.connectionText.classList.toggle("online", mode === "online");
  ui.connectionText.classList.toggle("error", mode === "error");
}

function serverIconNode(server, className = "server-fallback") {
  if (server.icon_url) {
    const img = document.createElement("img");
    img.src = server.icon_url;
    img.alt = "";
    img.loading = "lazy";
    return img;
  }
  return makeEl("span", className, initials(server.name));
}

function inviteTokenFrom(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return (url.searchParams.get("invite") || "").toLowerCase();
  } catch (_) {
    return raw.replace(/^.*[?&]invite=/i, "").split(/[&#/\s]/)[0].toLowerCase();
  }
}

function safeLocalStorageGet(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
function safeLocalStorageSet(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
function safeLocalStorageRemove(key) { try { localStorage.removeItem(key); } catch (_) {} }


function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || ""));
  return match ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) } : { r: 29, g: 141, b: 255 };
}

function applyPreferences() {
  const pref = state.preferences || {};
  const accent = /^#[0-9a-f]{6}$/i.test(pref.accent_color || "") ? pref.accent_color : "#1D8DFF";
  const rgb = hexToRgb(accent);
  document.documentElement.style.setProperty("--brand", accent);
  document.documentElement.style.setProperty("--brand-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  document.body.dataset.theme = pref.theme_mode || "neon";
  document.body.dataset.density = pref.density || "comfortable";
  document.body.classList.toggle("reduce-motion", Boolean(pref.reduce_motion));
}

async function loadPreferences() {
  const local = safeLocalStorageGet("tropa_preferences");
  if (local) {
    try { state.preferences = { ...state.preferences, ...JSON.parse(local) }; } catch (_) {}
  }
  if (state.supabase && state.user) {
    const { data, error } = await state.supabase.from("user_preferences").select("*").eq("user_id", state.user.id).maybeSingle();
    if (!error && data) state.preferences = { ...state.preferences, ...data };
  }
  applyPreferences();
}

function fillPreferencesForm() {
  ui.accentColorInput.value = state.preferences.accent_color || "#1D8DFF";
  ui.themeModeInput.value = state.preferences.theme_mode || "neon";
  ui.densityInput.value = state.preferences.density || "comfortable";
  ui.reduceMotionInput.checked = Boolean(state.preferences.reduce_motion);
  ui.browserNotificationsInput.checked = Boolean(state.preferences.browser_notifications);
  ui.soundsInput.checked = state.preferences.sounds_enabled !== false;
  ui.audioInputSelect.value = state.preferences.audio_input_id || "";
  ui.videoInputSelect.value = state.preferences.video_input_id || "";
}

async function openPreferences() {
  fillPreferencesForm();
  openDialog(ui.preferencesDialog);
  await refreshMediaDevices();
}

async function savePreferences() {
  const next = {
    user_id: state.user.id,
    accent_color: ui.accentColorInput.value,
    theme_mode: ui.themeModeInput.value,
    density: ui.densityInput.value,
    reduce_motion: ui.reduceMotionInput.checked,
    browser_notifications: ui.browserNotificationsInput.checked,
    sounds_enabled: ui.soundsInput.checked,
    audio_input_id: ui.audioInputSelect.value || null,
    video_input_id: ui.videoInputSelect.value || null
  };
  if (next.browser_notifications && "Notification" in window && Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    next.browser_notifications = permission === "granted";
    ui.browserNotificationsInput.checked = next.browser_notifications;
  }
  const { data, error } = await state.supabase.from("user_preferences").upsert(next, { onConflict: "user_id" }).select().single();
  if (error) throw error;
  state.preferences = { ...state.preferences, ...data };
  safeLocalStorageSet("tropa_preferences", JSON.stringify(state.preferences));
  applyPreferences();
}

async function refreshMediaDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) return;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audio = devices.filter((d) => d.kind === "audioinput");
    const video = devices.filter((d) => d.kind === "videoinput");
    const fill = (select, list, current, fallback) => {
      const old = current || select.value || ""; select.replaceChildren(); const base = document.createElement("option"); base.value = ""; base.textContent = fallback; select.appendChild(base);
      list.forEach((d, index) => { const option = document.createElement("option"); option.value = d.deviceId; option.textContent = d.label || `${fallback} ${index + 1}`; select.appendChild(option); });
      select.value = [...select.options].some((o) => o.value === old) ? old : "";
    };
    fill(ui.audioInputSelect, audio, state.preferences.audio_input_id, "Microfone padrão");
    fill(ui.videoInputSelect, video, state.preferences.video_input_id, "Câmera padrão");
  } catch (error) { console.warn("Dispositivos", error); }
}

let micTestStop = null;
async function testMicrophone() {
  if (micTestStop) { micTestStop(); micTestStop = null; ui.testMicBtn.textContent = "Testar microfone"; return; }
  try {
    const deviceId = ui.audioInputSelect.value;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true, video: false });
    const ctx = new (window.AudioContext || window.webkitAudioContext)(); const source = ctx.createMediaStreamSource(stream); const analyser = ctx.createAnalyser(); analyser.fftSize = 256; source.connect(analyser); const data = new Uint8Array(analyser.frequencyBinCount); let raf = 0; let active = true;
    const tick = () => { if (!active) return; analyser.getByteFrequencyData(data); let sum = 0; for (const v of data) sum += v; const pct = Math.min(100, Math.max(2, (sum / data.length) * 1.35)); ui.micMeter.querySelector("i").style.width = `${pct}%`; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); ui.testMicBtn.textContent = "Parar teste";
    micTestStop = () => { active = false; cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); try { source.disconnect(); } catch (_) {} ctx.close().catch(() => {}); ui.micMeter.querySelector("i").style.width = "0%"; };
  } catch (error) { toast(error?.name === "NotAllowedError" ? "Permita o uso do microfone." : "Não foi possível testar o microfone."); }
}
ui.refreshDevicesBtn?.addEventListener("click", async () => { try { const temp = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); temp.getTracks().forEach((t) => t.stop()); } catch (_) {} await refreshMediaDevices(); });
ui.testMicBtn?.addEventListener("click", testMicrophone);
ui.preferencesDialog?.addEventListener("close", () => { if (micTestStop) { micTestStop(); micTestStop = null; ui.testMicBtn.textContent = "Testar microfone"; } });

function playSoftTone(type = "message") {
  if (!state.preferences?.sounds_enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(type === "call" ? 560 : 720, now);
    osc.frequency.exponentialRampToValueAtTime(type === "call" ? 420 : 620, now + .11);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.035, now + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .14);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + .15);
    osc.addEventListener("ended", () => ctx.close().catch(() => {}));
  } catch (_) {}
}

function notifyDesktop(title, body) {
  if (!state.preferences?.browser_notifications || document.visibilityState === "visible" || !("Notification" in window) || Notification.permission !== "granted") return;
  try { new Notification(title, { body, icon: "./icon-192.png", badge: "./icon-192.png" }); } catch (_) {}
}

// -----------------------------------------------------------------------------
// UI base / dialogs
// -----------------------------------------------------------------------------
$$('[data-close-dialog]').forEach((button) => {
  button.addEventListener("click", () => closeDialog(document.getElementById(button.dataset.closeDialog)));
});

ui.mobileMenuBtn.addEventListener("click", () => {
  ui.membersPanel.classList.remove("open");
  ui.appShell.classList.toggle("nav-open");
  syncBackdrop();
});
ui.closeNavBtn.addEventListener("click", closeDrawers);
ui.mobileMembersBtn.addEventListener("click", () => {
  ui.appShell.classList.remove("nav-open");
  ui.membersPanel.classList.toggle("open");
  syncBackdrop();
});
ui.closeMembersBtn.addEventListener("click", closeDrawers);
ui.drawerBackdrop.addEventListener("click", closeDrawers);
window.addEventListener("resize", () => {
  if (!isMobileNav()) ui.appShell.classList.remove("nav-open");
  if (!isMembersDrawer()) ui.membersPanel.classList.remove("open");
  syncBackdrop();
});
ui.homeServerBtn.addEventListener("click", () => showHomeHub());
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    ui.serverQuickMenu.classList.add("hidden");
    closeDrawers();
    if (state.editingMessageId) cancelMessageEdit();
    else if (state.replyToMessageId) clearReply();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    ui.topbarSearchInput?.focus();
  }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "m" && state.voiceJoinedChannelId) {
    event.preventDefault();
    ui.muteBtn.click();
  }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "d" && state.voiceJoinedChannelId) {
    event.preventDefault();
    ui.deafenBtn.click();
  }
});

ui.serverMenuBtn.addEventListener("click", () => {
  if (!state.activeServer) return;
  ui.serverQuickMenu.classList.toggle("hidden");
});
document.addEventListener("click", (event) => {
  if (!ui.serverQuickMenu.classList.contains("hidden") && !ui.serverQuickMenu.contains(event.target) && !ui.serverMenuBtn.contains(event.target)) {
    ui.serverQuickMenu.classList.add("hidden");
  }
});

ui.appearanceBtn?.addEventListener("click", openPreferences);
ui.preferencesForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = ui.preferencesForm.querySelector('button[type="submit"]');
  setBusy(button, true, "Salvando…");
  try { await savePreferences(); closeDialog(ui.preferencesDialog); toast("Preferências salvas."); }
  catch (error) { console.error(error); toast(`Não foi possível salvar as preferências: ${error.message || error}`); }
  finally { setBusy(button, false); }
});
ui.exportDataBtn?.addEventListener("click", async () => {
  if (!state.user) return;
  setBusy(ui.exportDataBtn, true, "Preparando…");
  try {
    const [profileRes, membershipsRes, messagesRes, dmRes] = await Promise.all([
      state.supabase.from("profiles").select("user_id,username,display_name,bio,custom_status,avatar_url,banner_url,presence_mode,created_at,updated_at").eq("user_id", state.user.id).maybeSingle(),
      state.supabase.from("server_members").select("server_id,nickname,joined_at").eq("user_id", state.user.id),
      state.supabase.from("channel_messages").select("id,channel_id,content,created_at,edited_at,kind,metadata").eq("user_id", state.user.id).order("created_at", { ascending: false }).limit(1000),
      state.supabase.from("direct_messages").select("id,sender_id,recipient_id,content,created_at,edited_at").or(`sender_id.eq.${state.user.id},recipient_id.eq.${state.user.id}`).order("created_at", { ascending: false }).limit(1000)
    ]);
    const payload = { exported_at: new Date().toISOString(), account_email: state.user.email || null, profile: profileRes.data || null, memberships: membershipsRes.data || [], channel_messages: messagesRes.data || [], direct_messages: dmRes.data || [] };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `tropa-da-lan-dados-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast("Exportação criada.");
  } catch (error) { console.error(error); toast("Não foi possível exportar seus dados."); }
  finally { setBusy(ui.exportDataBtn, false); }
});
ui.signOutAllBtn?.addEventListener("click", async () => {
  if (!confirm("Sair da sua conta em todos os dispositivos?")) return;
  const { error } = await state.supabase.auth.signOut({ scope: "global" }); if (error) toast(error.message || "Não foi possível encerrar as sessões.");
});

ui.friendsBtn?.addEventListener("click", () => showHomeHub());
ui.notificationsBtn?.addEventListener("click", async () => {
  if (!("Notification" in window)) return toast("Este navegador não oferece notificações do sistema.");
  const permission = await Notification.requestPermission();
  toast(permission === "granted" ? "Notificações ativadas." : "Permissão de notificações não concedida.");
});


function switchAuthTab(mode) {
  const login = mode === "login";
  ui.loginTab.classList.toggle("active", login);
  ui.registerTab.classList.toggle("active", !login);
  ui.loginForm.classList.toggle("hidden", !login);
  ui.registerForm.classList.toggle("hidden", login);
  setTimeout(() => (login ? ui.loginEmail : ui.registerEmail).focus(), 30);
}
ui.loginTab.addEventListener("click", () => switchAuthTab("login"));
ui.registerTab.addEventListener("click", () => switchAuthTab("register"));

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------
async function previewInvite(token, target = ui.invitePreviewAuth) {
  if (!state.supabase || !token) return null;
  const { data, error } = await state.supabase.rpc("get_invite", { p_token: token });
  if (error || !data?.length) {
    target.classList.add("hidden");
    return null;
  }
  const info = data[0];
  target.replaceChildren();
  const icon = makeEl("div", "invite-server-icon", initials(info.server_name));
  if (info.server_icon_url) {
    const img = document.createElement("img"); img.src = info.server_icon_url; img.alt = ""; icon.replaceChildren(img);
  }
  const meta = makeEl("div");
  meta.append(makeEl("strong", "", info.server_name), makeEl("small", "", `${info.member_count} membro${Number(info.member_count) === 1 ? "" : "s"}${info.valid ? "" : " • convite indisponível"}`));
  target.append(icon, meta);
  target.classList.remove("hidden");
  return info;
}

async function handlePendingInviteAfterAuth() {
  const token = state.pendingInviteToken;
  if (!token || !state.user) return;
  const info = await previewInvite(token, ui.joinInvitePreview);
  if (!info) {
    toast("Este convite é inválido ou não existe.");
    state.pendingInviteToken = null;
    return;
  }
  ui.joinInviteInput.value = token;
  openDialog(ui.joinServerDialog);
}

ui.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.supabase) return;
  const email = normalizeEmail(ui.loginEmail.value);
  if (!validEmail(email)) return toast("Digite um e-mail válido.");
  if (!ui.loginPassword.value) return toast("Digite sua senha.");
  setBusy(ui.loginBtn, true, "Entrando…");
  try {
    const { error } = await state.supabase.auth.signInWithPassword({ email, password: ui.loginPassword.value });
    if (error) throw error;
    ui.loginPassword.value = "";
  } catch (error) {
    console.error(error);
    const msg = String(error?.message || "");
    if (/invalid login|invalid credentials/i.test(msg)) toast("E-mail ou senha incorretos.");
    else if (/email.*confirm|not confirmed/i.test(msg)) toast("Confirme seu e-mail antes de entrar.", 5200);
    else toast(`Não foi possível entrar: ${msg || "erro desconhecido"}`, 5200);
  } finally { setBusy(ui.loginBtn, false); }
});

ui.forgotPasswordBtn?.addEventListener("click", () => {
  ui.forgotEmailInput.value = normalizeEmail(ui.loginEmail.value || "");
  openDialog(ui.forgotPasswordDialog);
  setTimeout(() => ui.forgotEmailInput.focus(), 30);
});
ui.forgotPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = normalizeEmail(ui.forgotEmailInput.value); if (!validEmail(email)) return toast("Digite um e-mail válido.");
  const submit = ui.forgotPasswordForm.querySelector('button[type="submit"]'); setBusy(submit, true, "Enviando…");
  try {
    const redirectTo = `${location.origin}${location.pathname}`;
    const { error } = await state.supabase.auth.resetPasswordForEmail(email, { redirectTo }); if (error) throw error;
    closeDialog(ui.forgotPasswordDialog); toast("Se o e-mail estiver cadastrado, o link de recuperação será enviado.", 7000);
  } catch (error) { console.error(error); toast(/rate limit/i.test(error?.message || "") ? "Limite de e-mails do Supabase atingido. Aguarde ou configure SMTP próprio." : (error.message || "Não foi possível enviar o e-mail."), 7000); }
  finally { setBusy(submit, false); }
});
ui.recoveryForm?.addEventListener("submit", async (event) => {
  event.preventDefault(); const password = ui.recoveryPasswordInput.value;
  if (password.length < 6) return toast("A senha precisa ter pelo menos 6 caracteres.");
  if (password !== ui.recoveryPassword2Input.value) return toast("As senhas não coincidem.");
  const submit = ui.recoveryForm.querySelector('button[type="submit"]'); setBusy(submit, true, "Atualizando…");
  try { const { error } = await state.supabase.auth.updateUser({ password }); if (error) throw error; closeDialog(ui.recoveryDialog); toast("Senha atualizada com sucesso."); }
  catch (error) { console.error(error); toast(error.message || "Não foi possível atualizar a senha."); }
  finally { setBusy(submit, false); }
});

ui.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.supabase) return;
  const email = normalizeEmail(ui.registerEmail.value);
  const username = normalizeUsername(ui.registerUsername.value);
  const password = ui.registerPassword.value;
  if (!validEmail(email)) return toast("Digite um e-mail válido.");
  if (!validUsername(username)) return toast("Use 3–20 caracteres: letras minúsculas, números, ponto, hífen ou underline.", 5200);
  if (password.length < 6) return toast("A senha precisa ter pelo menos 6 caracteres.");
  if (password !== ui.registerPassword2.value) return toast("As duas senhas não são iguais.");

  setBusy(ui.registerBtn, true, "Criando…");
  try {
    const { data, error } = await state.supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: username } }
    });
    if (error) throw error;
    ui.registerPassword.value = "";
    ui.registerPassword2.value = "";
    if (!data.session) {
      toast("Conta criada. Confirme o e-mail recebido antes de entrar.", 7000);
      switchAuthTab("login");
      ui.loginEmail.value = email;
      return;
    }
    toast("Conta criada com sucesso!");
  } catch (error) {
    console.error(error);
    const msg = String(error?.message || "");
    const status = Number(error?.status || error?.statusCode || 0);
    if (/already|registered/i.test(msg)) toast("Já existe uma conta com esse e-mail.");
    else if (/database error saving new user/i.test(msg)) toast("Não foi possível criar o perfil. O nome de usuário pode já estar em uso. Tente outro.", 6500);
    else if (/email.*invalid|invalid.*email/i.test(msg)) toast("O Supabase recusou esse e-mail. Confira o endereço e tente novamente.", 6500);
    else if (status === 429 || /rate limit|too many requests|email rate/i.test(msg)) {
      toast("Limite temporário de cadastro/e-mail do Supabase atingido. No painel do Supabase, desative Confirm email para testes ou aguarde o limite liberar.", 9000);
      startRegisterCooldown(60);
    } else toast(`Não foi possível criar a conta: ${msg || "erro desconhecido"}`, 6000);
  } finally { if (!ui.registerBtn.dataset.cooldown) setBusy(ui.registerBtn, false); }
});

function startRegisterCooldown(seconds = 60) {
  let remaining = Math.max(1, Number(seconds) || 60);
  ui.registerBtn.dataset.cooldown = "1";
  ui.registerBtn.disabled = true;
  ui.registerBtn.textContent = `Aguarde ${remaining}s`;
  const timer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(timer);
      delete ui.registerBtn.dataset.cooldown;
      ui.registerBtn.disabled = false;
      ui.registerBtn.textContent = "Criar conta";
      return;
    }
    ui.registerBtn.textContent = `Aguarde ${remaining}s`;
  }, 1000);
}

ui.logoutBtn.addEventListener("click", async () => {
  if (!state.supabase) return;
  await cleanupAppSession();
  await state.supabase.auth.signOut();
});

function showAuth() {
  ui.appShell.classList.add("hidden");
  ui.authScreen.classList.remove("hidden");
  connectionStatus("Desconectado");
  switchAuthTab("login");
}
function showApp() {
  ui.authScreen.classList.add("hidden");
  ui.appShell.classList.remove("hidden");
}

async function loadCurrentProfile() {
  const { data, error } = await state.supabase.from("profiles").select("user_id,username,display_name,bio,custom_status,avatar_url,banner_url,presence_mode,created_at").eq("user_id", state.user.id).single();
  if (error) throw error;
  state.profile = data;
  updateOwnProfileUI();
}

function updateOwnProfileUI() {
  const p = state.profile;
  if (!p) return;
  setAvatar(ui.profileAvatar, p, "avatar-sm");
  ui.profileName.textContent = p.display_name;
  ui.profileUsername.textContent = `@${p.username}`;
}

// -----------------------------------------------------------------------------
// Profile editing
// -----------------------------------------------------------------------------
function openProfileEditor() {
  if (!state.profile) return;
  setAvatar(ui.profileAvatarPreview, state.profile, "avatar-xl");
  ui.displayNameInput.value = state.profile.display_name || "";
  ui.profileUsernameInput.value = state.profile.username || "";
  ui.customStatusInput.value = state.profile.custom_status || "";
  ui.bioInput.value = state.profile.bio || "";
  ui.presenceModeInput.value = state.profile.presence_mode || "online";
  ui.avatarFileInput.value = "";
  ui.bannerFileInput.value = "";
  state.selectedBannerFile = null;
  ui.profileBannerPreview.style.backgroundImage = state.profile.banner_url ? `linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.20)), url("${state.profile.banner_url}")` : "";
  openDialog(ui.profileDialog);
}
ui.profileButton.addEventListener("click", openProfileEditor);
ui.profileSettingsBtn.addEventListener("click", openPreferences);

async function uploadImage(bucket, folder, file) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) throw new Error("Selecione uma imagem.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem precisa ter até 5 MB.");
  const ext = (file.name.split(".").pop() || "webp").toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
  const path = `${folder}/${Date.now()}-${uuidish().slice(0, 8)}.${ext}`;
  const { error } = await state.supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return state.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

ui.avatarFileInput.addEventListener("change", () => {
  const file = ui.avatarFileInput.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  ui.profileAvatarPreview.replaceChildren();
  const img = document.createElement("img"); img.src = url; img.alt = "Prévia"; img.onload = () => URL.revokeObjectURL(url); ui.profileAvatarPreview.appendChild(img);
});

ui.bannerFileInput.addEventListener("change", () => {
  const file = ui.bannerFileInput.files?.[0];
  if (!file) return;
  state.selectedBannerFile = file;
  const url = URL.createObjectURL(file);
  ui.profileBannerPreview.style.backgroundImage = `linear-gradient(rgba(0,0,0,.06),rgba(0,0,0,.18)), url("${url}")`;
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});

ui.profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.profile) return;
  setBusy(ui.saveProfileBtn, true, "Salvando…");
  try {
    let avatarUrl = state.profile.avatar_url;
    let bannerUrl = state.profile.banner_url;
    const file = ui.avatarFileInput.files?.[0];
    if (file) avatarUrl = await uploadImage("avatars", state.user.id, file);
    if (state.selectedBannerFile) bannerUrl = await uploadImage("profile-banners", state.user.id, state.selectedBannerFile);
    const updates = {
      display_name: ui.displayNameInput.value.trim().slice(0, 32),
      custom_status: ui.customStatusInput.value.trim().slice(0, 64),
      bio: ui.bioInput.value.trim().slice(0, 190),
      avatar_url: avatarUrl || null,
      banner_url: bannerUrl || null,
      presence_mode: ui.presenceModeInput.value || "online"
    };
    if (!updates.display_name) throw new Error("O nome de exibição não pode ficar vazio.");
    const { data, error } = await state.supabase.from("profiles").update(updates).eq("user_id", state.user.id).select().single();
    if (error) throw error;
    state.profile = data;
    state.profiles.set(data.user_id, data);
    updateOwnProfileUI();
    await retrackServerPresence();
    if (state.voiceJoinedChannelId) await retrackVoicePresence();
    renderMembers();
    renderChannels();
    closeDialog(ui.profileDialog);
    toast("Perfil atualizado.");
  } catch (error) {
    console.error(error); toast(error.message || "Não foi possível salvar o perfil.");
  } finally { setBusy(ui.saveProfileBtn, false); }
});

// -----------------------------------------------------------------------------
// Social hub / friends / direct messages
// -----------------------------------------------------------------------------
async function showHomeHub() {
  if (!state.user) return;
  state.homeMode = true;
  closeDrawers();
  ui.serverQuickMenu.classList.add("hidden");
  ui.emptyState.classList.add("hidden");
  ui.messages.classList.add("hidden");
  ui.composerWrap.classList.add("hidden");
  ui.homeHub.classList.remove("hidden");
  ui.contentArea.classList.add("home-mode");
  ui.mediaStage.classList.add("home-hidden");
  ui.activeChannelIcon.textContent = "⌂";
  ui.activeChannelName.textContent = "Início";
  ui.activeChannelTopic.textContent = "Amigos, mensagens privadas e atividade";
  ui.topbarSearchInput.value = "";
  ui.topbarSearchInput.placeholder = "Buscar amigos";
  await cleanupChatSubscription();
  await loadSocialData();
  await setupDmRealtime();
}

async function loadSocialData() {
  if (!state.user) return;
  const uid = state.user.id;
  const { data, error } = await state.supabase.from("friendships").select("id,requester_id,addressee_id,status,created_at,updated_at").or(`requester_id.eq.${uid},addressee_id.eq.${uid}`).order("updated_at", { ascending: false });
  if (error) { console.warn(error); toast("Execute MIGRATION_V6_ULTIMATE.sql para ativar amigos e mensagens privadas.", 7000); return; }
  state.friendships = data || [];
  const ids = [...new Set(state.friendships.flatMap((f) => [f.requester_id, f.addressee_id]).filter((id) => id && id !== uid))];
  state.socialProfiles.clear();
  if (ids.length) {
    const { data: profiles, error: profileError } = await state.supabase.from("profiles").select("user_id,username,display_name,custom_status,avatar_url,banner_url,presence_mode").in("user_id", ids);
    if (!profileError) for (const profile of profiles || []) state.socialProfiles.set(profile.user_id, profile);
  }
  renderSocialHub();
}

function socialOtherId(friendship) { return friendship.requester_id === state.user.id ? friendship.addressee_id : friendship.requester_id; }
function acceptedFriends() { return state.friendships.filter((f) => f.status === "accepted"); }
function incomingFriendRequests() { return state.friendships.filter((f) => f.status === "pending" && f.addressee_id === state.user.id); }
function outgoingFriendRequests() { return state.friendships.filter((f) => f.status === "pending" && f.requester_id === state.user.id); }

function socialUserRow(profile, subtitle, actions = []) {
  const row = makeEl("div", "social-user-row");
  const avatar = makeEl("span", "avatar avatar-md"); setAvatar(avatar, profile, "avatar-md");
  const meta = makeEl("div", "social-user-meta"); meta.append(makeEl("strong", "", profile?.display_name || profile?.username || "Usuário"), makeEl("small", "", subtitle || `@${profile?.username || "usuario"}`));
  const actionWrap = makeEl("div", "social-user-actions"); for (const action of actions) actionWrap.appendChild(action);
  row.append(avatar, meta, actionWrap); return row;
}

function renderSocialHub() {
  ui.friendRequestsList.replaceChildren(); ui.friendsList.replaceChildren(); ui.dmContactsList.replaceChildren();
  const incoming = incomingFriendRequests(); const outgoing = outgoingFriendRequests(); const accepted = acceptedFriends();
  ui.friendRequestCount.textContent = String(incoming.length);
  ui.friendsCount.textContent = String(accepted.length);

  if (!incoming.length && !outgoing.length) ui.friendRequestsList.appendChild(makeEl("div", "empty-mini", "Nenhuma solicitação pendente."));
  for (const request of incoming) {
    const profile = state.socialProfiles.get(request.requester_id); if (!profile) continue;
    const accept = makeEl("button", "mini-action success", "✓"); accept.type = "button"; accept.title = "Aceitar"; accept.addEventListener("click", () => respondFriendRequest(request.id, true));
    const decline = makeEl("button", "mini-action danger", "×"); decline.type = "button"; decline.title = "Recusar"; decline.addEventListener("click", () => respondFriendRequest(request.id, false));
    ui.friendRequestsList.appendChild(socialUserRow(profile, "Quer adicionar você", [accept, decline]));
  }
  for (const request of outgoing) {
    const profile = state.socialProfiles.get(request.addressee_id); if (!profile) continue;
    const cancel = makeEl("button", "mini-action", "×"); cancel.type = "button"; cancel.title = "Cancelar"; cancel.addEventListener("click", () => removeFriendship(request.id));
    ui.friendRequestsList.appendChild(socialUserRow(profile, "Solicitação enviada", [cancel]));
  }

  if (!accepted.length) ui.friendsList.appendChild(makeEl("div", "empty-mini", "Adicione amigos para conversar por DM."));
  for (const relation of accepted) {
    const otherId = socialOtherId(relation); const profile = state.socialProfiles.get(otherId); if (!profile) continue;
    const msg = makeEl("button", "mini-action primary", "✉"); msg.type = "button"; msg.title = "Mensagem"; msg.addEventListener("click", () => openDm(otherId));
    const remove = makeEl("button", "mini-action", "×"); remove.type = "button"; remove.title = "Remover amigo"; remove.addEventListener("click", () => removeFriendship(relation.id));
    const subtitle = profile.custom_status || (profile.presence_mode === "dnd" ? "Não perturbe" : profile.presence_mode === "idle" ? "Ausente" : `@${profile.username}`);
    ui.friendsList.appendChild(socialUserRow(profile, subtitle, [msg, remove]));
    const contact = socialUserRow(profile, subtitle, []); contact.classList.add("clickable"); contact.addEventListener("click", () => openDm(otherId)); ui.dmContactsList.appendChild(contact);
  }
}

ui.addFriendBtn.addEventListener("click", () => { ui.friendUsernameInput.value = ""; openDialog(ui.addFriendDialog); setTimeout(() => ui.friendUsernameInput.focus(), 30); });
ui.addFriendForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = normalizeUsername(ui.friendUsernameInput.value); if (!validUsername(username)) return toast("Digite um @usuário válido.");
  const submit = ui.addFriendForm.querySelector('button[type="submit"]'); setBusy(submit, true, "Enviando…");
  try {
    const { error } = await state.supabase.rpc("send_friend_request", { p_username: username }); if (error) throw error;
    closeDialog(ui.addFriendDialog); toast("Solicitação de amizade enviada."); await loadSocialData();
  } catch (error) { console.error(error); toast(error.message || "Não foi possível enviar a solicitação."); }
  finally { setBusy(submit, false); }
});

async function respondFriendRequest(id, accept) {
  const { error } = await state.supabase.rpc("respond_friend_request", { p_request_id: id, p_accept: accept });
  if (error) return toast(error.message || "Não foi possível responder à solicitação.");
  toast(accept ? "Amizade aceita." : "Solicitação recusada."); await loadSocialData();
}
async function removeFriendship(id) {
  if (!confirm("Remover esta amizade/solicitação?")) return;
  const { error } = await state.supabase.from("friendships").delete().eq("id", id); if (error) return toast("Não foi possível remover.");
  if (state.activeDmUserId && !acceptedFriends().some((f) => socialOtherId(f) === state.activeDmUserId)) closeDm();
  await loadSocialData();
}

async function setupDmRealtime() {
  if (state.dmChannel) return;
  const ch = state.supabase.channel(`dm:${state.user.id}:${uuidish()}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, ({ new: row }) => {
      if (!row || ![row.sender_id, row.recipient_id].includes(state.user.id)) return;
      if (state.activeDmUserId && [row.sender_id, row.recipient_id].includes(state.activeDmUserId)) { renderDmMessage(row); ui.dmMessages.scrollTop = ui.dmMessages.scrollHeight; }
      if (row.sender_id !== state.user.id) { const p = state.socialProfiles.get(row.sender_id); playSoftTone("message"); notifyDesktop(p?.display_name || "Mensagem privada", row.content || "Novo anexo"); }
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "direct_messages" }, ({ new: row }) => { if (row && state.dmMessagesMap.has(String(row.id))) renderDmMessage(row, true); })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "direct_messages" }, ({ old }) => { document.querySelector(`[data-dm-id="${old.id}"]`)?.remove(); state.dmMessagesMap.delete(String(old.id)); })
    .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => { if (state.homeMode) loadSocialData(); });
  ch.subscribe(); state.dmChannel = ch;
}

async function openDm(userId) {
  const profile = state.socialProfiles.get(userId); if (!profile) return;
  state.activeDmUserId = userId; state.dmMessagesMap.clear();
  ui.dmEmpty.classList.add("hidden"); ui.dmConversation.classList.remove("hidden");
  setAvatar(ui.dmAvatar, profile, "avatar-md"); ui.dmName.textContent = profile.display_name || profile.username; ui.dmStatus.textContent = profile.custom_status || `@${profile.username}`;
  ui.dmMessages.replaceChildren(makeEl("div", "empty-mini", "Carregando…"));
  const uid = state.user.id;
  const { data, error } = await state.supabase.from("direct_messages").select("id,sender_id,recipient_id,content,attachments,created_at,edited_at,read_at").or(`and(sender_id.eq.${uid},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${uid})`).order("created_at", { ascending: true }).limit(150);
  ui.dmMessages.replaceChildren();
  if (error) return ui.dmMessages.appendChild(makeEl("div", "empty-mini", "Não foi possível carregar a conversa."));
  for (const row of data || []) renderDmMessage(row);
  ui.dmMessages.scrollTop = ui.dmMessages.scrollHeight; ui.dmInput.focus();
}

function closeDm() { state.activeDmUserId = null; ui.dmConversation.classList.add("hidden"); ui.dmEmpty.classList.remove("hidden"); ui.dmMessages.replaceChildren(); }
ui.dmBackBtn.addEventListener("click", closeDm);

function renderDmMessage(message, force = false) {
  const key = String(message.id); let row = document.querySelector(`[data-dm-id="${key}"]`); if (row && !force) return;
  state.dmMessagesMap.set(key, message);
  const mine = message.sender_id === state.user.id; const profile = mine ? state.profile : state.socialProfiles.get(message.sender_id);
  const node = makeEl("div", `dm-message${mine ? " mine" : ""}`); node.dataset.dmId = key;
  const avatar = makeEl("span", "avatar avatar-sm"); setAvatar(avatar, profile, "avatar-sm");
  const body = makeEl("div", "dm-message-body"); const head = makeEl("div", "dm-message-head"); head.append(makeEl("strong", "", mine ? "Você" : profile?.display_name || profile?.username || "Usuário"), makeEl("time", "", new Date(message.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })));
  const dmText = makeEl("div", "dm-message-text"); appendRichText(dmText, message.content || ""); body.append(head, dmText); renderAttachments(body, message.attachments || []);
  if (mine) { const del = makeEl("button", "message-action dm-delete", "×"); del.type = "button"; del.title = "Excluir"; del.addEventListener("click", async () => { const { error } = await state.supabase.from("direct_messages").delete().eq("id", message.id).eq("sender_id", state.user.id); if (error) toast("Não foi possível excluir."); }); node.append(avatar, body, del); } else node.append(avatar, body);
  if (row) row.replaceWith(node); else ui.dmMessages.appendChild(node);
}

ui.dmAttachBtn.addEventListener("click", () => ui.dmFileInput.click());
ui.dmForm.addEventListener("submit", async (event) => {
  event.preventDefault(); if (!state.activeDmUserId) return;
  const content = ui.dmInput.value.trim(); const file = ui.dmFileInput.files?.[0]; if (!content && !file) return;
  const submit = ui.dmForm.querySelector('button[type="submit"]'); setBusy(submit, true, "Enviando…");
  try {
    let attachments = []; if (file) attachments = [await uploadMessageFile(file, `dm-${state.activeDmUserId}`)];
    const { error } = await state.supabase.from("direct_messages").insert({ sender_id: state.user.id, recipient_id: state.activeDmUserId, content, attachments }); if (error) throw error;
    ui.dmInput.value = ""; ui.dmFileInput.value = "";
  } catch (error) { console.error(error); toast(error.message || "Não foi possível enviar a DM."); }
  finally { setBusy(submit, false); }
});

// -----------------------------------------------------------------------------
// Servers / channels / members
// -----------------------------------------------------------------------------
function myRoleIds() {
  if (!state.user) return [];
  return state.memberRoles.filter((item) => item.user_id === state.user.id).map((item) => item.role_id);
}
function hasPermission(permission) {
  if (!state.activeServer || !state.user) return false;
  if (state.activeServer.owner_id === state.user.id) return true;
  const ids = new Set(myRoleIds());
  const applicable = state.roles.filter((role) => role.is_default || ids.has(role.id));
  return applicable.some((role) => role.permissions?.includes("ADMINISTRATOR") || role.permissions?.includes(permission));
}

function renderServerRail() {
  ui.serverButtons.replaceChildren();
  for (const server of state.servers) {
    const button = makeEl("button", `server-button${server.id === state.activeServerId ? " active" : ""}`);
    button.type = "button";
    button.title = server.name;
    button.dataset.serverId = server.id;
    button.appendChild(serverIconNode(server));
    button.addEventListener("click", () => selectServer(server.id));
    ui.serverButtons.appendChild(button);
  }
}

async function loadServers(preferredId = null) {
  const { data, error } = await state.supabase.from("servers").select("id,owner_id,name,description,icon_url,created_at,updated_at").order("created_at", { ascending: true });
  if (error) throw error;
  state.servers = data || [];
  renderServerRail();

  const stored = preferredId || safeLocalStorageGet("tropa_active_server");
  const next = state.servers.find((s) => s.id === stored)?.id || state.servers[0]?.id || null;
  if (next) await selectServer(next, true);
  else clearActiveServer();
}

function clearActiveServer() {
  state.activeServerId = null;
  state.activeServer = null;
  state.channels = [];
  state.activeTextChannelId = null;
  state.serverMembers = [];
  state.roles = [];
  state.memberRoles = [];
  state.profiles.clear();
  ui.activeServerName.textContent = "Selecione um servidor";
  ui.serverMenuBtn.disabled = true;
  ui.channelList.replaceChildren();
  ui.homeHub.classList.add("hidden");
  ui.contentArea.classList.remove("home-mode");
  ui.emptyState.classList.remove("hidden");
  ui.messages.classList.add("hidden");
  ui.composerWrap.classList.add("hidden");
  ui.activeChannelName.textContent = "Tropa da Lan";
  ui.activeChannelTopic.textContent = "Crie um servidor ou use um convite para começar";
  ui.activeChannelIcon.textContent = "#";
  ui.membersList.replaceChildren();
}

async function selectServer(serverId, initial = false) {
  if (!serverId || (!initial && serverId === state.activeServerId && !state.homeMode)) { closeDrawers(); return; }
  state.homeMode = false;
  ui.homeHub.classList.add("hidden");
  ui.contentArea.classList.remove("home-mode");
  const server = state.servers.find((s) => s.id === serverId);
  if (!server) return;
  const token = ++state.serverLoadToken;
  connectionStatus("Carregando…");
  closeDrawers();
  ui.serverQuickMenu.classList.add("hidden");

  if (state.voiceJoinedChannelId) await leaveVoice();
  await cleanupActiveServerRealtime();

  state.activeServerId = serverId;
  state.activeServer = server;
  state.activeTextChannelId = null;
  safeLocalStorageSet("tropa_active_server", serverId);
  renderServerRail();
  ui.activeServerName.textContent = server.name;
  ui.serverMenuBtn.disabled = false;

  try {
    await loadServerBundle();
    if (token !== state.serverLoadToken) return;
    await setupServerPresence();
    await setupServerDataRealtime();
    await syncVoiceWatchers();
    connectionStatus("Online", "online");
    ui.emptyState.classList.add("hidden");
    const savedChannel = safeLocalStorageGet(`tropa_text_channel_${serverId}`);
    const firstText = state.channels.find((c) => c.type === "text" && c.id === savedChannel) || state.channels.find((c) => c.type === "text");
    if (firstText) await selectTextChannel(firstText.id);
    else {
      ui.messages.classList.add("hidden"); ui.composerWrap.classList.add("hidden");
      ui.activeChannelName.textContent = server.name; ui.activeChannelTopic.textContent = "Nenhum canal de texto";
    }
  } catch (error) {
    console.error(error);
    connectionStatus("Erro", "error");
    toast("Não consegui carregar este servidor. Confira se o SQL V4 foi executado.", 6500);
  }
}

async function loadServerBundle() {
  if (!state.activeServerId) return;
  const sid = state.activeServerId;
  const [channelsRes, membersRes, rolesRes, memberRolesRes] = await Promise.all([
    state.supabase.from("channels").select("id,server_id,name,type,topic,position,created_by,created_at").eq("server_id", sid).order("position").order("created_at"),
    state.supabase.from("server_members").select("server_id,user_id,nickname,joined_at").eq("server_id", sid).order("joined_at"),
    state.supabase.from("roles").select("id,server_id,name,color,position,permissions,is_default,created_at").eq("server_id", sid).order("position", { ascending: false }).order("created_at"),
    state.supabase.from("member_roles").select("server_id,user_id,role_id,assigned_at").eq("server_id", sid)
  ]);
  for (const res of [channelsRes, membersRes, rolesRes, memberRolesRes]) if (res.error) throw res.error;

  state.channels = channelsRes.data || [];
  state.serverMembers = membersRes.data || [];
  state.roles = rolesRes.data || [];
  state.memberRoles = memberRolesRes.data || [];
  const ids = state.serverMembers.map((m) => m.user_id);
  state.profiles.clear();
  if (ids.length) {
    const { data, error } = await state.supabase.from("profiles").select("user_id,username,display_name,bio,custom_status,avatar_url,banner_url,presence_mode,created_at").in("user_id", ids);
    if (error) throw error;
    for (const p of data || []) state.profiles.set(p.user_id, p);
  }

  renderChannels();
  renderMembers();
  renderServerQuickMenuPermissions();
  if (ui.serverSettingsDialog.open) renderSettingsAll();
}

function renderServerQuickMenuPermissions() {
  const canInvite = hasPermission("CREATE_INSTANT_INVITE");
  const canChannels = hasPermission("MANAGE_CHANNELS");
  const canSettings = hasPermission("MANAGE_SERVER") || hasPermission("MANAGE_ROLES") || hasPermission("KICK_MEMBERS");
  ui.quickInviteBtn.classList.toggle("hidden", !canInvite);
  ui.quickCreateChannelBtn.classList.toggle("hidden", !canChannels);
  ui.quickSettingsBtn.classList.toggle("hidden", !canSettings && state.activeServer?.owner_id !== state.user?.id);
  ui.quickEventsBtn?.classList.remove("hidden");
  ui.quickLeaveServerBtn.classList.toggle("hidden", state.activeServer?.owner_id === state.user?.id);
}

function scheduleServerBundleRefresh() {
  clearTimeout(state.realtimeRefreshTimer);
  const sid = state.activeServerId;
  state.realtimeRefreshTimer = setTimeout(async () => {
    if (sid !== state.activeServerId) return;
    try {
      await loadServerBundle();
      await syncVoiceWatchers();
      if (state.activeTextChannelId && !state.channels.some((c) => c.id === state.activeTextChannelId)) {
        const first = state.channels.find((c) => c.type === "text");
        if (first) await selectTextChannel(first.id); else state.activeTextChannelId = null;
      }
      if (state.voiceJoinedChannelId && !state.channels.some((c) => c.id === state.voiceJoinedChannelId)) await leaveVoice();
    } catch (error) { console.warn("Falha ao atualizar servidor em tempo real", error); }
  }, 180);
}

async function setupServerDataRealtime() {
  if (!state.activeServerId) return;
  const sid = state.activeServerId;
  const channel = state.supabase.channel(`server-db:${sid}:${uuidish()}`);
  for (const table of ["channels", "server_members", "roles", "member_roles", "server_events"]) {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
      const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
      if (!row?.server_id || row.server_id === sid) scheduleServerBundleRefresh();
    });
  }
  channel.subscribe((status) => {
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") connectionStatus("Realtime instável", "error");
  });
  state.serverDataChannel = channel;
}

async function setupServerPresence() {
  if (!state.activeServerId) return;
  const sid = state.activeServerId;
  const ch = state.supabase.channel(`server-presence:${sid}`, { config: { presence: { key: state.user.id } } });
  ch.on("presence", { event: "sync" }, () => {
    const presence = ch.presenceState();
    state.onlineUserIds = new Set(Object.keys(presence));
    renderMembers();
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout presence")), 10000);
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timer);
        try { if (state.profile?.presence_mode !== "invisible") await ch.track(serverPresencePayload()); } catch (_) {}
        resolve();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { clearTimeout(timer); reject(new Error(status)); }
    });
  });
  state.serverPresence = ch;
}

function serverPresencePayload() {
  return {
    user_id: state.user.id,
    display_name: state.profile?.display_name || state.profile?.username || "Usuário",
    username: state.profile?.username || "usuario",
    avatar_url: state.profile?.avatar_url || null,
    custom_status: state.profile?.custom_status || "",
    presence_mode: state.profile?.presence_mode || "online",
    at: new Date().toISOString()
  };
}
async function retrackServerPresence() {
  if (!state.serverPresence) return;
  try {
    if (state.profile?.presence_mode === "invisible") await state.serverPresence.untrack();
    else await state.serverPresence.track(serverPresencePayload());
  } catch (_) {}
}

async function cleanupActiveServerRealtime() {
  clearTimeout(state.realtimeRefreshTimer);
  await cleanupChatSubscription();
  if (state.serverPresence) {
    try { await state.serverPresence.untrack(); } catch (_) {}
    try { await state.supabase.removeChannel(state.serverPresence); } catch (_) {}
    state.serverPresence = null;
  }
  if (state.serverDataChannel) {
    try { await state.supabase.removeChannel(state.serverDataChannel); } catch (_) {}
    state.serverDataChannel = null;
  }
  await cleanupVoiceWatchers();
  state.onlineUserIds.clear();
}

function topRoleForUser(userId) {
  const ids = new Set(state.memberRoles.filter((mr) => mr.user_id === userId).map((mr) => mr.role_id));
  return state.roles.filter((r) => !r.is_default && ids.has(r.id)).sort((a, b) => b.position - a.position)[0] || state.roles.find((r) => r.is_default) || null;
}

function userInAnyVoice(userId) {
  for (const presences of state.voicePresence.values()) if (presences.some((p) => p.user_id === userId)) return true;
  return false;
}

function renderMembers() {
  ui.membersList.replaceChildren();
  if (!state.activeServer) return;
  const term = (ui.membersSearchInput?.value || "").trim().toLowerCase();
  const members = state.serverMembers.map((m) => ({ ...m, profile: state.profiles.get(m.user_id) })).filter((m) => m.profile).filter((m) => {
    if (!term) return true;
    const hay = `${m.nickname || ""} ${m.profile.display_name || ""} ${m.profile.username || ""} ${m.profile.custom_status || ""}`.toLowerCase();
    return hay.includes(term);
  });
  members.sort((a, b) => {
    const ao = state.onlineUserIds.has(a.user_id) ? 0 : 1;
    const bo = state.onlineUserIds.has(b.user_id) ? 0 : 1;
    if (ao !== bo) return ao - bo;
    const ar = topRoleForUser(a.user_id)?.position || 0;
    const br = topRoleForUser(b.user_id)?.position || 0;
    if (ar !== br) return br - ar;
    return a.profile.display_name.localeCompare(b.profile.display_name, "pt-BR");
  });

  const groups = [
    ["ONLINE", members.filter((m) => state.onlineUserIds.has(m.user_id))],
    ["OFFLINE", members.filter((m) => !state.onlineUserIds.has(m.user_id))]
  ];
  for (const [label, list] of groups) {
    if (!list.length) continue;
    ui.membersList.appendChild(makeEl("div", "member-group-title", `${label} — ${list.length}`));
    for (const member of list) {
      const row = makeEl("div", "member-row");
      const avatarWrap = makeEl("div", "member-avatar-wrap");
      const avatar = makeEl("span", "avatar avatar-md"); setAvatar(avatar, member.profile, "avatar-md");
      const isOnline = state.onlineUserIds.has(member.user_id);
      const mode = member.profile.presence_mode || "online";
      const dot = makeEl("span", `presence-dot${isOnline ? ` online ${mode}` : ""}`);
      avatarWrap.append(avatar, dot);
      const meta = makeEl("div", "member-meta");
      const role = topRoleForUser(member.user_id);
      const name = makeEl("strong", "", member.nickname || member.profile.display_name);
      if (role && !role.is_default) name.style.color = role.color;
      const presenceLabel = isOnline ? (mode === "dnd" ? "Não perturbe" : mode === "idle" ? "Ausente" : "Online") : "Offline";
      const statusText = member.profile.custom_status || (member.user_id === state.activeServer.owner_id ? "Dono do servidor" : role?.name || presenceLabel);
      meta.append(name, makeEl("small", "", statusText));
      row.append(avatarWrap, meta);
      if (userInAnyVoice(member.user_id)) row.appendChild(makeEl("span", "member-call-icon", "● voz"));
      ui.membersList.appendChild(row);
    }
  }
}

ui.membersSearchInput?.addEventListener("input", renderMembers);

function channelAdminActions(channel) {
  if (!hasPermission("MANAGE_CHANNELS")) return null;
  const wrap = makeEl("div", "channel-admin-actions");
  const edit = makeEl("button", "", "✎"); edit.type = "button"; edit.title = "Editar canal";
  edit.addEventListener("click", async (event) => {
    event.stopPropagation();
    const nameInput = prompt("Novo nome do canal:", channel.name); if (nameInput === null) return;
    const name = channel.type === "text" ? slugifyChannel(nameInput) : nameInput.trim().slice(0, 32); if (!name) return;
    let topic = channel.topic || "";
    if (channel.type === "text") { const t = prompt("Tópico do canal:", topic); if (t === null) return; topic = t.trim().slice(0, 180); }
    const { error } = await state.supabase.from("channels").update({ name, topic }).eq("id", channel.id);
    if (error) return toast(error.message || "Não foi possível editar o canal."); await loadServerBundle(); toast("Canal atualizado.");
  });
  const up = makeEl("button", "", "↑"); up.type = "button"; up.title = "Mover para cima"; up.addEventListener("click", (event) => { event.stopPropagation(); moveChannel(channel, -1); });
  const down = makeEl("button", "", "↓"); down.type = "button"; down.title = "Mover para baixo"; down.addEventListener("click", (event) => { event.stopPropagation(); moveChannel(channel, 1); });
  const del = makeEl("button", "danger-text", "×"); del.type = "button"; del.title = "Excluir canal"; del.addEventListener("click", async (event) => {
    event.stopPropagation(); if (!confirm(`Excluir ${channel.type === "text" ? "#" : "🔊 "}${channel.name}?`)) return;
    const { error } = await state.supabase.from("channels").delete().eq("id", channel.id); if (error) return toast(error.message || "Não foi possível excluir o canal.");
    if (state.voiceJoinedChannelId === channel.id) await leaveVoice(); await loadServerBundle(); toast("Canal excluído.");
  });
  wrap.append(edit, up, down, del); return wrap;
}

async function moveChannel(channel, delta) {
  const same = state.channels.filter((c) => c.type === channel.type).sort((a, b) => (a.position - b.position) || a.created_at.localeCompare(b.created_at));
  const index = same.findIndex((c) => c.id === channel.id); const other = same[index + delta]; if (!other) return;
  const aPos = Number(channel.position || index), bPos = Number(other.position || index + delta);
  const [a, b] = await Promise.all([
    state.supabase.from("channels").update({ position: bPos }).eq("id", channel.id),
    state.supabase.from("channels").update({ position: aPos }).eq("id", other.id)
  ]);
  if (a.error || b.error) return toast("Não foi possível reorganizar os canais."); await loadServerBundle();
}

function renderChannels() {
  ui.channelList.replaceChildren();
  if (!state.activeServer) return;
  const textChannels = state.channels.filter((c) => c.type === "text");
  const voiceChannels = state.channels.filter((c) => c.type === "voice");

  const addCategory = (title, canAdd) => {
    const cat = makeEl("div", "channel-category");
    cat.appendChild(makeEl("span", "", title));
    if (canAdd) {
      const add = makeEl("button", "", "+"); add.type = "button"; add.title = "Criar canal"; add.addEventListener("click", openChannelDialog); cat.appendChild(add);
    }
    ui.channelList.appendChild(cat);
  };
  addCategory("CANAIS DE TEXTO", hasPermission("MANAGE_CHANNELS"));
  for (const channel of textChannels) {
    const row = makeEl("div", "channel-row");
    const btn = makeEl("button", `channel-button${channel.id === state.activeTextChannelId ? " active" : ""}`);
    btn.type = "button"; btn.dataset.channelId = channel.id;
    btn.append(makeEl("span", "channel-symbol", "#"), makeEl("span", "channel-name", channel.name));
    btn.addEventListener("click", () => selectTextChannel(channel.id));
    row.appendChild(btn); const admin = channelAdminActions(channel); if (admin) row.appendChild(admin); ui.channelList.appendChild(row);
  }
  addCategory("CANAIS DE VOZ", hasPermission("MANAGE_CHANNELS"));
  for (const channel of voiceChannels) {
    const row = makeEl("div", "channel-row");
    const btn = makeEl("button", `channel-button${channel.id === state.voiceJoinedChannelId ? " active" : ""}`);
    btn.type = "button";
    btn.append(makeEl("span", "channel-symbol", "🔊"), makeEl("span", "channel-name", channel.name));
    btn.addEventListener("click", () => joinVoice(channel.id));
    row.appendChild(btn);
    const mini = makeEl("div", "voice-members-mini");
    const presences = state.voicePresence.get(channel.id) || [];
    for (const p of presences) {
      const item = makeEl("div", "voice-member-mini");
      const avatar = makeEl("span", "avatar"); setAvatar(avatar, { display_name: p.display_name, username: p.username, avatar_url: p.avatar_url });
      item.append(avatar, makeEl("span", "", `${p.display_name || p.username || "Usuário"}${p.muted ? " 🔇" : ""}${p.screen ? " 🖥" : p.camera ? " 📷" : ""}`));
      mini.appendChild(item);
    }
    row.appendChild(mini); const admin = channelAdminActions(channel); if (admin) row.appendChild(admin); ui.channelList.appendChild(row);
  }
}

// -----------------------------------------------------------------------------
// Text chat — respostas, edição, anexos, reações, enquetes, busca e pins
// -----------------------------------------------------------------------------
async function cleanupChatSubscription() {
  if (state.chatChannel) {
    try { await state.supabase.removeChannel(state.chatChannel); } catch (_) {}
    state.chatChannel = null;
  }
  state.typingUsers.clear();
  renderTypingIndicator();
}

function activeTextChannel() { return state.channels.find((c) => c.id === state.activeTextChannelId) || null; }

async function selectTextChannel(channelId) {
  const channel = state.channels.find((c) => c.id === channelId && c.type === "text");
  if (!channel) return;
  state.homeMode = false;
  ui.homeHub.classList.add("hidden");
  ui.contentArea.classList.remove("home-mode");
  state.activeTextChannelId = channelId;
  safeLocalStorageSet(`tropa_text_channel_${state.activeServerId}`, channelId);
  renderChannels();
  closeDrawers();
  ui.emptyState.classList.add("hidden");
  ui.messages.classList.remove("hidden");
  ui.composerWrap.classList.remove("hidden");
  ui.mediaStage.classList.remove("home-hidden");
  ui.activeChannelIcon.textContent = "#";
  ui.activeChannelName.textContent = channel.name;
  ui.activeChannelTopic.textContent = channel.topic || `Canal #${channel.name}`;
  ui.messageInput.placeholder = `Conversar em #${channel.name}`;
  ui.topbarSearchInput.placeholder = `Buscar em #${channel.name}`;
  ui.topbarSearchInput.value = "";
  ui.messageInput.disabled = !hasPermission("SEND_MESSAGES");
  ui.sendBtn.disabled = !hasPermission("SEND_MESSAGES");
  ui.attachBtn.disabled = !hasPermission("SEND_MESSAGES");
  ui.quickPollBtn.disabled = !hasPermission("SEND_MESSAGES");
  clearReply(); cancelMessageEdit(); clearPendingAttachment();
  const token = ++state.messageLoadToken;
  await cleanupChatSubscription();
  resetMessages(channel);
  await loadMessages(channel.id, token);
  if (token !== state.messageLoadToken || channel.id !== state.activeTextChannelId) return;
  subscribeMessages(channel.id, token);
}

function resetMessages(channel) {
  state.renderedMessages.clear();
  state.messageMap.clear();
  state.reactionMap.clear();
  state.pollVotes.clear();
  ui.messages.replaceChildren();
  const welcome = makeEl("div", "channel-welcome");
  welcome.append(makeEl("div", "welcome-symbol", "#"), makeEl("h2", "", `Bem-vindo a #${channel.name}`), makeEl("p", "", channel.topic || `Este é o começo do canal #${channel.name}.`));
  ui.messages.appendChild(welcome);
}

function profileForMessage(userId) {
  return state.profiles.get(userId) || state.socialProfiles.get(userId) || { display_name: "Usuário", username: "usuario", avatar_url: null };
}

function messageReplySummary(message) {
  if (!message?.reply_to) return null;
  const original = state.messageMap.get(String(message.reply_to));
  if (!original) return { author: "Mensagem anterior", content: "Mensagem não carregada" };
  const p = profileForMessage(original.user_id);
  return { author: p.display_name || p.username, content: original.content || (original.kind === "poll" ? "Enquete" : "Anexo") };
}

function attachmentKind(file) {
  const type = String(file?.type || "");
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "file";
}

function renderAttachments(container, attachments = []) {
  if (!Array.isArray(attachments) || !attachments.length) return;
  const wrap = makeEl("div", "message-attachments");
  for (const item of attachments) {
    if (!item?.url) continue;
    const kind = item.kind || "file";
    if (kind === "image") {
      const link = makeEl("a", "attachment-image-link"); link.href = item.url; link.target = "_blank"; link.rel = "noopener";
      const img = document.createElement("img"); img.src = item.url; img.alt = item.name || "Imagem"; img.loading = "lazy"; link.appendChild(img); wrap.appendChild(link);
    } else if (kind === "video") {
      const video = document.createElement("video"); video.src = item.url; video.controls = true; video.preload = "metadata"; video.className = "attachment-media"; wrap.appendChild(video);
    } else if (kind === "audio") {
      const audio = document.createElement("audio"); audio.src = item.url; audio.controls = true; audio.preload = "metadata"; wrap.appendChild(audio);
    } else {
      const link = makeEl("a", "attachment-file"); link.href = item.url; link.target = "_blank"; link.rel = "noopener";
      link.append(makeEl("span", "attachment-file-icon", "↧"), makeEl("span", "", item.name || "Arquivo")); wrap.appendChild(link);
    }
  }
  container.appendChild(wrap);
}

function reactionEntries(messageId) {
  const all = state.reactionMap.get(String(messageId)) || [];
  const groups = new Map();
  for (const row of all) {
    if (!groups.has(row.emoji)) groups.set(row.emoji, []);
    groups.get(row.emoji).push(row.user_id);
  }
  return groups;
}

function renderReactions(container, message) {
  const groups = reactionEntries(message.id);
  if (!groups.size) return;
  const bar = makeEl("div", "reaction-bar");
  for (const [emoji, users] of groups) {
    const mine = users.includes(state.user.id);
    const button = makeEl("button", `reaction-chip${mine ? " active" : ""}`, `${emoji} ${users.length}`);
    button.type = "button";
    button.title = mine ? "Remover reação" : "Reagir";
    button.addEventListener("click", () => toggleReaction(message.id, emoji, mine));
    bar.appendChild(button);
  }
  container.appendChild(bar);
}

function renderPoll(container, message) {
  if (message.kind !== "poll") return false;
  const options = Array.isArray(message.metadata?.options) ? message.metadata.options.slice(0, 6) : [];
  const votes = state.pollVotes.get(String(message.id)) || [];
  const myVote = votes.find((v) => v.user_id === state.user.id)?.option_index;
  const poll = makeEl("div", "poll-card");
  poll.appendChild(makeEl("strong", "poll-question", message.content || "Enquete"));
  const total = votes.length;
  options.forEach((option, index) => {
    const count = votes.filter((v) => Number(v.option_index) === index).length;
    const pct = total ? Math.round((count / total) * 100) : 0;
    const btn = makeEl("button", `poll-option${Number(myVote) === index ? " selected" : ""}`);
    btn.type = "button";
    const label = makeEl("span", "poll-option-label", option);
    const stat = makeEl("span", "poll-option-stat", `${count} • ${pct}%`);
    const fill = makeEl("span", "poll-option-fill"); fill.style.width = `${pct}%`;
    btn.append(fill, label, stat);
    btn.addEventListener("click", () => votePoll(message.id, index));
    poll.appendChild(btn);
  });
  poll.appendChild(makeEl("small", "poll-total", `${total} voto${total === 1 ? "" : "s"}`));
  container.appendChild(poll);
  return true;
}

function renderMessage(message, { force = false } = {}) {
  if (!message?.id) return;
  const key = String(message.id);
  state.messageMap.set(key, message);
  let article = document.querySelector(`[data-message-id="${key}"]`);
  if (article && !force) return;
  const old = article;
  article = makeEl("article", `message${message.pinned ? " pinned-message" : ""}`);
  article.dataset.messageId = key;
  const profile = profileForMessage(message.user_id);
  const avatar = makeEl("span", "avatar avatar-md"); setAvatar(avatar, profile, "avatar-md");
  const content = makeEl("div", "message-content");

  const reply = messageReplySummary(message);
  if (reply) {
    const replyNode = makeEl("button", "message-reply-context"); replyNode.type = "button";
    replyNode.append(makeEl("strong", "", reply.author), makeEl("span", "", reply.content.slice(0, 120)));
    replyNode.addEventListener("click", () => document.querySelector(`[data-message-id="${message.reply_to}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    content.appendChild(replyNode);
  }

  const head = makeEl("div", "message-head");
  const author = makeEl("strong", "message-author", profile.display_name || profile.username);
  const role = topRoleForUser(message.user_id); if (role && !role.is_default) author.style.color = role.color;
  const time = makeEl("time", "message-time", new Date(message.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }));
  head.append(author, time);
  if (message.edited_at) head.appendChild(makeEl("span", "message-edited", "editada"));
  if (message.pinned) head.appendChild(makeEl("span", "message-pin-badge", "FIXADA"));
  content.appendChild(head);

  if (!renderPoll(content, message)) {
    const body = makeEl("div", "message-body"); appendRichText(body, message.content || "");
    content.appendChild(body);
  }
  renderAttachments(content, message.attachments);
  renderReactions(content, message);

  article.append(avatar, content);
  const actions = makeEl("div", "message-actions");
  const replyBtn = makeEl("button", "message-action", "↩"); replyBtn.type = "button"; replyBtn.title = "Responder"; replyBtn.addEventListener("click", () => beginReply(message)); actions.appendChild(replyBtn);
  const reactBtn = makeEl("button", "message-action", "♡"); reactBtn.type = "button"; reactBtn.title = "Reagir"; reactBtn.addEventListener("click", () => quickReactionMenu(message.id, reactBtn)); actions.appendChild(reactBtn);
  if (message.user_id === state.user.id && message.kind === "text") {
    const edit = makeEl("button", "message-action", "✎"); edit.type = "button"; edit.title = "Editar"; edit.addEventListener("click", () => beginMessageEdit(message)); actions.appendChild(edit);
  }
  if (hasPermission("MANAGE_MESSAGES")) {
    const pin = makeEl("button", "message-action", message.pinned ? "⌖" : "⌾"); pin.type = "button"; pin.title = message.pinned ? "Desafixar" : "Fixar"; pin.addEventListener("click", () => setMessagePin(message.id, !message.pinned)); actions.appendChild(pin);
  }
  if (message.user_id === state.user.id || hasPermission("MANAGE_MESSAGES")) {
    const del = makeEl("button", "message-action danger", "×"); del.type = "button"; del.title = "Excluir mensagem"; del.addEventListener("click", () => deleteMessage(message.id)); actions.appendChild(del);
  }
  article.appendChild(actions);

  if (old) old.replaceWith(article); else ui.messages.appendChild(article);
  state.renderedMessages.add(key);
}

async function loadMessageExtras(ids) {
  if (!ids.length) return;
  const [reactionsRes, votesRes] = await Promise.all([
    state.supabase.from("message_reactions").select("message_id,user_id,emoji,created_at").in("message_id", ids),
    state.supabase.from("poll_votes").select("message_id,user_id,option_index,created_at").in("message_id", ids)
  ]);
  if (!reactionsRes.error) {
    state.reactionMap.clear();
    for (const row of reactionsRes.data || []) {
      const key = String(row.message_id); if (!state.reactionMap.has(key)) state.reactionMap.set(key, []); state.reactionMap.get(key).push(row);
    }
  }
  if (!votesRes.error) {
    state.pollVotes.clear();
    for (const row of votesRes.data || []) {
      const key = String(row.message_id); if (!state.pollVotes.has(key)) state.pollVotes.set(key, []); state.pollVotes.get(key).push(row);
    }
  }
}

async function refreshMessageExtras(messageId) {
  const id = Number(messageId); if (!id) return;
  const [reactionsRes, votesRes] = await Promise.all([
    state.supabase.from("message_reactions").select("message_id,user_id,emoji,created_at").eq("message_id", id),
    state.supabase.from("poll_votes").select("message_id,user_id,option_index,created_at").eq("message_id", id)
  ]);
  if (!reactionsRes.error) state.reactionMap.set(String(id), reactionsRes.data || []);
  if (!votesRes.error) state.pollVotes.set(String(id), votesRes.data || []);
  const message = state.messageMap.get(String(id)); if (message) renderMessage(message, { force: true });
}

async function loadMessages(channelId, token, searchTerm = "") {
  let query = state.supabase.from("channel_messages")
    .select("id,channel_id,user_id,content,reply_to,created_at,edited_at,attachments,kind,metadata,pinned,pinned_by,pinned_at")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(searchTerm ? 60 : 100);
  if (searchTerm) query = query.ilike("content", `%${searchTerm.replace(/[%_]/g, "").trim()}%`);
  const { data, error } = await query;
  if (error) { console.error(error); toast("Não consegui carregar as mensagens."); return; }
  if (token !== state.messageLoadToken || channelId !== state.activeTextChannelId) return;
  const rows = [...(data || [])].reverse();
  await loadMessageExtras(rows.map((m) => m.id));
  rows.forEach((row) => { state.messageMap.set(String(row.id), row); renderMessage(row, { force: true }); });
  if (!searchTerm) ui.messages.scrollTop = ui.messages.scrollHeight;
}

function renderTypingIndicator() {
  const now = Date.now();
  for (const [id, item] of [...state.typingUsers.entries()]) if (now - item.at > 4500) state.typingUsers.delete(id);
  const names = [...state.typingUsers.values()].filter((x) => x.user_id !== state.user?.id).map((x) => x.name);
  ui.typingIndicator.textContent = names.length ? `${names.slice(0, 2).join(" e ")}${names.length > 2 ? ` +${names.length - 2}` : ""} está digitando…` : "";
}

async function sendTyping() {
  if (!state.chatChannel || !state.activeTextChannelId || !state.user) return;
  clearTimeout(state.typingBroadcastTimer);
  try { await state.chatChannel.send({ type: "broadcast", event: "typing", payload: { user_id: state.user.id, name: state.profile?.display_name || state.profile?.username || "Usuário", at: Date.now() } }); } catch (_) {}
  state.typingBroadcastTimer = setTimeout(() => {}, 2500);
}

function subscribeMessages(channelId, token) {
  const rt = state.supabase.channel(`messages:${channelId}:${uuidish()}`)
    .on("broadcast", { event: "typing" }, ({ payload }) => {
      if (!payload?.user_id || payload.user_id === state.user.id) return;
      state.typingUsers.set(payload.user_id, { ...payload, at: Date.now() }); renderTypingIndicator(); setTimeout(renderTypingIndicator, 4700);
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "channel_messages", filter: `channel_id=eq.${channelId}` }, async ({ new: row }) => {
      if (token !== state.messageLoadToken || channelId !== state.activeTextChannelId) return;
      state.messageMap.set(String(row.id), row); renderMessage(row, { force: true }); ui.messages.scrollTop = ui.messages.scrollHeight;
      if (row.user_id !== state.user.id) { const p = profileForMessage(row.user_id); playSoftTone("message"); notifyDesktop(`${p.display_name || p.username} em #${activeTextChannel()?.name || "canal"}`, row.content || "Novo conteúdo"); }
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "channel_messages", filter: `channel_id=eq.${channelId}` }, ({ new: row }) => {
      if (token !== state.messageLoadToken || channelId !== state.activeTextChannelId) return;
      state.messageMap.set(String(row.id), row); renderMessage(row, { force: true });
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "channel_messages" }, ({ old }) => {
      document.querySelector(`[data-message-id="${old.id}"]`)?.remove(); state.renderedMessages.delete(String(old.id)); state.messageMap.delete(String(old.id));
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, ({ new: n, old: o }) => refreshMessageExtras(n?.message_id || o?.message_id))
    .on("postgres_changes", { event: "*", schema: "public", table: "poll_votes" }, ({ new: n, old: o }) => refreshMessageExtras(n?.message_id || o?.message_id));
  rt.subscribe(); state.chatChannel = rt;
}

ui.messageInput.addEventListener("input", () => { sendTyping(); });

function beginReply(message) {
  state.replyToMessageId = message.id;
  state.editingMessageId = null;
  ui.editBar.classList.add("hidden");
  const p = profileForMessage(message.user_id);
  ui.replyLabel.textContent = `Respondendo a ${p.display_name || p.username}`;
  ui.replyPreview.textContent = (message.content || (message.kind === "poll" ? "Enquete" : "Anexo")).slice(0, 130);
  ui.replyBar.classList.remove("hidden");
  ui.messageInput.focus();
}
function clearReply() { state.replyToMessageId = null; ui.replyBar.classList.add("hidden"); }
ui.cancelReplyBtn.addEventListener("click", clearReply);

function beginMessageEdit(message) {
  state.editingMessageId = message.id;
  state.replyToMessageId = null;
  ui.replyBar.classList.add("hidden");
  ui.editBar.classList.remove("hidden");
  ui.messageInput.value = message.content || "";
  ui.messageInput.focus(); ui.messageInput.setSelectionRange(ui.messageInput.value.length, ui.messageInput.value.length);
}
function cancelMessageEdit() {
  if (!state.editingMessageId) return;
  state.editingMessageId = null; ui.editBar.classList.add("hidden"); ui.messageInput.value = "";
}
ui.cancelEditBtn.addEventListener("click", cancelMessageEdit);

async function uploadMessageFile(file, scope = "channel") {
  if (!file) return null;
  if (file.size > 25 * 1024 * 1024) throw new Error("O arquivo precisa ter até 25 MB.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "arquivo";
  const path = `${state.user.id}/${scope}/${Date.now()}-${uuidish().slice(0, 8)}-${safeName}`;
  const { error } = await state.supabase.storage.from("message-files").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  const url = state.supabase.storage.from("message-files").getPublicUrl(path).data.publicUrl;
  return { url, name: file.name, size: file.size, type: file.type || "application/octet-stream", kind: attachmentKind(file) };
}

function clearPendingAttachment() { state.pendingAttachment = null; ui.messageFileInput.value = ""; ui.attachmentPreview.classList.add("hidden"); ui.attachmentPreview.replaceChildren(); }
ui.attachBtn.addEventListener("click", () => ui.messageFileInput.click());
ui.messageFileInput.addEventListener("change", () => {
  const file = ui.messageFileInput.files?.[0]; if (!file) return;
  if (file.size > 25 * 1024 * 1024) { clearPendingAttachment(); return toast("O arquivo precisa ter até 25 MB."); }
  state.pendingAttachment = file;
  ui.attachmentPreview.replaceChildren();
  const info = makeEl("div", "attachment-draft"); info.append(makeEl("strong", "", file.name), makeEl("small", "", `${(file.size / 1024 / 1024).toFixed(1)} MB`));
  const remove = makeEl("button", "tiny-icon", "✕"); remove.type = "button"; remove.addEventListener("click", clearPendingAttachment);
  ui.attachmentPreview.append(info, remove); ui.attachmentPreview.classList.remove("hidden");
});

ui.messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.sendingMessage || !state.activeTextChannelId) return;
  const content = ui.messageInput.value.trim();
  if (!content && !state.pendingAttachment) return;
  if (content.length > 2000) return toast("Mensagem grande demais.");
  state.sendingMessage = true; ui.sendBtn.disabled = true;
  try {
    if (state.editingMessageId) {
      if (!content) throw new Error("A mensagem não pode ficar vazia.");
      const { error } = await state.supabase.from("channel_messages").update({ content, edited_at: new Date().toISOString() }).eq("id", state.editingMessageId).eq("user_id", state.user.id);
      if (error) throw error;
      cancelMessageEdit();
    } else {
      let attachments = [];
      if (state.pendingAttachment) attachments = [await uploadMessageFile(state.pendingAttachment, `server-${state.activeServerId}`)];
      const payload = { channel_id: state.activeTextChannelId, user_id: state.user.id, content: content || (attachments.length ? "Arquivo enviado" : ""), reply_to: state.replyToMessageId || null, attachments, kind: "text", metadata: {} };
      const { error } = await state.supabase.from("channel_messages").insert(payload);
      if (error) throw error;
      ui.messageInput.value = ""; clearReply(); clearPendingAttachment();
    }
  } catch (error) { console.error(error); toast(error.message || "Não foi possível enviar a mensagem."); }
  finally { state.sendingMessage = false; ui.sendBtn.disabled = !hasPermission("SEND_MESSAGES"); ui.messageInput.focus(); }
});

async function deleteMessage(id) {
  if (!confirm("Excluir esta mensagem?")) return;
  const { error } = await state.supabase.from("channel_messages").delete().eq("id", id);
  if (error) toast("Não foi possível excluir a mensagem.");
  else { document.querySelector(`[data-message-id="${id}"]`)?.remove(); state.messageMap.delete(String(id)); }
}

async function toggleReaction(messageId, emoji, remove = false) {
  const query = state.supabase.from("message_reactions");
  const result = remove
    ? await query.delete().eq("message_id", messageId).eq("user_id", state.user.id).eq("emoji", emoji)
    : await query.upsert({ message_id: messageId, user_id: state.user.id, emoji }, { onConflict: "message_id,user_id,emoji" });
  if (result.error) return toast("Não consegui atualizar a reação.");
  await refreshMessageExtras(messageId);
}

function quickReactionMenu(messageId, anchor) {
  document.querySelector(".quick-reaction-popover")?.remove();
  const pop = makeEl("div", "quick-reaction-popover");
  for (const emoji of ["👍", "❤️", "😂", "🔥", "🎮", "✅"]) {
    const btn = makeEl("button", "", emoji); btn.type = "button"; btn.addEventListener("click", async () => { const mine = (state.reactionMap.get(String(messageId)) || []).some((r) => r.user_id === state.user.id && r.emoji === emoji); await toggleReaction(messageId, emoji, mine); pop.remove(); }); pop.appendChild(btn);
  }
  anchor.closest(".message")?.appendChild(pop);
  setTimeout(() => document.addEventListener("click", function close(e) { if (!pop.contains(e.target) && e.target !== anchor) { pop.remove(); document.removeEventListener("click", close); } }), 0);
}

async function setMessagePin(messageId, pin) {
  const { error } = await state.supabase.rpc("set_message_pin", { p_message_id: messageId, p_pin: pin });
  if (error) return toast(error.message || "Não foi possível alterar a mensagem fixada.");
  const message = state.messageMap.get(String(messageId)); if (message) { message.pinned = pin; message.pinned_at = pin ? new Date().toISOString() : null; renderMessage(message, { force: true }); }
  toast(pin ? "Mensagem fixada." : "Mensagem desafixada.");
}

async function openPinnedMessages() {
  if (!state.activeTextChannelId) return;
  ui.pinnedList.replaceChildren(makeEl("div", "empty-mini", "Carregando…"));
  openDialog(ui.pinnedDialog);
  const { data, error } = await state.supabase.from("channel_messages").select("id,user_id,content,created_at,attachments,kind,metadata,pinned").eq("channel_id", state.activeTextChannelId).eq("pinned", true).order("pinned_at", { ascending: false });
  ui.pinnedList.replaceChildren();
  if (error) return ui.pinnedList.appendChild(makeEl("div", "empty-mini", "Não foi possível carregar."));
  if (!data?.length) return ui.pinnedList.appendChild(makeEl("div", "empty-mini", "Nenhuma mensagem fixada neste canal."));
  for (const row of data) {
    const p = profileForMessage(row.user_id); const card = makeEl("button", "pinned-item"); card.type = "button";
    card.append(makeEl("strong", "", p.display_name || p.username), makeEl("span", "", (row.content || "Conteúdo fixado").slice(0, 180)));
    card.addEventListener("click", () => { closeDialog(ui.pinnedDialog); document.querySelector(`[data-message-id="${row.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }); ui.pinnedList.appendChild(card);
  }
}
ui.pinnedMessagesBtn.addEventListener("click", openPinnedMessages);

let searchTimer = null;
ui.topbarSearchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const term = ui.topbarSearchInput.value.trim().toLowerCase();
    if (state.homeMode) {
      for (const row of ui.homeHub.querySelectorAll(".social-user-row")) row.classList.toggle("hidden", term && !row.textContent.toLowerCase().includes(term));
      return;
    }
    if (!state.activeTextChannelId) return;
    const channel = activeTextChannel(); if (!channel) return;
    resetMessages(channel);
    const token = state.messageLoadToken;
    await loadMessages(channel.id, token, term);
    if (term) ui.messages.prepend(makeEl("div", "search-summary", `Resultados para “${term}”`));
  }, 280);
});

ui.quickPollBtn.addEventListener("click", () => {
  if (!state.activeTextChannelId || !hasPermission("SEND_MESSAGES")) return;
  ui.pollQuestionInput.value = ""; ui.pollOptionsInput.value = ""; openDialog(ui.pollDialog); setTimeout(() => ui.pollQuestionInput.focus(), 30);
});
ui.pollForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = ui.pollQuestionInput.value.trim();
  const options = ui.pollOptionsInput.value.split(/\n+/).map((x) => x.trim()).filter(Boolean).slice(0, 6);
  if (!question || options.length < 2) return toast("Informe uma pergunta e pelo menos 2 opções.");
  const submit = ui.pollForm.querySelector('button[type="submit"]'); setBusy(submit, true, "Publicando…");
  try {
    const { error } = await state.supabase.from("channel_messages").insert({ channel_id: state.activeTextChannelId, user_id: state.user.id, content: question, kind: "poll", metadata: { options }, attachments: [] });
    if (error) throw error; closeDialog(ui.pollDialog); toast("Enquete publicada.");
  } catch (error) { console.error(error); toast(error.message || "Não foi possível publicar a enquete."); }
  finally { setBusy(submit, false); }
});

async function votePoll(messageId, optionIndex) {
  const { error } = await state.supabase.from("poll_votes").upsert({ message_id: messageId, user_id: state.user.id, option_index: optionIndex }, { onConflict: "message_id,user_id" });
  if (error) return toast("Não foi possível registrar seu voto.");
  await refreshMessageExtras(messageId);
}

// -----------------------------------------------------------------------------
// Create / join server, invite, channel
// -----------------------------------------------------------------------------
function openCreateServer() { ui.serverNameInput.value = ""; openDialog(ui.serverDialog); setTimeout(() => ui.serverNameInput.focus(), 30); }
ui.createServerBtn.addEventListener("click", openCreateServer);
ui.emptyCreateServerBtn.addEventListener("click", openCreateServer);

ui.serverForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = ui.serverNameInput.value.trim(); if (name.length < 2) return;
  const submit = ui.serverForm.querySelector('button[type="submit"]'); setBusy(submit, true, "Criando…");
  try {
    const { data: serverId, error } = await state.supabase.rpc("create_tropa_server", { p_name: name });
    if (error) throw error;
    if (!serverId) throw new Error("O servidor foi criado, mas o ID não foi retornado.");
    closeDialog(ui.serverDialog);
    await sleep(250);
    await loadServers(serverId);
    toast(`Servidor “${name}” criado.`);
  } catch (error) {
    console.error(error);
    const msg = String(error?.message || "erro");
    const missingRpc = error?.code === "PGRST202" || /create_tropa_server|schema cache/i.test(msg);
    toast(
      missingRpc
        ? "A função de criação de servidor ainda não foi instalada. Execute MIGRATION_V6_ULTIMATE.sql no Supabase e tente novamente."
        : `Não foi possível criar o servidor: ${msg}`,
      8000
    );
  }
  finally { setBusy(submit, false); }
});

function openJoinServer(prefill = "") {
  ui.joinInviteInput.value = prefill;
  ui.joinInvitePreview.classList.add("hidden");
  openDialog(ui.joinServerDialog);
  if (prefill) updateJoinInvitePreview();
  else setTimeout(() => ui.joinInviteInput.focus(), 30);
}
ui.joinServerBtn.addEventListener("click", () => openJoinServer());
ui.emptyJoinServerBtn.addEventListener("click", () => openJoinServer());
let invitePreviewTimer = null;
ui.joinInviteInput.addEventListener("input", () => { clearTimeout(invitePreviewTimer); invitePreviewTimer = setTimeout(updateJoinInvitePreview, 350); });
async function updateJoinInvitePreview() {
  const token = inviteTokenFrom(ui.joinInviteInput.value);
  if (!token) return ui.joinInvitePreview.classList.add("hidden");
  await previewInvite(token, ui.joinInvitePreview);
}

ui.joinServerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = inviteTokenFrom(ui.joinInviteInput.value); if (!token) return toast("Cole um convite válido.");
  setBusy(ui.acceptInviteBtn, true, "Entrando…");
  try {
    const { data, error } = await state.supabase.rpc("accept_invite", { p_token: token });
    if (error) throw error;
    state.pendingInviteToken = null;
    const url = new URL(location.href); url.searchParams.delete("invite"); history.replaceState({}, "", url);
    closeDialog(ui.joinServerDialog);
    await loadServers(data);
    toast("Você entrou no servidor.");
  } catch (error) { console.error(error); toast(error.message || "Não foi possível aceitar o convite.", 6000); }
  finally { setBusy(ui.acceptInviteBtn, false); }
});

function openInviteDialog() {
  if (!state.activeServer || !hasPermission("CREATE_INSTANT_INVITE")) return toast("Você não tem permissão para criar convites.");
  ui.inviteDialogTitle.textContent = `Convide pessoas para ${state.activeServer.name}`;
  ui.inviteResult.classList.add("hidden"); ui.inviteLinkOutput.value = "";
  openDialog(ui.inviteDialog);
}
ui.quickInviteBtn.addEventListener("click", () => { ui.serverQuickMenu.classList.add("hidden"); openInviteDialog(); });
ui.generateInviteBtn.addEventListener("click", async () => {
  if (!state.activeServer) return;
  setBusy(ui.generateInviteBtn, true, "Gerando…");
  try {
    const expiry = ui.inviteExpiry.value === "never" ? null : Number(ui.inviteExpiry.value);
    const maxUses = ui.inviteMaxUses.value === "none" ? null : Number(ui.inviteMaxUses.value);
    const { data, error } = await state.supabase.rpc("create_server_invite", { p_server_id: state.activeServer.id, p_expires_hours: expiry, p_max_uses: maxUses });
    if (error) throw error;
    const base = new URL(location.href); base.search = ""; base.hash = ""; base.searchParams.set("invite", data);
    ui.inviteLinkOutput.value = base.toString(); ui.inviteResult.classList.remove("hidden");
  } catch (error) { console.error(error); toast(error.message || "Não foi possível gerar o convite."); }
  finally { setBusy(ui.generateInviteBtn, false); }
});
ui.copyInviteBtn.addEventListener("click", async () => {
  if (!ui.inviteLinkOutput.value) return;
  try { await navigator.clipboard.writeText(ui.inviteLinkOutput.value); toast("Link copiado."); }
  catch (_) { ui.inviteLinkOutput.select(); document.execCommand("copy"); toast("Link copiado."); }
});

function openChannelDialog() {
  if (!hasPermission("MANAGE_CHANNELS")) return toast("Você não tem permissão para criar canais.");
  ui.channelForm.reset(); ui.channelTopicLabel.classList.remove("hidden"); openDialog(ui.channelDialog); setTimeout(() => ui.channelNameInput.focus(), 30);
}
ui.quickCreateChannelBtn.addEventListener("click", () => { ui.serverQuickMenu.classList.add("hidden"); openChannelDialog(); });
$$('input[name="channelType"]').forEach((radio) => radio.addEventListener("change", () => ui.channelTopicLabel.classList.toggle("hidden", radio.checked && radio.value === "voice")));
ui.channelNameInput.addEventListener("blur", () => {
  const type = $('input[name="channelType"]:checked')?.value;
  if (type === "text") ui.channelNameInput.value = slugifyChannel(ui.channelNameInput.value);
});
ui.channelForm.addEventListener("submit", async (event) => {
  event.preventDefault(); if (!state.activeServer) return;
  const type = $('input[name="channelType"]:checked')?.value || "text";
  const raw = ui.channelNameInput.value.trim(); const name = type === "text" ? slugifyChannel(raw) : raw.slice(0, 32);
  if (!name) return toast("Digite um nome para o canal.");
  const submit = ui.channelForm.querySelector('button[type="submit"]'); setBusy(submit, true, "Criando…");
  try {
    const position = state.channels.filter((c) => c.type === type).length;
    const { data, error } = await state.supabase.from("channels").insert({ server_id: state.activeServer.id, name, type, topic: type === "text" ? ui.channelTopicInput.value.trim().slice(0, 180) : "", position, created_by: state.user.id }).select().single();
    if (error) throw error;
    closeDialog(ui.channelDialog); await loadServerBundle(); await syncVoiceWatchers();
    if (type === "text") await selectTextChannel(data.id);
    toast(`Canal ${type === "text" ? "#" : "🔊 "}${name} criado.`);
  } catch (error) { console.error(error); toast(error.message || "Não foi possível criar o canal."); }
  finally { setBusy(submit, false); }
});

ui.quickLeaveServerBtn.addEventListener("click", async () => {
  if (!state.activeServer || state.activeServer.owner_id === state.user.id) return;
  if (!confirm(`Sair de “${state.activeServer.name}”?`)) return;
  const sid = state.activeServer.id;
  const { error } = await state.supabase.from("server_members").delete().eq("server_id", sid).eq("user_id", state.user.id);
  if (error) return toast(error.message || "Não foi possível sair do servidor.");
  await cleanupActiveServerRealtime(); await loadServers(); toast("Você saiu do servidor.");
});

// -----------------------------------------------------------------------------
// Server settings / roles / member roles
// -----------------------------------------------------------------------------
function openServerSettings() {
  if (!state.activeServer) return;
  ui.serverQuickMenu.classList.add("hidden");
  renderSettingsAll();
  switchSettingsTab("overview");
  openDialog(ui.serverSettingsDialog);
}
ui.quickSettingsBtn.addEventListener("click", openServerSettings);
ui.quickNicknameBtn?.addEventListener("click", async () => {
  if (!state.activeServer) return;
  const member = state.serverMembers.find((m) => m.user_id === state.user.id);
  const value = prompt("Seu apelido neste servidor (deixe vazio para usar o nome do perfil):", member?.nickname || "");
  if (value === null) return;
  const nickname = value.trim().slice(0, 32) || null;
  const { error } = await state.supabase.from("server_members").update({ nickname }).eq("server_id", state.activeServer.id).eq("user_id", state.user.id);
  if (error) return toast(error.message || "Não foi possível alterar seu apelido.");
  ui.serverQuickMenu.classList.add("hidden"); await loadServerBundle(); await retrackServerPresence(); toast("Apelido atualizado.");
});
ui.quickEventsBtn?.addEventListener("click", () => { if (!state.activeServer) return; ui.serverQuickMenu.classList.add("hidden"); renderSettingsAll(); switchSettingsTab("events"); openDialog(ui.serverSettingsDialog); });
$$('.settings-tab[data-settings-tab]').forEach((btn) => btn.addEventListener("click", () => switchSettingsTab(btn.dataset.settingsTab)));
function switchSettingsTab(name) {
  $$('.settings-tab[data-settings-tab]').forEach((btn) => btn.classList.toggle("active", btn.dataset.settingsTab === name));
  ui.settingsOverviewPane.classList.toggle("hidden", name !== "overview");
  ui.settingsRolesPane.classList.toggle("hidden", name !== "roles");
  ui.settingsMembersPane.classList.toggle("hidden", name !== "members");
  ui.settingsEventsPane.classList.toggle("hidden", name !== "events");
  ui.settingsModerationPane.classList.toggle("hidden", name !== "moderation");
  if (name === "events") loadEvents();
  if (name === "moderation") loadModeration();
}

function renderSettingsAll() {
  if (!state.activeServer) return;
  ui.settingsServerName.textContent = state.activeServer.name;
  ui.settingsServerNameInput.value = state.activeServer.name;
  ui.settingsServerDescription.value = state.activeServer.description || "";
  ui.serverIconPreview.style.backgroundImage = state.activeServer.icon_url ? `url("${state.activeServer.icon_url}")` : "";
  ui.serverIconPreview.textContent = state.activeServer.icon_url ? "" : initials(state.activeServer.name);
  ui.saveServerOverviewBtn.disabled = !hasPermission("MANAGE_SERVER");
  ui.serverIconFileInput.disabled = !hasPermission("MANAGE_SERVER");
  ui.settingsServerNameInput.disabled = !hasPermission("MANAGE_SERVER");
  ui.settingsServerDescription.disabled = !hasPermission("MANAGE_SERVER");
  ui.deleteServerBtn.classList.toggle("hidden", state.activeServer.owner_id !== state.user.id);
  ui.newRoleBtn.disabled = !hasPermission("MANAGE_ROLES");
  renderRolesList();
  renderSettingsMembers();
}

ui.serverIconFileInput.addEventListener("change", () => {
  const file = ui.serverIconFileInput.files?.[0]; if (!file) return;
  const url = URL.createObjectURL(file); ui.serverIconPreview.style.backgroundImage = `url("${url}")`; ui.serverIconPreview.textContent = "";
  setTimeout(() => URL.revokeObjectURL(url), 15000);
});
ui.saveServerOverviewBtn.addEventListener("click", async () => {
  if (!state.activeServer || !hasPermission("MANAGE_SERVER")) return;
  setBusy(ui.saveServerOverviewBtn, true, "Salvando…");
  try {
    let iconUrl = state.activeServer.icon_url;
    const file = ui.serverIconFileInput.files?.[0]; if (file) iconUrl = await uploadImage("server-icons", state.activeServer.id, file);
    const updates = { name: ui.settingsServerNameInput.value.trim().slice(0, 40), description: ui.settingsServerDescription.value.trim().slice(0, 180), icon_url: iconUrl || null };
    if (updates.name.length < 2) throw new Error("O nome precisa ter ao menos 2 caracteres.");
    const { data, error } = await state.supabase.from("servers").update(updates).eq("id", state.activeServer.id).select().single();
    if (error) throw error;
    state.activeServer = data; state.servers = state.servers.map((s) => s.id === data.id ? data : s); renderServerRail(); ui.activeServerName.textContent = data.name; renderSettingsAll(); toast("Servidor atualizado.");
  } catch (error) { console.error(error); toast(error.message || "Não foi possível salvar."); }
  finally { setBusy(ui.saveServerOverviewBtn, false); }
});

ui.deleteServerBtn.addEventListener("click", async () => {
  if (!state.activeServer || state.activeServer.owner_id !== state.user.id) return;
  const name = state.activeServer.name;
  if (!confirm(`Excluir permanentemente o servidor “${name}”? Esta ação apaga canais, mensagens, cargos e convites.`)) return;
  if (!confirm("Confirma novamente? Esta ação não pode ser desfeita.")) return;
  const sid = state.activeServer.id;
  const { error } = await state.supabase.from("servers").delete().eq("id", sid);
  if (error) return toast(error.message || "Não foi possível excluir o servidor.");
  closeDialog(ui.serverSettingsDialog); await cleanupActiveServerRealtime(); await loadServers(); toast(`Servidor “${name}” excluído.`);
});

function renderRolesList() {
  ui.rolesList.replaceChildren();
  for (const role of state.roles) {
    const btn = makeEl("button", `role-list-item${role.id === state.selectedRoleId ? " active" : ""}`);
    btn.type = "button"; const dot = makeEl("span", "role-color-dot"); dot.style.background = role.color; btn.append(dot, makeEl("span", "", role.name));
    btn.addEventListener("click", () => selectRole(role.id)); ui.rolesList.appendChild(btn);
  }
  if (state.selectedRoleId && !state.roles.some((r) => r.id === state.selectedRoleId)) state.selectedRoleId = null;
  if (!state.selectedRoleId) ui.roleEditor.classList.add("hidden");
}

function permissionToggle(key, enabled, canEdit) {
  const row = makeEl("div", "permission-item");
  const meta = makeEl("div"); const info = PERMISSIONS.find((p) => p[0] === key); meta.append(makeEl("strong", "", info?.[1] || key), makeEl("small", "", info?.[2] || ""));
  const toggle = makeEl("button", `switch${enabled ? " on" : ""}`); toggle.type = "button"; toggle.disabled = !canEdit;
  toggle.addEventListener("click", () => {
    if (state.roleDraftPermissions.has(key)) state.roleDraftPermissions.delete(key); else state.roleDraftPermissions.add(key);
    toggle.classList.toggle("on", state.roleDraftPermissions.has(key));
  });
  row.append(meta, toggle); return row;
}

function selectRole(roleId) {
  const role = state.roles.find((r) => r.id === roleId); if (!role) return;
  state.selectedRoleId = roleId; state.roleDraftPermissions = new Set(role.permissions || []); renderRolesList();
  ui.roleEditor.classList.remove("hidden"); ui.roleEditorTitle.textContent = role.name; ui.roleNameInput.value = role.name; ui.roleColorInput.value = role.color; ui.roleColorText.value = role.color.toUpperCase();
  const canEdit = hasPermission("MANAGE_ROLES"); ui.roleNameInput.disabled = !canEdit || role.is_default; ui.roleColorInput.disabled = !canEdit; ui.roleColorText.disabled = !canEdit; ui.deleteRoleBtn.classList.toggle("hidden", role.is_default || !canEdit);
  ui.rolePermissions.replaceChildren(); for (const [key] of PERMISSIONS) ui.rolePermissions.appendChild(permissionToggle(key, state.roleDraftPermissions.has(key), canEdit));
}

ui.newRoleBtn.addEventListener("click", async () => {
  if (!hasPermission("MANAGE_ROLES") || !state.activeServer) return;
  const maxPos = Math.max(0, ...state.roles.map((r) => r.position || 0));
  const { data, error } = await state.supabase.from("roles").insert({ server_id: state.activeServer.id, name: "Novo cargo", color: "#99A1B3", position: maxPos + 1, permissions: [] }).select().single();
  if (error) return toast(error.message || "Não foi possível criar o cargo.");
  await loadServerBundle(); state.selectedRoleId = data.id; selectRole(data.id);
});
ui.roleColorInput.addEventListener("input", () => { ui.roleColorText.value = ui.roleColorInput.value.toUpperCase(); });
ui.roleColorText.addEventListener("input", () => { const v = ui.roleColorText.value.trim(); if (/^#[0-9a-f]{6}$/i.test(v)) ui.roleColorInput.value = v; });
ui.roleEditor.addEventListener("submit", async (event) => {
  event.preventDefault(); const role = state.roles.find((r) => r.id === state.selectedRoleId); if (!role || !hasPermission("MANAGE_ROLES")) return;
  const updates = { name: role.is_default ? "@everyone" : ui.roleNameInput.value.trim().slice(0, 32), color: /^#[0-9a-f]{6}$/i.test(ui.roleColorText.value.trim()) ? ui.roleColorText.value.trim().toUpperCase() : ui.roleColorInput.value.toUpperCase(), permissions: [...state.roleDraftPermissions] };
  if (!updates.name) return toast("O cargo precisa de um nome.");
  const submit = ui.roleEditor.querySelector('button[type="submit"]'); setBusy(submit, true, "Salvando…");
  const { error } = await state.supabase.from("roles").update(updates).eq("id", role.id);
  setBusy(submit, false);
  if (error) return toast(error.message || "Não foi possível salvar o cargo.");
  await loadServerBundle(); selectRole(role.id); toast("Cargo atualizado.");
});
ui.deleteRoleBtn.addEventListener("click", async () => {
  const role = state.roles.find((r) => r.id === state.selectedRoleId); if (!role || role.is_default || !hasPermission("MANAGE_ROLES")) return;
  if (!confirm(`Excluir o cargo “${role.name}”?`)) return;
  const { error } = await state.supabase.from("roles").delete().eq("id", role.id);
  if (error) return toast(error.message || "Não foi possível excluir o cargo.");
  state.selectedRoleId = null; await loadServerBundle(); renderRolesList(); toast("Cargo excluído.");
});

function renderSettingsMembers() {
  ui.settingsMembersList.replaceChildren(); ui.settingsMemberCount.textContent = `${state.serverMembers.length} membro${state.serverMembers.length === 1 ? "" : "s"}`;
  const canRoles = hasPermission("MANAGE_ROLES");
  const editableRoles = state.roles.filter((r) => !r.is_default);
  for (const member of state.serverMembers) {
    const profile = state.profiles.get(member.user_id); if (!profile) continue;
    const row = makeEl("div", "settings-member-row");
    const main = makeEl("div", "settings-member-main"); const av = makeEl("span", "avatar avatar-md"); setAvatar(av, profile, "avatar-md");
    const meta = makeEl("div"); meta.append(makeEl("strong", "", member.nickname || profile.display_name), makeEl("small", "", `@${profile.username}${member.user_id === state.activeServer.owner_id ? " • dono" : ""}`)); main.append(av, meta);
    const roleBox = makeEl("div", "member-role-editor");
    const assigned = new Set(state.memberRoles.filter((mr) => mr.user_id === member.user_id).map((mr) => mr.role_id));
    for (const role of editableRoles) {
      const chip = makeEl("button", `role-chip${assigned.has(role.id) ? " assigned" : ""}`, role.name); chip.type = "button"; chip.style.color = assigned.has(role.id) ? role.color : ""; chip.disabled = !canRoles;
      chip.addEventListener("click", async () => {
        chip.disabled = true;
        let res;
        if (assigned.has(role.id)) res = await state.supabase.from("member_roles").delete().eq("server_id", state.activeServer.id).eq("user_id", member.user_id).eq("role_id", role.id);
        else res = await state.supabase.from("member_roles").insert({ server_id: state.activeServer.id, user_id: member.user_id, role_id: role.id });
        if (res.error) toast(res.error.message || "Não foi possível alterar o cargo."); else await loadServerBundle();
      }); roleBox.appendChild(chip);
    }
    if (hasPermission("KICK_MEMBERS") && member.user_id !== state.user.id && member.user_id !== state.activeServer.owner_id) {
      const kick = makeEl("button", "role-chip", "Remover"); kick.type = "button"; kick.style.color = "#ff7d8c";
      kick.addEventListener("click", async () => {
        if (!confirm(`Remover ${profile.display_name} deste servidor?`)) return;
        kick.disabled = true;
        const { error } = await state.supabase.from("server_members").delete().eq("server_id", state.activeServer.id).eq("user_id", member.user_id);
        if (error) toast(error.message || "Não foi possível remover o membro."); else { await loadServerBundle(); toast("Membro removido."); }
      });
      roleBox.appendChild(kick);
      const ban = makeEl("button", "role-chip danger-chip", "Banir"); ban.type = "button";
      ban.addEventListener("click", async () => {
        const reason = prompt(`Motivo do banimento de ${profile.display_name}:`, "") ?? null; if (reason === null) return;
        ban.disabled = true;
        const { error } = await state.supabase.rpc("ban_server_member", { p_server_id: state.activeServer.id, p_user_id: member.user_id, p_reason: reason.slice(0, 300) });
        if (error) toast(error.message || "Não foi possível banir o membro."); else { await loadServerBundle(); toast("Membro banido."); }
      });
      roleBox.appendChild(ban);
    }
    row.append(main, roleBox); ui.settingsMembersList.appendChild(row);
  }
}

// -----------------------------------------------------------------------------
// Eventos e moderação
// -----------------------------------------------------------------------------
ui.newEventBtn?.addEventListener("click", () => {
  if (!state.activeServer) return;
  ui.eventForm.reset();
  const d = new Date(Date.now() + 60 * 60 * 1000); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  ui.eventStartsAtInput.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  openDialog(ui.eventDialog);
});

ui.eventForm?.addEventListener("submit", async (event) => {
  event.preventDefault(); if (!state.activeServer) return;
  const title = ui.eventTitleInput.value.trim(); const starts = new Date(ui.eventStartsAtInput.value);
  if (!title || Number.isNaN(starts.getTime())) return toast("Preencha título e data do evento.");
  const submit = ui.eventForm.querySelector('button[type="submit"]'); setBusy(submit, true, "Criando…");
  try {
    const { error } = await state.supabase.from("server_events").insert({ server_id: state.activeServer.id, created_by: state.user.id, title, description: ui.eventDescriptionInput.value.trim().slice(0, 500), starts_at: starts.toISOString() });
    if (error) throw error; closeDialog(ui.eventDialog); await loadEvents(); toast("Evento criado.");
  } catch (error) { console.error(error); toast(error.message || "Não foi possível criar o evento."); }
  finally { setBusy(submit, false); }
});

async function loadEvents() {
  if (!state.activeServer || !ui.settingsEventsPane || ui.settingsEventsPane.classList.contains("hidden")) return;
  ui.eventsList.replaceChildren(makeEl("div", "empty-mini", "Carregando eventos…"));
  const { data, error } = await state.supabase.from("server_events").select("id,server_id,created_by,title,description,starts_at,created_at").eq("server_id", state.activeServer.id).order("starts_at", { ascending: true }).limit(100);
  ui.eventsList.replaceChildren();
  if (error) return ui.eventsList.appendChild(makeEl("div", "empty-mini", "Execute a migração V6 para ativar eventos."));
  state.events = data || [];
  if (!state.events.length) return ui.eventsList.appendChild(makeEl("div", "empty-mini", "Nenhum evento agendado."));
  const ids = state.events.map((e) => e.id);
  const { data: rsvps } = await state.supabase.from("event_rsvps").select("event_id,user_id,response").in("event_id", ids);
  for (const item of state.events) {
    const card = makeEl("article", "event-card");
    const when = new Date(item.starts_at);
    const head = makeEl("div", "event-card-head"); head.append(makeEl("div", "event-date", when.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })), makeEl("div", "event-title-wrap"));
    const wrap = head.lastChild; wrap.append(makeEl("strong", "", item.title), makeEl("small", "", when.toLocaleString("pt-BR", { weekday: "short", hour: "2-digit", minute: "2-digit" })));
    card.appendChild(head); if (item.description) card.appendChild(makeEl("p", "event-description", item.description));
    const votes = (rsvps || []).filter((r) => r.event_id === item.id); const my = votes.find((r) => r.user_id === state.user.id)?.response;
    const foot = makeEl("div", "event-actions");
    const going = makeEl("button", `secondary-button small-action${my === "going" ? " active" : ""}`, `Vou (${votes.filter((r) => r.response === "going").length})`); going.type = "button"; going.addEventListener("click", () => setEventRsvp(item.id, "going"));
    const maybe = makeEl("button", `secondary-button small-action${my === "maybe" ? " active" : ""}`, "Talvez"); maybe.type = "button"; maybe.addEventListener("click", () => setEventRsvp(item.id, "maybe"));
    foot.append(going, maybe);
    if (item.created_by === state.user.id || hasPermission("MANAGE_SERVER")) { const del = makeEl("button", "danger-button small-action", "Excluir"); del.type = "button"; del.addEventListener("click", () => deleteEvent(item.id)); foot.appendChild(del); }
    card.appendChild(foot); ui.eventsList.appendChild(card);
  }
}

async function setEventRsvp(eventId, response) {
  const { error } = await state.supabase.from("event_rsvps").upsert({ event_id: eventId, user_id: state.user.id, response }, { onConflict: "event_id,user_id" });
  if (error) return toast("Não foi possível confirmar presença."); await loadEvents();
}
async function deleteEvent(eventId) {
  if (!confirm("Excluir este evento?")) return;
  const { error } = await state.supabase.from("server_events").delete().eq("id", eventId); if (error) return toast("Não foi possível excluir o evento."); await loadEvents();
}

async function loadModeration() {
  if (!state.activeServer || ui.settingsModerationPane.classList.contains("hidden")) return;
  ui.bansList.replaceChildren(makeEl("div", "empty-mini", "Carregando…")); ui.auditLogList.replaceChildren(makeEl("div", "empty-mini", "Carregando…"));
  if (!hasPermission("KICK_MEMBERS") && !hasPermission("MANAGE_SERVER")) {
    ui.bansList.replaceChildren(makeEl("div", "empty-mini", "Você não tem permissão para ver a moderação.")); ui.auditLogList.replaceChildren(); return;
  }
  const [bansRes, auditRes] = await Promise.all([
    state.supabase.from("server_bans").select("server_id,user_id,banned_by,reason,created_at").eq("server_id", state.activeServer.id).order("created_at", { ascending: false }),
    state.supabase.from("server_audit_log").select("id,server_id,actor_id,action,target_user_id,metadata,created_at").eq("server_id", state.activeServer.id).order("created_at", { ascending: false }).limit(100)
  ]);
  ui.bansList.replaceChildren(); ui.auditLogList.replaceChildren();
  if (bansRes.error) ui.bansList.appendChild(makeEl("div", "empty-mini", "Migração V6 necessária."));
  else {
    state.bans = bansRes.data || [];
    const ids = [...new Set(state.bans.flatMap((b) => [b.user_id, b.banned_by]).filter(Boolean))];
    if (ids.length) { const { data } = await state.supabase.from("profiles").select("user_id,username,display_name,avatar_url").in("user_id", ids); for (const p of data || []) state.socialProfiles.set(p.user_id, p); }
    if (!state.bans.length) ui.bansList.appendChild(makeEl("div", "empty-mini", "Nenhum membro banido."));
    for (const ban of state.bans) {
      const p = state.socialProfiles.get(ban.user_id) || { display_name: "Usuário", username: "usuario" };
      const row = socialUserRow(p, ban.reason || "Sem motivo", []); const unban = makeEl("button", "mini-action", "Desbanir"); unban.type = "button"; unban.addEventListener("click", async () => { const { error } = await state.supabase.rpc("unban_server_member", { p_server_id: state.activeServer.id, p_user_id: ban.user_id }); if (error) toast(error.message || "Erro ao desbanir."); else { toast("Membro desbanido."); loadModeration(); } }); row.querySelector(".social-user-actions").appendChild(unban); ui.bansList.appendChild(row);
    }
  }
  if (auditRes.error) ui.auditLogList.appendChild(makeEl("div", "empty-mini", "Migração V6 necessária."));
  else {
    state.auditLog = auditRes.data || [];
    if (!state.auditLog.length) ui.auditLogList.appendChild(makeEl("div", "empty-mini", "Sem ações registradas ainda."));
    for (const log of state.auditLog) {
      const row = makeEl("div", "audit-row"); row.append(makeEl("strong", "", log.action.replaceAll("_", " ")), makeEl("small", "", new Date(log.created_at).toLocaleString("pt-BR"))); if (log.metadata?.reason) row.appendChild(makeEl("span", "", log.metadata.reason)); ui.auditLogList.appendChild(row);
    }
  }
}

// -----------------------------------------------------------------------------
// Voice presence watchers + WebRTC
// -----------------------------------------------------------------------------
function getIceServers() {
  const list = Array.isArray(cfg.ICE_SERVERS) ? cfg.ICE_SERVERS.filter((s) => s && (typeof s.urls === "string" || Array.isArray(s.urls))) : [];
  return list.length ? list : [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }];
}
function screenShareSupported() { return Boolean(navigator.mediaDevices?.getDisplayMedia); }
function micTrack() { return state.localStream?.getAudioTracks()[0] || null; }
function currentVideoTrack() { return state.screenTrack || state.cameraTrack || null; }

async function ensureVoiceWatcher(channel) {
  if (state.voiceWatchers.has(channel.id)) return state.voiceWatchers.get(channel.id);
  let resolveReady, rejectReady;
  const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  ready.catch(() => {});
  const realtime = state.supabase.channel(`voice:${channel.id}`, { config: { presence: { key: state.voiceClientId }, broadcast: { self: false, ack: false } } });
  const watcher = { realtime, ready, status: "SUBSCRIBING", channelId: channel.id, channelName: channel.name, resolveReady, rejectReady };
  state.voiceWatchers.set(channel.id, watcher);

  const sync = () => {
    const list = [];
    const presence = realtime.presenceState();
    for (const entries of Object.values(presence)) for (const p of entries) if (p?.voice_client_id) list.push(p);
    state.voicePresence.set(channel.id, list);
    renderChannels(); renderMembers();
    if (channel.id === state.voiceJoinedChannelId) syncVoicePeers();
  };
  realtime.on("presence", { event: "sync" }, sync).on("presence", { event: "join" }, sync).on("presence", { event: "leave" }, sync)
    .on("broadcast", { event: "signal" }, ({ payload }) => { if (channel.id === state.voiceJoinedChannelId) handleSignal(payload); })
    .on("broadcast", { event: "media-state" }, ({ payload }) => { if (channel.id === state.voiceJoinedChannelId) handleMediaState(payload); });
  realtime.subscribe((status) => {
    watcher.status = status;
    if (status === "SUBSCRIBED") resolveReady(watcher);
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") rejectReady(new Error(`Falha no canal de voz: ${status}`));
  });
  return watcher;
}

async function syncVoiceWatchers() {
  if (!state.activeServerId) return;
  const voiceChannels = state.channels.filter((c) => c.type === "voice");
  const wanted = new Set(voiceChannels.map((c) => c.id));
  for (const [id, watcher] of [...state.voiceWatchers.entries()]) {
    if (!wanted.has(id)) {
      if (id === state.voiceJoinedChannelId) await leaveVoice();
      try { await state.supabase.removeChannel(watcher.realtime); } catch (_) {}
      state.voiceWatchers.delete(id); state.voicePresence.delete(id);
    }
  }
  for (const channel of voiceChannels) ensureVoiceWatcher(channel).catch((error) => console.warn(error));
}

async function cleanupVoiceWatchers() {
  if (state.voiceJoinedChannelId || state.joiningVoice) await leaveVoice();
  for (const watcher of state.voiceWatchers.values()) {
    try { await state.supabase.removeChannel(watcher.realtime); } catch (_) {}
  }
  state.voiceWatchers.clear(); state.voicePresence.clear(); renderChannels();
}

function voicePresencePayload() {
  return {
    voice_client_id: state.voiceClientId,
    user_id: state.user.id,
    username: state.profile?.username || "usuario",
    display_name: state.profile?.display_name || "Usuário",
    avatar_url: state.profile?.avatar_url || null,
    muted: Boolean(micTrack() && !micTrack().enabled),
    deafened: state.deafen,
    camera: Boolean(state.cameraTrack),
    screen: Boolean(state.screenTrack),
    joined_at: new Date().toISOString()
  };
}

async function retrackVoicePresence() {
  const watcher = state.voiceWatchers.get(state.voiceJoinedChannelId); if (!watcher || !state.voiceJoinedChannelId) return;
  try { await watcher.realtime.track(voicePresencePayload()); } catch (_) {}
  await broadcastMediaState();
}

function activeVoiceWatcher() { return state.voiceWatchers.get(state.voiceJoinedChannelId) || null; }

async function joinVoice(channelId) {
  const channel = state.channels.find((c) => c.id === channelId && c.type === "voice"); if (!channel) return;
  if (!hasPermission("CONNECT")) return toast("Você não tem permissão para entrar neste canal de voz.");
  if (state.voiceJoinedChannelId === channelId && !state.joiningVoice) { ui.mediaStage.classList.remove("hidden"); closeDrawers(); return; }
  if (state.joiningVoice) return;
  if (state.voiceJoinedChannelId) await leaveVoice();

  const session = ++state.voiceSession; state.joiningVoice = true; updateVoiceDock("connecting", channel);
  let stream = null;
  try {
    const audioConstraint = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
    if (state.preferences.audio_input_id) audioConstraint.deviceId = { exact: state.preferences.audio_input_id };
    stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraint, video: false });
    if (session !== state.voiceSession) { stream.getTracks().forEach((t) => t.stop()); return; }
    state.localStream = stream; state.voiceJoinedChannelId = channel.id; state.voiceJoinedChannelName = channel.name;
    const watcher = await ensureVoiceWatcher(channel); await Promise.race([watcher.ready, sleep(11000).then(() => { throw new Error("Tempo limite ao conectar à chamada"); })]);
    if (session !== state.voiceSession) return;
    await watcher.realtime.track(voicePresencePayload());
    state.joiningVoice = false;
    updateVoiceDock("joined", channel); ensureLocalCard(); syncVoicePeers(); await broadcastMediaState(); renderChannels(); renderMembers(); closeDrawers();
    toast(`Você entrou em 🔊 ${channel.name}.`);
  } catch (error) {
    console.error(error);
    if (session === state.voiceSession) {
      stream?.getTracks().forEach((t) => t.stop()); state.localStream = null; state.voiceJoinedChannelId = null; state.voiceJoinedChannelName = null; state.joiningVoice = false; updateVoiceDock("idle");
      toast(error?.name === "NotAllowedError" ? "Permita o acesso ao microfone para entrar na chamada." : "Não foi possível entrar na chamada.", 5500);
    }
  }
}

async function leaveVoice() {
  if (!state.voiceJoinedChannelId && !state.joiningVoice && !state.localStream) return;
  ++state.voiceSession; state.joiningVoice = false;
  const watcher = activeVoiceWatcher();
  const local = state.localStream, camera = state.cameraTrack, screen = state.screenTrack;
  state.voiceJoinedChannelId = null; state.voiceJoinedChannelName = null; state.localStream = null; state.cameraTrack = null; state.screenTrack = null; state.deafen = false; state.cameraBusy = false; state.screenBusy = false;
  if (screen) screen.onended = null;
  for (const id of [...state.peers.keys()]) closePeer(id);
  if (watcher) { try { await watcher.realtime.untrack(); } catch (_) {} }
  local?.getTracks().forEach((t) => { try { t.stop(); } catch (_) {} });
  if (camera && camera.readyState !== "ended") try { camera.stop(); } catch (_) {}
  if (screen && screen.readyState !== "ended") try { screen.stop(); } catch (_) {}
  ui.mediaGrid.replaceChildren(); ui.mediaStage.classList.add("hidden"); ui.mediaStage.classList.remove("collapsed");
  updateVoiceDock("idle"); renderChannels(); renderMembers();
}

function updateVoiceDock(mode, channel = null) {
  const joined = mode === "joined"; const connecting = mode === "connecting";
  ui.voiceDock.classList.toggle("hidden", mode === "idle");
  if (mode !== "idle") {
    ui.voiceStateText.textContent = joined ? "Voz conectada" : "Conectando…";
    ui.voiceRoomLabel.textContent = channel?.name || state.voiceJoinedChannelName || "Canal de voz";
  }
  ui.muteBtn.disabled = !joined || state.cameraBusy || state.screenBusy;
  ui.deafenBtn.disabled = !joined;
  ui.cameraBtn.disabled = !joined || state.cameraBusy || state.screenBusy || Boolean(state.screenTrack);
  ui.shareBtn.disabled = !joined || state.cameraBusy || state.screenBusy || !screenShareSupported();
  ui.muteBtn.classList.toggle("active", Boolean(micTrack() && !micTrack().enabled));
  ui.deafenBtn.classList.toggle("active", state.deafen);
  ui.cameraBtn.classList.toggle("active", Boolean(state.cameraTrack));
  ui.shareBtn.classList.toggle("active", Boolean(state.screenTrack));
}

ui.leaveVoiceBtn.addEventListener("click", leaveVoice);
ui.muteBtn.addEventListener("click", async () => {
  const track = micTrack(); if (!track) return; track.enabled = !track.enabled; updateVoiceDock("joined"); await retrackVoicePresence();
});
ui.deafenBtn.addEventListener("click", async () => {
  if (!state.voiceJoinedChannelId) return; state.deafen = !state.deafen;
  for (const card of ui.mediaGrid.querySelectorAll('.media-card:not(#media-local) video')) card.muted = state.deafen;
  updateVoiceDock("joined"); await retrackVoicePresence();
});
ui.cameraBtn.addEventListener("click", toggleCamera);
ui.shareBtn.addEventListener("click", toggleScreenShare);
ui.collapseMediaBtn.addEventListener("click", () => { ui.mediaStage.classList.toggle("collapsed"); ui.collapseMediaBtn.textContent = ui.mediaStage.classList.contains("collapsed") ? "□" : "—"; });

function ensureLocalCard() {
  if (!state.voiceJoinedChannelId) return;
  let card = document.getElementById("media-local");
  if (!card) {
    card = makeEl("div", "media-card audio-only"); card.id = "media-local";
    const video = document.createElement("video"); video.autoplay = true; video.muted = true; video.playsInline = true;
    card.append(video, makeEl("span", "media-label"), makeEl("span", "media-connection ok", "você")); ui.mediaGrid.prepend(card);
  }
  card.dataset.initials = initials(state.profile?.display_name || state.profile?.username || "TL");
  const video = card.querySelector("video"), label = card.querySelector(".media-label"); const track = currentVideoTrack();
  const preview = new MediaStream(); if (track) preview.addTrack(track); const audio = micTrack(); if (audio) preview.addTrack(audio); video.srcObject = preview;
  card.classList.toggle("audio-only", !track); card.classList.toggle("screen", Boolean(state.screenTrack));
  label.textContent = `${state.profile?.display_name || "Você"} (você)${state.screenTrack ? " • tela" : ""}`;
  ui.mediaStageTitle.textContent = `🔊 ${state.voiceJoinedChannelName || "Canal de voz"}`; ui.mediaStage.classList.remove("hidden"); updateCallStatus();
}

function peerPresence(peerId) {
  const list = state.voicePresence.get(state.voiceJoinedChannelId) || [];
  return list.find((p) => p.voice_client_id === peerId) || state.peerProfiles.get(peerId) || null;
}
function makeRemoteCard(peerId) {
  const peer = state.peers.get(peerId); if (!peer) return;
  let card = document.getElementById(`media-${peerId}`);
  if (!card) {
    card = makeEl("div", "media-card audio-only"); card.id = `media-${peerId}`;
    const video = document.createElement("video"); video.autoplay = true; video.playsInline = true; video.muted = state.deafen;
    const controls = makeEl("div", "media-local-controls");
    const volumeLabel = makeEl("label", "media-volume"); volumeLabel.title = "Volume individual";
    volumeLabel.append(makeEl("span", "", "VOL"));
    const volume = document.createElement("input"); volume.type = "range"; volume.min = "0"; volume.max = "1"; volume.step = "0.05"; volume.value = "1";
    volume.addEventListener("input", () => { video.volume = Number(volume.value); });
    volumeLabel.appendChild(volume); controls.appendChild(volumeLabel);
    card.append(video, makeEl("span", "media-label"), makeEl("span", "media-connection", "conectando"), controls);
    card.addEventListener("dblclick", () => { if (document.fullscreenElement) document.exitFullscreen?.(); else card.requestFullscreen?.(); });
    card.addEventListener("click", () => video.play().catch(() => {})); ui.mediaGrid.appendChild(card);
  }
  const p = peerPresence(peerId); const name = p?.display_name || p?.username || state.peerNames.get(peerId) || "Usuário"; card.dataset.initials = initials(name);
  const video = card.querySelector("video"); if (video.srcObject !== peer.remoteStream) video.srcObject = peer.remoteStream; video.muted = state.deafen;
  const liveVideo = peer.remoteStream.getVideoTracks().some((t) => t.readyState === "live" && !t.muted);
  card.classList.toggle("audio-only", !liveVideo); card.classList.toggle("screen", Boolean(peer.remoteMedia?.screen));
  card.querySelector(".media-label").textContent = `${name}${peer.remoteMedia?.screen ? " • tela" : ""}${peer.remoteMedia?.muted ? " • mudo" : ""}`;
  video.play().catch(() => {}); startSpeakingMeter(peerId, peer.remoteStream, card); updatePeerCardStatus(peerId); ui.mediaStage.classList.remove("hidden");
}
function startSpeakingMeter(peerId, stream, card) {
  if (state.audioMeters.has(peerId) || !stream?.getAudioTracks()?.length) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = .72;
    const source = ctx.createMediaStreamSource(stream); source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0; let active = true;
    const tick = () => {
      if (!active || !document.body.contains(card)) return;
      analyser.getByteFrequencyData(data);
      let sum = 0; for (const v of data) sum += v; const avg = sum / data.length;
      card.classList.toggle("speaking", avg > 13);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    state.audioMeters.set(peerId, { stop: () => { active = false; cancelAnimationFrame(raf); try { source.disconnect(); } catch (_) {} ctx.close().catch(() => {}); } });
  } catch (_) {}
}

function removeRemoteCard(peerId) { state.audioMeters.get(peerId)?.stop?.(); state.audioMeters.delete(peerId); document.getElementById(`media-${peerId}`)?.remove(); updateCallStatus(); }
function updatePeerCardStatus(peerId) {
  const peer = state.peers.get(peerId), card = document.getElementById(`media-${peerId}`); if (!peer || !card) return;
  const badge = card.querySelector(".media-connection"); const map = { new: "preparando", connecting: "conectando", connected: "conectado", disconnected: "reconectando", failed: "falha", closed: "desconectado" };
  badge.textContent = map[peer.pc.connectionState] || peer.pc.connectionState; badge.classList.toggle("ok", peer.pc.connectionState === "connected"); updateCallStatus();
}
function updateCallStatus() {
  if (!state.voiceJoinedChannelId) { ui.callStatusText.textContent = "Fora da chamada"; return; }
  const peers = [...state.peers.values()]; const connected = peers.filter((p) => p.pc.connectionState === "connected").length;
  if (!peers.length) ui.callStatusText.textContent = "Aguardando outra pessoa entrar…";
  else if (connected === peers.length) ui.callStatusText.textContent = `${connected + 1} participantes na chamada`;
  else ui.callStatusText.textContent = `${connected + 1} conectados • conectando ${peers.length - connected}`;
}

async function sendVoiceBroadcast(event, payload) {
  const watcher = activeVoiceWatcher(); if (!watcher) return;
  try { await watcher.realtime.send({ type: "broadcast", event, payload }); } catch (error) { console.warn("Broadcast voice", error); }
}
async function sendSignal(to, signal) {
  return sendVoiceBroadcast("signal", { from: state.voiceClientId, to, username: state.profile?.display_name || "Usuário", user_id: state.user.id, signal });
}
async function broadcastMediaState() {
  if (!state.voiceJoinedChannelId) return;
  await sendVoiceBroadcast("media-state", { from: state.voiceClientId, username: state.profile?.display_name || "Usuário", user_id: state.user.id, avatar_url: state.profile?.avatar_url || null, camera: Boolean(state.cameraTrack), screen: Boolean(state.screenTrack), muted: Boolean(micTrack() && !micTrack().enabled), deafened: state.deafen });
}
function handleMediaState(payload) {
  if (!payload?.from || payload.from === state.voiceClientId) return;
  state.peerNames.set(payload.from, payload.username || "Usuário"); state.peerProfiles.set(payload.from, payload);
  const media = { camera: Boolean(payload.camera), screen: Boolean(payload.screen), muted: Boolean(payload.muted), deafened: Boolean(payload.deafened) };
  state.remoteMediaStates.set(payload.from, media); const peer = state.peers.get(payload.from); if (peer) { peer.remoteMedia = media; makeRemoteCard(payload.from); }
}

async function negotiatePeer(peerId) {
  const peer = state.peers.get(peerId); if (!peer || peer.pc.signalingState === "closed" || peer.makingOffer) return;
  try {
    peer.makingOffer = true; if (peer.pc.signalingState !== "stable") return;
    const offer = await peer.pc.createOffer(); if (peer.pc.signalingState !== "stable") return;
    await peer.pc.setLocalDescription(offer); await sendSignal(peerId, { description: peer.pc.localDescription });
  } catch (error) { console.warn("Falha na negociação WebRTC", error); }
  finally { peer.makingOffer = false; }
}
async function restartPeerIce(peerId) {
  const peer = state.peers.get(peerId); if (!peer || peer.pc.signalingState === "closed") return;
  if (peer.restartCount >= 3) {
    if (!peer.warningShown) { peer.warningShown = true; toast("Uma conexão de voz não encontrou rota direta. Para funcionar em todas as redes, configure um servidor TURN em config.js.", 7000); }
    return;
  }
  if (peer.pc.signalingState !== "stable") { clearTimeout(peer.restartTimer); peer.restartTimer = setTimeout(() => restartPeerIce(peerId), 1200); return; }
  try { peer.restartCount += 1; peer.pc.restartIce(); await negotiatePeer(peerId); } catch (error) { console.warn("ICE restart", error); }
}
function schedulePeerIceRestart(peerId, delay = 1200) { const peer = state.peers.get(peerId); if (!peer) return; clearTimeout(peer.restartTimer); peer.restartTimer = setTimeout(() => restartPeerIce(peerId), delay); }

function createPeer(peerId) {
  if (state.peers.has(peerId)) return state.peers.get(peerId);
  if (!state.localStream) return null;
  const pc = new RTCPeerConnection({ iceServers: getIceServers(), iceCandidatePoolSize: 6 });
  const remoteStream = new MediaStream();
  const peer = { pc, remoteStream, audioSender: null, videoSender: null, makingOffer: false, ignoreOffer: false, isSettingRemoteAnswerPending: false, pendingCandidates: [], polite: state.voiceClientId.localeCompare(peerId) > 0, remoteMedia: state.remoteMediaStates.get(peerId) || { camera: false, screen: false, muted: false }, restartTimer: null, connectTimer: null, restartCount: 0, warningShown: false };
  state.peers.set(peerId, peer);
  const audio = micTrack();
  const audioTx = audio ? pc.addTransceiver(audio, { direction: "sendrecv", streams: [state.localStream] }) : pc.addTransceiver("audio", { direction: "recvonly" }); peer.audioSender = audioTx.sender;
  const videoTx = pc.addTransceiver("video", { direction: "sendrecv" }); peer.videoSender = videoTx.sender; if (currentVideoTrack()) peer.videoSender.replaceTrack(currentVideoTrack()).catch(console.warn);
  pc.onicecandidate = ({ candidate }) => { if (candidate) sendSignal(peerId, { candidate: candidate.toJSON ? candidate.toJSON() : candidate }); };
  pc.ontrack = (event) => { const track = event.track; if (!remoteStream.getTracks().some((t) => t.id === track.id)) remoteStream.addTrack(track); const refresh = () => makeRemoteCard(peerId); track.addEventListener("unmute", refresh); track.addEventListener("mute", refresh); track.addEventListener("ended", refresh); makeRemoteCard(peerId); };
  pc.onnegotiationneeded = () => negotiatePeer(peerId);
  pc.onconnectionstatechange = () => {
    updatePeerCardStatus(peerId);
    if (pc.connectionState === "connected") { clearTimeout(peer.restartTimer); clearTimeout(peer.connectTimer); peer.restartCount = 0; peer.warningShown = false; }
    else if (pc.connectionState === "failed") schedulePeerIceRestart(peerId, 600);
    else if (pc.connectionState === "disconnected") schedulePeerIceRestart(peerId, 3500);
  };
  pc.oniceconnectionstatechange = () => { if (pc.iceConnectionState === "failed") schedulePeerIceRestart(peerId, 600); };
  peer.connectTimer = setTimeout(() => { if (["new", "connecting"].includes(pc.connectionState)) schedulePeerIceRestart(peerId, 0); }, 12000);
  makeRemoteCard(peerId); updateCallStatus(); return peer;
}
async function flushPendingCandidates(peer) {
  if (!peer.pc.remoteDescription) return; const pending = peer.pendingCandidates.splice(0);
  for (const candidate of pending) try { await peer.pc.addIceCandidate(candidate); } catch (error) { if (!peer.ignoreOffer) console.warn("ICE candidate", error); }
}
async function handleSignal(payload) {
  if (!payload || payload.to !== state.voiceClientId || payload.from === state.voiceClientId || !state.voiceJoinedChannelId) return;
  const peerId = payload.from; state.peerNames.set(peerId, payload.username || "Usuário"); state.peerProfiles.set(peerId, payload);
  const peer = createPeer(peerId); if (!peer) return; const { pc } = peer; const { description, candidate } = payload.signal || {};
  try {
    if (description) {
      const readyForOffer = !peer.makingOffer && (pc.signalingState === "stable" || peer.isSettingRemoteAnswerPending);
      const offerCollision = description.type === "offer" && !readyForOffer; peer.ignoreOffer = !peer.polite && offerCollision; if (peer.ignoreOffer) return;
      peer.isSettingRemoteAnswerPending = description.type === "answer";
      if (offerCollision && peer.polite && pc.signalingState !== "stable") try { await pc.setLocalDescription({ type: "rollback" }); } catch (_) {}
      await pc.setRemoteDescription(description); peer.isSettingRemoteAnswerPending = false; await flushPendingCandidates(peer);
      if (description.type === "offer") { const answer = await pc.createAnswer(); await pc.setLocalDescription(answer); await sendSignal(peerId, { description: pc.localDescription }); }
    } else if (candidate) {
      if (peer.ignoreOffer) return;
      if (pc.remoteDescription?.type) await pc.addIceCandidate(candidate); else peer.pendingCandidates.push(candidate);
    }
  } catch (error) { peer.isSettingRemoteAnswerPending = false; console.error("Sinalização WebRTC", error); }
}

function activeVoicePeers() {
  const list = state.voicePresence.get(state.voiceJoinedChannelId) || []; const peers = [];
  for (const p of list) if (p.voice_client_id && p.voice_client_id !== state.voiceClientId) { state.peerNames.set(p.voice_client_id, p.display_name || p.username || "Usuário"); state.peerProfiles.set(p.voice_client_id, p); peers.push(p.voice_client_id); }
  return [...new Set(peers)];
}
function syncVoicePeers() {
  if (!state.voiceJoinedChannelId || !state.localStream) return;
  const active = new Set(activeVoicePeers());
  for (const id of active) {
    const peer = createPeer(id);
    if (peer && state.voiceClientId.localeCompare(id) < 0 && peer.pc.signalingState === "stable" && peer.pc.connectionState === "new") negotiatePeer(id);
  }
  for (const id of [...state.peers.keys()]) if (!active.has(id)) closePeer(id);
  updateCallStatus(); if (active.size) broadcastMediaState();
}
function closePeer(peerId) {
  const peer = state.peers.get(peerId); if (!peer) return;
  clearTimeout(peer.restartTimer); clearTimeout(peer.connectTimer); peer.pc.ontrack = null; peer.pc.onicecandidate = null; peer.pc.onconnectionstatechange = null; peer.pc.oniceconnectionstatechange = null; peer.pc.onnegotiationneeded = null;
  try { peer.pc.close(); } catch (_) {} peer.remoteStream.getTracks().forEach((t) => { try { t.stop(); } catch (_) {} });
  state.peers.delete(peerId); state.peerNames.delete(peerId); state.peerProfiles.delete(peerId); state.remoteMediaStates.delete(peerId); removeRemoteCard(peerId);
}

async function replaceVideoForPeers(track) { await Promise.allSettled([...state.peers.values()].map((p) => p.videoSender?.replaceTrack(track || null))); }
async function toggleCamera() {
  if (!state.voiceJoinedChannelId || state.cameraBusy || state.screenBusy) return;
  if (state.screenTrack) return toast("Pare o compartilhamento de tela antes de alterar a câmera.");
  const session = state.voiceSession; state.cameraBusy = true; updateVoiceDock("joined");
  try {
    if (state.cameraTrack) {
      const old = state.cameraTrack; state.cameraTrack = null; await replaceVideoForPeers(null); if (old.readyState !== "ended") old.stop(); ensureLocalCard(); await retrackVoicePresence(); return;
    }
    const videoConstraint = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 }, facingMode: "user" };
    if (state.preferences.video_input_id) { delete videoConstraint.facingMode; videoConstraint.deviceId = { exact: state.preferences.video_input_id }; }
    const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: false });
    const track = stream.getVideoTracks()[0]; if (!track) throw new Error("Nenhuma câmera disponível.");
    if (!state.voiceJoinedChannelId || session !== state.voiceSession || state.screenTrack) { stream.getTracks().forEach((t) => t.stop()); return; }
    state.cameraTrack = track; if ("contentHint" in track) track.contentHint = "motion";
    track.addEventListener("ended", () => {
      if (state.cameraTrack !== track) return; state.cameraTrack = null;
      Promise.resolve(state.screenTrack ? undefined : replaceVideoForPeers(null)).then(() => { if (state.voiceJoinedChannelId) { ensureLocalCard(); retrackVoicePresence(); } }).catch(console.warn);
    }, { once: true });
    await replaceVideoForPeers(track); ensureLocalCard(); await retrackVoicePresence();
  } catch (error) { console.error(error); toast(error?.name === "NotAllowedError" ? "Permita o acesso à câmera." : "Não foi possível acessar a câmera."); }
  finally { if (session === state.voiceSession) { state.cameraBusy = false; updateVoiceDock(state.voiceJoinedChannelId ? "joined" : "idle"); } }
}
async function stopScreenShare(stopTrack = true, expected = null) {
  const old = state.screenTrack; if (!old || (expected && old !== expected)) return; state.screenTrack = null; old.onended = null;
  if (state.voiceJoinedChannelId) await replaceVideoForPeers(state.cameraTrack || null); if (stopTrack && old.readyState !== "ended") try { old.stop(); } catch (_) {}
  if (state.voiceJoinedChannelId) { ensureLocalCard(); await retrackVoicePresence(); }
}
async function toggleScreenShare() {
  if (!state.voiceJoinedChannelId || state.screenBusy || state.cameraBusy) return;
  if (!screenShareSupported()) return toast("Este navegador não permite compartilhar a tela. No computador, use Chrome ou Edge atualizado.", 5500);
  const session = state.voiceSession; state.screenBusy = true; updateVoiceDock("joined");
  try {
    if (state.screenTrack) { await stopScreenShare(true); return; }
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30, max: 30 } }, audio: false });
    const track = stream.getVideoTracks()[0]; if (!track) throw new Error("Nenhuma tela selecionada.");
    if (!state.voiceJoinedChannelId || session !== state.voiceSession) { stream.getTracks().forEach((t) => t.stop()); return; }
    state.screenTrack = track; if ("contentHint" in track) track.contentHint = "detail";
    track.onended = () => { if (state.screenTrack !== track) return; state.screenBusy = true; stopScreenShare(false, track).catch(console.warn).finally(() => { if (session === state.voiceSession) { state.screenBusy = false; updateVoiceDock(state.voiceJoinedChannelId ? "joined" : "idle"); } }); };
    await replaceVideoForPeers(track); ensureLocalCard(); await retrackVoicePresence();
  } catch (error) { if (!["NotAllowedError", "AbortError"].includes(error?.name)) { console.error(error); toast("Não foi possível iniciar o compartilhamento de tela."); } }
  finally { if (session === state.voiceSession) { state.screenBusy = false; updateVoiceDock(state.voiceJoinedChannelId ? "joined" : "idle"); } }
}

// -----------------------------------------------------------------------------
// Cleanup / boot
// -----------------------------------------------------------------------------
async function cleanupAppSession() {
  ++state.serverLoadToken; ++state.messageLoadToken;
  try { await cleanupActiveServerRealtime(); } catch (_) {}
  if (state.dmChannel && state.supabase) { try { await state.supabase.removeChannel(state.dmChannel); } catch (_) {} state.dmChannel = null; }
  for (const meter of state.audioMeters.values()) meter.stop?.(); state.audioMeters.clear();
  state.servers = []; state.activeServerId = null; state.activeServer = null; state.channels = []; state.serverMembers = []; state.roles = []; state.memberRoles = []; state.profiles.clear(); state.socialProfiles.clear(); state.friendships = []; state.activeDmUserId = null; state.user = null; state.profile = null; state.homeMode = false;
  clearActiveServer(); renderServerRail();
}

async function onSignedIn(user) {
  state.user = user; showApp(); connectionStatus("Carregando…");
  try {
    await loadCurrentProfile();
    await loadPreferences();
    await loadServers();
    connectionStatus("Online", "online");
    await handlePendingInviteAfterAuth();
  } catch (error) {
    console.error(error); connectionStatus("Erro", "error");
    const msg = String(error?.message || "");
    toast(/user_preferences|friendships|direct_messages|message_reactions/i.test(msg)
      ? "Execute MIGRATION_V6_ULTIMATE.sql no Supabase para ativar todos os recursos da V6."
      : "A estrutura do banco ainda não está pronta. Confira supabase_v4.sql e MIGRATION_V6_ULTIMATE.sql.", 9000);
  }
}

async function boot() {
  state.pendingInviteToken = inviteTokenFrom(new URL(location.href).searchParams.get("invite") || "");
  if (!isConfigured) {
    ui.setupBanner.classList.remove("hidden"); ui.authScreen.classList.remove("hidden");
    return;
  }
  state.supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("./sw.js").catch(() => {});
  if (state.pendingInviteToken) previewInvite(state.pendingInviteToken).catch(() => {});

  const { data: { session } } = await state.supabase.auth.getSession();
  if (session?.user) await onSignedIn(session.user); else showAuth();

  state.supabase.auth.onAuthStateChange((event, sessionNow) => {
    setTimeout(async () => {
      if (event === "PASSWORD_RECOVERY" && sessionNow?.user) { state.user = sessionNow.user; showApp(); openDialog(ui.recoveryDialog); return; }
      if (event === "SIGNED_OUT" || !sessionNow?.user) { await cleanupAppSession(); showAuth(); return; }
      if (["SIGNED_IN", "USER_UPDATED", "TOKEN_REFRESHED", "INITIAL_SESSION"].includes(event)) {
        if (state.user?.id === sessionNow.user.id && state.profile) return;
        await onSignedIn(sessionNow.user);
      }
    }, 0);
  });
}

window.addEventListener("beforeunload", () => {
  try { micTrack()?.stop(); state.cameraTrack?.stop(); state.screenTrack?.stop(); } catch (_) {}
  for (const peer of state.peers.values()) try { peer.pc.close(); } catch (_) {}
});

boot().catch((error) => { console.error(error); ui.setupBanner.classList.remove("hidden"); toast("Falha ao iniciar o aplicativo.", 6000); });
