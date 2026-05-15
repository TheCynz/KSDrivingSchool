(function () {
  const profile = document.querySelector("#instructor-profile");
  const heading = document.querySelector("#profile-heading");
  const intro = document.querySelector("#profile-intro");
  const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
  const primaryNav = document.querySelector("#primary-nav");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("instructor");
  const safeUrlPattern = /^(https?:)?\/\//i;

  function hasSupabaseConfig() {
    return window.KS_SUPABASE &&
      !window.KS_SUPABASE.url.includes("YOUR_PROJECT_REF") &&
      !window.KS_SUPABASE.publishableKey.includes("YOUR_SUPABASE");
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

  function publicPhone() {
    return window.KS_SITE?.phoneDisplay || "0333 7720143";
  }

  function publicPhoneHref() {
    return safePhoneHref(window.KS_SITE?.phoneHref, "+443337720143");
  }

  function publicEmail() {
    return safeEmail(window.KS_SITE?.email, "ksdrivingschool66@gmail.com");
  }

  function safeEmail(value, fallback) {
    const email = String(value || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : fallback;
  }

  function safePhoneHref(value, fallback) {
    const phone = String(value || "").trim();
    return /^\+?[0-9\s().-]{7,24}$/.test(phone) ? phone.replace(/[^\d+]/g, "") : fallback;
  }

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

  const areaLabels = {
    shrewsbury: "Shrewsbury",
    telford: "Telford",
    shawbury: "Shawbury",
    boomerheath: "Boomerheath"
  };

  function instructorMapKeys(instructor) {
    return Array.isArray(instructor.map_keys)
      ? instructor.map_keys.filter((key) => areaLabels[key])
      : [];
  }

  function instructorAreaLabel(instructor) {
    const labels = instructorMapKeys(instructor).map((key) => areaLabels[key]);
    return labels.length > 0 ? labels.join(", ") : "Shropshire";
  }

  function renderMissing() {
    if (heading) heading.textContent = "Choose a KS Driving School instructor.";
    if (intro) intro.textContent = "Go back to the areas map and select an instructor covering your postcode.";
    profile.innerHTML = `
      <div class="rounded-md bg-white p-6 shadow-xl shadow-ink/8">
        <p class="text-xl font-black text-ink">Instructor profile not found.</p>
        <p class="mt-3 leading-7 text-ink/70">Use the coverage map to choose an instructor, or contact the office with your postcode and availability.</p>
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <a class="rounded-md bg-road px-5 py-3 text-center font-black text-white transition hover:bg-leaf" href="../home/#areas">View lesson areas</a>
          <a class="rounded-md border border-ink/15 px-5 py-3 text-center font-black text-ink transition hover:border-leaf hover:text-leaf" href="../contact/">Contact us</a>
        </div>
      </div>
    `;
  }

  function renderProfile(instructor) {
    const imageUrl = instructor.photo_url && safeUrlPattern.test(instructor.photo_url) ? escapeHtml(instructor.photo_url) : "";
    const photo = imageUrl
      ? `<img class="aspect-[4/5] w-full rounded-md object-cover shadow-xl shadow-ink/10" src="${imageUrl}" alt="${escapeHtml(instructor.name)}" loading="eager" decoding="async">`
      : `<div class="flex aspect-[4/5] w-full items-center justify-center rounded-md bg-white text-6xl font-black text-road shadow-xl shadow-ink/10">${escapeHtml(initials(instructor.name))}</div>`;
    const description = instructor.profile_bio || instructor.bio || "Contact KS Driving School to check this instructor's current lesson availability.";
    const directPhone = instructor.phone || publicPhone();
    const directPhoneHref = safePhoneHref(directPhone, publicPhoneHref());
    const subject = encodeURIComponent(`Driving lessons with ${instructor.name}`);
    const areaLabel = instructorAreaLabel(instructor);

    document.title = `${instructor.name} | KS Driving School Instructor`;
    if (heading) heading.textContent = instructor.name;
    if (intro) intro.textContent = `${instructor.transmission || "Driving"} lessons covering ${areaLabel}.`;

    profile.innerHTML = `
      <div class="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
        <div>
          ${photo}
        </div>
        <article class="rounded-md bg-white p-6 shadow-xl shadow-ink/8 sm:p-8">
          <div class="flex flex-wrap gap-2">
            <span class="rounded bg-kerb px-3 py-2 text-sm font-black text-road">${escapeHtml(instructor.transmission || "Lessons")}</span>
            <span class="rounded bg-kerb px-3 py-2 text-sm font-black text-road">${escapeHtml(areaLabel)}</span>
          </div>
          <h2 class="mt-6 text-3xl font-black tracking-normal sm:text-4xl">Learn with ${escapeHtml(instructor.name)}.</h2>
          <p class="mt-5 text-lg leading-8 text-ink/74">${escapeHtml(description)}</p>
          <div class="mt-8 rounded-md bg-kerb p-5">
            <p class="text-sm font-black uppercase tracking-[.18em] text-leaf">Book lessons</p>
            <p class="mt-3 leading-7 text-ink/72">Call or email with your postcode, availability, and whether you want manual or automatic lessons.</p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <a class="rounded-md bg-signal px-5 py-4 text-center font-black text-ink transition hover:bg-road hover:text-white" href="tel:${escapeHtml(directPhoneHref)}">Call ${escapeHtml(directPhone)}</a>
              <a class="rounded-md border border-ink/15 bg-white px-5 py-4 text-center font-black text-ink transition hover:border-leaf hover:text-leaf" href="mailto:${escapeHtml(publicEmail())}?subject=${subject}">Email to book</a>
            </div>
          </div>
          <a class="mt-6 inline-flex font-black text-leaf transition hover:text-road" href="../home/#areas">Back to lesson areas</a>
        </article>
      </div>
    `;
  }

  async function loadProfile() {
    if (!profile) return;
    if (!slug || !hasSupabaseConfig() || !window.supabase) {
      renderMissing();
      return;
    }

    const client = window.supabase.createClient(window.KS_SUPABASE.url, window.KS_SUPABASE.publishableKey);
    const { data, error } = await client
      .from("instructors")
      .select("name, map_keys, transmission, phone, bio, profile_bio, photo_url, slug")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error || !data) {
      renderMissing();
      return;
    }

    renderProfile(data);
  }

  loadProfile();
})();
