"use strict";
(function () {
    function hasSupabaseConfig(config = window.KS_SUPABASE) {
        return Boolean(config) &&
            !config.url.includes("YOUR_PROJECT_REF") &&
            !config.publishableKey.includes("YOUR_SUPABASE");
    }
    function getSupabaseClient(factory = window.supabase) {
        if (!factory || !hasSupabaseConfig())
            return null;
        if (!window.KS_SUPABASE_CLIENT) {
            window.KS_SUPABASE_CLIENT = factory.createClient(window.KS_SUPABASE.url, window.KS_SUPABASE.publishableKey);
        }
        return window.KS_SUPABASE_CLIENT;
    }
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    function initials(name) {
        return String(name)
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "KS";
    }
    function safeEmail(value, fallback) {
        const email = String(value || "").trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : fallback;
    }
    function safeHttpUrl(value, fallback) {
        try {
            const url = new URL(String(value || ""), window.location.href);
            return url.protocol === "https:" || url.protocol === "http:" ? url.href : fallback;
        }
        catch (_error) {
            return fallback;
        }
    }
    function safePhoneHref(value, fallback) {
        const phone = String(value || "").trim();
        return /^\+?[0-9\s().-]{7,24}$/.test(phone) ? phone.replace(/[^\d+]/g, "") : fallback;
    }
    function bindMobileNav(toggle, nav) {
        if (!toggle || !nav)
            return;
        if (toggle.getAttribute("data-mobile-nav-bound") === "true")
            return;
        toggle.setAttribute("data-mobile-nav-bound", "true");
        toggle.addEventListener("click", () => {
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            nav.classList.toggle("hidden", expanded);
            nav.classList.toggle("flex", !expanded);
        });
        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                toggle.setAttribute("aria-expanded", "false");
                nav.classList.add("hidden");
                nav.classList.remove("flex");
            });
        });
    }
    window.KS_SHARED = {
        bindMobileNav,
        escapeHtml,
        getSupabaseClient,
        hasSupabaseConfig,
        initials,
        safeEmail,
        safeHttpUrl,
        safePhoneHref
    };
})();
