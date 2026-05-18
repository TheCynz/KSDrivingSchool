"use strict";
(function () {
    const shared = window.KS_SHARED;
    const profile = document.querySelector("#instructor-profile");
    const heading = document.querySelector("#profile-heading");
    const intro = document.querySelector("#profile-intro");
    const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
    const primaryNav = document.querySelector("#primary-nav");
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("instructor");
    const safeUrlPattern = /^(https?:)?\/\//i;
    function publicPhone() {
        return window.KS_SITE?.phoneDisplay || "0333 7720143";
    }
    function publicPhoneHref() {
        return shared.safePhoneHref(window.KS_SITE?.phoneHref, "+443337720143");
    }
    function publicEmail() {
        return shared.safeEmail(window.KS_SITE?.email, "ksdrivingschool66@gmail.com");
    }
    shared.bindMobileNav(mobileNavToggle, primaryNav);
    function instructorAreas(instructor) {
        return Array.isArray(instructor.instructor_areas)
            ? instructor.instructor_areas
                .map((row) => row.area)
                .filter((area) => area && area.name && area.is_visible !== false)
                .sort((areaA, areaB) => {
                const order = (Number(areaA.sort_order) || 100) - (Number(areaB.sort_order) || 100);
                return order !== 0 ? order : String(areaA.name).localeCompare(String(areaB.name), "en-GB");
            })
            : [];
    }
    function instructorAreaLabel(instructor) {
        const labels = instructorAreas(instructor).map((area) => area.name);
        return labels.length > 0 ? labels.join(", ") : "Shropshire";
    }
    function renderMissing() {
        if (heading)
            heading.textContent = "Choose a KS Driving School instructor.";
        if (intro)
            intro.textContent = "Go back to the areas map and select an instructor covering your postcode.";
        profile.innerHTML = `
      <div class="rounded-md bg-white p-6 shadow-xl shadow-ink/8">
        <p class="text-xl font-black text-ink">Instructor profile not found.</p>
        <p class="mt-3 leading-7 text-ink/70">Use the coverage map to choose an instructor, or contact the office with your postcode and availability.</p>
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <a class="rounded-md bg-road px-5 py-3 text-center font-black text-white transition hover:bg-leaf" href="../home/#areas">View lesson areas</a>
          <a class="rounded-md border border-ink/15 px-5 py-3 text-center font-black text-ink transition hover:border-leaf hover:text-leaf" href="../contact/">Book lessons</a>
        </div>
      </div>
    `;
    }
    function renderProfile(instructor) {
        const imageUrl = instructor.photo_url && safeUrlPattern.test(instructor.photo_url) ? shared.escapeHtml(instructor.photo_url) : "";
        const photo = imageUrl
            ? `<img class="aspect-[4/5] w-full rounded-md object-cover shadow-xl shadow-ink/10" src="${imageUrl}" alt="${shared.escapeHtml(instructor.name)}" loading="eager" decoding="async">`
            : `<div class="flex aspect-[4/5] w-full items-center justify-center rounded-md bg-white text-6xl font-black text-road shadow-xl shadow-ink/10">${shared.escapeHtml(shared.initials(instructor.name))}</div>`;
        const description = instructor.profile_bio || instructor.bio || "Contact KS Driving School to check this instructor's current lesson availability.";
        const directPhone = instructor.phone || publicPhone();
        const directPhoneHref = shared.safePhoneHref(directPhone, publicPhoneHref());
        const subject = encodeURIComponent(`Driving lessons with ${instructor.name}`);
        const areaLabel = instructorAreaLabel(instructor);
        document.title = `${instructor.name} | KS Driving School Instructor`;
        if (heading)
            heading.textContent = instructor.name;
        if (intro)
            intro.textContent = `${instructor.transmission || "Driving"} lessons covering ${areaLabel}.`;
        profile.innerHTML = `
      <div class="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
        <div>
          ${photo}
        </div>
        <article class="rounded-md bg-white p-6 shadow-xl shadow-ink/8 sm:p-8">
          <div class="flex flex-wrap gap-2">
            <span class="rounded bg-kerb px-3 py-2 text-sm font-black text-road">${shared.escapeHtml(instructor.transmission || "Lessons")}</span>
            <span class="rounded bg-kerb px-3 py-2 text-sm font-black text-road">${shared.escapeHtml(areaLabel)}</span>
          </div>
          <h2 class="mt-6 text-3xl font-black sm:text-4xl">Learn with ${shared.escapeHtml(instructor.name)}.</h2>
          <p class="mt-5 text-lg leading-8 text-ink/74">${shared.escapeHtml(description)}</p>
          <div class="mt-8 rounded-md bg-kerb p-5">
            <p class="text-sm font-black uppercase text-leaf">Book lessons</p>
            <p class="mt-3 leading-7 text-ink/72">Call or email with your postcode, availability, and whether you want manual or automatic lessons.</p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <a class="rounded-md bg-signal px-5 py-4 text-center font-black text-ink transition hover:bg-road hover:text-white" href="tel:${shared.escapeHtml(directPhoneHref)}">Call ${shared.escapeHtml(directPhone)}</a>
              <a class="rounded-md border border-ink/15 bg-white px-5 py-4 text-center font-black text-ink transition hover:border-leaf hover:text-leaf" href="mailto:${shared.escapeHtml(publicEmail())}?subject=${subject}">Email to book</a>
            </div>
          </div>
          <a class="mt-6 inline-flex font-black text-leaf transition hover:text-road" href="../home/#areas">Back to lesson areas</a>
        </article>
      </div>
    `;
    }
    async function loadProfile() {
        if (!profile)
            return;
        if (!slug || !shared.hasSupabaseConfig()) {
            renderMissing();
            return;
        }
        const supabase = await window.KS_LOAD_SUPABASE?.();
        if (!supabase) {
            renderMissing();
            return;
        }
        const client = supabase.createClient(window.KS_SUPABASE.url, window.KS_SUPABASE.publishableKey);
        const { data, error } = await client
            .from("instructors")
            .select("name, transmission, phone, bio, profile_bio, photo_url, slug, instructor_areas(area:areas(name, is_visible, sort_order))")
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
