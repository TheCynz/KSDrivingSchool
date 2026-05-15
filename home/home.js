(function () {
  const gallery = document.querySelector("#pass-gallery");
  const instructorList = document.querySelector("#instructor-list");
  const selectedAreaTitle = document.querySelector("#selected-area-title");
  const areaTabs = Array.from(document.querySelectorAll(".area-tab"));
  const mapAreas = Array.from(document.querySelectorAll(".map-area"));
  const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
  const primaryNav = document.querySelector("#primary-nav");
  let selectedArea = "shrewsbury";
  let instructors = [];

  const areaLabels = {
    shrewsbury: "Shrewsbury",
    telford: "Telford",
    shawbury: "Shawbury",
    boomerheath: "Boomerheath"
  };

  const fallbackInstructors = [
    {
      name: "Karen Jones",
      map_keys: ["shrewsbury", "shawbury", "telford"],
      transmission: "Manual",
      phone: "07931 673337",
      slug: "karen-jones",
      photo_url: "",
      bio: "Grade A instructor covering Shrewsbury, Shawbury and nearby villages."
    },
    {
      name: "Adam Snaith",
      map_keys: ["telford"],
      transmission: "Manual",
      phone: "07555 618618",
      slug: "adam-snaith",
      photo_url: "",
      bio: "Telford instructor for learners preparing on local test routes."
    },
    {
      name: "Vanessa Marmont",
      map_keys: ["shrewsbury"],
      transmission: "Manual",
      phone: "0333 7720143",
      slug: "vanessa-marmont",
      photo_url: "",
      bio: "Experienced instructor covering Shrewsbury and surrounding villages."
    },
    {
      name: "Shawbury coverage",
      map_keys: ["shawbury"],
      transmission: "Manual and automatic",
      phone: "0333 7720143",
      slug: "shawbury-coverage",
      photo_url: "",
      bio: "Call the office to match with the right available instructor."
    },
    {
      name: "Boomerheath coverage",
      map_keys: ["boomerheath"],
      transmission: "Manual and automatic",
      phone: "0333 7720143",
      slug: "boomerheath-coverage",
      photo_url: "",
      bio: "Nearby Shropshire lessons arranged through the office."
    }
  ];
  const safeUrlPattern = /^(https?:)?\/\//i;

  function hasSupabaseConfig() {
    return window.KS_SUPABASE &&
      !window.KS_SUPABASE.url.includes("YOUR_PROJECT_REF") &&
      !window.KS_SUPABASE.publishableKey.includes("YOUR_SUPABASE");
  }

  function renderPassPlaceholder() {
    if (!gallery) return;
    gallery.innerHTML = `
      <div class="rounded-md bg-white p-6 text-ink/70 sm:col-span-2 lg:col-span-3">
        <p class="text-xl font-black text-ink">Recent pass photos will appear here.</p>
        <p class="mt-2 leading-7">Once an instructor uploads a student pass through the private admin area, the photo and review are served from Supabase Storage.</p>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function postCard(post) {
    const date = post.passed_at
      ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(post.passed_at))
      : "Recent pass";
    const studentName = escapeHtml(post.student_name);
    const caption = escapeHtml(post.caption || "Student passed with no faults.");
    const review = post.review ? `<blockquote class="mt-4 border-l-4 border-signal pl-4 text-sm font-bold leading-6 text-ink/80">"${escapeHtml(post.review)}"</blockquote>` : "";
    const imageUrl = safeUrlPattern.test(post.image_url) ? escapeHtml(post.image_url) : "";

    return `
      <article class="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-ink/8">
        <img class="gallery-image h-auto w-full object-cover" src="${imageUrl}" alt="${studentName} passed their driving test" loading="lazy" decoding="async">
        <div class="p-5">
          <p class="text-sm font-bold text-leaf">${date}</p>
          <h3 class="mt-2 text-xl font-black">${studentName}</h3>
          <p class="mt-3 leading-7 text-ink/72">${caption}</p>
          ${review}
        </div>
      </article>
    `;
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

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "instructor";
  }

  function instructorMapKeys(instructor) {
    if (Array.isArray(instructor.map_keys) && instructor.map_keys.length > 0) {
      return instructor.map_keys.filter((key) => areaLabels[key]);
    }
    return [];
  }

  function instructorAreaLabel(instructor) {
    const labels = instructorMapKeys(instructor).map((key) => areaLabels[key]);
    return labels.length > 0 ? labels.join(", ") : "Shropshire";
  }

  function instructorSortValue(instructor) {
    return slugify(instructor.slug || instructor.name) === "karen-jones" ? 0 : 1;
  }

  function sortPublicInstructors(instructorA, instructorB) {
    const ownerOrder = instructorSortValue(instructorA) - instructorSortValue(instructorB);
    if (ownerOrder !== 0) return ownerOrder;
    return String(instructorA.name || "").localeCompare(String(instructorB.name || ""), "en-GB");
  }

  function instructorCard(instructor) {
    const phoneHref = instructor.phone ? instructor.phone.replace(/[^\d+]/g, "") : "";
    const phone = phoneHref ? `<a class="mt-3 inline-flex rounded-md bg-kerb px-3 py-2 text-sm font-black text-road transition hover:bg-signal hover:text-ink" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(instructor.phone)}</a>` : "";
    const imageUrl = instructor.photo_url && safeUrlPattern.test(instructor.photo_url) ? escapeHtml(instructor.photo_url) : "";
    const photo = imageUrl
      ? `<img class="h-16 w-16 shrink-0 rounded-md object-cover" src="${imageUrl}" alt="${escapeHtml(instructor.name)}" loading="lazy" decoding="async">`
      : `<div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-kerb text-lg font-black text-road">${escapeHtml(initials(instructor.name))}</div>`;
    const profileHref = `../instructors/?instructor=${encodeURIComponent(instructor.slug || slugify(instructor.name))}`;

    return `
      <article class="rounded-md border border-ink/10 p-4 transition hover:border-leaf hover:shadow-md">
        <a class="block" href="${profileHref}" aria-label="View ${escapeHtml(instructor.name)} profile">
          <div class="flex gap-4">
            ${photo}
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="text-lg font-black">${escapeHtml(instructor.name)}</h4>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold text-road">${escapeHtml(instructor.transmission || "Lessons")}</span>
              </div>
              <p class="mt-2 text-sm font-bold text-leaf">${escapeHtml(instructorAreaLabel(instructor))}</p>
            </div>
          </div>
          <p class="mt-3 text-sm leading-6 text-ink/70">${escapeHtml(instructor.bio || "Call the office to check current availability.")}</p>
        </a>
        <div>
          ${phone}
        </div>
      </article>
    `;
  }

  function renderInstructors() {
    if (!instructorList || !selectedAreaTitle) return;

    selectedAreaTitle.textContent = `${areaLabels[selectedArea]} instructors`;
    areaTabs.forEach((tab) => {
      const active = tab.dataset.mapKey === selectedArea;
      tab.classList.toggle("bg-road", active);
      tab.classList.toggle("text-white", active);
      tab.classList.toggle("bg-white", !active);
      tab.classList.toggle("text-ink", !active);
    });
    mapAreas.forEach((area) => {
      area.classList.toggle("map-area-active", area.dataset.mapKey === selectedArea);
    });

    const matching = instructors
      .filter((instructor) => instructorMapKeys(instructor).includes(selectedArea))
      .sort(sortPublicInstructors);
    if (matching.length === 0) {
      instructorList.innerHTML = `<div class="rounded-md border border-ink/10 p-4 text-ink/70">Call the office on 0333 7720143 and we will check availability for ${areaLabels[selectedArea]}.</div>`;
      return;
    }

    instructorList.innerHTML = matching.map(instructorCard).join("");
  }

  function setSelectedArea(mapKey) {
    if (!areaLabels[mapKey]) return;
    selectedArea = mapKey;
    renderInstructors();
  }

  async function loadInstructors(client) {
    if (!instructorList) return;

    if (!client) {
      instructors = fallbackInstructors;
      renderInstructors();
      return;
    }

    const { data, error } = await client
      .from("instructors")
      .select("name, map_keys, transmission, phone, bio, slug, photo_url")
      .eq("active", true)
      .order("name", { ascending: true });

    instructors = error || !data || data.length === 0 ? fallbackInstructors : data;
    renderInstructors();
  }

  async function loadPosts() {
    if (!gallery) return;

    loadInstructors(null);

    if (!hasSupabaseConfig() || !window.supabase) {
      renderPassPlaceholder();
      return;
    }

    const client = window.supabase.createClient(window.KS_SUPABASE.url, window.KS_SUPABASE.publishableKey);
    loadInstructors(client);
    const { data, error } = await client
      .from("pass_posts")
      .select("student_name, caption, review, image_url, passed_at")
      .eq("published", true)
      .order("passed_at", { ascending: false })
      .limit(9);

    if (error) {
      renderPassPlaceholder();
      return;
    }

    if (!data || data.length === 0) {
      renderPassPlaceholder();
      return;
    }

    gallery.innerHTML = data.map(postCard).join("");
  }

  areaTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setSelectedArea(tab.dataset.mapKey);
    });
  });

  mapAreas.forEach((area) => {
    area.setAttribute("role", "button");
    area.setAttribute("tabindex", "0");
    area.setAttribute("aria-label", `${areaLabels[area.dataset.mapKey]} instructors`);
    area.addEventListener("click", () => {
      setSelectedArea(area.dataset.mapKey);
    });
    area.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      setSelectedArea(area.dataset.mapKey);
    });
  });

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

  loadPosts();
})();
