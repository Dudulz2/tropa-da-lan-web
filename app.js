let createClient;
try {
  ({ createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"));
} catch (primaryError) {
  console.warn("Falha ao carregar Supabase pelo CDN principal; tentando fallback.", primaryError);
  try {
    ({ createClient } = await import("https://esm.sh/@supabase/supabase-js@2"));
  } catch (fallbackError) {
    const gateText = document.getElementById("startupGateText");
    const gateBtn = document.getElementById("startupReloadBtn");
    if (gateText) gateText.textContent = "Não foi possível carregar a biblioteca de conexão. Verifique a internet e recarregue.";
    gateBtn?.classList.remove("hidden");
    throw fallbackError;
  }
}

const cfg = window.TROPA_CONFIG || {};
const APP_VERSION = "7.3.1";
const isConfigured = Boolean(
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_PUBLISHABLE_KEY &&
  !cfg.SUPABASE_URL.includes("SEU-PROJETO") &&
  !cfg.SUPABASE_PUBLISHABLE_KEY.includes("COLE_SUA_CHAVE")
);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatDateTime(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function finishStartupGate() {
  window.__TROPA_BOOT_OK = true;
  if (window.__TROPA_BOOT_TIMER) clearTimeout(window.__TROPA_BOOT_TIMER);
  document.getElementById("startupGate")?.classList.add("hidden");
}
function startupStatus(message) {
  const el = document.getElementById("startupGateText");
  if (el) el.textContent = message;
}

const ui = {
  setupBanner: $("#setupBanner"), authScreen: $("#authScreen"), appShell: $("#appShell"),
  loginTab: $("#loginTab"), registerTab: $("#registerTab"), loginForm: $("#loginForm"), registerForm: $("#registerForm"),
  loginEmail: $("#loginEmail"), loginPassword: $("#loginPassword"), loginBtn: $("#loginBtn"), forgotPasswordBtn: $("#forgotPasswordBtn"),
  registerEmail: $("#registerEmail"), registerUsername: $("#registerUsername"), registerPassword: $("#registerPassword"), registerPassword2: $("#registerPassword2"), registerBtn: $("#registerBtn"),
  invitePreviewAuth: $("#invitePreviewAuth"),
  serversRail: $("#serversRail"), serverButtons: $("#serverButtons"), createServerBtn: $("#createServerBtn"), joinServerBtn: $("#joinServerBtn"),
  emptyCreateServerBtn: $("#emptyCreateServerBtn"), emptyJoinServerBtn: $("#emptyJoinServerBtn"), homeServerBtn: $("#homeServerBtn"),
  channelsPanel: $("#channelsPanel"), activeServerName: $("#activeServerName"), serverMenuBtn: $("#serverMenuBtn"), serverHeaderInviteBtn: $("#serverHeaderInviteBtn"), closeNavBtn: $("#closeNavBtn"),
  serverQuickMenu: $("#serverQuickMenu"), quickInviteBtn: $("#quickInviteBtn"), quickCreateChannelBtn: $("#quickCreateChannelBtn"), quickSoundboardBtn: $("#quickSoundboardBtn"), quickSettingsBtn: $("#quickSettingsBtn"), quickNicknameBtn: $("#quickNicknameBtn"), quickEventsBtn: $("#quickEventsBtn"), quickNotificationsBtn: $("#quickNotificationsBtn"), quickLeaveServerBtn: $("#quickLeaveServerBtn"),
  channelList: $("#channelList"), profileButton: $("#profileButton"), profileMicBtn: $("#profileMicBtn"), profileDeafenBtn: $("#profileDeafenBtn"), profileSettingsBtn: $("#profileSettingsBtn"), prefsLogoutBtn: $("#prefsLogoutBtn"), logoutBtn: $("#logoutBtn"),
  profileAvatar: $("#profileAvatar"), profilePresenceDot: $("#profilePresenceDot"), profileName: $("#profileName"), profileUsername: $("#profileUsername"),
  mobileMenuBtn: $("#mobileMenuBtn"), mobileMembersBtn: $("#mobileMembersBtn"), closeMembersBtn: $("#closeMembersBtn"), drawerBackdrop: $("#drawerBackdrop"),
  activeChannelIcon: $("#activeChannelIcon"), activeChannelName: $("#activeChannelName"), activeChannelTopic: $("#activeChannelTopic"), connectionText: $("#connectionText"),
  topbarSearchInput: $("#topbarSearchInput"), pinnedMessagesBtn: $("#pinnedMessagesBtn"), notificationsBtn: $("#notificationsBtn"), friendsBtn: $("#friendsBtn"), appearanceBtn: $("#appearanceBtn"),
  homeHub: $("#homeHub"), contentArea: $(".content-area"), friendRequestCount: $("#friendRequestCount"), friendRequestsList: $("#friendRequestsList"), friendsCount: $("#friendsCount"), friendsList: $("#friendsList"), dmContactsList: $("#dmContactsList"), addFriendBtn: $("#addFriendBtn"),
  dmEmpty: $("#dmEmpty"), dmConversation: $("#dmConversation"), dmBackBtn: $("#dmBackBtn"), dmAvatar: $("#dmAvatar"), dmName: $("#dmName"), dmStatus: $("#dmStatus"), dmMessages: $("#dmMessages"), dmForm: $("#dmForm"), dmInput: $("#dmInput"), dmAttachBtn: $("#dmAttachBtn"), dmFileInput: $("#dmFileInput"),
  emptyState: $("#emptyState"), messages: $("#messages"), composerWrap: $("#composerWrap"), messageForm: $("#messageForm"), messageInput: $("#messageInput"), sendBtn: $("#sendBtn"), attachBtn: $("#attachBtn"), messageFileInput: $("#messageFileInput"), attachmentPreview: $("#attachmentPreview"), replyBar: $("#replyBar"), replyLabel: $("#replyLabel"), replyPreview: $("#replyPreview"), cancelReplyBtn: $("#cancelReplyBtn"), editBar: $("#editBar"), cancelEditBtn: $("#cancelEditBtn"), typingIndicator: $("#typingIndicator"), quickPollBtn: $("#quickPollBtn"),
  membersPanel: $("#membersPanel"), membersList: $("#membersList"), membersSearchInput: $("#membersSearchInput"),
  voiceDock: $("#voiceDock"), voiceIndicator: $("#voiceIndicator"), voiceStateText: $("#voiceStateText"), voiceRoomLabel: $("#voiceRoomLabel"),
  leaveVoiceBtn: $("#leaveVoiceBtn"), muteBtn: $("#muteBtn"), deafenBtn: $("#deafenBtn"), cameraBtn: $("#cameraBtn"), shareBtn: $("#shareBtn"), soundboardBtn: $("#soundboardBtn"), voiceReconnectBtn: $("#voiceReconnectBtn"), voiceDiagnosticsBtn: $("#voiceDiagnosticsBtn"), voiceMicSelect: $("#voiceMicSelect"), voiceOutputSelect: $("#voiceOutputSelect"),
  mediaStage: $("#mediaStage"), mediaStageTitle: $("#mediaStageTitle"), callStatusText: $("#callStatusText"), mediaGrid: $("#mediaGrid"), screenMediaSection: $("#screenMediaSection"), screenMediaGrid: $("#screenMediaGrid"), cameraMediaSection: $("#cameraMediaSection"), expandMediaBtn: $("#expandMediaBtn"), collapseMediaBtn: $("#collapseMediaBtn"),
  profileDialog: $("#profileDialog"), profileForm: $("#profileForm"), profileAvatarPreview: $("#profileAvatarPreview"), avatarFileInput: $("#avatarFileInput"),
  displayNameInput: $("#displayNameInput"), profileUsernameInput: $("#profileUsernameInput"), customStatusInput: $("#customStatusInput"), bioInput: $("#bioInput"), saveProfileBtn: $("#saveProfileBtn"),
  serverDialog: $("#serverDialog"), serverForm: $("#serverForm"), serverNameInput: $("#serverNameInput"), serverTemplateInput: $("#serverTemplateInput"),
  joinServerDialog: $("#joinServerDialog"), joinServerForm: $("#joinServerForm"), joinInviteInput: $("#joinInviteInput"), joinInvitePreview: $("#joinInvitePreview"), acceptInviteBtn: $("#acceptInviteBtn"),
  inviteDialog: $("#inviteDialog"), inviteDialogTitle: $("#inviteDialogTitle"), inviteExpiry: $("#inviteExpiry"), inviteMaxUses: $("#inviteMaxUses"), generateInviteBtn: $("#generateInviteBtn"), inviteResult: $("#inviteResult"), inviteLinkOutput: $("#inviteLinkOutput"), copyInviteBtn: $("#copyInviteBtn"),
  channelDialog: $("#channelDialog"), channelForm: $("#channelForm"), channelNameInput: $("#channelNameInput"), channelTopicInput: $("#channelTopicInput"), channelTopicLabel: $("#channelTopicLabel"), channelCategoryInput: $("#channelCategoryInput"), channelSlowmodeInput: $("#channelSlowmodeInput"), channelReadOnlyInput: $("#channelReadOnlyInput"), channelReadOnlyRow: $("#channelReadOnlyRow"), channelPrivateInput: $("#channelPrivateInput"), channelAllowedRoles: $("#channelAllowedRoles"), channelAllowedRolesRow: $("#channelAllowedRolesRow"),
  serverSettingsDialog: $("#serverSettingsDialog"), settingsServerName: $("#settingsServerName"), settingsOverviewPane: $("#settingsOverviewPane"), settingsRolesPane: $("#settingsRolesPane"), settingsMembersPane: $("#settingsMembersPane"),
  serverIconPreview: $("#serverIconPreview"), serverIconFileInput: $("#serverIconFileInput"), serverBannerPreview: $("#serverBannerPreview"), serverBannerFileInput: $("#serverBannerFileInput"), settingsServerAccent: $("#settingsServerAccent"), settingsServerNameInput: $("#settingsServerNameInput"), settingsServerDescription: $("#settingsServerDescription"), saveServerOverviewBtn: $("#saveServerOverviewBtn"), deleteServerBtn: $("#deleteServerBtn"),
  rolesList: $("#rolesList"), newRoleBtn: $("#newRoleBtn"), roleEditor: $("#roleEditor"), roleEditorTitle: $("#roleEditorTitle"), deleteRoleBtn: $("#deleteRoleBtn"), roleNameInput: $("#roleNameInput"), roleColorInput: $("#roleColorInput"), roleColorText: $("#roleColorText"), rolePermissions: $("#rolePermissions"),
  settingsMemberCount: $("#settingsMemberCount"), settingsMembersList: $("#settingsMembersList"),
  settingsEventsPane: $("#settingsEventsPane"), settingsModerationPane: $("#settingsModerationPane"), eventsList: $("#eventsList"), newEventBtn: $("#newEventBtn"), bansList: $("#bansList"), auditLogList: $("#auditLogList"),
  forgotPasswordDialog: $("#forgotPasswordDialog"), forgotPasswordForm: $("#forgotPasswordForm"), forgotEmailInput: $("#forgotEmailInput"), recoveryDialog: $("#recoveryDialog"), recoveryForm: $("#recoveryForm"), recoveryPasswordInput: $("#recoveryPasswordInput"), recoveryPassword2Input: $("#recoveryPassword2Input"),
  addFriendDialog: $("#addFriendDialog"), addFriendForm: $("#addFriendForm"), friendUsernameInput: $("#friendUsernameInput"),
  preferencesDialog: $("#preferencesDialog"), preferencesForm: $("#preferencesForm"), accentColorInput: $("#accentColorInput"), themeModeInput: $("#themeModeInput"), densityInput: $("#densityInput"), audioInputSelect: $("#audioInputSelect"), videoInputSelect: $("#videoInputSelect"), audioOutputPreference: $("#audioOutputPreference"), screenQualityInput: $("#screenQualityInput"), screenFpsInput: $("#screenFpsInput"), streamModeInput: $("#streamModeInput"), notificationLevelInput: $("#notificationLevelInput"), pushToTalkInput: $("#pushToTalkInput"), pushToTalkKeyInput: $("#pushToTalkKeyInput"), voiceSensitivityInput: $("#voiceSensitivityInput"), voiceSensitivityValue: $("#voiceSensitivityValue"), lowBandwidthInput: $("#lowBandwidthInput"), refreshDevicesBtn: $("#refreshDevicesBtn"), testMicBtn: $("#testMicBtn"), micMeter: $("#micMeter"), micDeviceStatus: $("#micDeviceStatus"), openDiagnosticsFromPrefsBtn: $("#openDiagnosticsFromPrefsBtn"), installAppBtn: $("#installAppBtn"), checkUpdateBtn: $("#checkUpdateBtn"), exportDataBtn: $("#exportDataBtn"), signOutAllBtn: $("#signOutAllBtn"), reduceMotionInput: $("#reduceMotionInput"), browserNotificationsInput: $("#browserNotificationsInput"), soundsInput: $("#soundsInput"),
  pollDialog: $("#pollDialog"), pollForm: $("#pollForm"), pollQuestionInput: $("#pollQuestionInput"), pollOptionsInput: $("#pollOptionsInput"), pollDurationInput: $("#pollDurationInput"), pollMultipleInput: $("#pollMultipleInput"), pollAnonymousInput: $("#pollAnonymousInput"),
  eventDialog: $("#eventDialog"), eventForm: $("#eventForm"), eventTitleInput: $("#eventTitleInput"), eventDescriptionInput: $("#eventDescriptionInput"), eventStartsAtInput: $("#eventStartsAtInput"),
  pinnedDialog: $("#pinnedDialog"), pinnedList: $("#pinnedList"),
  profileBannerPreview: $("#profileBannerPreview"), bannerFileInput: $("#bannerFileInput"), presenceModeInput: $("#presenceModeInput"),
  soundboardDialog: $("#soundboardDialog"), soundboardList: $("#soundboardList"), soundboardManage: $("#soundboardManage"), soundboardForm: $("#soundboardForm"), soundNameInput: $("#soundNameInput"), soundEmojiInput: $("#soundEmojiInput"), soundFileInput: $("#soundFileInput"), uploadSoundBtn: $("#uploadSoundBtn"), soundboardSearchInput: $("#soundboardSearchInput"), soundboardFavoritesBtn: $("#soundboardFavoritesBtn"), soundboardVolume: $("#soundboardVolume"), soundboardVolumeValue: $("#soundboardVolumeValue"), soundboardCallHint: $("#soundboardCallHint"), diagnosticsDialog: $("#diagnosticsDialog"), commandPaletteDialog: $("#commandPaletteDialog"), commandPaletteInput: $("#commandPaletteInput"), commandPaletteResults: $("#commandPaletteResults"), mobileBottomNav: $("#mobileBottomNav"), toast: $("#toast")
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
  serverNotificationLevel: null,
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
  editingChannelId: null,
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
  screenAudioTrack: null,
  mixedAudioTrack: null,
  audioMixContext: null,
  audioMixDestination: null,
  audioMixNodes: [],
  deafen: false,
  hardMuted: false,
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
  preferences: { theme_mode: 'neon', accent_color: '#1D8DFF', density: 'comfortable', reduce_motion: false, browser_notifications: false, sounds_enabled: true, audio_input_id: null, audio_output_id: null, video_input_id: null, push_to_talk: false, push_to_talk_key: 'Space', voice_sensitivity: 45, screen_quality: '1080p', screen_fps: 30, stream_mode: 'balanced', low_bandwidth: false, notification_level: 'mentions' },
  selectedBannerFile: null,
  events: [],
  bans: [],
  auditLog: [],
  audioMeters: new Map(),
  soundboardSounds: [],
  activeSoundboardAudio: null,
  soundboardLastPlayAt: 0,
  soundboardRemoteLastAt: 0
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
  if (ui.audioOutputPreference) ui.audioOutputPreference.value = state.preferences.audio_output_id || safeLocalStorageGet("tropa_audio_output_id") || "";
  if (ui.screenQualityInput) ui.screenQualityInput.value = state.preferences.screen_quality || "1080p";
  if (ui.screenFpsInput) ui.screenFpsInput.value = String(state.preferences.screen_fps || 30);
  if (ui.streamModeInput) ui.streamModeInput.value = state.preferences.stream_mode || "balanced";
  if (ui.notificationLevelInput) ui.notificationLevelInput.value = state.preferences.notification_level || "mentions";
  if (ui.pushToTalkInput) ui.pushToTalkInput.checked = Boolean(state.preferences.push_to_talk);
  if (ui.pushToTalkKeyInput) ui.pushToTalkKeyInput.value = state.preferences.push_to_talk_key || "Space";
  if (ui.voiceSensitivityInput) ui.voiceSensitivityInput.value = String(state.preferences.voice_sensitivity ?? 45);
  if (ui.voiceSensitivityValue) ui.voiceSensitivityValue.textContent = String(state.preferences.voice_sensitivity ?? 45);
  if (ui.lowBandwidthInput) ui.lowBandwidthInput.checked = Boolean(state.preferences.low_bandwidth);
}

async function openPreferences() {
  openDialog(ui.preferencesDialog);
  await refreshMediaDevices();
  fillPreferencesForm();
  await refreshMediaDevices({ preserveUi: true });
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
    audio_output_id: ui.audioOutputPreference?.value || null,
    video_input_id: ui.videoInputSelect.value || null,
    push_to_talk: Boolean(ui.pushToTalkInput?.checked),
    push_to_talk_key: (ui.pushToTalkKeyInput?.value || "Space").trim().slice(0, 20) || "Space",
    voice_sensitivity: Math.max(5, Math.min(95, Number(ui.voiceSensitivityInput?.value || 45))),
    screen_quality: ui.screenQualityInput?.value || "1080p",
    screen_fps: Number(ui.screenFpsInput?.value || 30),
    stream_mode: ui.streamModeInput?.value || "balanced",
    low_bandwidth: Boolean(ui.lowBandwidthInput?.checked),
    notification_level: ui.notificationLevelInput?.value || "mentions"
  };
  if (next.browser_notifications && "Notification" in window && Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    next.browser_notifications = permission === "granted";
    ui.browserNotificationsInput.checked = next.browser_notifications;
  }
  const previousAudioId = state.preferences.audio_input_id || "";
  const { data, error } = await state.supabase.from("user_preferences").upsert(next, { onConflict: "user_id" }).select().single();
  if (error) throw error;
  state.preferences = { ...state.preferences, ...data };
  safeLocalStorageSet("tropa_preferences", JSON.stringify(state.preferences));
  if (state.preferences.audio_output_id) safeLocalStorageSet("tropa_audio_output_id", state.preferences.audio_output_id);
  else safeLocalStorageSet("tropa_audio_output_id", "");
  applyPreferences();
  if (state.voiceJoinedChannelId && (next.audio_input_id || "") !== previousAudioId && micTrack()) {
    await switchMicrophone(next.audio_input_id || "", { persist: false, announce: true });
  }
  await refreshMediaDevices({ preserveUi: true });
}

function buildVoiceAudioConstraints(deviceId = "") {
  const supported = navigator.mediaDevices?.getSupportedConstraints?.() || {};
  const audio = {};
  if (supported.echoCancellation !== false) audio.echoCancellation = { ideal: true };
  if (supported.noiseSuppression !== false) audio.noiseSuppression = { ideal: true };
  if (supported.autoGainControl !== false) audio.autoGainControl = { ideal: true };
  if (supported.channelCount) audio.channelCount = { ideal: 1 };
  if (deviceId) audio.deviceId = { ideal: deviceId };
  return audio;
}

async function acquireMicrophone(deviceId = "") {
  const attempts = [
    buildVoiceAudioConstraints(deviceId),
    deviceId ? { deviceId: { ideal: deviceId } } : true,
    true
  ];
  let lastError = null;
  for (const audio of attempts) {
    try { return await navigator.mediaDevices.getUserMedia({ audio, video: false }); }
    catch (error) {
      if (["NotAllowedError", "PermissionDeniedError", "SecurityError"].includes(error?.name)) throw error;
      lastError = error;
    }
  }
  throw lastError || new Error("Não foi possível abrir o microfone.");
}

function setSpeechHint(track) {
  if (!track) return;
  try { if ("contentHint" in track) track.contentHint = "speech"; } catch (_) {}
}

function setDeviceSelectOptions(select, list, savedValue, fallback, preserveUi = false) {
  if (!select) return;
  const wanted = preserveUi ? select.value : (savedValue || select.value || "");
  select.replaceChildren();
  const base = document.createElement("option"); base.value = ""; base.textContent = fallback; select.appendChild(base);
  list.forEach((d, index) => {
    const option = document.createElement("option");
    option.value = d.deviceId;
    option.textContent = d.label || `${fallback} ${index + 1}`;
    select.appendChild(option);
  });
  select.value = [...select.options].some((o) => o.value === wanted) ? wanted : "";
}

async function refreshMediaDevices({ preserveUi = false } = {}) {
  if (!navigator.mediaDevices?.enumerateDevices) return;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audio = devices.filter((d) => d.kind === "audioinput");
    const outputs = devices.filter((d) => d.kind === "audiooutput");
    const video = devices.filter((d) => d.kind === "videoinput");
    setDeviceSelectOptions(ui.audioInputSelect, audio, state.preferences.audio_input_id, "Microfone padrão", preserveUi);
    setDeviceSelectOptions(ui.voiceMicSelect, audio, state.preferences.audio_input_id, "Padrão do sistema", false);
    setDeviceSelectOptions(ui.voiceOutputSelect, outputs, state.preferences.audio_output_id || safeLocalStorageGet("tropa_audio_output_id") || "", "Saída padrão", false);
    setDeviceSelectOptions(ui.audioOutputPreference, outputs, state.preferences.audio_output_id || safeLocalStorageGet("tropa_audio_output_id") || "", "Saída padrão", preserveUi);
    if (ui.voiceOutputSelect && typeof HTMLMediaElement !== "undefined" && typeof HTMLMediaElement.prototype.setSinkId !== "function") {
      ui.voiceOutputSelect.disabled = true;
      ui.voiceOutputSelect.title = "Este navegador usa a saída de áudio padrão do sistema.";
      if (ui.audioOutputPreference) { ui.audioOutputPreference.disabled = true; ui.audioOutputPreference.title = "Este navegador usa a saída de áudio padrão do sistema."; }
    } else if (ui.audioOutputPreference) { ui.audioOutputPreference.disabled = false; ui.audioOutputPreference.title = ""; }
    setDeviceSelectOptions(ui.videoInputSelect, video, state.preferences.video_input_id, "Câmera padrão", preserveUi);
    if (ui.voiceMicSelect) ui.voiceMicSelect.value = [...ui.voiceMicSelect.options].some((o) => o.value === (state.preferences.audio_input_id || "")) ? (state.preferences.audio_input_id || "") : "";
    if (ui.micDeviceStatus) ui.micDeviceStatus.textContent = audio.length ? `${audio.length} microfone(s) detectado(s).` : "Nenhum microfone detectado.";
  } catch (error) { console.warn("Dispositivos", error); }
}

async function requestLabeledDevices() {
  let temp = null;
  try {
    temp = await acquireMicrophone(ui.audioInputSelect?.value || state.preferences.audio_input_id || "");
  } catch (error) {
    if (!["NotAllowedError", "PermissionDeniedError"].includes(error?.name)) console.warn("Permissão de dispositivos", error);
  } finally {
    temp?.getTracks().forEach((t) => t.stop());
  }
  await refreshMediaDevices({ preserveUi: true });
}

async function tuneAudioSender(sender) {
  if (!sender?.getParameters || !sender?.setParameters) return;
  try {
    const params = sender.getParameters();
    if (!params.encodings?.length) params.encodings = [{}];
    params.encodings[0].maxBitrate = 128000;
    if ("priority" in params.encodings[0]) params.encodings[0].priority = "high";
    if ("networkPriority" in params.encodings[0]) params.encodings[0].networkPriority = "high";
    await sender.setParameters(params);
  } catch (error) { console.debug("Ajuste de bitrate de voz não suportado", error); }
}

function preferOpus(transceiver) {
  try {
    if (!transceiver?.setCodecPreferences || !window.RTCRtpReceiver?.getCapabilities) return;
    const caps = RTCRtpReceiver.getCapabilities("audio");
    if (!caps?.codecs?.length) return;
    const opus = caps.codecs.filter((c) => /audio\/opus/i.test(c.mimeType || ""));
    const rest = caps.codecs.filter((c) => !/audio\/opus/i.test(c.mimeType || ""));
    if (opus.length) transceiver.setCodecPreferences([...opus, ...rest]);
  } catch (error) { console.debug("Preferência Opus não suportada", error); }
}

async function persistAudioInputPreference(deviceId) {
  state.preferences.audio_input_id = deviceId || null;
  safeLocalStorageSet("tropa_preferences", JSON.stringify(state.preferences));
  if (state.supabase && state.user) {
    const { error } = await state.supabase.from("user_preferences").update({ audio_input_id: deviceId || null }).eq("user_id", state.user.id);
    if (error) console.warn("Salvar microfone", error);
  }
}

async function switchMicrophone(deviceId, { persist = true, announce = true } = {}) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microfone indisponível neste navegador.");
  const requestedDeviceId = deviceId || "";
  const oldTrack = micTrack();
  const wasMuted = Boolean(state.hardMuted || (oldTrack && !oldTrack.enabled && !state.preferences.push_to_talk));
  const currentDeviceId = oldTrack?.getSettings?.().deviceId || "";
  if (oldTrack && deviceId && currentDeviceId === deviceId) {
    if (persist) await persistAudioInputPreference(deviceId);
    return oldTrack;
  }
  let stream;
  try {
    stream = await acquireMicrophone(deviceId);
  } catch (error) {
    if (deviceId && ["OverconstrainedError", "NotFoundError", "DevicesNotFoundError"].includes(error?.name)) {
      stream = await acquireMicrophone("");
      deviceId = "";
      if (announce) toast("O microfone salvo não foi encontrado. Usando o microfone padrão.", 4500);
    } else throw error;
  }
  const newTrack = stream.getAudioTracks()[0];
  if (!newTrack) { stream.getTracks().forEach((t) => t.stop()); throw new Error("Nenhum microfone disponível."); }
  const actualDeviceId = newTrack.getSettings?.().deviceId || "";
  if (requestedDeviceId && actualDeviceId && actualDeviceId !== requestedDeviceId) {
    deviceId = "";
    if (announce) toast("O microfone escolhido não pôde ser aberto. Usando o microfone padrão.", 4500);
  }
  setSpeechHint(newTrack);
  newTrack.enabled = state.preferences.push_to_talk ? false : !wasMuted;
  newTrack.addEventListener("ended", () => {
    if (micTrack() !== newTrack || !state.voiceJoinedChannelId) return;
    toast("O microfone foi desconectado. Tentando usar o microfone padrão…", 4500);
    switchMicrophone("", { persist: true, announce: false }).catch((error) => console.warn("Fallback de microfone", error));
  }, { once: true });
  if (!state.localStream) state.localStream = new MediaStream();
  if (oldTrack) state.localStream.removeTrack(oldTrack);
  state.localStream.addTrack(newTrack);
  if (state.screenAudioTrack && state.screenAudioTrack.readyState === "live") {
    await startScreenAudioMix(state.screenAudioTrack, { announce: false });
  } else {
    await replaceAudioForPeers(newTrack);
  }
  if (oldTrack && oldTrack.readyState !== "ended") { try { oldTrack.stop(); } catch (_) {} }
  if (persist) await persistAudioInputPreference(deviceId);
  if (ui.audioInputSelect) ui.audioInputSelect.value = [...ui.audioInputSelect.options].some((o) => o.value === deviceId) ? deviceId : "";
  if (ui.voiceMicSelect) ui.voiceMicSelect.value = [...ui.voiceMicSelect.options].some((o) => o.value === deviceId) ? deviceId : "";
  if (state.voiceJoinedChannelId) { updateVoiceDock("joined"); await retrackVoicePresence(); }
  if (announce) toast(`Microfone alterado para ${newTrack.label || "dispositivo selecionado"}.`);
  return newTrack;
}

let micTestStop = null;
async function testMicrophone() {
  if (micTestStop) { micTestStop(); micTestStop = null; ui.testMicBtn.textContent = "Testar microfone"; return; }
  try {
    const deviceId = ui.audioInputSelect.value;
    const stream = await acquireMicrophone(deviceId);
    const track = stream.getAudioTracks()[0]; setSpeechHint(track);
    if (ui.micDeviceStatus) ui.micDeviceStatus.textContent = `Testando: ${track?.label || "microfone selecionado"}`;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaStreamSource(stream); const analyser = ctx.createAnalyser(); analyser.fftSize = 512; analyser.smoothingTimeConstant = .72; source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount); let raf = 0; let active = true;
    const tick = () => { if (!active) return; analyser.getByteTimeDomainData(data); let sum = 0; for (const v of data) { const n = (v - 128) / 128; sum += n * n; } const rms = Math.sqrt(sum / data.length); const pct = Math.min(100, Math.max(2, rms * 260)); ui.micMeter.querySelector("i").style.width = `${pct}%`; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); ui.testMicBtn.textContent = "Parar teste";
    micTestStop = () => { active = false; cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); try { source.disconnect(); } catch (_) {} ctx.close().catch(() => {}); ui.micMeter.querySelector("i").style.width = "0%"; if (ui.micDeviceStatus) ui.micDeviceStatus.textContent = "Qualidade de voz otimizada: Opus / 48 kHz quando suportado."; };
  } catch (error) { toast(error?.name === "NotAllowedError" ? "Permita o uso do microfone." : "Não foi possível testar o microfone."); }
}
ui.refreshDevicesBtn?.addEventListener("click", requestLabeledDevices);
ui.testMicBtn?.addEventListener("click", testMicrophone);
ui.voiceMicSelect?.addEventListener("change", async () => {
  ui.voiceMicSelect.disabled = true;
  try {
    if (state.voiceJoinedChannelId) await switchMicrophone(ui.voiceMicSelect.value, { persist: true, announce: true });
    else { await persistAudioInputPreference(ui.voiceMicSelect.value); if (ui.audioInputSelect) ui.audioInputSelect.value = ui.voiceMicSelect.value; }
  } catch (error) { console.error(error); toast(error?.name === "NotAllowedError" ? "Permita o uso do microfone." : "Não foi possível trocar o microfone."); await refreshMediaDevices(); }
  finally { ui.voiceMicSelect.disabled = false; }
});

async function applyAudioOutputToElement(element, deviceId = safeLocalStorageGet("tropa_audio_output_id") || "") {
  if (!element || typeof element.setSinkId !== "function") return;
  try { await element.setSinkId(deviceId || ""); }
  catch (error) { console.warn("Saída de áudio", error); }
}

async function applyAudioOutputToAll() {
  const deviceId = state.preferences.audio_output_id || safeLocalStorageGet("tropa_audio_output_id") || "";
  await Promise.allSettled([...document.querySelectorAll("audio.remote-audio")].map((audio) => applyAudioOutputToElement(audio, deviceId)));
}

ui.voiceOutputSelect?.addEventListener("change", async () => {
  state.preferences.audio_output_id = ui.voiceOutputSelect.value || null;
  safeLocalStorageSet("tropa_audio_output_id", ui.voiceOutputSelect.value || "");
  if (ui.audioOutputPreference) ui.audioOutputPreference.value = ui.voiceOutputSelect.value || "";
  if (state.supabase && state.user) state.supabase.from("user_preferences").update({ audio_output_id: ui.voiceOutputSelect.value || null }).eq("user_id", state.user.id).then(() => {});
  await applyAudioOutputToAll();
  toast("Saída de áudio atualizada.");
});
ui.audioOutputPreference?.addEventListener("change", async () => {
  state.preferences.audio_output_id = ui.audioOutputPreference.value || null;
  safeLocalStorageSet("tropa_audio_output_id", ui.audioOutputPreference.value || "");
  if (ui.voiceOutputSelect) ui.voiceOutputSelect.value = ui.audioOutputPreference.value || "";
  await applyAudioOutputToAll();
});
ui.preferencesDialog?.addEventListener("close", () => { if (micTestStop) { micTestStop(); micTestStop = null; ui.testMicBtn.textContent = "Testar microfone"; } });
if (navigator.mediaDevices?.addEventListener) navigator.mediaDevices.addEventListener("devicechange", () => refreshMediaDevices({ preserveUi: true }));

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
  const level = state.serverNotificationLevel || state.preferences.notification_level || "mentions";
  if (level === "none") return;
  if (level === "mentions") {
    const username = state.profile?.username ? `@${state.profile.username}`.toLowerCase() : "";
    const display = (state.profile?.display_name || "").toLowerCase();
    const hay = `${title} ${body}`.toLowerCase();
    if (!hay.includes("@everyone") && !hay.includes("@here") && !(username && hay.includes(username)) && !(display && hay.includes(display))) return;
  }
  try { new Notification(title, { body, icon: "./icon-192.png", badge: "./icon-192.png", tag: "tropa-message" }); } catch (_) {}
}

// -----------------------------------------------------------------------------
// UI base / dialogs
// -----------------------------------------------------------------------------
$$('[data-close-dialog]').forEach((button) => {
  button.addEventListener("click", () => closeDialog(document.getElementById(button.dataset.closeDialog)));
});

ui.mobileMenuBtn.addEventListener("click", () => {
  ui.membersPanel.classList.remove("open");
  const willOpen = !ui.appShell.classList.contains("nav-open");
  ui.appShell.classList.toggle("nav-open", willOpen);
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
  const mode = p.presence_mode || "online";
  const presenceText = mode === "dnd" ? "Não perturbe" : mode === "idle" ? "Ausente" : mode === "invisible" ? "Invisível" : "Disponível";
  ui.profileUsername.textContent = p.custom_status || presenceText;
  if (ui.profilePresenceDot) ui.profilePresenceDot.className = `profile-presence-dot ${mode}`;
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
ui.prefsLogoutBtn?.addEventListener("click", () => ui.logoutBtn.click());
ui.profileMicBtn?.addEventListener("click", () => {
  if (!state.voiceJoinedChannelId) return toast("Entre em uma call para controlar o microfone.");
  ui.muteBtn.click();
});
ui.profileDeafenBtn?.addEventListener("click", () => {
  if (!state.voiceJoinedChannelId) return toast("Entre em uma call para controlar o áudio.");
  ui.deafenBtn.click();
});

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

function myHighestRolePosition() {
  if (!state.activeServer || !state.user) return -1;
  if (state.activeServer.owner_id === state.user.id) return Number.MAX_SAFE_INTEGER;
  const ids = new Set(myRoleIds());
  return Math.max(-1, ...state.roles.filter((r) => r.is_default || ids.has(r.id)).map((r) => Number(r.position || 0)));
}
function canManageRoleClient(role) {
  if (!role || !state.activeServer || !state.user) return false;
  if (state.activeServer.owner_id === state.user.id) return true;
  return hasPermission("MANAGE_ROLES") && myHighestRolePosition() > Number(role.position || 0);
}
function highestRolePositionForUser(userId) {
  if (!state.activeServer || !userId) return -1;
  if (state.activeServer.owner_id === userId) return Number.MAX_SAFE_INTEGER;
  const ids = new Set(state.memberRoles.filter((mr) => mr.user_id === userId).map((mr) => mr.role_id));
  return Math.max(-1, ...state.roles.filter((r) => r.is_default || ids.has(r.id)).map((r) => Number(r.position || 0)));
}
function canModerateMemberClient(member) {
  if (!member || !state.activeServer || !state.user) return false;
  if (member.user_id === state.user.id || member.user_id === state.activeServer.owner_id) return false;
  if (state.activeServer.owner_id === state.user.id) return true;
  return hasPermission("KICK_MEMBERS") && myHighestRolePosition() > highestRolePositionForUser(member.user_id);
}

async function loadServerNotificationSetting() {
  state.serverNotificationLevel = null;
  if (!state.activeServer || !state.user) return;
  try {
    const { data, error } = await state.supabase.from("server_notification_settings").select("level").eq("server_id", state.activeServer.id).eq("user_id", state.user.id).maybeSingle();
    if (!error && data?.level) state.serverNotificationLevel = data.level;
  } catch (_) {}
  const level = state.serverNotificationLevel || state.preferences.notification_level || "mentions";
  if (ui.quickNotificationsBtn) {
    const label = ui.quickNotificationsBtn.querySelector(".menu-label");
    const text = `Notificações: ${level === "all" ? "todas" : level === "none" ? "nenhuma" : "menções"}`;
    if (label) label.textContent = text; else ui.quickNotificationsBtn.textContent = text;
  }
}

ui.quickNotificationsBtn?.addEventListener("click", async () => {
  if (!state.activeServer || !state.user) return;
  const current = state.serverNotificationLevel || state.preferences.notification_level || "mentions";
  const next = current === "all" ? "mentions" : current === "mentions" ? "none" : "all";
  const { error } = await state.supabase.from("server_notification_settings").upsert({ server_id: state.activeServer.id, user_id: state.user.id, level: next, updated_at: new Date().toISOString() }, { onConflict: "server_id,user_id" });
  if (error) return toast("Execute MIGRATION_V7_PRO.sql para usar notificações por servidor.");
  state.serverNotificationLevel = next; await loadServerNotificationSetting(); toast(`Notificações deste servidor: ${next === "all" ? "todas" : next === "none" ? "nenhuma" : "somente menções"}.`);
});

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
  const { data, error } = await state.supabase.from("servers").select("id,owner_id,name,description,icon_url,banner_url,accent_color,created_at,updated_at").order("created_at", { ascending: true });
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
  state.serverNotificationLevel = null;
  state.channels = [];
  state.activeTextChannelId = null;
  state.serverMembers = [];
  state.roles = [];
  state.memberRoles = [];
  state.soundboardSounds = [];
  state.profiles.clear();
  ui.activeServerName.textContent = "Selecione um servidor";
  ui.serverMenuBtn.disabled = true;
  if (ui.serverHeaderInviteBtn) ui.serverHeaderInviteBtn.disabled = true;
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
  document.documentElement.style.setProperty("--server-accent", server.accent_color || state.preferences.accent_color || "#1D8DFF");
  ui.channelsPanel?.style.setProperty("--server-banner", server.banner_url ? `url("${server.banner_url}")` : "none");
  safeLocalStorageSet("tropa_active_server", serverId);
  renderServerRail();
  ui.activeServerName.textContent = server.name;
  ui.serverMenuBtn.disabled = false;
  if (ui.serverHeaderInviteBtn) ui.serverHeaderInviteBtn.disabled = false;

  try {
    await loadServerBundle();
    await loadServerNotificationSetting();
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
    toast(`Erro ao carregar servidor: ${String(error?.message || error || "desconhecido")}`, 12000);
  }
}

async function loadServerBundle() {
  if (!state.activeServerId) return;
  const sid = state.activeServerId;
  const [channelsRes, membersRes, rolesRes, memberRolesRes] = await Promise.all([
    state.supabase.from("channels").select("id,server_id,name,type,topic,position,category,is_private,allowed_role_ids,read_only,slowmode_seconds,created_by,created_at").eq("server_id", sid).order("position").order("created_at"),
    state.supabase.from("server_members").select("server_id,user_id,nickname,joined_at,timeout_until").eq("server_id", sid).order("joined_at"),
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
  if (ui.serverHeaderInviteBtn) { ui.serverHeaderInviteBtn.classList.toggle("hidden", !canInvite); ui.serverHeaderInviteBtn.disabled = !canInvite || !state.activeServer; }
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
  const wrap = makeEl("div", "channel-admin-actions channel-admin-menu-wrap");
  const more = makeEl("button", "channel-more-button", "⋮");
  more.type = "button"; more.title = "Opções do canal"; more.setAttribute("aria-label", "Opções do canal");
  const menu = makeEl("div", "channel-context-menu hidden");
  const option = (label, icon, handler, danger = false) => {
    const btn = makeEl("button", danger ? "danger-text" : "", ""); btn.type = "button";
    btn.append(makeEl("span", "channel-menu-icon", icon), makeEl("span", "", label));
    btn.addEventListener("click", async (event) => { event.stopPropagation(); menu.classList.add("hidden"); await handler(event); });
    return btn;
  };
  menu.append(
    option("Editar canal", "✎", () => openChannelDialog(channel)),
    option("Mover para cima", "↑", () => moveChannel(channel, -1)),
    option("Mover para baixo", "↓", () => moveChannel(channel, 1)),
    option("Excluir canal", "×", async () => {
      if (!confirm(`Excluir ${channel.type === "text" ? "#" : "🔊 "}${channel.name}?`)) return;
      const { error } = await state.supabase.from("channels").delete().eq("id", channel.id);
      if (error) return toast(error.message || "Não foi possível excluir o canal.");
      if (state.voiceJoinedChannelId === channel.id) await leaveVoice();
      await loadServerBundle(); toast("Canal excluído.");
    }, true)
  );
  more.addEventListener("click", (event) => {
    event.stopPropagation();
    document.querySelectorAll(".channel-context-menu").forEach((node) => { if (node !== menu) node.classList.add("hidden"); });
    menu.classList.toggle("hidden");
  });
  wrap.append(more, menu);
  return wrap;
}

document.addEventListener("click", () => document.querySelectorAll(".channel-context-menu").forEach((node) => node.classList.add("hidden")));

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

async function reorderChannelById(sourceId, targetId) {
  if (!hasPermission("MANAGE_CHANNELS") || sourceId === targetId) return;
  const source = state.channels.find((c) => c.id === sourceId);
  const target = state.channels.find((c) => c.id === targetId);
  if (!source || !target || source.type !== target.type) return;
  const sameStoredCategory = (source.category || "Geral") === (target.category || "Geral");
  if (source.type !== "voice" && !sameStoredCategory) return;
  const group = state.channels.filter((c) => c.type === source.type && (source.type === "voice" || (c.category || "Geral") === (source.category || "Geral"))).sort((a,b) => (a.position-b.position) || a.created_at.localeCompare(b.created_at));
  const from = group.findIndex((c) => c.id === sourceId), to = group.findIndex((c) => c.id === targetId);
  if (from < 0 || to < 0) return;
  const [moved] = group.splice(from, 1); group.splice(to, 0, moved);
  const updates = group.map((c, i) => state.supabase.from("channels").update({ position: i }).eq("id", c.id));
  const results = await Promise.all(updates);
  if (results.some((r) => r.error)) return toast("Não foi possível reorganizar os canais.");
  await loadServerBundle();
}

function renderChannels() {
  ui.channelList.replaceChildren();
  if (!state.activeServer) return;

  const textChannels = state.channels.filter((c) => c.type === "text");
  const voiceChannels = state.channels.filter((c) => c.type === "voice");
  const textCategories = [...new Set(textChannels.map((c) => (c.category || "Geral").trim() || "Geral"))];
  if (!textCategories.length && hasPermission("MANAGE_CHANNELS")) textCategories.push("Geral");
  textCategories.sort((a,b) => a.localeCompare(b, "pt-BR"));

  const collapsedKey = (key) => `tropa_category_collapsed_${state.activeServerId}_${key}`;
  const isCollapsed = (key) => safeLocalStorageGet(collapsedKey(key)) === "1";
  const setTypeInDialog = (channelType) => {
    const radio = $(`input[name="channelType"][value="${channelType}"]`);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
  };
  const addHeader = ({ label, key, count, actualCategory = "Geral", channelType = "text" }) => {
    const cat = makeEl("div", "channel-category v7-category discord-channel-category");
    const toggle = makeEl("button", "channel-category-toggle"); toggle.type = "button";
    const collapsed = isCollapsed(key);
    toggle.append(makeEl("span", "category-chevron", collapsed ? "›" : "⌄"), makeEl("span", "discord-category-label", label), makeEl("small", "category-count", String(count || 0)));
    toggle.title = collapsed ? `Expandir ${label}` : `Recolher ${label}`;
    toggle.addEventListener("click", () => { safeLocalStorageSet(collapsedKey(key), collapsed ? "0" : "1"); renderChannels(); });
    cat.appendChild(toggle);
    if (hasPermission("MANAGE_CHANNELS")) {
      const add = makeEl("button", "category-add-button", "+"); add.type = "button"; add.title = `Criar canal em ${label}`;
      add.addEventListener("click", (event) => {
        event.stopPropagation();
        openChannelDialog();
        if (ui.channelCategoryInput) ui.channelCategoryInput.value = actualCategory;
        setTypeInDialog(channelType);
      });
      cat.appendChild(add);
    }
    ui.channelList.appendChild(cat);
  };

  const makeRow = (channel) => {
    const row = makeEl("div", "channel-row");
    row.dataset.channelId = channel.id;
    if (hasPermission("MANAGE_CHANNELS")) {
      row.draggable = true;
      row.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/tropa-channel", channel.id); row.classList.add("dragging"); });
      row.addEventListener("dragend", () => row.classList.remove("dragging"));
      row.addEventListener("dragover", (e) => { e.preventDefault(); row.classList.add("drag-over"); });
      row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
      row.addEventListener("drop", (e) => { e.preventDefault(); row.classList.remove("drag-over"); reorderChannelById(e.dataTransfer.getData("text/tropa-channel"), channel.id); });
    }
    const active = channel.type === "text" ? channel.id === state.activeTextChannelId : channel.id === state.voiceJoinedChannelId;
    const btn = makeEl("button", `channel-button${active ? " active" : ""}`); btn.type = "button"; btn.dataset.channelId = channel.id;
    const symbolNode = makeEl("span", "channel-symbol");
    if (channel.is_private) symbolNode.textContent = "🔒";
    else if (channel.type === "voice") {
      symbolNode.classList.add("voice-channel-symbol");
      symbolNode.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10v4h3l4 3V7l-4 3H6Z"/><path d="M16 9.3a4 4 0 0 1 0 5.4"/><path d="M18.8 6.8a7.5 7.5 0 0 1 0 10.4"/></svg>`;
    } else symbolNode.textContent = "#";
    const nameWrap = makeEl("span", "channel-name-wrap"); nameWrap.appendChild(makeEl("span", "channel-name", channel.name));
    const tags = makeEl("span", "channel-tags");
    if (channel.read_only) tags.appendChild(makeEl("span", "channel-tag", "leitura"));
    if (Number(channel.slowmode_seconds || 0) > 0) tags.appendChild(makeEl("span", "channel-tag", `${channel.slowmode_seconds}s`));
    nameWrap.appendChild(tags); btn.append(symbolNode, nameWrap);
    if (channel.type === "text") {
      const unread = window.TROPA_GET_CHANNEL_UNREAD?.(channel.id);
      if (unread?.count > 0 && !active) {
        const badge = makeEl("span", `channel-unread-badge${unread.mentions ? " mention" : ""}`, unread.mentions ? String(unread.mentions) : (unread.count > 99 ? "99+" : String(unread.count)));
        badge.title = unread.mentions ? `${unread.mentions} menção(ões)` : `${unread.count} não lida(s)`;
        btn.appendChild(badge);
      }
      btn.addEventListener("click", () => selectTextChannel(channel.id));
    } else {
      const voiceCount = (state.voicePresence.get(channel.id) || []).length;
      if (voiceCount > 0) btn.appendChild(makeEl("span", "voice-count-badge", String(voiceCount)));
      btn.addEventListener("click", () => window.TROPA_OPEN_VOICE_LOBBY ? window.TROPA_OPEN_VOICE_LOBBY(channel.id) : joinVoice(channel.id));
    }
    row.appendChild(btn);
    if (channel.type === "voice") {
      const mini = makeEl("div", "voice-members-mini");
      for (const p of state.voicePresence.get(channel.id) || []) {
        const item = makeEl("div", "voice-member-mini"); const avatar = makeEl("span", "avatar");
        setAvatar(avatar, { display_name: p.display_name, username: p.username, avatar_url: p.avatar_url });
        item.append(avatar, makeEl("span", "", `${p.display_name || p.username || "Usuário"}${p.muted ? " 🔇" : ""}${p.screen ? " 🖥" : p.camera ? " 📷" : ""}`)); mini.appendChild(item);
      }
      row.appendChild(mini);
    }
    const admin = channelAdminActions(channel); if (admin) row.appendChild(admin);
    return row;
  };

  for (const category of textCategories) {
    const channels = textChannels.filter((c) => ((c.category || "Geral").trim() || "Geral") === category).sort((a,b) => (a.position-b.position) || a.created_at.localeCompare(b.created_at));
    if (!channels.length && !hasPermission("MANAGE_CHANNELS")) continue;
    const displayLabel = category.toLocaleLowerCase("pt-BR") === "geral" ? "CENTRAL" : category.toUpperCase();
    addHeader({ label: displayLabel, key: `text:${category}`, count: channels.length, actualCategory: category, channelType: "text" });
    if (isCollapsed(`text:${category}`)) continue;
    for (const channel of channels) ui.channelList.appendChild(makeRow(channel));
  }

  if (voiceChannels.length || hasPermission("MANAGE_CHANNELS")) {
    const sortedVoice = [...voiceChannels].sort((a,b) => (a.position-b.position) || a.created_at.localeCompare(b.created_at));
    addHeader({ label: "CALL", key: "voice:call", count: sortedVoice.length, actualCategory: "Geral", channelType: "voice" });
    if (!isCollapsed("voice:call")) for (const channel of sortedVoice) ui.channelList.appendChild(makeRow(channel));
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
  try { window.TROPA_MARK_CHANNEL_READ?.(channelId); } catch (_) {}
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
  const canWriteChannel = hasPermission("SEND_MESSAGES") && (!channel.read_only || hasPermission("MANAGE_MESSAGES"));
  ui.messageInput.disabled = !canWriteChannel;
  ui.sendBtn.disabled = !canWriteChannel;
  ui.attachBtn.disabled = !canWriteChannel;
  ui.quickPollBtn.disabled = !canWriteChannel;
  if (channel.read_only && !canWriteChannel) ui.messageInput.placeholder = `#${channel.name} é somente leitura`;
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
  const myVotes = new Set(votes.filter((v) => v.user_id === state.user.id).map((v) => Number(v.option_index)));
  const poll = makeEl("div", "poll-card");
  poll.appendChild(makeEl("strong", "poll-question", message.content || "Enquete"));
  const total = votes.length;
  options.forEach((option, index) => {
    const count = votes.filter((v) => Number(v.option_index) === index).length;
    const pct = total ? Math.round((count / total) * 100) : 0;
    const btn = makeEl("button", `poll-option${myVotes.has(index) ? " selected" : ""}`);
    btn.type = "button";
    const label = makeEl("span", "poll-option-label", option);
    const stat = makeEl("span", "poll-option-stat", `${count} • ${pct}%`);
    const fill = makeEl("span", "poll-option-fill"); fill.style.width = `${pct}%`;
    btn.append(fill, label, stat);
    btn.addEventListener("click", () => votePoll(message.id, index));
    poll.appendChild(btn);
  });
  const uniqueVoters = new Set(votes.map((v) => v.user_id)).size;
  const footerBits = [`${uniqueVoters} votante${uniqueVoters === 1 ? "" : "s"}`];
  if (message.metadata?.multiple) footerBits.push("múltipla escolha");
  if (message.metadata?.anonymous) footerBits.push("anônima");
  if (message.metadata?.closes_at) { const closes = new Date(message.metadata.closes_at); footerBits.push(closes > new Date() ? `encerra ${formatDateTime(closes.toISOString())}` : "encerrada"); }
  poll.appendChild(makeEl("small", "poll-total", footerBits.join(" • ")));
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
  const mobileActionsToggle = makeEl("button", "message-actions-toggle", "⋮");
  mobileActionsToggle.type = "button";
  mobileActionsToggle.title = "Opções da mensagem";
  mobileActionsToggle.setAttribute("aria-label", "Opções da mensagem");
  mobileActionsToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const opening = !article.classList.contains("mobile-actions-open");
    document.querySelectorAll(".message.mobile-actions-open").forEach((node) => { if (node !== article) node.classList.remove("mobile-actions-open"); });
    article.classList.toggle("mobile-actions-open", opening);
  });
  actions.addEventListener("click", () => article.classList.remove("mobile-actions-open"));
  article.appendChild(mobileActionsToggle);

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
  const rawSearch = String(searchTerm || "").trim();
  let textSearch = rawSearch;
  const fromMatch = textSearch.match(/(?:^|\s)from:@?([\w.-]+)/i);
  const beforeMatch = textSearch.match(/(?:^|\s)before:(\d{4}-\d{2}-\d{2})/i);
  const afterMatch = textSearch.match(/(?:^|\s)after:(\d{4}-\d{2}-\d{2})/i);
  const hasMatch = textSearch.match(/(?:^|\s)has:(image|file|link|video|audio)/i);
  textSearch = textSearch.replace(/(?:^|\s)(?:from:@?[\w.-]+|before:\d{4}-\d{2}-\d{2}|after:\d{4}-\d{2}-\d{2}|has:(?:image|file|link|video|audio))/gi, " ").replace(/\s+/g, " ").trim();

  let query = state.supabase.from("channel_messages")
    .select("id,channel_id,user_id,content,reply_to,created_at,edited_at,attachments,kind,metadata,pinned,pinned_by,pinned_at")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(rawSearch ? 100 : 100);

  if (textSearch) query = query.ilike("content", `%${textSearch.replace(/[%_]/g, "").trim()}%`);
  if (beforeMatch) query = query.lt("created_at", `${beforeMatch[1]}T23:59:59.999Z`);
  if (afterMatch) query = query.gte("created_at", `${afterMatch[1]}T00:00:00.000Z`);
  if (fromMatch) {
    const wanted = fromMatch[1].toLowerCase();
    const profile = [...state.profiles.values(), ...state.socialProfiles.values()].find((p) => String(p.username || "").toLowerCase() === wanted || String(p.display_name || "").toLowerCase().replace(/\s+/g, "") === wanted.replace(/\s+/g, ""));
    if (profile?.user_id) query = query.eq("user_id", profile.user_id);
    else { resetMessages(activeTextChannel() || { name: "busca", topic: "" }); ui.messages.appendChild(makeEl("div", "empty-mini", `Nenhum usuário encontrado para from:${fromMatch[1]}`)); return; }
  }

  const { data, error } = await query;
  if (error) { console.error(error); toast("Não consegui carregar as mensagens."); return; }
  if (token !== state.messageLoadToken || channelId !== state.activeTextChannelId) return;
  let rows = [...(data || [])].reverse();
  if (hasMatch) {
    const kind = hasMatch[1].toLowerCase();
    rows = rows.filter((row) => {
      const attachments = Array.isArray(row.attachments) ? row.attachments : [];
      if (kind === "link") return /https?:\/\//i.test(row.content || "") || attachments.some((a) => /^https?:\/\//i.test(a?.url || ""));
      if (kind === "file") return attachments.length > 0;
      return attachments.some((a) => (a?.kind || "").toLowerCase() === kind || String(a?.type || "").toLowerCase().startsWith(`${kind}/`));
    });
  }
  await loadMessageExtras(rows.map((m) => m.id));
  rows.forEach((row) => { state.messageMap.set(String(row.id), row); renderMessage(row, { force: true }); });
  if (rawSearch && !rows.length) ui.messages.appendChild(makeEl("div", "empty-mini", "Nenhuma mensagem encontrada. Dica: use from:@usuario, before:2026-09-25, after:2026-09-01 ou has:image."));
  if (!rawSearch) ui.messages.scrollTop = ui.messages.scrollHeight;
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

async function handleSlashCommand(raw) {
  const [name, ...parts] = String(raw || "").trim().split(/\s+/);
  if (!name.startsWith("/")) return false;
  const arg = parts.join(" ");
  if (name === "/shrug") { ui.messageInput.value = `${arg}${arg ? " " : ""}¯\\_(ツ)_/¯`; return false; }
  if (name === "/me") { ui.messageInput.value = `*${arg || state.profile?.display_name || "Usuário"}*`; return false; }
  if (name === "/status") { if (!arg) { toast("Use /status seu texto"); return true; } await state.supabase.from("profiles").update({ custom_status: arg.slice(0, 80) }).eq("user_id", state.user.id); state.profile.custom_status = arg.slice(0,80); toast("Status atualizado."); return true; }
  if (name === "/poll") { openDialog(ui.pollDialog); if (arg) ui.pollQuestionInput.value = arg.slice(0,180); return true; }
  if (name === "/invite") { if (state.activeServer) { ui.serverQuickMenu.classList.add("hidden"); ui.quickInviteBtn.click(); } return true; }
  toast("Comando desconhecido. Use /me, /shrug, /status, /poll ou /invite."); return true;
}

ui.messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.sendingMessage || !state.activeTextChannelId) return;
  const currentChannel = activeTextChannel();
  if (currentChannel?.read_only && !hasPermission("MANAGE_MESSAGES")) return toast("Este canal é somente leitura.");
  if (Number(currentChannel?.slowmode_seconds || 0) > 0 && !hasPermission("MANAGE_MESSAGES")) {
    const mine = [...state.messageMap.values()].filter((m) => m.channel_id === state.activeTextChannelId && m.user_id === state.user.id).sort((a,b) => new Date(b.created_at)-new Date(a.created_at))[0];
    if (mine) {
      const remaining = Number(currentChannel.slowmode_seconds) - Math.floor((Date.now() - new Date(mine.created_at).getTime())/1000);
      if (remaining > 0) return toast(`Modo lento ativo. Aguarde ${remaining}s.`);
    }
  }
  const myMembership = state.serverMembers.find((m) => m.user_id === state.user?.id);
  if (myMembership?.timeout_until && new Date(myMembership.timeout_until) > new Date()) return toast(`Você está em timeout até ${formatDateTime(myMembership.timeout_until)}.`);
  const content = ui.messageInput.value.trim();
  if (content.startsWith("/") && await handleSlashCommand(content)) { ui.messageInput.value = ""; return; }
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
    const durationMinutes = Number(ui.pollDurationInput?.value || 0);
    const closesAt = durationMinutes > 0 ? new Date(Date.now() + durationMinutes * 60000).toISOString() : null;
    const { error } = await state.supabase.from("channel_messages").insert({ channel_id: state.activeTextChannelId, user_id: state.user.id, content: question, kind: "poll", metadata: { options, multiple: Boolean(ui.pollMultipleInput?.checked), anonymous: Boolean(ui.pollAnonymousInput?.checked), closes_at: closesAt }, attachments: [] });
    if (error) throw error; closeDialog(ui.pollDialog); toast("Enquete publicada.");
  } catch (error) { console.error(error); toast(error.message || "Não foi possível publicar a enquete."); }
  finally { setBusy(submit, false); }
});

async function votePoll(messageId, optionIndex) {
  const message = state.messageMap.get(String(messageId));
  const closesAt = message?.metadata?.closes_at ? new Date(message.metadata.closes_at) : null;
  if (closesAt && closesAt <= new Date()) return toast("Esta enquete já foi encerrada.");
  const multiple = Boolean(message?.metadata?.multiple);
  const votes = state.pollVotes.get(String(messageId)) || [];
  const existing = votes.find((v) => v.user_id === state.user.id && Number(v.option_index) === Number(optionIndex));
  let error = null;
  if (multiple) {
    if (existing) ({ error } = await state.supabase.from("poll_votes").delete().eq("message_id", messageId).eq("user_id", state.user.id).eq("option_index", optionIndex));
    else ({ error } = await state.supabase.from("poll_votes").insert({ message_id: messageId, user_id: state.user.id, option_index: optionIndex }));
  } else {
    const del = await state.supabase.from("poll_votes").delete().eq("message_id", messageId).eq("user_id", state.user.id);
    if (del.error) error = del.error;
    else ({ error } = await state.supabase.from("poll_votes").insert({ message_id: messageId, user_id: state.user.id, option_index: optionIndex }));
  }
  if (error) return toast("Não foi possível registrar seu voto. Execute MIGRATION_V7_PRO.sql se necessário.");
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
    const template = ui.serverTemplateInput?.value || "basic";
    closeDialog(ui.serverDialog);
    await sleep(250);
    await loadServers(serverId);
    const templates = {
      gaming: [
        { name: "jogos", type: "text", category: "Comunidade", topic: "Jogos, partidas e novidades" },
        { name: "memes", type: "text", category: "Comunidade", topic: "Memes e conteúdo descontraído" },
        { name: "Jogando", type: "voice", category: "Voz" },
        { name: "AFK", type: "voice", category: "Voz" }
      ],
      study: [
        { name: "materiais", type: "text", category: "Estudo", topic: "Materiais e links úteis" },
        { name: "duvidas", type: "text", category: "Estudo", topic: "Dúvidas e ajuda" },
        { name: "Sala de estudo", type: "voice", category: "Estudo" }
      ],
      community: [
        { name: "avisos", type: "text", category: "Informações", topic: "Avisos importantes", read_only: true },
        { name: "apresentacoes", type: "text", category: "Comunidade", topic: "Apresente-se para a comunidade" },
        { name: "Bate-papo", type: "voice", category: "Voz" }
      ]
    };
    const extras = templates[template] || [];
    if (extras.length) {
      let templateError = null;
      for (let i = 0; i < extras.length; i += 1) {
        const c = extras[i];
        const { error: rpcError } = await state.supabase.rpc("create_server_channel", {
          p_server_id: serverId,
          p_name: c.name,
          p_type: c.type,
          p_topic: c.topic || "",
          p_position: 10 + i,
          p_category: c.category || "Geral",
          p_is_private: false,
          p_allowed_role_ids: [],
          p_read_only: Boolean(c.read_only),
          p_slowmode_seconds: 0
        });
        if (rpcError) { templateError = rpcError; break; }
      }
      if (templateError) console.warn("Template do servidor", templateError); else await loadServerBundle();
    }
    toast(`Servidor “${name}” criado.`);
  } catch (error) {
    console.error(error);
    const msg = String(error?.message || "erro");
    const missingRpc = error?.code === "PGRST202" || /create_tropa_server|schema cache/i.test(msg);
    toast(
      missingRpc
        ? "A função de criação de servidor ainda não foi instalada. Execute MIGRATION_V6_ULTIMATE.sql e depois MIGRATION_V7_PRO.sql no Supabase."
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
ui.serverHeaderInviteBtn?.addEventListener("click", (event) => { event.stopPropagation(); if (!ui.quickInviteBtn.classList.contains("hidden")) ui.quickInviteBtn.click(); });
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

function openChannelDialog(channel = null) {
  if (!hasPermission("MANAGE_CHANNELS")) return toast("Você não tem permissão para gerenciar canais.");
  state.editingChannelId = channel?.id || null;
  ui.channelForm.reset();
  ui.channelTopicLabel.classList.remove("hidden");
  if (ui.channelAllowedRoles) {
    ui.channelAllowedRoles.replaceChildren();
    for (const role of state.roles) {
      const option = document.createElement("option"); option.value = role.id; option.textContent = role.name; ui.channelAllowedRoles.appendChild(option);
    }
  }
  const radios = $$('input[name="channelType"]');
  radios.forEach((r) => { r.disabled = Boolean(channel); r.checked = channel ? r.value === channel.type : r.value === "text"; });
  if (channel) {
    ui.channelDialog.querySelector("h2").textContent = "Editar canal";
    ui.channelForm.querySelector('button[type="submit"]').textContent = "Salvar canal";
    ui.channelNameInput.value = channel.name || "";
    ui.channelTopicInput.value = channel.topic || "";
    ui.channelTopicLabel.classList.toggle("hidden", channel.type === "voice");
    if (ui.channelCategoryInput) ui.channelCategoryInput.value = channel.category || "Geral";
    if (ui.channelSlowmodeInput) ui.channelSlowmodeInput.value = String(channel.slowmode_seconds || 0);
    if (ui.channelReadOnlyInput) ui.channelReadOnlyInput.checked = Boolean(channel.read_only);
    ui.channelReadOnlyRow?.classList.toggle("hidden", channel.type === "voice");
    if (ui.channelPrivateInput) ui.channelPrivateInput.checked = Boolean(channel.is_private);
    ui.channelAllowedRolesRow?.classList.toggle("hidden", !channel.is_private);
    const allowed = new Set(channel.allowed_role_ids || []);
    [...(ui.channelAllowedRoles?.options || [])].forEach((o) => o.selected = allowed.has(o.value));
  } else {
    ui.channelDialog.querySelector("h2").textContent = "Criar canal";
    ui.channelForm.querySelector('button[type="submit"]').textContent = "Criar canal";
    if (ui.channelCategoryInput) ui.channelCategoryInput.value = "Geral";
    if (ui.channelSlowmodeInput) ui.channelSlowmodeInput.value = "0";
    if (ui.channelReadOnlyInput) ui.channelReadOnlyInput.checked = false;
    ui.channelReadOnlyRow?.classList.remove("hidden");
    if (ui.channelPrivateInput) ui.channelPrivateInput.checked = false;
    ui.channelAllowedRolesRow?.classList.add("hidden");
  }
  openDialog(ui.channelDialog); setTimeout(() => ui.channelNameInput.focus(), 30);
}
ui.quickCreateChannelBtn.addEventListener("click", () => { ui.serverQuickMenu.classList.add("hidden"); openChannelDialog(); });
ui.channelDialog?.addEventListener("close", () => { state.editingChannelId = null; $$('input[name="channelType"]').forEach((r) => r.disabled = false); });

$$('input[name="channelType"]').forEach((radio) => radio.addEventListener("change", () => ui.channelTopicLabel.classList.toggle("hidden", radio.checked && radio.value === "voice")));
ui.channelPrivateInput?.addEventListener("change", () => ui.channelAllowedRolesRow?.classList.toggle("hidden", !ui.channelPrivateInput.checked));
$$('input[name="channelType"]').forEach((radio) => radio.addEventListener("change", () => { const voice = radio.checked && radio.value === "voice"; if (voice && ui.channelReadOnlyInput) ui.channelReadOnlyInput.checked = false; ui.channelReadOnlyRow?.classList.toggle("hidden", voice); }));
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
    const editing = state.channels.find((c) => c.id === state.editingChannelId) || null;
    const actualType = editing?.type || type;
    const position = editing?.position ?? state.channels.filter((c) => c.type === actualType).length;
    const allowedRoleIds = ui.channelPrivateInput?.checked ? [...(ui.channelAllowedRoles?.selectedOptions || [])].map((o) => o.value) : [];
    if (ui.channelPrivateInput?.checked && !allowedRoleIds.length) return toast("Selecione pelo menos um cargo para o canal privado.");
    const payload = { name: actualType === "text" ? slugifyChannel(raw) : raw.slice(0, 32), topic: actualType === "text" ? ui.channelTopicInput.value.trim().slice(0, 180) : "", category: (ui.channelCategoryInput?.value || "Geral").trim().slice(0,32) || "Geral", is_private: Boolean(ui.channelPrivateInput?.checked), allowed_role_ids: allowedRoleIds, read_only: actualType === "text" && Boolean(ui.channelReadOnlyInput?.checked), slowmode_seconds: actualType === "text" ? Number(ui.channelSlowmodeInput?.value || 0) : 0 };
    let data, error;
    if (editing) {
      ({ data, error } = await state.supabase.from("channels").update(payload).eq("id", editing.id).select().single());
    } else {
      ({ data, error } = await state.supabase.rpc("create_server_channel", {
        p_server_id: state.activeServer.id,
        p_name: payload.name,
        p_type: actualType,
        p_topic: payload.topic,
        p_position: position,
        p_category: payload.category,
        p_is_private: payload.is_private,
        p_allowed_role_ids: payload.allowed_role_ids,
        p_read_only: payload.read_only,
        p_slowmode_seconds: payload.slowmode_seconds
      }));
    }
    if (error) {
      const msg = String(error?.message || "");
      if (!editing && (error?.code === "PGRST202" || /create_server_channel|schema cache/i.test(msg))) {
        throw new Error("A função segura de criação de canais ainda não foi instalada. Execute FIX_CHANNEL_RLS_V7_1_2.sql no Supabase.");
      }
      throw error;
    }
    const createdChannelId = editing ? data?.id : data;
    state.editingChannelId = null;
    closeDialog(ui.channelDialog); await loadServerBundle(); await syncVoiceWatchers();
    if (!editing && actualType === "text" && createdChannelId) await selectTextChannel(createdChannelId);
    toast(editing ? "Canal atualizado." : `Canal ${actualType === "text" ? "#" : "🔊 "}${payload.name} criado.`);
  } catch (error) { console.error(error); toast(error.message || "Não foi possível salvar o canal."); }
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
  if (ui.settingsServerAccent) ui.settingsServerAccent.value = state.activeServer.accent_color || "#1D8DFF";
  if (ui.serverBannerPreview) {
    ui.serverBannerPreview.style.backgroundImage = state.activeServer.banner_url ? `url("${state.activeServer.banner_url}")` : "";
    ui.serverBannerPreview.querySelector("span")?.classList.toggle("hidden", Boolean(state.activeServer.banner_url));
  }
  ui.serverIconPreview.style.backgroundImage = state.activeServer.icon_url ? `url("${state.activeServer.icon_url}")` : "";
  ui.serverIconPreview.textContent = state.activeServer.icon_url ? "" : initials(state.activeServer.name);
  ui.saveServerOverviewBtn.disabled = !hasPermission("MANAGE_SERVER");
  ui.serverIconFileInput.disabled = !hasPermission("MANAGE_SERVER");
  if (ui.serverBannerFileInput) ui.serverBannerFileInput.disabled = !hasPermission("MANAGE_SERVER");
  if (ui.settingsServerAccent) ui.settingsServerAccent.disabled = !hasPermission("MANAGE_SERVER");
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
ui.serverBannerFileInput?.addEventListener("change", () => {
  const file = ui.serverBannerFileInput.files?.[0]; if (!file) return;
  const url = URL.createObjectURL(file); ui.serverBannerPreview.style.backgroundImage = `url("${url}")`; ui.serverBannerPreview.querySelector("span")?.classList.add("hidden");
  setTimeout(() => URL.revokeObjectURL(url), 15000);
});
ui.saveServerOverviewBtn.addEventListener("click", async () => {
  if (!state.activeServer || !hasPermission("MANAGE_SERVER")) return;
  setBusy(ui.saveServerOverviewBtn, true, "Salvando…");
  try {
    let iconUrl = state.activeServer.icon_url;
    let bannerUrl = state.activeServer.banner_url;
    const file = ui.serverIconFileInput.files?.[0]; if (file) iconUrl = await uploadImage("server-icons", state.activeServer.id, file);
    const bannerFile = ui.serverBannerFileInput?.files?.[0]; if (bannerFile) bannerUrl = await uploadImage("server-icons", `${state.activeServer.id}-banner`, bannerFile);
    const updates = { name: ui.settingsServerNameInput.value.trim().slice(0, 40), description: ui.settingsServerDescription.value.trim().slice(0, 180), icon_url: iconUrl || null, banner_url: bannerUrl || null, accent_color: ui.settingsServerAccent?.value || state.activeServer.accent_color || "#1D8DFF" };
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
    btn.type = "button"; btn.dataset.roleId = role.id;
    const dot = makeEl("span", "role-color-dot"); dot.style.background = role.color; btn.append(dot, makeEl("span", "", role.name));
    if (canManageRoleClient(role) && !role.is_default) {
      btn.draggable = true;
      btn.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/tropa-role", role.id); btn.classList.add("dragging"); });
      btn.addEventListener("dragend", () => btn.classList.remove("dragging"));
      btn.addEventListener("dragover", (e) => { e.preventDefault(); btn.classList.add("drag-over"); });
      btn.addEventListener("dragleave", () => btn.classList.remove("drag-over"));
      btn.addEventListener("drop", (e) => { e.preventDefault(); btn.classList.remove("drag-over"); reorderRole(e.dataTransfer.getData("text/tropa-role"), role.id); });
    }
    btn.addEventListener("click", () => selectRole(role.id)); ui.rolesList.appendChild(btn);
  }
  if (state.selectedRoleId && !state.roles.some((r) => r.id === state.selectedRoleId)) state.selectedRoleId = null;
  if (!state.selectedRoleId) ui.roleEditor.classList.add("hidden");
}

async function reorderRole(sourceId, targetId) {
  if (!hasPermission("MANAGE_ROLES") || sourceId === targetId) return;
  const sourceRole = state.roles.find((r) => r.id === sourceId);
  const targetRole = state.roles.find((r) => r.id === targetId);
  if (!sourceRole || !targetRole || sourceRole.is_default || targetRole.is_default || !canManageRoleClient(sourceRole) || !canManageRoleClient(targetRole)) {
    return toast("Você só pode reorganizar cargos abaixo do seu cargo mais alto.");
  }
  const ownMax = myHighestRolePosition();
  const list = state.roles.filter((r) => !r.is_default && (state.activeServer?.owner_id === state.user?.id || Number(r.position || 0) < ownMax)).sort((a,b) => b.position-a.position);
  const from = list.findIndex((r) => r.id === sourceId), to = list.findIndex((r) => r.id === targetId);
  if (from < 0 || to < 0) return;
  const [moved] = list.splice(from,1); list.splice(to,0,moved);
  const maxAssignable = state.activeServer?.owner_id === state.user?.id ? Math.max(...state.roles.map((r) => Number(r.position || 0)), list.length) : Math.max(0, ownMax - 1);
  const results = await Promise.all(list.map((r,i) => state.supabase.from("roles").update({ position: Math.max(1, maxAssignable-i) }).eq("id", r.id)));
  if (results.some((r) => r.error)) return toast("Não foi possível reorganizar os cargos.");
  await loadServerBundle(); renderRolesList();
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
  const canEdit = canManageRoleClient(role); ui.roleNameInput.disabled = !canEdit || role.is_default; ui.roleColorInput.disabled = !canEdit; ui.roleColorText.disabled = !canEdit; ui.deleteRoleBtn.classList.toggle("hidden", role.is_default || !canEdit);
  ui.rolePermissions.replaceChildren(); for (const [key] of PERMISSIONS) ui.rolePermissions.appendChild(permissionToggle(key, state.roleDraftPermissions.has(key), canEdit));
}

ui.newRoleBtn.addEventListener("click", async () => {
  if (!hasPermission("MANAGE_ROLES") || !state.activeServer) return;
  const maxPos = Math.max(0, ...state.roles.map((r) => r.position || 0));
  const desired = state.activeServer.owner_id === state.user.id ? maxPos + 1 : Math.max(0, Math.min(maxPos + 1, myHighestRolePosition() - 1));
  const { data, error } = await state.supabase.from("roles").insert({ server_id: state.activeServer.id, name: "Novo cargo", color: "#99A1B3", position: desired, permissions: [] }).select().single();
  if (error) return toast(error.message || "Não foi possível criar o cargo.");
  await loadServerBundle(); state.selectedRoleId = data.id; selectRole(data.id);
});
ui.roleColorInput.addEventListener("input", () => { ui.roleColorText.value = ui.roleColorInput.value.toUpperCase(); });
ui.roleColorText.addEventListener("input", () => { const v = ui.roleColorText.value.trim(); if (/^#[0-9a-f]{6}$/i.test(v)) ui.roleColorInput.value = v; });
ui.roleEditor.addEventListener("submit", async (event) => {
  event.preventDefault(); const role = state.roles.find((r) => r.id === state.selectedRoleId); if (!role || !canManageRoleClient(role)) return;
  const updates = { name: role.is_default ? "@everyone" : ui.roleNameInput.value.trim().slice(0, 32), color: /^#[0-9a-f]{6}$/i.test(ui.roleColorText.value.trim()) ? ui.roleColorText.value.trim().toUpperCase() : ui.roleColorInput.value.toUpperCase(), permissions: [...state.roleDraftPermissions] };
  if (!updates.name) return toast("O cargo precisa de um nome.");
  const submit = ui.roleEditor.querySelector('button[type="submit"]'); setBusy(submit, true, "Salvando…");
  const { error } = await state.supabase.from("roles").update(updates).eq("id", role.id);
  setBusy(submit, false);
  if (error) return toast(error.message || "Não foi possível salvar o cargo.");
  await loadServerBundle(); selectRole(role.id); toast("Cargo atualizado.");
});
ui.deleteRoleBtn.addEventListener("click", async () => {
  const role = state.roles.find((r) => r.id === state.selectedRoleId); if (!role || role.is_default || !canManageRoleClient(role)) return;
  if (!confirm(`Excluir o cargo “${role.name}”?`)) return;
  const { error } = await state.supabase.from("roles").delete().eq("id", role.id);
  if (error) return toast(error.message || "Não foi possível excluir o cargo.");
  state.selectedRoleId = null; await loadServerBundle(); renderRolesList(); toast("Cargo excluído.");
});

function renderSettingsMembers() {
  ui.settingsMembersList.replaceChildren(); ui.settingsMemberCount.textContent = `${state.serverMembers.length} membro${state.serverMembers.length === 1 ? "" : "s"}`;
  const canRoles = hasPermission("MANAGE_ROLES");
  const editableRoles = state.roles.filter((r) => !r.is_default && canManageRoleClient(r));
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
    if (canModerateMemberClient(member)) {
      const warn = makeEl("button", "role-chip", "Advertir"); warn.type = "button";
      warn.addEventListener("click", async () => {
        const reason = prompt(`Motivo da advertência para ${profile.display_name}:`, "") ?? null; if (reason === null) return;
        warn.disabled = true;
        const { error } = await state.supabase.rpc("warn_server_member", { p_server_id: state.activeServer.id, p_user_id: member.user_id, p_reason: reason.slice(0,500) });
        warn.disabled = false;
        if (error) toast(error.message || "Não foi possível advertir o membro."); else toast("Advertência registrada.");
      });
      roleBox.appendChild(warn);
      const timeout = makeEl("button", "role-chip", member.timeout_until && new Date(member.timeout_until) > new Date() ? "Remover timeout" : "Timeout"); timeout.type = "button";
      timeout.addEventListener("click", async () => {
        const active = member.timeout_until && new Date(member.timeout_until) > new Date();
        let minutes = 0, reason = "";
        if (!active) {
          const raw = prompt(`Timeout de ${profile.display_name} por quantos minutos?`, "10"); if (raw === null) return;
          minutes = Math.max(1, Math.min(10080, Number(raw) || 10));
          reason = prompt("Motivo (opcional):", "") ?? "";
        }
        timeout.disabled = true;
        const { error } = await state.supabase.rpc("timeout_server_member", { p_server_id: state.activeServer.id, p_user_id: member.user_id, p_minutes: minutes, p_reason: reason.slice(0,500) });
        if (error) toast(error.message || "Não foi possível aplicar o timeout."); else { await loadServerBundle(); toast(active ? "Timeout removido." : `Timeout aplicado por ${minutes} min.`); }
      });
      roleBox.appendChild(timeout);
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
  return list.length ? list : [
    { urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun3.l.google.com:19302",
      "stun:stun4.l.google.com:19302"
    ] }
  ];
}
function getPeerConnectionConfig() {
  return {
    iceServers: getIceServers(),
    iceTransportPolicy: "all",
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
    iceCandidatePoolSize: 10
  };
}
function screenShareSupported() { return Boolean(navigator.mediaDevices?.getDisplayMedia); }
function micTrack() { return state.localStream?.getAudioTracks()[0] || null; }
function outgoingAudioTrack() { return state.mixedAudioTrack || micTrack(); }
function currentVideoTrack() { return state.screenTrack || state.cameraTrack || null; }

async function replaceAudioForPeers(track) {
  const results = await Promise.allSettled([...state.peers.values()].map(async (peer) => {
    if (!peer.audioSender) return;
    await peer.audioSender.replaceTrack(track || null);
    if (track) await tuneAudioSender(peer.audioSender);
  }));
  if (results.some((r) => r.status === "rejected")) console.warn("Alguns peers não aceitaram a troca de áudio", results);
  return results;
}

async function stopScreenAudioMix({ restoreMic = true, stopCapturedTrack = false } = {}) {
  const oldMixed = state.mixedAudioTrack;
  const oldScreenAudio = state.screenAudioTrack;
  const ctx = state.audioMixContext;
  state.mixedAudioTrack = null;
  state.screenAudioTrack = null;
  state.audioMixContext = null;
  state.audioMixDestination = null;
  state.audioMixNodes = [];
  if (oldMixed && oldMixed.readyState !== "ended") { try { oldMixed.stop(); } catch (_) {} }
  if (stopCapturedTrack && oldScreenAudio && oldScreenAudio.readyState !== "ended") { try { oldScreenAudio.stop(); } catch (_) {} }
  if (ctx && ctx.state !== "closed") { try { await ctx.close(); } catch (_) {} }
  if (restoreMic && state.voiceJoinedChannelId) await replaceAudioForPeers(micTrack());
}

async function startScreenAudioMix(screenAudioTrack, { announce = false } = {}) {
  if (!screenAudioTrack || screenAudioTrack.readyState === "ended") return false;
  await stopScreenAudioMix({ restoreMic: false, stopCapturedTrack: false });
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    state.screenAudioTrack = screenAudioTrack;
    await replaceAudioForPeers(screenAudioTrack);
    if (announce) toast("Áudio da transmissão ativado.");
    return true;
  }
  try {
    const ctx = new AudioCtx();
    const dest = ctx.createMediaStreamDestination();
    const nodes = [];
    const screenSource = ctx.createMediaStreamSource(new MediaStream([screenAudioTrack]));
    const screenGain = ctx.createGain(); screenGain.gain.value = 0.88;
    screenSource.connect(screenGain).connect(dest); nodes.push(screenSource, screenGain);
    const mic = micTrack();
    if (mic && mic.readyState === "live") {
      const micSource = ctx.createMediaStreamSource(new MediaStream([mic]));
      const micGain = ctx.createGain(); micGain.gain.value = 1.0;
      micSource.connect(micGain).connect(dest); nodes.push(micSource, micGain);
    }
    const mixed = dest.stream.getAudioTracks()[0];
    if (!mixed) throw new Error("Falha ao criar áudio combinado.");
    state.screenAudioTrack = screenAudioTrack;
    state.audioMixContext = ctx;
    state.audioMixDestination = dest;
    state.audioMixNodes = nodes;
    state.mixedAudioTrack = mixed;
    await replaceAudioForPeers(mixed);
    if (ctx.state === "suspended") { try { await ctx.resume(); } catch (_) {} }
    if (announce) toast("Áudio da transmissão ativado junto com o microfone.");
    return true;
  } catch (error) {
    console.warn("Mixer de áudio da transmissão indisponível", error);
    state.screenAudioTrack = screenAudioTrack;
    await replaceAudioForPeers(screenAudioTrack);
    if (announce) toast("Áudio da transmissão ativado. O navegador não permitiu misturar com o microfone.", 4200);
    return true;
  }
}

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
    .on("broadcast", { event: "media-state" }, ({ payload }) => { if (channel.id === state.voiceJoinedChannelId) handleMediaState(payload); })
    .on("broadcast", { event: "soundboard" }, ({ payload }) => { if (channel.id === state.voiceJoinedChannelId) handleSoundboardBroadcast(payload); });
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
  closeDrawers();
  if (!hasPermission("CONNECT")) return toast("Você não tem permissão para entrar neste canal de voz.");
  if (state.voiceJoinedChannelId === channelId && !state.joiningVoice) { ui.mediaStage.classList.remove("hidden"); closeDrawers(); return; }
  if (state.joiningVoice) return;
  if (state.voiceJoinedChannelId) await leaveVoice();

  const session = ++state.voiceSession; state.joiningVoice = true; updateVoiceDock("connecting", channel);
  let stream = null;
  try {
    try {
      stream = await acquireMicrophone(state.preferences.audio_input_id || "");
    } catch (error) {
      if (state.preferences.audio_input_id && ["OverconstrainedError", "NotFoundError", "DevicesNotFoundError", "NotReadableError", "AbortError"].includes(error?.name)) {
        stream = await acquireMicrophone("");
        await persistAudioInputPreference("");
        toast("O microfone salvo não está disponível. Usando o microfone padrão.", 4500);
      } else throw error;
    }
    const joinedTrack = stream.getAudioTracks()[0];
    setSpeechHint(joinedTrack);
    if (!joinedTrack) throw new Error("Nenhum microfone foi capturado.");
    joinedTrack.addEventListener("ended", () => {
      if (micTrack() !== joinedTrack || !state.voiceJoinedChannelId) return;
      toast("O microfone foi desconectado. Tentando reconectar…", 4200);
      setTimeout(() => switchMicrophone("", { persist: true, announce: false }).catch((error) => console.warn("Reconexão automática do microfone", error)), 1200);
    }, { once: true });
    const actualDeviceId = joinedTrack.getSettings?.().deviceId || state.preferences.audio_input_id || "";
    if (actualDeviceId && actualDeviceId !== state.preferences.audio_input_id) await persistAudioInputPreference(actualDeviceId);
    if (session !== state.voiceSession) { stream.getTracks().forEach((t) => t.stop()); return; }
    state.localStream = stream; state.voiceJoinedChannelId = channel.id; state.voiceJoinedChannelName = channel.name; state.hardMuted = false; if (state.preferences.push_to_talk && micTrack()) micTrack().enabled = false;
    const watcher = await ensureVoiceWatcher(channel); await Promise.race([watcher.ready, sleep(11000).then(() => { throw new Error("Tempo limite ao conectar à chamada"); })]);
    if (session !== state.voiceSession) return;
    await watcher.realtime.track(voicePresencePayload());
    state.joiningVoice = false;
    updateVoiceDock("joined", channel); ensureLocalCard(); syncVoicePeers(); await broadcastMediaState(); renderChannels(); renderMembers(); closeDrawers();
    await refreshMediaDevices();
    await applyAudioOutputToAll();
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
  const local = state.localStream, camera = state.cameraTrack, screen = state.screenTrack, screenAudio = state.screenAudioTrack;
  await stopScreenAudioMix({ restoreMic: false, stopCapturedTrack: false });
  state.voiceJoinedChannelId = null; state.voiceJoinedChannelName = null; state.localStream = null; state.cameraTrack = null; state.screenTrack = null; state.screenAudioTrack = null; state.deafen = false; state.hardMuted = false; state.cameraBusy = false; state.screenBusy = false;
  if (screen) screen.onended = null;
  for (const id of [...state.peers.keys()]) closePeer(id);
  if (watcher) { try { await watcher.realtime.untrack(); } catch (_) {} }
  local?.getTracks().forEach((t) => { try { t.stop(); } catch (_) {} });
  if (camera && camera.readyState !== "ended") try { camera.stop(); } catch (_) {}
  if (screen && screen.readyState !== "ended") try { screen.stop(); } catch (_) {}
  if (screenAudio && screenAudio.readyState !== "ended") try { screenAudio.stop(); } catch (_) {}
  ui.mediaGrid.replaceChildren(); ui.screenMediaGrid?.replaceChildren(); removeFullscreenSelfView(); refreshMediaSections(); ui.mediaStage.classList.add("hidden"); ui.mediaStage.classList.remove("collapsed", "expanded", "has-screen-share"); if (ui.expandMediaBtn) { ui.expandMediaBtn.textContent = "⛶"; ui.expandMediaBtn.title = "Ampliar área de mídia"; }
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
  if (ui.voiceMicSelect) { ui.voiceMicSelect.disabled = connecting; ui.voiceMicSelect.value = [...ui.voiceMicSelect.options].some((o) => o.value === (state.preferences.audio_input_id || "")) ? (state.preferences.audio_input_id || "") : ""; }
  if (ui.voiceOutputSelect) ui.voiceOutputSelect.disabled = connecting;
  const mutedNow = Boolean(state.hardMuted || (!state.preferences.push_to_talk && micTrack() && !micTrack().enabled));
  ui.muteBtn.classList.toggle("active", mutedNow);
  ui.deafenBtn.classList.toggle("active", state.deafen);
  ui.profileMicBtn?.classList.toggle("active", mutedNow);
  ui.profileDeafenBtn?.classList.toggle("active", state.deafen);
  ui.cameraBtn.classList.toggle("active", Boolean(state.cameraTrack));
  ui.shareBtn.classList.toggle("active", Boolean(state.screenTrack));
}

ui.leaveVoiceBtn.addEventListener("click", leaveVoice);
ui.muteBtn.addEventListener("click", async () => {
  const track = micTrack(); if (!track) return;
  state.hardMuted = !state.hardMuted;
  track.enabled = state.hardMuted ? false : (state.preferences.push_to_talk ? false : true);
  updateVoiceDock("joined"); await retrackVoicePresence();
});
ui.deafenBtn.addEventListener("click", async () => {
  if (!state.voiceJoinedChannelId) return; state.deafen = !state.deafen;
  for (const audio of ui.mediaStage.querySelectorAll('audio.remote-audio')) audio.muted = state.deafen;
  updateVoiceDock("joined"); await retrackVoicePresence();
});
ui.cameraBtn.addEventListener("click", toggleCamera);
ui.shareBtn.addEventListener("click", toggleScreenShare);
ui.expandMediaBtn?.addEventListener("click", () => toggleMediaExpanded());
ui.collapseMediaBtn.addEventListener("click", () => { ui.mediaStage.classList.toggle("collapsed"); ui.collapseMediaBtn.textContent = ui.mediaStage.classList.contains("collapsed") ? "□" : "—"; });

function refreshMediaSections() {
  const screenCount = ui.screenMediaGrid?.querySelectorAll(".media-card").length || 0;
  const cameraCount = ui.mediaGrid?.querySelectorAll(".media-card").length || 0;
  ui.screenMediaSection?.classList.toggle("hidden", screenCount === 0);
  ui.cameraMediaSection?.classList.toggle("hidden", cameraCount === 0);
  ui.mediaStage?.classList.toggle("has-screen-share", screenCount > 0);
}
function placeMediaCard(card, screen = false) {
  const target = screen ? ui.screenMediaGrid : ui.mediaGrid;
  if (target && card.parentElement !== target) target.appendChild(card);
  refreshMediaSections();
}
function removeFullscreenSelfView(card = null) {
  (card || document).querySelectorAll?.(".fullscreen-self-view").forEach((el) => {
    const video = el.querySelector("video");
    if (video) video.srcObject = null;
    el.remove();
  });
}
function addFullscreenSelfView(card) {
  removeFullscreenSelfView(card);
  if (!card || card.id === "media-local" || !state.cameraTrack || state.cameraTrack.readyState !== "live") return;
  const pip = makeEl("div", "fullscreen-self-view");
  const video = document.createElement("video"); video.autoplay = true; video.muted = true; video.playsInline = true;
  video.srcObject = new MediaStream([state.cameraTrack]);
  const label = makeEl("span", "fullscreen-self-label", "Você");
  pip.append(video, label); card.appendChild(pip); video.play().catch(() => {});
}
async function toggleCardFullscreen(card) {
  if (!card) return;
  if (document.fullscreenElement) { await document.exitFullscreen?.(); return; }
  addFullscreenSelfView(card);
  try { await card.requestFullscreen?.(); }
  catch (error) { removeFullscreenSelfView(card); console.warn("Fullscreen indisponível", error); }
}
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) removeFullscreenSelfView();
  else if (document.fullscreenElement.classList?.contains("media-card")) addFullscreenSelfView(document.fullscreenElement);
});

function ensureLocalScreenCard() {
  let card = document.getElementById("media-local-screen");
  if (!state.screenTrack) {
    if (card) { card.querySelector("video")?.replaceChildren?.(); card.remove(); }
    refreshMediaSections(); return;
  }
  if (!card) {
    card = makeEl("div", "media-card screen local-screen-card"); card.id = "media-local-screen";
    const video = document.createElement("video"); video.autoplay = true; video.muted = true; video.playsInline = true;
    const controls = makeEl("div", "media-local-controls");
    const expandBtn = makeEl("button", "tiny-icon media-expand-btn", "⛶"); expandBtn.type = "button"; expandBtn.title = "Expandir transmissão";
    expandBtn.addEventListener("click", (event) => { event.stopPropagation(); toggleCardFullscreen(card); });
    controls.appendChild(expandBtn);
    card.append(video, makeEl("span", "media-label", "Sua transmissão"), makeEl("span", "media-connection ok", "ao vivo"), controls);
    card.addEventListener("dblclick", () => toggleCardFullscreen(card));
  }
  const video = card.querySelector("video");
  const preview = new MediaStream([state.screenTrack]);
  if (video.srcObject?.getVideoTracks?.()[0] !== state.screenTrack) video.srcObject = preview;
  video.play().catch(() => {});
  placeMediaCard(card, true);
}
function ensureLocalCard() {
  if (!state.voiceJoinedChannelId) return;
  let card = document.getElementById("media-local");
  if (!card) {
    card = makeEl("div", "media-card audio-only local-camera-card"); card.id = "media-local";
    const video = document.createElement("video"); video.autoplay = true; video.muted = true; video.playsInline = true;
    const mediaAvatar = makeEl("span", "media-avatar avatar");
    const controls = makeEl("div", "media-local-controls");
    const expandBtn = makeEl("button", "tiny-icon media-expand-btn", "⛶"); expandBtn.type = "button"; expandBtn.title = "Expandir câmera";
    expandBtn.addEventListener("click", (event) => { event.stopPropagation(); toggleCardFullscreen(card); });
    controls.appendChild(expandBtn);
    card.append(video, mediaAvatar, makeEl("span", "media-label"), makeEl("span", "media-connection ok", "você"), controls);
    card.addEventListener("dblclick", () => toggleCardFullscreen(card));
  }
  placeMediaCard(card, false);
  card.dataset.initials = initials(state.profile?.display_name || state.profile?.username || "TL");
  setAvatar(card.querySelector(".media-avatar"), state.profile || { display_name: "Você" });
  const video = card.querySelector("video"), label = card.querySelector(".media-label");
  const cameraTrack = state.cameraTrack?.readyState === "live" ? state.cameraTrack : null;
  if (cameraTrack) {
    const preview = new MediaStream([cameraTrack]);
    if (video.srcObject?.getVideoTracks?.()[0] !== cameraTrack) video.srcObject = preview;
    card.classList.remove("audio-only");
    video.play().catch(() => {});
  } else {
    video.srcObject = null;
    card.classList.add("audio-only");
  }
  card.classList.remove("screen", "local-screen-suppressed");
  label.textContent = `${state.profile?.display_name || "Você"} (você)${state.screenTrack ? " • transmitindo tela" : cameraTrack ? " • câmera" : ""}`;
  ensureLocalScreenCard();
  ui.mediaStageTitle.textContent = `🔊 ${state.voiceJoinedChannelName || "Canal de voz"}`;
  ui.mediaStage.classList.remove("hidden");
  refreshMediaSections();
  updateCallStatus();
}

function toggleMediaExpanded(force = null) {
  const shouldExpand = force === null ? !ui.mediaStage.classList.contains("expanded") : Boolean(force);
  ui.mediaStage.classList.toggle("expanded", shouldExpand);
  if (ui.expandMediaBtn) {
    ui.expandMediaBtn.textContent = shouldExpand ? "🗗" : "⛶";
    ui.expandMediaBtn.title = shouldExpand ? "Reduzir área de mídia" : "Ampliar área de mídia";
  }
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
    const video = document.createElement("video"); video.autoplay = true; video.playsInline = true; video.muted = true;
    const remoteAudio = document.createElement("audio"); remoteAudio.className = "remote-audio"; remoteAudio.autoplay = true; remoteAudio.playsInline = true; remoteAudio.muted = state.deafen;
    const mediaAvatar = makeEl("span", "media-avatar avatar");
    const controls = makeEl("div", "media-local-controls");
    const expandBtn = makeEl("button", "tiny-icon media-expand-btn", "⛶"); expandBtn.type = "button"; expandBtn.title = "Expandir vídeo";
    expandBtn.addEventListener("click", (event) => { event.stopPropagation(); toggleCardFullscreen(card); });
    controls.appendChild(expandBtn);
    const volumeLabel = makeEl("label", "media-volume"); volumeLabel.title = "Volume individual";
    volumeLabel.append(makeEl("span", "", "VOL"));
    const volume = document.createElement("input"); volume.type = "range"; volume.min = "0"; volume.max = "1"; volume.step = "0.05"; volume.value = "1";
    volume.addEventListener("input", () => { remoteAudio.volume = Number(volume.value); });
    volumeLabel.appendChild(volume); controls.appendChild(volumeLabel);
    card.append(video, remoteAudio, mediaAvatar, makeEl("span", "media-label"), makeEl("span", "media-connection", "conectando"), controls);
    card.addEventListener("dblclick", () => toggleCardFullscreen(card));
    card.addEventListener("click", () => { video.play().catch(() => {}); remoteAudio.play().catch(() => {}); }); ui.mediaGrid.appendChild(card);
  }
  const p = peerPresence(peerId); const name = p?.display_name || p?.username || state.peerNames.get(peerId) || "Usuário"; card.dataset.initials = initials(name);
  setAvatar(card.querySelector(".media-avatar"), p || { display_name: name, username: name });
  const video = card.querySelector("video"); if (video.srcObject !== peer.remoteStream) video.srcObject = peer.remoteStream; video.muted = true;
  const remoteAudio = card.querySelector("audio.remote-audio"); if (remoteAudio && remoteAudio.srcObject !== peer.remoteStream) remoteAudio.srcObject = peer.remoteStream; if (remoteAudio) remoteAudio.muted = state.deafen;
  applyAudioOutputToElement(remoteAudio).catch(() => {});
  const liveVideo = peer.remoteStream.getVideoTracks().some((t) => t.readyState === "live" && !t.muted);
  const remoteScreen = Boolean(peer.remoteMedia?.screen);
  card.classList.toggle("audio-only", !liveVideo); card.classList.toggle("screen", remoteScreen);
  placeMediaCard(card, remoteScreen);
  card.querySelector(".media-label").textContent = `${name}${remoteScreen ? " • tela" : ""}${peer.remoteMedia?.muted ? " • mudo" : ""}`;
  video.play().catch(() => {});
  remoteAudio?.play().catch((error) => {
    if (error?.name === "NotAllowedError") {
      const retry = () => { remoteAudio.play().catch(() => {}); document.removeEventListener("pointerdown", retry); };
      document.addEventListener("pointerdown", retry, { once: true });
    }
  });
  startSpeakingMeter(peerId, peer.remoteStream, card); updatePeerCardStatus(peerId); ui.mediaStage.classList.remove("hidden");
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

function removeRemoteCard(peerId) { state.audioMeters.get(peerId)?.stop?.(); state.audioMeters.delete(peerId); document.getElementById(`media-${peerId}`)?.remove(); refreshMediaSections(); updateCallStatus(); }
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

async function negotiatePeer(peerId, { iceRestart = false } = {}) {
  const peer = state.peers.get(peerId); if (!peer || peer.pc.signalingState === "closed" || peer.makingOffer) return;
  try {
    peer.makingOffer = true;
    if (peer.pc.signalingState !== "stable") return;
    const offer = await peer.pc.createOffer(iceRestart ? { iceRestart: true } : undefined);
    if (peer.pc.signalingState !== "stable") return;
    await peer.pc.setLocalDescription(offer);
    await sendSignal(peerId, { description: peer.pc.localDescription });
  } catch (error) { console.warn("Falha na negociação WebRTC", error); }
  finally { peer.makingOffer = false; }
}
async function restartPeerIce(peerId, { reason = "recovery", force = false } = {}) {
  const peer = state.peers.get(peerId); if (!peer || peer.pc.signalingState === "closed" || !navigator.onLine) return;
  const now = Date.now();
  if (!force && peer.lastRestartAt && now - peer.lastRestartAt < 1800) return;
  if (peer.restartCount >= 4) {
    if (!peer.warningShown) {
      peer.warningShown = true;
      toast("A rede bloqueou a rota P2P direta. O Tropa tentou reconectar automaticamente; algumas redes exigem TURN.", 7600);
    }
    return;
  }
  if (peer.pc.signalingState !== "stable") {
    clearTimeout(peer.restartTimer);
    peer.restartTimer = setTimeout(() => restartPeerIce(peerId, { reason, force }), 900);
    return;
  }
  try {
    peer.restartCount += 1;
    peer.lastRestartAt = now;
    peer.lastRestartReason = reason;
    try { peer.pc.restartIce?.(); } catch (_) {}
    await negotiatePeer(peerId, { iceRestart: true });
  } catch (error) { console.warn("ICE restart", reason, error); }
}
function schedulePeerIceRestart(peerId, delay = 1200, reason = "recovery") {
  const peer = state.peers.get(peerId); if (!peer) return;
  clearTimeout(peer.restartTimer);
  peer.restartTimer = setTimeout(() => restartPeerIce(peerId, { reason }), delay);
}
async function recoverAllVoicePeers(reason = "network-change", { force = false } = {}) {
  if (!state.voiceJoinedChannelId || !navigator.onLine) return;
  const jobs = [];
  for (const [peerId, peer] of state.peers.entries()) {
    if (!peer?.pc || peer.pc.signalingState === "closed") continue;
    if (force) { peer.restartCount = 0; peer.warningShown = false; peer.lastRestartAt = 0; }
    jobs.push(restartPeerIce(peerId, { reason, force }));
  }
  await Promise.allSettled(jobs);
}

function createPeer(peerId) {
  if (state.peers.has(peerId)) return state.peers.get(peerId);
  if (!state.localStream) return null;
  const pc = new RTCPeerConnection(getPeerConnectionConfig());
  const remoteStream = new MediaStream();
  const peer = { pc, remoteStream, audioSender: null, videoSender: null, makingOffer: false, ignoreOffer: false, isSettingRemoteAnswerPending: false, pendingCandidates: [], polite: state.voiceClientId.localeCompare(peerId) > 0, remoteMedia: state.remoteMediaStates.get(peerId) || { camera: false, screen: false, muted: false }, restartTimer: null, connectTimer: null, restartCount: 0, warningShown: false, lastRestartAt: 0, lastRestartReason: "", candidateTypes: new Set(), iceErrors: [] };
  state.peers.set(peerId, peer);
  const audio = outgoingAudioTrack();
  if (audio) peer.audioSender = pc.addTrack(audio, new MediaStream([audio]));
  else peer.audioSender = pc.addTransceiver("audio", { direction: "recvonly" }).sender;
  const videoTx = pc.addTransceiver("video", { direction: "sendrecv" }); peer.videoSender = videoTx.sender; if (currentVideoTrack()) peer.videoSender.replaceTrack(currentVideoTrack()).then(() => { if (state.screenTrack) tuneScreenSender(peer.videoSender, state.screenTrack).catch?.(() => {}); }).catch(console.warn);
  pc.onicecandidate = ({ candidate }) => {
    if (!candidate) return;
    const json = candidate.toJSON ? candidate.toJSON() : candidate;
    const type = json?.type || json?.candidateType || (String(json?.candidate || "").match(/ typ (host|srflx|prflx|relay)(?: |$)/)?.[1]);
    if (type) peer.candidateTypes.add(type);
    sendSignal(peerId, { candidate: json });
  };
  pc.onicecandidateerror = (event) => {
    peer.iceErrors.push({ code: event.errorCode || 0, text: event.errorText || "ICE candidate error", url: event.url || "" });
    if (peer.iceErrors.length > 8) peer.iceErrors.shift();
    console.warn("ICE candidate error", peerId, event.errorCode, event.errorText, event.url);
  };
  pc.ontrack = (event) => { const track = event.track; if (!remoteStream.getTracks().some((t) => t.id === track.id)) remoteStream.addTrack(track); const refresh = () => makeRemoteCard(peerId); track.addEventListener("unmute", refresh); track.addEventListener("mute", refresh); track.addEventListener("ended", refresh); makeRemoteCard(peerId); };
  pc.onnegotiationneeded = () => negotiatePeer(peerId);
  pc.onconnectionstatechange = () => {
    updatePeerCardStatus(peerId);
    if (pc.connectionState === "connected") {
      clearTimeout(peer.restartTimer); clearTimeout(peer.connectTimer);
      peer.restartCount = 0; peer.warningShown = false; peer.lastRestartReason = "";
    }
    else if (pc.connectionState === "failed") schedulePeerIceRestart(peerId, 250, "connection-failed");
    else if (pc.connectionState === "disconnected") schedulePeerIceRestart(peerId, 2200, "connection-disconnected");
  };
  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === "failed") schedulePeerIceRestart(peerId, 250, "ice-failed");
    else if (pc.iceConnectionState === "disconnected") schedulePeerIceRestart(peerId, 1800, "ice-disconnected");
  };
  pc.onicegatheringstatechange = () => {
    if (pc.iceGatheringState === "complete" && ["new", "connecting"].includes(pc.connectionState))
      schedulePeerIceRestart(peerId, 5200, "gathering-complete-no-route");
  };
  peer.connectTimer = setTimeout(() => {
    if (["new", "connecting"].includes(pc.connectionState)) schedulePeerIceRestart(peerId, 0, "connect-timeout");
  }, 9000);
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
  clearTimeout(peer.restartTimer); clearTimeout(peer.connectTimer); peer.pc.ontrack = null; peer.pc.onicecandidate = null; peer.pc.onicecandidateerror = null; peer.pc.onconnectionstatechange = null; peer.pc.oniceconnectionstatechange = null; peer.pc.onicegatheringstatechange = null; peer.pc.onnegotiationneeded = null;
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
    const low = Boolean(state.preferences.low_bandwidth);
    const videoConstraint = { width: { ideal: low ? 640 : 1280 }, height: { ideal: low ? 360 : 720 }, frameRate: { ideal: low ? 15 : 30, max: low ? 15 : 30 }, facingMode: "user" };
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
  const old = state.screenTrack; if (!old || (expected && old !== expected)) return;
  const oldScreenAudio = state.screenAudioTrack;
  state.screenTrack = null; old.onended = null;
  if (oldScreenAudio) oldScreenAudio.onended = null;
  await stopScreenAudioMix({ restoreMic: Boolean(state.voiceJoinedChannelId), stopCapturedTrack: false });
  if (state.voiceJoinedChannelId) await replaceVideoForPeers(state.cameraTrack || null);
  if (stopTrack && old.readyState !== "ended") try { old.stop(); } catch (_) {}
  if (oldScreenAudio && oldScreenAudio.readyState !== "ended") try { oldScreenAudio.stop(); } catch (_) {}
  ensureLocalScreenCard();
  if (state.voiceJoinedChannelId) { ensureLocalCard(); if (![...state.peers.values()].some((peer) => peer.remoteMedia?.screen)) toggleMediaExpanded(false); await retrackVoicePresence(); }
  refreshMediaSections(); updateStreamActualInfo();
}
function getScreenShareVideoConstraints() {
  const quality = state.preferences.screen_quality || "1080p";
  const fps = Number(state.preferences.screen_fps || 30);
  const mode = state.preferences.stream_mode || "balanced";
  const low = Boolean(state.preferences.low_bandwidth);
  const sizes = { "720p": [1280, 720], "1080p": [1920, 1080], "1440p": [2560, 1440] };
  let [width, height] = sizes[quality] || sizes["1080p"];
  let frameRate = fps;
  if (low) { width = Math.min(width, 1280); height = Math.min(height, 720); frameRate = Math.min(frameRate, 15); }
  return { width: { ideal: width }, height: { ideal: height }, frameRate: { ideal: frameRate, max: frameRate } };
}

function screenTargetProfile() {
  const quality = state.preferences.screen_quality || "1080p";
  const fps = Math.max(5, Math.min(60, Number(state.preferences.screen_fps || 30)));
  const mode = state.preferences.stream_mode || "balanced";
  const low = Boolean(state.preferences.low_bandwidth);
  const sizes = { "720p": [1280, 720], "1080p": [1920, 1080], "1440p": [2560, 1440] };
  let [width, height] = sizes[quality] || sizes["1080p"];
  let targetFps = fps;
  if (low) { width = Math.min(width, 1280); height = Math.min(height, 720); targetFps = Math.min(targetFps, 15); }
  const bitrateTable = {
    "720p": { 15: 2500000, 30: 4500000, 60: 7000000 },
    "1080p": { 15: 4500000, 30: 8000000, 60: 12000000 },
    "1440p": { 15: 7000000, 30: 14000000, 60: 20000000 }
  };
  const fpsBucket = targetFps <= 15 ? 15 : targetFps <= 30 ? 30 : 60;
  const bitrate = low ? 2500000 : (bitrateTable[quality]?.[fpsBucket] || 8000000);
  return { quality, width, height, fps: targetFps, mode, bitrate };
}

async function tuneScreenSender(sender, track = state.screenTrack) {
  if (!sender || !track || !sender.getParameters || !sender.setParameters) return null;
  const target = screenTargetProfile();
  try {
    const settings = track.getSettings?.() || {};
    const sourceWidth = Number(settings.width || target.width);
    const sourceHeight = Number(settings.height || target.height);
    const scale = Math.max(1, sourceWidth / target.width, sourceHeight / target.height);
    const params = sender.getParameters();
    if (!params.encodings?.length) params.encodings = [{}];
    const enc = params.encodings[0];
    enc.maxFramerate = target.fps;
    enc.maxBitrate = target.bitrate;
    enc.scaleResolutionDownBy = Number(scale.toFixed(3));
    if ("priority" in enc) enc.priority = target.mode === "quality" ? "high" : "medium";
    if ("networkPriority" in enc) enc.networkPriority = target.mode === "quality" ? "high" : "medium";
    params.degradationPreference = target.mode === "quality" ? "maintain-resolution" : target.mode === "fluidity" ? "maintain-framerate" : "balanced";
    await sender.setParameters(params);
    return { sourceWidth, sourceHeight, scale, ...target };
  } catch (error) {
    console.debug("Ajuste dinâmico da transmissão não suportado", error);
    return null;
  }
}

function updateStreamActualInfo(profile = null) {
  const el = document.getElementById("streamActualInfo");
  if (!el) return;
  if (!state.screenTrack) { el.classList.add("hidden"); el.textContent = "—"; return; }
  const target = profile || screenTargetProfile();
  const settings = state.screenTrack.getSettings?.() || {};
  const sourceW = Number(settings.width || target.width);
  const sourceH = Number(settings.height || target.height);
  const scale = Math.max(1, sourceW / target.width, sourceH / target.height);
  const outW = Math.round(sourceW / scale);
  const outH = Math.round(sourceH / scale);
  el.textContent = `Alvo ${outW}×${outH} • ${target.fps} FPS`;
  el.classList.remove("hidden");
}

async function applyScreenShareSettings({ silent = false } = {}) {
  const track = state.screenTrack;
  if (!track) { updateStreamActualInfo(); return false; }
  const target = screenTargetProfile();
  try {
    await track.applyConstraints?.({ frameRate: { ideal: target.fps, max: target.fps } });
  } catch (error) {
    console.debug("O navegador ignorou a alteração de FPS na captura", error);
  }
  const results = await Promise.allSettled([...state.peers.values()].map((peer) => tuneScreenSender(peer.videoSender, track)));
  const first = results.find((r) => r.status === "fulfilled" && r.value)?.value || target;
  updateStreamActualInfo(first);
  if (!silent) toast(`Transmissão ajustada para ${target.quality} • ${target.fps} FPS.`, 2400);
  return true;
}

async function toggleScreenShare() {
  if (!state.voiceJoinedChannelId || state.screenBusy || state.cameraBusy) return;
  if (!screenShareSupported()) return toast("Este navegador não permite compartilhar a tela. No computador, use Chrome ou Edge atualizado.", 5500);
  const session = state.voiceSession; state.screenBusy = true; updateVoiceDock("joined");
  try {
    if (state.screenTrack) { await stopScreenShare(true); return; }
    const displayOptions = { video: getScreenShareVideoConstraints(), audio: true };
    if ("getSupportedConstraints" in navigator.mediaDevices) {
      try { displayOptions.systemAudio = "include"; } catch (_) {}
    }
    const stream = await navigator.mediaDevices.getDisplayMedia(displayOptions);
    const track = stream.getVideoTracks()[0]; if (!track) throw new Error("Nenhuma tela selecionada.");
    const capturedAudio = stream.getAudioTracks()[0] || null;
    if (!state.voiceJoinedChannelId || session !== state.voiceSession) { stream.getTracks().forEach((t) => t.stop()); return; }
    state.screenTrack = track; if ("contentHint" in track) track.contentHint = state.preferences.stream_mode === "fluidity" ? "motion" : "detail";
    if (capturedAudio) {
      capturedAudio.onended = () => {
        if (state.screenAudioTrack !== capturedAudio) return;
        stopScreenAudioMix({ restoreMic: true, stopCapturedTrack: false }).catch(console.warn);
      };
      await startScreenAudioMix(capturedAudio, { announce: false });
    }
    track.onended = () => { if (state.screenTrack !== track) return; state.screenBusy = true; stopScreenShare(false, track).catch(console.warn).finally(() => { if (session === state.voiceSession) { state.screenBusy = false; updateVoiceDock(state.voiceJoinedChannelId ? "joined" : "idle"); } }); };
    await replaceVideoForPeers(track); ensureLocalCard(); ensureLocalScreenCard(); toggleMediaExpanded(true); refreshMediaSections(); await applyScreenShareSettings({ silent: true }); await retrackVoicePresence();
    const audioMsg = capturedAudio ? " • áudio da tela ativo" : " • sem áudio da tela (marque Compartilhar áudio na janela do navegador)";
    toast(`Compartilhamento iniciado em ${state.preferences.screen_quality || "1080p"} • ${state.preferences.screen_fps || 30} FPS${audioMsg}.`, capturedAudio ? 3600 : 6200);
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
    const friendly = /push_to_talk|screen_quality|category|is_private|timeout_until|server_notification_settings|member_warnings|banner_url|accent_color|allowed_role_ids|read_only|slowmode_seconds/i.test(msg)
      ? "A migração V7 está incompleta. Execute DB_REPAIR_V7.sql no Supabase."
      : /user_preferences|friendships|direct_messages|message_reactions/i.test(msg)
        ? "A estrutura V6 está incompleta. Execute MIGRATION_V6_ULTIMATE.sql e depois DB_REPAIR_V7.sql."
        : "Erro do banco: " + (msg || "estrutura não reconhecida");
    toast(friendly, 12000);
  }
}

async function boot() {
  startupStatus("Preparando o aplicativo…");
  state.pendingInviteToken = inviteTokenFrom(new URL(location.href).searchParams.get("invite") || "");
  if (!isConfigured) {
    ui.setupBanner.classList.remove("hidden"); ui.authScreen.classList.remove("hidden");
    finishStartupGate();
    return;
  }
  state.supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("./sw.js?v=7.3.1").catch(() => {});
  if (state.pendingInviteToken) previewInvite(state.pendingInviteToken).catch(() => {});

  startupStatus("Verificando sua sessão…");
  let session = null;
  try {
    const sessionResult = await Promise.race([
      state.supabase.auth.getSession(),
      new Promise((resolve) => setTimeout(() => resolve({ data: { session: null }, timedOut: true }), 4500))
    ]);
    session = sessionResult?.data?.session || null;
    if (sessionResult?.timedOut) console.warn("getSession demorou demais; exibindo login e aguardando auth state.");
  } catch (error) {
    console.warn("Não foi possível recuperar a sessão imediatamente.", error);
  }

  if (session?.user) await onSignedIn(session.user); else showAuth();
  finishStartupGate();

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


// -----------------------------------------------------------------------------
// V7.1.0 — Soundboard + experiência refinada
// -----------------------------------------------------------------------------
function soundboardVolumeValue() {
  const stored = Number(safeLocalStorageGet("tropa_soundboard_volume") || 70);
  return Math.max(0, Math.min(100, Number.isFinite(stored) ? stored : 70));
}

function syncSoundboardVolumeUI() {
  const value = soundboardVolumeValue();
  if (ui.soundboardVolume) ui.soundboardVolume.value = String(value);
  if (ui.soundboardVolumeValue) ui.soundboardVolumeValue.textContent = `${value}%`;
}

function canManageSoundboard() {
  return Boolean(state.activeServer && state.user && (state.activeServer.owner_id === state.user.id || hasPermission("MANAGE_SERVER")));
}

async function loadServerSounds() {
  if (!state.activeServerId) { state.soundboardSounds = []; return []; }
  const { data, error } = await state.supabase
    .from("server_sounds")
    .select("id,server_id,name,emoji,audio_url,storage_path,uploaded_by,duration_ms,created_at")
    .eq("server_id", state.activeServerId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  state.soundboardSounds = data || [];
  return state.soundboardSounds;
}

function soundDurationLabel(ms) {
  const seconds = Math.max(0, Number(ms || 0)) / 1000;
  return `${seconds.toFixed(seconds >= 10 ? 0 : 1)}s`;
}

function highlightSoundboardCard(soundId) {
  const card = ui.soundboardList?.querySelector(`[data-sound-id="${CSS.escape(String(soundId))}"]`);
  if (!card) return;
  card.classList.remove("playing");
  void card.offsetWidth;
  card.classList.add("playing");
  setTimeout(() => card.classList.remove("playing"), 900);
}

async function playSoundboardAudio(sound, { remote = false, username = "" } = {}) {
  if (!sound?.audio_url) return;
  if (remote && state.deafen) return;
  try {
    if (state.activeSoundboardAudio) {
      try { state.activeSoundboardAudio.pause(); state.activeSoundboardAudio.currentTime = 0; } catch (_) {}
    }
    const audio = new Audio(sound.audio_url);
    audio.preload = "auto";
    audio.volume = soundboardVolumeValue() / 100;
    const outputId = state.preferences?.audio_output_id || "";
    if (outputId && typeof audio.setSinkId === "function") {
      try { await audio.setSinkId(outputId); } catch (_) {}
    }
    state.activeSoundboardAudio = audio;
    audio.addEventListener("ended", () => { if (state.activeSoundboardAudio === audio) state.activeSoundboardAudio = null; }, { once: true });
    await audio.play();
    highlightSoundboardCard(sound.id);
    if (remote && username) toast(`${username} tocou “${sound.name}”`, 1600);
  } catch (error) {
    console.warn("Falha ao reproduzir soundboard", error);
    if (!remote) toast("O navegador bloqueou a reprodução deste som. Clique novamente.");
  }
}

async function handleSoundboardBroadcast(payload) {
  if (!payload?.sound_id || payload.from === state.voiceClientId || !state.activeServerId) return;
  const present = (state.voicePresence.get(state.voiceJoinedChannelId) || []).some((item) => item.voice_client_id === payload.from && item.user_id === payload.user_id);
  if (!present) return;
  const now = Date.now();
  if (now - state.soundboardRemoteLastAt < 250) return;
  state.soundboardRemoteLastAt = now;
  let sound = state.soundboardSounds.find((item) => item.id === payload.sound_id);
  if (!sound) {
    const { data, error } = await state.supabase
      .from("server_sounds")
      .select("id,server_id,name,emoji,audio_url,storage_path,uploaded_by,duration_ms,created_at")
      .eq("id", payload.sound_id)
      .eq("server_id", state.activeServerId)
      .maybeSingle();
    if (error || !data) return;
    sound = data;
    state.soundboardSounds.push(data);
    if (ui.soundboardDialog?.open) renderSoundboard();
  }
  await playSoundboardAudio(sound, { remote: true, username: payload.username || "Alguém" });
}

async function playServerSound(sound) {
  const now = Date.now();
  if (now - state.soundboardLastPlayAt < 700) return toast("Espere um instante antes de tocar outro som.", 1400);
  state.soundboardLastPlayAt = now;
  await playSoundboardAudio(sound);
  if (!state.voiceJoinedChannelId) {
    toast("Prévia local. Entre em uma call para o servidor ouvir.", 2200);
    return;
  }
  await sendVoiceBroadcast("soundboard", {
    from: state.voiceClientId,
    user_id: state.user?.id,
    username: state.profile?.display_name || "Usuário",
    sound_id: sound.id
  });
}

function soundboardFavoritesKey() { return `tropa_soundboard_favorites_${state.activeServerId || "none"}`; }
function soundboardFavorites() {
  try { const raw = safeLocalStorageGet(soundboardFavoritesKey()); return new Set(raw ? JSON.parse(raw) : []); } catch (_) { return new Set(); }
}
function saveSoundboardFavorites(set) { safeLocalStorageSet(soundboardFavoritesKey(), JSON.stringify([...set])); }
function toggleSoundboardFavorite(soundId) {
  const favs = soundboardFavorites();
  if (favs.has(soundId)) favs.delete(soundId); else favs.add(soundId);
  saveSoundboardFavorites(favs); renderSoundboard();
}

function renderSoundboard() {
  if (!ui.soundboardList) return;
  ui.soundboardList.replaceChildren();
  const canManage = canManageSoundboard();
  ui.soundboardManage?.classList.toggle("hidden", !canManage);
  if (ui.soundboardCallHint) {
    ui.soundboardCallHint.textContent = state.voiceJoinedChannelId ? `Pronto para tocar em #${state.voiceJoinedChannelName || "voz"}` : "Entre em uma call para tocar para todos.";
    ui.soundboardCallHint.classList.toggle("connected", Boolean(state.voiceJoinedChannelId));
  }
  const query = (ui.soundboardSearchInput?.value || "").trim().toLowerCase();
  const onlyFavorites = ui.soundboardFavoritesBtn?.getAttribute("aria-pressed") === "true";
  const favs = soundboardFavorites();
  const visibleSounds = state.soundboardSounds.filter((sound) => (!query || `${sound.name} ${sound.emoji || ""}`.toLowerCase().includes(query)) && (!onlyFavorites || favs.has(sound.id)));
  if (!visibleSounds.length) {
    const empty = makeEl("div", "soundboard-empty");
    empty.innerHTML = `<span>♪</span><strong>${state.soundboardSounds.length ? "Nenhum som encontrado" : "Nenhum som ainda"}</strong><small>${state.soundboardSounds.length ? "Tente mudar a busca ou o filtro de favoritos." : (canManage ? "Adicione o primeiro efeito do servidor." : "Um administrador pode adicionar efeitos aqui.")}</small>`;
    ui.soundboardList.appendChild(empty);
    return;
  }
  for (const sound of visibleSounds) {
    const card = makeEl("div", "soundboard-card");
    card.dataset.soundId = sound.id;
    const play = makeEl("button", "soundboard-play"); play.type = "button"; play.title = `Tocar ${sound.name}`;
    const emoji = makeEl("span", "soundboard-emoji", sound.emoji || "🔊");
    const copy = makeEl("span", "soundboard-copy");
    copy.append(makeEl("strong", "", sound.name), makeEl("small", "", soundDurationLabel(sound.duration_ms)));
    play.append(emoji, copy);
    play.addEventListener("click", () => playServerSound(sound));
    card.appendChild(play);
    const favorite = makeEl("button", `soundboard-favorite${favs.has(sound.id) ? " active" : ""}`, favs.has(sound.id) ? "★" : "☆"); favorite.type = "button"; favorite.title = favs.has(sound.id) ? "Remover dos favoritos" : "Adicionar aos favoritos";
    favorite.addEventListener("click", (event) => { event.stopPropagation(); toggleSoundboardFavorite(sound.id); });
    card.appendChild(favorite);
    if (canManage) {
      const del = makeEl("button", "soundboard-delete", "×"); del.type = "button"; del.title = "Excluir som";
      del.addEventListener("click", async (event) => {
        event.stopPropagation();
        if (!confirm(`Excluir o som “${sound.name}”?`)) return;
        const { error } = await state.supabase.from("server_sounds").delete().eq("id", sound.id).eq("server_id", state.activeServerId);
        if (error) return toast(`Não foi possível excluir: ${error.message}`);
        if (sound.storage_path) state.supabase.storage.from("server-sounds").remove([sound.storage_path]).catch(() => {});
        state.soundboardSounds = state.soundboardSounds.filter((item) => item.id !== sound.id);
        renderSoundboard();
        toast("Som removido.");
      });
      card.appendChild(del);
    }
    ui.soundboardList.appendChild(card);
  }
}

async function openSoundboard() {
  if (!state.activeServer) return toast("Selecione um servidor primeiro.");
  syncSoundboardVolumeUI();
  if (ui.soundboardSearchInput) ui.soundboardSearchInput.value = "";
  ui.soundboardFavoritesBtn?.setAttribute("aria-pressed", "false");
  ui.soundboardFavoritesBtn?.classList.remove("active");
  if (ui.soundboardFavoritesBtn) ui.soundboardFavoritesBtn.textContent = "☆ Favoritos";
  ui.serverQuickMenu?.classList.add("hidden");
  if (ui.soundboardList) ui.soundboardList.innerHTML = '<div class="soundboard-loading">Carregando sons…</div>';
  openDialog(ui.soundboardDialog);
  try {
    await loadServerSounds();
    renderSoundboard();
  } catch (error) {
    console.error(error);
    if (ui.soundboardList) ui.soundboardList.innerHTML = '<div class="soundboard-empty"><span>!</span><strong>Soundboard ainda não está instalado</strong><small>Execute MIGRATION_V7_0_8_SOUNDBOARD.sql no Supabase.</small></div>';
  }
}

function audioDurationMs(file) {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    const url = URL.createObjectURL(file);
    const cleanup = () => { URL.revokeObjectURL(url); audio.removeAttribute("src"); };
    const timer = setTimeout(() => { cleanup(); reject(new Error("Não foi possível ler a duração do áudio.")); }, 8000);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      const duration = Number(audio.duration || 0);
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) return reject(new Error("Arquivo de áudio inválido."));
      resolve(Math.ceil(duration * 1000));
    };
    audio.onerror = () => { clearTimeout(timer); cleanup(); reject(new Error("Formato de áudio não suportado.")); };
    audio.src = url;
  });
}

function soundContentType(file) {
  if (file.type?.startsWith("audio/")) return file.type;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  return ({ mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", webm: "audio/webm", m4a: "audio/mp4", aac: "audio/aac" })[ext] || "audio/mpeg";
}

ui.soundboardBtn?.addEventListener("click", openSoundboard);
ui.quickSoundboardBtn?.addEventListener("click", openSoundboard);
ui.soundboardSearchInput?.addEventListener("input", renderSoundboard);
ui.soundboardFavoritesBtn?.addEventListener("click", () => {
  const active = ui.soundboardFavoritesBtn.getAttribute("aria-pressed") === "true";
  ui.soundboardFavoritesBtn.setAttribute("aria-pressed", String(!active));
  ui.soundboardFavoritesBtn.classList.toggle("active", !active);
  ui.soundboardFavoritesBtn.textContent = !active ? "★ Favoritos" : "☆ Favoritos";
  renderSoundboard();
});

ui.soundboardVolume?.addEventListener("input", () => {
  const value = Math.max(0, Math.min(100, Number(ui.soundboardVolume.value || 70)));
  if (ui.soundboardVolumeValue) ui.soundboardVolumeValue.textContent = `${value}%`;
  safeLocalStorageSet("tropa_soundboard_volume", String(value));
  if (state.activeSoundboardAudio) state.activeSoundboardAudio.volume = value / 100;
});

ui.soundboardForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.activeServer || !canManageSoundboard()) return toast("Você não tem permissão para adicionar sons.");
  const file = ui.soundFileInput?.files?.[0];
  const name = ui.soundNameInput?.value.trim().slice(0, 24) || "";
  const emoji = ui.soundEmojiInput?.value.trim().slice(0, 8) || "🔊";
  if (!name || !file) return;
  if (file.size > 2 * 1024 * 1024) return toast("O som precisa ter até 2 MB.");
  const contentType = soundContentType(file);
  if (!contentType.startsWith("audio/")) return toast("Escolha um arquivo de áudio.");
  let durationMs = 0;
  try { durationMs = await audioDurationMs(file); } catch (error) { return toast(error.message || "Áudio inválido."); }
  if (durationMs > 8000) return toast("O som precisa ter no máximo 8 segundos.");
  setBusy(ui.uploadSoundBtn, true, "Enviando…");
  try {
    const ext = (file.name.split(".").pop() || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
    const path = `${state.activeServer.id}/${state.user.id}/${Date.now()}-${uuidish().slice(0, 8)}.${ext}`;
    const { error: uploadError } = await state.supabase.storage.from("server-sounds").upload(path, file, { cacheControl: "86400", upsert: false, contentType });
    if (uploadError) throw uploadError;
    const audioUrl = state.supabase.storage.from("server-sounds").getPublicUrl(path).data.publicUrl;
    const { data, error } = await state.supabase.from("server_sounds").insert({
      server_id: state.activeServer.id, name, emoji, audio_url: audioUrl, storage_path: path,
      uploaded_by: state.user.id, duration_ms: durationMs
    }).select("id,server_id,name,emoji,audio_url,storage_path,uploaded_by,duration_ms,created_at").single();
    if (error) {
      await state.supabase.storage.from("server-sounds").remove([path]).catch(() => {});
      throw error;
    }
    state.soundboardSounds.push(data);
    ui.soundboardForm.reset();
    renderSoundboard();
    toast("Som adicionado ao servidor.");
  } catch (error) {
    console.error(error);
    toast(`Não foi possível adicionar o som: ${error.message || error}`, 6000);
  } finally { setBusy(ui.uploadSoundBtn, false); }
});

window.TROPA_RUNTIME = {
  APP_VERSION, state, ui,
  openDialog, closeDialog, toast, makeEl, setAvatar, formatDateTime,
  safeLocalStorageGet, safeLocalStorageSet,
  hasPermission, selectServer, selectTextChannel, showHomeHub, loadServers, loadServerBundle, closeDrawers, openDm, loadSocialData,
  renderChannels, renderMembers, profileForMessage, renderMessage, loadMessageExtras,
  joinVoice, leaveVoice, switchMicrophone, refreshMediaDevices, acquireMicrophone, micTrack, outgoingAudioTrack, recoverAllVoicePeers, restartPeerIce,
  applyAudioOutputToAll, toggleMediaExpanded, applyScreenShareSettings, activeTextChannel, updateVoiceDock,
  retrackVoicePresence, broadcastMediaState, clearPendingAttachment, uploadMessageFile,
  notifyDesktop, playSoftTone
};
window.dispatchEvent(new CustomEvent("tropa-runtime-ready", { detail: window.TROPA_RUNTIME }));

let networkRecoveryTimer = null;
function scheduleNetworkRecovery(reason, delay = 700) {
  if (!state.voiceJoinedChannelId) return;
  clearTimeout(networkRecoveryTimer);
  networkRecoveryTimer = setTimeout(() => {
    if (navigator.onLine) recoverAllVoicePeers(reason, { force: true }).catch((error) => console.warn("Network recovery", error));
  }, delay);
}
window.addEventListener("online", () => { toast("Internet voltou. Reconectando a chamada…", 2600); scheduleNetworkRecovery("browser-online", 350); });
window.addEventListener("offline", () => { if (state.voiceJoinedChannelId) toast("Internet caiu. A chamada tentará voltar automaticamente.", 4200); });
const networkInfo = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
networkInfo?.addEventListener?.("change", () => scheduleNetworkRecovery("network-interface-change", 900));
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && state.voiceJoinedChannelId) {
    const needsRecovery = [...state.peers.values()].some((p) => p.pc && !["connected"].includes(p.pc.connectionState));
    if (needsRecovery) scheduleNetworkRecovery("tab-resume", 500);
  }
});

window.addEventListener("beforeunload", () => {
  try { micTrack()?.stop(); state.cameraTrack?.stop(); state.screenTrack?.stop(); state.screenAudioTrack?.stop(); state.mixedAudioTrack?.stop(); state.audioMixContext?.close?.(); } catch (_) {}
  for (const peer of state.peers.values()) try { peer.pc.close(); } catch (_) {}
});

boot().catch((error) => {
  console.error(error);
  ui.setupBanner?.classList.remove("hidden");
  ui.authScreen?.classList.remove("hidden");
  const gateText = document.getElementById("startupGateText");
  if (gateText) gateText.textContent = "Falha ao iniciar o aplicativo. Recarregue a página.";
  document.getElementById("startupReloadBtn")?.classList.remove("hidden");
  toast?.("Falha ao iniciar o aplicativo.", 6000);
});
