// modals.js: Log in / Sign up / Book a demo for every page

// Optional: paste a form endpoint here (e.g. a Formspree URL) so demo requests
// are sent to your email. Leave it empty to only save requests in this browser.
const DEMO_ENDPOINT = "";

const LOGIN_LABELS = ["log in", "sign in"];
const DEMO_LABELS = ["book a demo", "book a conversation", "see a live demo", "talk to sales"];

const USERS_KEY = "twine_users";
const SESSION_KEY = "twine_session";
const DEMOS_KEY = "twine_demo_requests";

const SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
const TEAM_SIZES = ["1–10", "11–50", "51–200", "201–1000", "1000+"];

/* ---------- helpers ---------- */
const read = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
};
const write = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { }
};
const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const getSession = () => read(SESSION_KEY, null);

async function hash(text) {
    if (window.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    return btoa(unescape(encodeURIComponent(text)));
}

function tomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toast(msg) {
    const t = document.createElement("div");
    t.className = "twm-toast";
    t.setAttribute("role", "status");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}

/* ---------- styles ---------- */
const style = document.createElement("style");
style.textContent = `
.twm-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,20,20,.55);font-family:'Instrument Sans',system-ui,sans-serif}
.twm-overlay[hidden]{display:none}
.twm-dialog{position:relative;width:100%;max-width:440px;max-height:calc(100vh - 32px);overflow-y:auto;background:#fff;color:#141414;border-radius:16px;padding:32px 28px;box-shadow:0 20px 60px rgba(0,0,0,.25);box-sizing:border-box}
.twm-dialog.twm-wide{max-width:580px}
.twm-close{position:absolute;top:10px;right:14px;border:0;background:none;font-size:30px;line-height:1;cursor:pointer;color:#555}
.twm-title{font-family:'Times New Roman',serif;font-size:30px;font-weight:400;margin:0 0 6px}
.twm-sub{color:#717171;font-size:14px;margin:0 0 20px}
.twm-row{display:flex;gap:12px;flex-wrap:wrap}
.twm-field{margin-bottom:14px;display:flex;flex-direction:column;gap:6px;flex:1;min-width:180px}
.twm-field label{font-size:13px;font-weight:500}
.twm-field input,.twm-field select,.twm-field textarea{width:100%;box-sizing:border-box;border:1px solid #cfcac5;border-radius:8px;padding:10px 12px;font:inherit;font-size:14px;background:#fff;color:#141414}
.twm-field input:focus,.twm-field select:focus,.twm-field textarea:focus{outline:2px solid #141414;outline-offset:1px}
.twm-invalid input,.twm-invalid select,.twm-invalid textarea{border-color:#d33}
.twm-err{color:#d33;font-size:12px}
.twm-pw{position:relative}
.twm-pw input{padding-right:60px}
.twm-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:none;font:inherit;font-size:12px;color:#555;cursor:pointer}
.twm-btn{width:100%;border:0;border-radius:8px;padding:12px;background:#141414;color:#fff;font:inherit;font-weight:500;cursor:pointer}
.twm-btn:hover{opacity:.9}
.twm-btn:disabled{opacity:.6;cursor:wait}
.twm-form-error{color:#d33;font-size:13px;margin:0 0 12px}
.twm-form-error:empty{display:none}
.twm-switch{text-align:center;font-size:14px;color:#717171;margin:16px 0 0}
.twm-link{border:0;background:none;padding:0;font:inherit;color:#141414;font-weight:600;text-decoration:underline;cursor:pointer}
.twm-summary{background:#f6f6f6;border-radius:10px;padding:14px 16px;font-size:14px;line-height:1.7;margin:16px 0 20px}
.twm-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:10000;background:#141414;color:#fff;padding:12px 18px;border-radius:10px;font:500 14px 'Instrument Sans',system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.twm-nav-actions{display:flex;align-items:center;white-space:nowrap}
@media (max-width:767px){
.twm-nav-actions{margin-left:auto;margin-right:4px;gap:10px}
.twm-nav-actions a{font-size:13px}
.twm-nav-actions a:first-child{margin-right:0}
.twm-nav-actions a:last-child{padding:8px 12px}
}
@media (max-width:380px){
.twm-nav-actions{gap:6px}
.twm-nav-actions a{font-size:12px}
.twm-nav-actions a:last-child{padding:6px 10px}
}
`;
document.head.appendChild(style);

/* ---------- modal shell ---------- */
const overlay = document.createElement("div");
overlay.className = "twm-overlay";
overlay.hidden = true;
overlay.innerHTML = `<div class="twm-dialog" role="dialog" aria-modal="true" aria-labelledby="twm-title"></div>`;
document.body.appendChild(overlay);
const dialog = overlay.firstElementChild;
let lastFocus = null;

function openModal(view) {
    const nav = document.getElementById("navigator");
    if (nav) nav.classList.add("hidden"); // close the mobile menu if it's open
    lastFocus = document.activeElement;
    render(view);
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
}

function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/* ---------- form pieces ---------- */
function field({ name, label, type = "text", autocomplete = "", extra = "" }) {
    const input =
        type === "password"
            ? `<div class="twm-pw"><input id="twm-${name}" name="${name}" type="password" autocomplete="${autocomplete}" ${extra}><button type="button" class="twm-toggle" aria-label="Show password">Show</button></div>`
            : `<input id="twm-${name}" name="${name}" type="${type}" autocomplete="${autocomplete}" ${extra}>`;
    return `<div class="twm-field" data-field="${name}"><label for="twm-${name}">${label}</label>${input}<span class="twm-err"></span></div>`;
}

function setError(form, name, msg) {
    const wrap = form.querySelector(`[data-field="${name}"]`);
    if (!wrap) return;
    wrap.classList.toggle("twm-invalid", Boolean(msg));
    wrap.querySelector(".twm-err").textContent = msg || "";
}

function clearErrors(form) {
    form.querySelectorAll("[data-field]").forEach((w) => {
        w.classList.remove("twm-invalid");
        w.querySelector(".twm-err").textContent = "";
    });
    form.querySelector(".twm-form-error").textContent = "";
}

/* ---------- views ---------- */
const loginHTML = () => `
  <h2 class="twm-title" id="twm-title">Log in</h2>
  <p class="twm-sub">Welcome back to Twine.</p>
  <form novalidate>
    ${field({ name: "email", label: "Work email", type: "email", autocomplete: "email" })}
    ${field({ name: "password", label: "Password", type: "password", autocomplete: "current-password" })}
    <p class="twm-form-error" role="alert"></p>
    <button class="twm-btn" type="submit">Log in</button>
  </form>
  <p class="twm-switch">New to Twine? <button type="button" class="twm-link" data-switch="signup">Create an account</button></p>`;

const signupHTML = () => `
  <h2 class="twm-title" id="twm-title">Create your account</h2>
  <p class="twm-sub">It only takes a minute.</p>
  <form novalidate>
    ${field({ name: "name", label: "Full name", autocomplete: "name" })}
    ${field({ name: "email", label: "Work email", type: "email", autocomplete: "email" })}
    ${field({ name: "password", label: "Password (min. 8 characters)", type: "password", autocomplete: "new-password" })}
    <p class="twm-form-error" role="alert"></p>
    <button class="twm-btn" type="submit">Create account</button>
  </form>
  <p class="twm-switch">Already have an account? <button type="button" class="twm-link" data-switch="login">Log in</button></p>`;

function demoHTML() {
    const user = getSession();
    return `
  <h2 class="twm-title" id="twm-title">Book a demo</h2>
  <p class="twm-sub">See what Twine would surface from your customer conversations.</p>
  <form novalidate>
    <div class="twm-row">
      ${field({ name: "name", label: "Full name", autocomplete: "name", extra: `value="${esc(user ? user.name : "")}"` })}
      ${field({ name: "email", label: "Work email", type: "email", autocomplete: "email", extra: `value="${esc(user ? user.email : "")}"` })}
    </div>
    <div class="twm-row">
      ${field({ name: "company", label: "Company", autocomplete: "organization" })}
      <div class="twm-field" data-field="teamSize">
        <label for="twm-teamSize">Team size</label>
        <select id="twm-teamSize" name="teamSize"><option value="">Select…</option>${TEAM_SIZES.map((s) => `<option>${s}</option>`).join("")}</select>
        <span class="twm-err"></span>
      </div>
    </div>
    <div class="twm-row">
      ${field({ name: "date", label: "Preferred date", type: "date", extra: `min="${tomorrow()}"` })}
      <div class="twm-field" data-field="time">
        <label for="twm-time">Preferred time</label>
        <select id="twm-time" name="time"><option value="">Select…</option>${SLOTS.map((s) => `<option>${s}</option>`).join("")}</select>
        <span class="twm-err"></span>
      </div>
    </div>
    <div class="twm-field" data-field="notes">
      <label for="twm-notes">Anything we should know? (optional)</label>
      <textarea id="twm-notes" name="notes" rows="3"></textarea>
      <span class="twm-err"></span>
    </div>
    <p class="twm-form-error" role="alert"></p>
    <button class="twm-btn" type="submit">Request demo</button>
  </form>`;
}

function doneHTML(r) {
    const when = new Date(`${r.date}T00:00`).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    return `
  <h2 class="twm-title" id="twm-title">Request received</h2>
  <p class="twm-sub">Thanks, ${esc(r.name.split(" ")[0])}. Your demo request is in.</p>
  <div class="twm-summary">
    <div><strong>When:</strong> ${esc(when)}, ${esc(r.time)}</div>
    <div><strong>Company:</strong> ${esc(r.company)}</div>
    <div><strong>Contact:</strong> ${esc(r.email)}</div>
  </div>
  <button class="twm-btn" type="button" data-close>Done</button>`;
}

function render(view, data) {
    dialog.classList.toggle("twm-wide", view === "demo");
    const views = { login: loginHTML, signup: signupHTML, demo: demoHTML, "demo-done": () => doneHTML(data) };
    dialog.innerHTML = `<button type="button" class="twm-close" aria-label="Close">&times;</button>` + views[view]();

    dialog.querySelector(".twm-close").addEventListener("click", closeModal);
    dialog.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeModal));
    dialog.querySelectorAll("[data-switch]").forEach((b) => b.addEventListener("click", () => render(b.dataset.switch)));
    dialog.querySelectorAll(".twm-toggle").forEach((btn) =>
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            btn.textContent = show ? "Hide" : "Show";
        }),
    );

    const form = dialog.querySelector("form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            handlers[view](form);
        });
    }
    const first = dialog.querySelector("input, select, .twm-btn");
    if (first) first.focus();
}

/* ---------- handlers ---------- */
async function handleLogin(form) {
    clearErrors(form);
    const email = form.elements["email"].value.trim().toLowerCase();
    const password = form.elements["password"].value;
    let ok = true;
    if (!isEmail(email)) {
        setError(form, "email", "Enter a valid email address.");
        ok = false;
    }
    if (!password) {
        setError(form, "password", "Enter your password.");
        ok = false;
    }
    if (!ok) return;

    const user = read(USERS_KEY, []).find((u) => u.email === email);
    if (!user || user.hash !== (await hash(password))) {
        form.querySelector(".twm-form-error").textContent =
            "Incorrect email or password. New here? Create an account below.";
        return;
    }
    write(SESSION_KEY, { name: user.name, email: user.email });
    closeModal();
    refreshAuthUI();
    toast(`Welcome back, ${user.name.split(" ")[0]}!`);
}

async function handleSignup(form) {
    clearErrors(form);
    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim().toLowerCase();
    const password = form.elements["password"].value;
    let ok = true;
    if (name.length < 2) {
        setError(form, "name", "Enter your full name.");
        ok = false;
    }
    if (!isEmail(email)) {
        setError(form, "email", "Enter a valid email address.");
        ok = false;
    }
    if (password.length < 8) {
        setError(form, "password", "Use at least 8 characters.");
        ok = false;
    }
    if (!ok) return;

    const users = read(USERS_KEY, []);
    if (users.some((u) => u.email === email)) {
        setError(form, "email", "An account with this email already exists. Log in instead.");
        return;
    }
    users.push({ name, email, hash: await hash(password) });
    write(USERS_KEY, users);
    write(SESSION_KEY, { name, email });
    closeModal();
    refreshAuthUI();
    toast("Account created. You're logged in.");
}

async function handleDemo(form) {
    clearErrors(form);
    const data = Object.fromEntries(new FormData(form));
    Object.keys(data).forEach((k) => (data[k] = String(data[k]).trim()));
    data.email = data.email.toLowerCase();

    let ok = true;
    if (data.name.length < 2) {
        setError(form, "name", "Enter your full name.");
        ok = false;
    }
    if (!isEmail(data.email)) {
        setError(form, "email", "Enter a valid email address.");
        ok = false;
    }
    if (!data.company) {
        setError(form, "company", "Enter your company name.");
        ok = false;
    }
    if (!data.teamSize) {
        setError(form, "teamSize", "Select your team size.");
        ok = false;
    }
    if (!data.date) {
        setError(form, "date", "Pick a date.");
        ok = false;
    } else {
        const day = new Date(`${data.date}T00:00`).getDay();
        if (data.date < tomorrow()) {
            setError(form, "date", "Pick a future date.");
            ok = false;
        } else if (day === 0 || day === 6) {
            setError(form, "date", "Demos run Monday to Friday.");
            ok = false;
        }
    }
    if (!data.time) {
        setError(form, "time", "Pick a time.");
        ok = false;
    }
    if (!ok) return;

    const btn = form.querySelector(".twm-btn");
    btn.disabled = true;
    btn.textContent = "Sending…";

    const request = { id: Date.now(), ...data, createdAt: new Date().toISOString() };

    if (DEMO_ENDPOINT) {
        try {
            const res = await fetch(DEMO_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(request),
            });
            if (!res.ok) throw new Error("Request failed");
        } catch {
            btn.disabled = false;
            btn.textContent = "Request demo";
            form.querySelector(".twm-form-error").textContent = "Couldn't send your request. Please try again.";
            return;
        }
    }

    write(DEMOS_KEY, [...read(DEMOS_KEY, []), request]);
    render("demo-done", request);
}

const handlers = { login: handleLogin, signup: handleSignup, demo: handleDemo };

/* ---------- auth state in the page ---------- */
function logout() {
    localStorage.removeItem(SESSION_KEY);
    refreshAuthUI();
    toast("You've been logged out.");
}

function refreshAuthUI() {
    const user = getSession();
    document.querySelectorAll('[data-twine="login"]').forEach((el) => {
        if (!el.dataset.original) el.dataset.original = el.textContent.trim();
        const original = el.dataset.original;
        el.textContent = user ? (original.toLowerCase().startsWith("sign") ? "Sign out" : "Log out") : original;
        el.title = user ? `Signed in as ${user.email}` : "";
    });
}

/* ---------- wire up the existing buttons ---------- */
function markTriggers() {
    document.querySelectorAll("a, button").forEach((el) => {
        if (el.dataset.twine) return;
        const label = el.textContent.replace(/\s+/g, " ").trim().toLowerCase();
        if (LOGIN_LABELS.includes(label)) el.dataset.twine = "login";
        else if (DEMO_LABELS.includes(label)) el.dataset.twine = "demo";
    });
}

markTriggers();

// Keep Log in / Book a demo in the top bar on every screen size (not inside the hamburger)
const navLogin = document.querySelector('nav [data-twine="login"]');
const navActions = navLogin && navLogin.parentElement;
if (navActions) {
    navActions.classList.remove("hidden", "md:block");
    navActions.classList.add("twm-nav-actions");
}

refreshAuthUI();

document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-twine]");
    if (!el) return;
    e.preventDefault();
    if (el.dataset.twine === "login") {
        if (getSession()) logout();
        else openModal("login");
    } else {
        openModal("demo");
    }
});

overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) closeModal();
});

document.addEventListener("keydown", (e) => {
    if (overlay.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
        const items = [...dialog.querySelectorAll("button, input, select, textarea, a[href]")].filter((x) => !x.disabled);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});