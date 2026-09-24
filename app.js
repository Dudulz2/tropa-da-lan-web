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
  loginUsername: $("#loginUsername"), loginPassword: $("#loginPassword"), loginBtn: $("#loginBtn"),
  registerUsername: $("#registerUsername"), registerPassword: $("#registerPassword"), registerPassword2: $("#registerPassword2"), registerBtn: $("#registerBtn"),
  invitePreviewAuth: $("#invitePreviewAuth"),
  serversRail: $("#serversRail"), serverButtons: $("#serverButtons"), createServerBtn: $("#createServerBtn"), joinServerBtn: $("#joinServerBtn"),
  emptyCreateServerBtn: $("#emptyCreateServerBtn"), emptyJoinServerBtn: $("#emptyJoinServerBtn"), homeServerBtn: $("#homeServerBtn"),
  channelsPanel: $("#channelsPanel"), activeServerName: $("#activeServerName"), serverMenuBtn: $("#serverMenuBtn"), closeNavBtn: $("#closeNavBtn"),
  serverQuickMenu: $("#serverQuickMenu"), quickInviteBtn: $("#quickInviteBtn"), quickCreateChannelBtn: $("#quickCreateChannelBtn"), quickSettingsBtn: $("#quickSettingsBtn"), quickLeaveServerBtn: $("#quickLeaveServerBtn"),
  channelList: $("#channelList"), profileButton: $("#profileButton"), profileSettingsBtn: $("#profileSettingsBtn"), logoutBtn: $("#logoutBtn"),
  profileAvatar: $("#profileAvatar"), profileName: $("#profileName"), profileUsername: $("#profileUsername"),
  mobileMenuBtn: $("#mobileMenuBtn"), mobileMembersBtn: $("#mobileMembersBtn"), closeMembersBtn: $("#closeMembersBtn"), drawerBackdrop: $("#drawerBackdrop"),
  activeChannelIcon: $("#activeChannelIcon"), activeChannelName: $("#activeChannelName"), activeChannelTopic: $("#activeChannelTopic"), connectionText: $("#connectionText"),
  emptyState: $("#emptyState"), messages: $("#messages"), messageForm: $("#messageForm"), messageInput: $("#messageInput"), sendBtn: $("#sendBtn"),
  membersPanel: $("#membersPanel"), membersList: $("#membersList"),
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
  settingsMemberCount: $("#settingsMemberCount"), settingsMembersList: $("#settingsMembersList"), toast: $("#toast")
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
  roleDraftPermissions: new Set()
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

function usernameEmail(username) {
  return `${normalizeUsername(username)}@tropadalan.invalid`;
}

function makeEl(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== "") node.textContent = text;
  return node;
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
ui.homeServerBtn.addEventListener("click", () => {
  closeDrawers();
  ui.emptyState.classList.remove("hidden");
  ui.messages.classList.add("hidden");
  ui.messageForm.classList.add("hidden");
  ui.activeChannelIcon.textContent = "⌂";
  ui.activeChannelName.textContent = "Início";
  ui.activeChannelTopic.textContent = state.activeServer ? `Você está em ${state.activeServer.name}` : "Tropa da Lan";
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    ui.serverQuickMenu.classList.add("hidden");
    closeDrawers();
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

function switchAuthTab(mode) {
  const login = mode === "login";
  ui.loginTab.classList.toggle("active", login);
  ui.registerTab.classList.toggle("active", !login);
  ui.loginForm.classList.toggle("hidden", !login);
  ui.registerForm.classList.toggle("hidden", login);
  setTimeout(() => (login ? ui.loginUsername : ui.registerUsername).focus(), 30);
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
  const username = normalizeUsername(ui.loginUsername.value);
  if (!validUsername(username)) return toast("Digite um nome de usuário válido.");
  setBusy(ui.loginBtn, true, "Entrando…");
  try {
    const { error } = await state.supabase.auth.signInWithPassword({ email: usernameEmail(username), password: ui.loginPassword.value });
    if (error) throw error;
    ui.loginPassword.value = "";
  } catch (error) {
    console.error(error);
    toast(error?.message?.toLowerCase().includes("invalid login") ? "Usuário ou senha incorretos." : `Não foi possível entrar: ${error.message || "erro desconhecido"}`, 5200);
  } finally { setBusy(ui.loginBtn, false); }
});

ui.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.supabase) return;
  const username = normalizeUsername(ui.registerUsername.value);
  const password = ui.registerPassword.value;
  if (!validUsername(username)) return toast("Use 3–20 caracteres: letras minúsculas, números, ponto, hífen ou underline.", 5200);
  if (password.length < 6) return toast("A senha precisa ter pelo menos 6 caracteres.");
  if (password !== ui.registerPassword2.value) return toast("As duas senhas não são iguais.");

  setBusy(ui.registerBtn, true, "Criando…");
  try {
    const { data, error } = await state.supabase.auth.signUp({
      email: usernameEmail(username),
      password,
      options: { data: { username, display_name: username } }
    });
    if (error) throw error;
    if (!data.session) {
      toast("A conta foi criada, mas o Supabase está exigindo confirmação de e-mail. Desative 'Confirm email' em Authentication > Providers > Email e crie a conta novamente.", 9000);
      await state.supabase.auth.signOut();
      return;
    }
    ui.registerPassword.value = "";
    ui.registerPassword2.value = "";
    toast("Conta criada com sucesso!");
  } catch (error) {
    console.error(error);
    const msg = String(error?.message || "");
    if (/already|registered|duplicate|unique/i.test(msg)) toast("Esse nome de usuário já está sendo usado.");
    else toast(`Não foi possível criar a conta: ${msg || "erro desconhecido"}`, 6000);
  } finally { setBusy(ui.registerBtn, false); }
});

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
  const { data, error } = await state.supabase.from("profiles").select("user_id,username,display_name,bio,custom_status,avatar_url,created_at").eq("user_id", state.user.id).single();
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
  ui.avatarFileInput.value = "";
  openDialog(ui.profileDialog);
}
ui.profileButton.addEventListener("click", openProfileEditor);
ui.profileSettingsBtn.addEventListener("click", openProfileEditor);

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

ui.profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.profile) return;
  setBusy(ui.saveProfileBtn, true, "Salvando…");
  try {
    let avatarUrl = state.profile.avatar_url;
    const file = ui.avatarFileInput.files?.[0];
    if (file) avatarUrl = await uploadImage("avatars", state.user.id, file);
    const updates = {
      display_name: ui.displayNameInput.value.trim().slice(0, 32),
      custom_status: ui.customStatusInput.value.trim().slice(0, 64),
      bio: ui.bioInput.value.trim().slice(0, 190),
      avatar_url: avatarUrl || null
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
  ui.emptyState.classList.remove("hidden");
  ui.messages.classList.add("hidden");
  ui.messageForm.classList.add("hidden");
  ui.activeChannelName.textContent = "Tropa da Lan";
  ui.activeChannelTopic.textContent = "Crie um servidor ou use um convite para começar";
  ui.activeChannelIcon.textContent = "#";
  ui.membersList.replaceChildren();
}

async function selectServer(serverId, initial = false) {
  if (!serverId || (!initial && serverId === state.activeServerId)) { closeDrawers(); return; }
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
      ui.messages.classList.add("hidden"); ui.messageForm.classList.add("hidden");
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
    const { data, error } = await state.supabase.from("profiles").select("user_id,username,display_name,bio,custom_status,avatar_url,created_at").in("user_id", ids);
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
  for (const table of ["channels", "server_members", "roles", "member_roles"]) {
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
        try { await ch.track(serverPresencePayload()); } catch (_) {}
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
    at: new Date().toISOString()
  };
}
async function retrackServerPresence() {
  if (!state.serverPresence) return;
  try { await state.serverPresence.track(serverPresencePayload()); } catch (_) {}
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
  const members = state.serverMembers.map((m) => ({ ...m, profile: state.profiles.get(m.user_id) })).filter((m) => m.profile);
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
      const dot = makeEl("span", `presence-dot${state.onlineUserIds.has(member.user_id) ? " online" : ""}`);
      avatarWrap.append(avatar, dot);
      const meta = makeEl("div", "member-meta");
      const role = topRoleForUser(member.user_id);
      const name = makeEl("strong", "", member.nickname || member.profile.display_name);
      if (role && !role.is_default) name.style.color = role.color;
      const statusText = member.profile.custom_status || (member.user_id === state.activeServer.owner_id ? "Dono do servidor" : role?.name || `@${member.profile.username}`);
      meta.append(name, makeEl("small", "", statusText));
      row.append(avatarWrap, meta);
      if (userInAnyVoice(member.user_id)) row.appendChild(makeEl("span", "member-call-icon", "● voz"));
      ui.membersList.appendChild(row);
    }
  }
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
    row.appendChild(btn); ui.channelList.appendChild(row);
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
    row.appendChild(mini); ui.channelList.appendChild(row);
  }
}

// -----------------------------------------------------------------------------
// Text chat
// -----------------------------------------------------------------------------
async function cleanupChatSubscription() {
  if (state.chatChannel) {
    try { await state.supabase.removeChannel(state.chatChannel); } catch (_) {}
    state.chatChannel = null;
  }
}

function activeTextChannel() { return state.channels.find((c) => c.id === state.activeTextChannelId) || null; }

async function selectTextChannel(channelId) {
  const channel = state.channels.find((c) => c.id === channelId && c.type === "text");
  if (!channel) return;
  state.activeTextChannelId = channelId;
  safeLocalStorageSet(`tropa_text_channel_${state.activeServerId}`, channelId);
  renderChannels();
  closeDrawers();
  ui.emptyState.classList.add("hidden");
  ui.messages.classList.remove("hidden");
  ui.messageForm.classList.remove("hidden");
  ui.activeChannelIcon.textContent = "#";
  ui.activeChannelName.textContent = channel.name;
  ui.activeChannelTopic.textContent = channel.topic || `Canal #${channel.name}`;
  ui.messageInput.placeholder = `Conversar em #${channel.name}`;
  ui.messageInput.disabled = !hasPermission("SEND_MESSAGES");
  ui.sendBtn.disabled = !hasPermission("SEND_MESSAGES");
  const token = ++state.messageLoadToken;
  await cleanupChatSubscription();
  resetMessages(channel);
  await loadMessages(channel.id, token);
  if (token !== state.messageLoadToken || channel.id !== state.activeTextChannelId) return;
  subscribeMessages(channel.id, token);
}

function resetMessages(channel) {
  state.renderedMessages.clear();
  ui.messages.replaceChildren();
  const welcome = makeEl("div", "channel-welcome");
  welcome.append(makeEl("div", "welcome-symbol", "#"), makeEl("h2", "", `Bem-vindo a #${channel.name}`), makeEl("p", "", channel.topic || `Este é o começo do canal #${channel.name}.`));
  ui.messages.appendChild(welcome);
}

function profileForMessage(userId) {
  return state.profiles.get(userId) || { display_name: "Usuário", username: "usuario", avatar_url: null };
}

function renderMessage(message) {
  const key = String(message.id);
  if (state.renderedMessages.has(key)) return;
  state.renderedMessages.add(key);
  const profile = profileForMessage(message.user_id);
  const article = makeEl("article", "message");
  article.dataset.messageId = key;
  const avatar = makeEl("span", "avatar avatar-md"); setAvatar(avatar, profile, "avatar-md");
  const content = makeEl("div", "message-content");
  const head = makeEl("div", "message-head");
  const author = makeEl("strong", "message-author", profile.display_name || profile.username);
  const role = topRoleForUser(message.user_id); if (role && !role.is_default) author.style.color = role.color;
  const time = makeEl("time", "message-time", new Date(message.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }));
  head.append(author, time);
  const body = makeEl("div", "message-body", message.content || "");
  content.append(head, body);
  article.append(avatar, content);
  if (message.user_id === state.user.id || hasPermission("MANAGE_MESSAGES")) {
    const actions = makeEl("div", "message-actions");
    const del = makeEl("button", "message-action danger", "🗑"); del.type = "button"; del.title = "Excluir mensagem";
    del.addEventListener("click", () => deleteMessage(message.id)); actions.appendChild(del); article.appendChild(actions);
  }
  ui.messages.appendChild(article);
}

async function loadMessages(channelId, token) {
  const { data, error } = await state.supabase.from("channel_messages").select("id,channel_id,user_id,content,reply_to,created_at,edited_at").eq("channel_id", channelId).order("created_at", { ascending: false }).limit(100);
  if (error) { console.error(error); toast("Não consegui carregar as mensagens."); return; }
  if (token !== state.messageLoadToken || channelId !== state.activeTextChannelId) return;
  [...(data || [])].reverse().forEach(renderMessage);
  ui.messages.scrollTop = ui.messages.scrollHeight;
}

function subscribeMessages(channelId, token) {
  const rt = state.supabase.channel(`messages:${channelId}:${uuidish()}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "channel_messages", filter: `channel_id=eq.${channelId}` }, ({ new: row }) => {
      if (token !== state.messageLoadToken || channelId !== state.activeTextChannelId) return;
      renderMessage(row); ui.messages.scrollTop = ui.messages.scrollHeight;
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "channel_messages" }, ({ old }) => {
      if (old?.channel_id && old.channel_id !== channelId) return;
      document.querySelector(`[data-message-id="${old.id}"]`)?.remove(); state.renderedMessages.delete(String(old.id));
    });
  rt.subscribe(); state.chatChannel = rt;
}

ui.messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.sendingMessage || !state.activeTextChannelId) return;
  const content = ui.messageInput.value.trim(); if (!content) return;
  if (content.length > 2000) return toast("Mensagem grande demais.");
  state.sendingMessage = true; ui.sendBtn.disabled = true;
  try {
    const { error } = await state.supabase.from("channel_messages").insert({ channel_id: state.activeTextChannelId, user_id: state.user.id, content });
    if (error) throw error;
    ui.messageInput.value = "";
  } catch (error) { console.error(error); toast("Não foi possível enviar a mensagem."); }
  finally { state.sendingMessage = false; ui.sendBtn.disabled = !hasPermission("SEND_MESSAGES"); ui.messageInput.focus(); }
});

async function deleteMessage(id) {
  if (!confirm("Excluir esta mensagem?")) return;
  const { error } = await state.supabase.from("channel_messages").delete().eq("id", id);
  if (error) toast("Não foi possível excluir a mensagem.");
  else document.querySelector(`[data-message-id="${id}"]`)?.remove();
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
    const { data, error } = await state.supabase.from("servers").insert({ owner_id: state.user.id, name }).select().single();
    if (error) throw error;
    closeDialog(ui.serverDialog);
    await sleep(250);
    await loadServers(data.id);
    toast(`Servidor “${name}” criado.`);
  } catch (error) { console.error(error); toast(`Não foi possível criar o servidor: ${error.message || "erro"}`, 6000); }
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
$$('.settings-tab[data-settings-tab]').forEach((btn) => btn.addEventListener("click", () => switchSettingsTab(btn.dataset.settingsTab)));
function switchSettingsTab(name) {
  $$('.settings-tab[data-settings-tab]').forEach((btn) => btn.classList.toggle("active", btn.dataset.settingsTab === name));
  ui.settingsOverviewPane.classList.toggle("hidden", name !== "overview");
  ui.settingsRolesPane.classList.toggle("hidden", name !== "roles");
  ui.settingsMembersPane.classList.toggle("hidden", name !== "members");
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
    }
    row.append(main, roleBox); ui.settingsMembersList.appendChild(row);
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
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
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
    card.append(video, makeEl("span", "media-label"), makeEl("span", "media-connection", "conectando"));
    card.addEventListener("click", () => video.play().catch(() => {})); ui.mediaGrid.appendChild(card);
  }
  const p = peerPresence(peerId); const name = p?.display_name || p?.username || state.peerNames.get(peerId) || "Usuário"; card.dataset.initials = initials(name);
  const video = card.querySelector("video"); if (video.srcObject !== peer.remoteStream) video.srcObject = peer.remoteStream; video.muted = state.deafen;
  const liveVideo = peer.remoteStream.getVideoTracks().some((t) => t.readyState === "live" && !t.muted);
  card.classList.toggle("audio-only", !liveVideo); card.classList.toggle("screen", Boolean(peer.remoteMedia?.screen));
  card.querySelector(".media-label").textContent = `${name}${peer.remoteMedia?.screen ? " • tela" : ""}${peer.remoteMedia?.muted ? " • mudo" : ""}`;
  video.play().catch(() => {}); updatePeerCardStatus(peerId); ui.mediaStage.classList.remove("hidden");
}
function removeRemoteCard(peerId) { document.getElementById(`media-${peerId}`)?.remove(); updateCallStatus(); }
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
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 }, facingMode: "user" }, audio: false });
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
  state.servers = []; state.activeServerId = null; state.activeServer = null; state.channels = []; state.serverMembers = []; state.roles = []; state.memberRoles = []; state.profiles.clear(); state.user = null; state.profile = null;
  clearActiveServer(); renderServerRail();
}

async function onSignedIn(user) {
  state.user = user; showApp(); connectionStatus("Carregando…");
  try {
    await loadCurrentProfile(); await loadServers(); connectionStatus("Online", "online"); await handlePendingInviteAfterAuth();
  } catch (error) {
    console.error(error); connectionStatus("Erro", "error");
    toast("A estrutura V4 do banco ainda não está pronta. Execute supabase_v4.sql no Supabase e recarregue a página.", 9000);
  }
}

async function boot() {
  state.pendingInviteToken = inviteTokenFrom(new URL(location.href).searchParams.get("invite") || "");
  if (!isConfigured) {
    ui.setupBanner.classList.remove("hidden"); ui.authScreen.classList.remove("hidden");
    return;
  }
  state.supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  if (state.pendingInviteToken) previewInvite(state.pendingInviteToken).catch(() => {});

  const { data: { session } } = await state.supabase.auth.getSession();
  if (session?.user) await onSignedIn(session.user); else showAuth();

  state.supabase.auth.onAuthStateChange((event, sessionNow) => {
    setTimeout(async () => {
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
