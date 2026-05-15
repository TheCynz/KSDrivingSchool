(function () {
  const form = document.querySelector("#contact-form");
  const message = document.querySelector("#contact-message");
  const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
  const primaryNav = document.querySelector("#primary-nav");

  if (mobileNavToggle && primaryNav) {
    mobileNavToggle.addEventListener("click", () => {
      const expanded = mobileNavToggle.getAttribute("aria-expanded") === "true";
      mobileNavToggle.setAttribute("aria-expanded", String(!expanded));
      primaryNav.classList.toggle("hidden", expanded);
      primaryNav.classList.toggle("flex", !expanded);
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNavToggle.setAttribute("aria-expanded", "false");
        primaryNav.classList.add("hidden");
        primaryNav.classList.remove("flex");
      });
    });
  }

  if (!form) return;

  function setMessage(text, isError) {
    message.textContent = text;
    message.classList.toggle("text-red-700", Boolean(isError));
  }

  function safeEmail(value, fallback) {
    const email = String(value || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : fallback;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const site = window.KS_SITE || {};
    const adminEmail = safeEmail(site.email, "ksdrivingschool66@gmail.com");
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
