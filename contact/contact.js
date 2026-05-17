"use strict";
(function () {
    const shared = window.KS_SHARED;
    const form = document.querySelector("#contact-form");
    const message = document.querySelector("#contact-message");
    const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
    const primaryNav = document.querySelector("#primary-nav");
    shared.bindMobileNav(mobileNavToggle, primaryNav);
    if (!form || !message)
        return;
    function setMessage(text, isError) {
        message.textContent = text;
        message.classList.toggle("text-red-700", Boolean(isError));
    }
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const site = window.KS_SITE || {};
        const adminEmail = shared.safeEmail(site.email, "ksdrivingschool66@gmail.com");
        const formData = new FormData(form);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const postcode = String(formData.get("postcode") || "").trim();
        const messageText = String(formData.get("message") || "").trim();
        if (!name || !email || !messageText) {
            setMessage("Add your name, email, and message before sending.", true);
            return;
        }
        const subject = `Driving lesson enquiry from ${name}`;
        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone || "Not provided"}`,
            `Postcode: ${postcode || "Not provided"}`,
            "",
            messageText
        ].join("\n");
        window.location.href = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setMessage("Opening your email app with the message ready to send.", false);
    });
})();
