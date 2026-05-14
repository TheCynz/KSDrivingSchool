(function () {
  const site = window.KS_SITE || {};
  const cookieKey = "ks_cookie_consent";

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  document.querySelectorAll("[data-phone-link]").forEach((element) => {
    element.href = `tel:${site.phoneHref || "+443337720143"}`;
    element.textContent = element.dataset.phoneLabel || site.phoneDisplay || "0333 7720143";
  });

  document.querySelectorAll("[data-email-link]").forEach((element) => {
    const subject = element.dataset.emailSubject || "Driving lesson enquiry";
    const email = site.email || "ksdrivingschool66@gmail.com";
    element.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    element.textContent = element.dataset.emailLabel || email;
  });

  document.querySelectorAll("[data-facebook-link]").forEach((element) => {
    element.href = site.facebookUrl || "https://www.facebook.com/drivinglessonsshrewsbury/";
  });

  function applyCookieChoice(choice) {
    window.KS_COOKIE_CONSENT = choice;
  }

  function saveCookieChoice(choice) {
    localStorage.setItem(cookieKey, JSON.stringify(choice));
    applyCookieChoice(choice);
    document.querySelector("[data-cookie-banner]")?.remove();
  }

  function readCookieChoice() {
    try {
      const stored = localStorage.getItem(cookieKey);
      return stored ? JSON.parse(stored) : null;
    } catch (_error) {
      return null;
    }
  }

  function showCookieBanner() {
    document.querySelector("[data-cookie-banner]")?.remove();

    const banner = document.createElement("section");
    banner.setAttribute("data-cookie-banner", "");
    banner.className = "fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl rounded-md border border-ink/10 bg-white p-4 text-ink shadow-2xl shadow-ink/20";
    banner.innerHTML = `
      <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p class="text-base font-black">Cookies on KS Driving School</p>
          <p class="mt-1 text-sm leading-6 text-ink/70">We use essential cookies to make this site work. With your permission, we can also use analytics cookies later to understand which pages help learners book lessons.</p>
          <label class="mt-3 flex items-center gap-2 text-sm font-bold">
            <input data-cookie-analytics type="checkbox" class="h-4 w-4 rounded border-ink/20 text-leaf">
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

  const cookieChoice = readCookieChoice();
  if (cookieChoice) {
    applyCookieChoice(cookieChoice);
  } else {
    showCookieBanner();
  }
})();
