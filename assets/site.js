"use strict";
(function () {
    const shared = window.KS_SHARED;
    const site = { ...(window.KS_SITE || {}) };
    const cookieKey = "ks_cookie_consent";
    const supabaseClientUrl = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.4";
    const googleTagBaseUrl = "https://www.googletagmanager.com/gtag/js";
    const fallbackSite = {
        phoneDisplay: "0333 7720143",
        phoneHref: "+443337720143",
        email: "ksdrivingschool66@gmail.com",
        facebookUrl: "https://www.facebook.com/drivinglessonsshrewsbury/"
    };
    let supabaseClientPromise = null;
    let analyticsLoaded = false;
    let analyticsEventsBound = false;
    function loadSupabaseClient() {
        if (!shared.hasSupabaseConfig())
            return Promise.resolve(null);
        if (window.supabase)
            return Promise.resolve(window.supabase);
        if (supabaseClientPromise)
            return supabaseClientPromise;
        supabaseClientPromise = new Promise((resolve) => {
            const existingScript = document.querySelector(`script[src="${supabaseClientUrl}"]`);
            const script = existingScript || document.createElement("script");
            script.addEventListener("load", () => resolve(window.supabase || null), { once: true });
            script.addEventListener("error", () => resolve(null), { once: true });
            if (!existingScript) {
                script.src = supabaseClientUrl;
                script.async = true;
                document.head.appendChild(script);
            }
        });
        return supabaseClientPromise;
    }
    function runWhenIdle(callback) {
        if ("requestIdleCallback" in window) {
            window.requestIdleCallback(callback, { timeout: 1800 });
            return;
        }
        window.setTimeout(callback, 900);
    }
    function toCamelKey(key) {
        return key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
    }
    function applySiteConfig() {
        document.querySelectorAll("[data-current-year]").forEach((element) => {
            element.textContent = new Date().getFullYear();
        });
        document.querySelectorAll("[data-phone-link]").forEach((element) => {
            const phoneDisplay = site.phoneDisplay || fallbackSite.phoneDisplay;
            element.href = `tel:${shared.safePhoneHref(site.phoneHref, fallbackSite.phoneHref)}`;
            if (element.dataset.phoneLabel || element.children.length === 0) {
                element.textContent = element.dataset.phoneLabel || phoneDisplay;
            }
        });
        document.querySelectorAll("[data-email-link]").forEach((element) => {
            const subject = element.dataset.emailSubject || "Driving lesson enquiry";
            const email = shared.safeEmail(site.email, fallbackSite.email);
            element.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
            if (element.dataset.emailLabel || element.children.length === 0) {
                element.textContent = element.dataset.emailLabel || email;
            }
        });
        document.querySelectorAll("[data-facebook-link]").forEach((element) => {
            element.href = shared.safeHttpUrl(site.facebookUrl, fallbackSite.facebookUrl);
        });
    }
    function getAnalyticsMeasurementId() {
        const rawId = String(site.analyticsMeasurementId || "").trim();
        if (!rawId)
            return "";
        if (/^G-[A-Z0-9]+$/i.test(rawId)) {
            return rawId.toUpperCase();
        }
        console.warn("KS analyticsMeasurementId must be a GA4 Measurement ID that starts with G-.");
        return "";
    }
    function ensureGoogleTag() {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () {
            window.dataLayer.push(arguments);
        };
        return window.gtag;
    }
    function setGoogleAnalyticsDisabled(disabled) {
        const measurementId = getAnalyticsMeasurementId();
        if (!measurementId)
            return;
        window[`ga-disable-${measurementId}`] = disabled;
        if (window.gtag) {
            window.gtag("consent", "update", {
                analytics_storage: disabled ? "denied" : "granted"
            });
        }
    }
    function expireCookie(name) {
        const expiry = "Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax";
        document.cookie = `${name}=; ${expiry}`;
        const hostname = window.location.hostname;
        if (!hostname || !hostname.includes("."))
            return;
        const parts = hostname.split(".");
        const domains = new Set([hostname, `.${hostname}`]);
        if (parts.length > 2) {
            domains.add(`.${parts.slice(-2).join(".")}`);
        }
        domains.forEach((domain) => {
            document.cookie = `${name}=; ${expiry}; Domain=${domain}`;
        });
    }
    function clearGoogleAnalyticsCookies() {
        document.cookie
            .split(";")
            .map((cookie) => cookie.split("=")[0].trim())
            .filter((name) => name === "_ga" || name.startsWith("_ga_"))
            .forEach(expireCookie);
    }
    function loadGoogleAnalytics() {
        const measurementId = getAnalyticsMeasurementId();
        if (!measurementId)
            return;
        setGoogleAnalyticsDisabled(false);
        if (!analyticsLoaded) {
            const tagUrl = `${googleTagBaseUrl}?id=${encodeURIComponent(measurementId)}`;
            const existingScript = document.querySelector(`script[src="${tagUrl}"]`);
            if (!existingScript) {
                const script = document.createElement("script");
                script.async = true;
                script.src = tagUrl;
                document.head.appendChild(script);
            }
            const gtag = ensureGoogleTag();
            gtag("js", new Date());
            gtag("config", measurementId);
            analyticsLoaded = true;
        }
    }
    function disableGoogleAnalytics() {
        setGoogleAnalyticsDisabled(true);
        clearGoogleAnalyticsCookies();
    }
    function trackAnalyticsEvent(name, params) {
        var _a;
        if (!((_a = window.KS_COOKIE_CONSENT) === null || _a === void 0 ? void 0 : _a.analytics) || !getAnalyticsMeasurementId() || !window.gtag)
            return;
        window.gtag("event", name, params || {});
    }
    function bindAnalyticsEventTracking() {
        if (analyticsEventsBound)
            return;
        analyticsEventsBound = true;
        document.addEventListener("click", (event) => {
            const target = event.target instanceof Element ? event.target.closest("a, button") : null;
            if (!target)
                return;
            if (target.matches("[data-phone-link], a[href^='tel:']")) {
                trackAnalyticsEvent("generate_lead", { method: "phone_click" });
                return;
            }
            if (target.matches("[data-email-link], a[href^='mailto:']")) {
                trackAnalyticsEvent("generate_lead", { method: "email_click" });
                return;
            }
            if (target.matches("[data-facebook-link]")) {
                trackAnalyticsEvent("select_content", {
                    content_type: "social_link",
                    item_id: "facebook"
                });
            }
        });
        document.addEventListener("submit", (event) => {
            const form = event.target instanceof HTMLFormElement ? event.target : null;
            if (!form || !form.checkValidity())
                return;
            if (form.matches("#contact-form")) {
                trackAnalyticsEvent("generate_lead", { method: "contact_form" });
                return;
            }
            if (form.matches("#lesson-finder")) {
                trackAnalyticsEvent("generate_lead", { method: "lesson_finder" });
            }
        });
    }
    async function loadRemoteSiteSettings() {
        if (!shared.hasSupabaseConfig())
            return;
        const supabase = await loadSupabaseClient();
        if (!supabase)
            return;
        const client = shared.getSupabaseClient(supabase);
        if (!client)
            return;
        const { data, error } = await client
            .from("site_settings")
            .select("key, value")
            .eq("public", true);
        if (error || !data)
            return;
        data.forEach((setting) => {
            site[toCamelKey(setting.key)] = setting.value;
        });
        window.KS_SITE = site;
        applySiteConfig();
        if (window.KS_COOKIE_CONSENT) {
            applyCookieChoice(window.KS_COOKIE_CONSENT);
        }
    }
    function applyCookieChoice(choice) {
        window.KS_COOKIE_CONSENT = choice;
        if (choice.analytics) {
            loadGoogleAnalytics();
            return;
        }
        disableGoogleAnalytics();
    }
    function writeConsentCookie(choice) {
        const maxAge = 60 * 60 * 24 * 180;
        document.cookie = `${cookieKey}=${encodeURIComponent(JSON.stringify(choice))}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
    }
    function readConsentCookie() {
        const match = document.cookie
            .split("; ")
            .find((item) => item.startsWith(`${cookieKey}=`));
        if (!match)
            return null;
        try {
            return JSON.parse(decodeURIComponent(match.slice(cookieKey.length + 1)));
        }
        catch (_error) {
            return null;
        }
    }
    function getConsentStorage() {
        try {
            return window.localStorage || null;
        }
        catch (_error) {
            return null;
        }
    }
    function removeStoredConsent(storage) {
        try {
            storage.removeItem(cookieKey);
        }
        catch (_error) {
        }
    }
    function saveCookieChoice(choice) {
        var _a;
        const storage = getConsentStorage();
        if (storage) {
            try {
                storage.setItem(cookieKey, JSON.stringify(choice));
            }
            catch (_error) {
                removeStoredConsent(storage);
            }
        }
        writeConsentCookie(choice);
        applyCookieChoice(choice);
        (_a = document.querySelector("[data-cookie-banner]")) === null || _a === void 0 ? void 0 : _a.remove();
    }
    function readCookieChoice() {
        const storage = getConsentStorage();
        if (!storage)
            return readConsentCookie();
        try {
            const stored = storage.getItem(cookieKey);
            if (stored)
                return JSON.parse(stored);
        }
        catch (_error) {
            removeStoredConsent(storage);
        }
        return readConsentCookie();
    }
    function showCookieBanner() {
        var _a;
        (_a = document.querySelector("[data-cookie-banner]")) === null || _a === void 0 ? void 0 : _a.remove();
        const savedChoice = readCookieChoice();
        const analyticsChecked = savedChoice ? Boolean(savedChoice.analytics) : true;
        const banner = document.createElement("section");
        banner.setAttribute("data-cookie-banner", "");
        banner.className = "fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl rounded-md border border-ink/10 bg-white p-4 text-ink shadow-2xl shadow-ink/20";
        banner.innerHTML = `
      <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p class="text-base font-black">Cookies on KS Driving School</p>
          <p class="mt-1 text-sm leading-6 text-ink/70">We use essential cookies to make this site work. With your permission, we can also use analytics cookies later to understand which pages help learners book lessons.</p>
          <label class="mt-3 flex items-center gap-2 text-sm font-bold">
            <input data-cookie-analytics type="checkbox" class="h-4 w-4 rounded border-ink/20 text-leaf" ${analyticsChecked ? "checked" : ""}>
            Allow analytics cookies
          </label>
        </div>
        <div class="grid gap-2 sm:grid-cols-3 md:w-80 md:grid-cols-1">
          <button data-cookie-accept class="rounded-md bg-road px-4 py-3 text-sm font-black text-white transition hover:bg-leaf" type="button">Accept all</button>
          <button data-cookie-reject class="rounded-md border border-ink/15 px-4 py-3 text-sm font-black text-ink transition hover:border-leaf hover:text-leaf" type="button">Reject</button>
          <button data-cookie-save class="rounded-md bg-signal px-4 py-3 text-sm font-black text-ink transition hover:bg-ink hover:text-white" type="button">Save choice</button>
        </div>
      </div>
    `;
        banner.querySelector("[data-cookie-accept]").addEventListener("click", () => {
            saveCookieChoice({ essential: true, analytics: true, decidedAt: new Date().toISOString() });
        });
        banner.querySelector("[data-cookie-reject]").addEventListener("click", () => {
            saveCookieChoice({ essential: true, analytics: false, decidedAt: new Date().toISOString() });
        });
        banner.querySelector("[data-cookie-save]").addEventListener("click", () => {
            saveCookieChoice({
                essential: true,
                analytics: banner.querySelector("[data-cookie-analytics]").checked,
                decidedAt: new Date().toISOString()
            });
        });
        document.body.appendChild(banner);
    }
    document.querySelectorAll("[data-cookie-settings]").forEach((element) => {
        element.addEventListener("click", showCookieBanner);
    });
    shared.bindMobileNav(document.querySelector("#mobile-nav-toggle"), document.querySelector("#primary-nav"));
    bindAnalyticsEventTracking();
    const cookieChoice = readCookieChoice();
    if (cookieChoice) {
        applyCookieChoice(cookieChoice);
    }
    else {
        showCookieBanner();
    }
    applySiteConfig();
    window.KS_LOAD_SUPABASE = loadSupabaseClient;
    runWhenIdle(loadRemoteSiteSettings);
})();
