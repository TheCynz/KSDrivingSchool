(function () {
  const gallery = document.querySelector("#pass-gallery");
  const instructorList = document.querySelector("#instructor-list");
  const selectedAreaTitle = document.querySelector("#selected-area-title");
  const areaTabs = Array.from(document.querySelectorAll(".area-tab"));
  const mapAreas = Array.from(document.querySelectorAll(".map-area"));
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
      area: "Shrewsbury and Shawbury",
      map_key: "shrewsbury",
      transmission: "Manual",
      phone: "07931 673337",
      bio: "Grade A instructor covering Shrewsbury, Shawbury and nearby villages."
    },
    {
      name: "Adam Snaith",
      area: "Telford",
      map_key: "telford",
      transmission: "Manual",
      phone: "07555 618618",
      bio: "Telford instructor for learners preparing on local test routes."
    },
    {
      name: "Vanessa Marmont",
      area: "Shrewsbury, Minsterley and Pontesbury",
      map_key: "shrewsbury",
      transmission: "Manual",
      phone: "0333 7720143",
      bio: "Experienced instructor covering Shrewsbury and surrounding villages."
    },
    {
      name: "Shawbury coverage",
      area: "Shawbury",
      map_key: "shawbury",
      transmission: "Manual and automatic",
      phone: "0333 7720143",
      bio: "Call the office to match with the right available instructor."
    },
    {
      name: "Boomerheath coverage",
      area: "Boomerheath",
      map_key: "boomerheath",
      transmission: "Manual and automatic",
      phone: "0333 7720143",
      bio: "Nearby Shropshire lessons arranged through the office."
    }
  ];

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

    return `
      <article class="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-ink/8">
        <img class="gallery-image h-auto w-full object-cover" src="${post.image_url}" alt="${studentName} passed their driving test">
        <div class="p-5">
          <p class="text-sm font-bold text-leaf">${date}</p>
          <h3 class="mt-2 text-xl font-black">${studentName}</h3>
          <p class="mt-3 leading-7 text-ink/72">${caption}</p>
          ${review}
        </div>
      </article>
    `;
  }

  function instructorCard(instructor) {
    const phone = instructor.phone ? `<a class="mt-3 inline-flex rounded-md bg-kerb px-3 py-2 text-sm font-black text-road transition hover:bg-signal hover:text-ink" href="tel:${escapeHtml(instructor.phone.replace(/\s+/g, ""))}">${escapeHtml(instructor.phone)}</a>` : "";

    return `
      <article class="rounded-md border border-ink/10 p-4">
        <div class="flex flex-wrap items-center gap-2">
          <h4 class="text-lg font-black">${escapeHtml(instructor.name)}</h4>
          <span class="rounded bg-kerb px-2 py-1 text-xs font-bold text-road">${escapeHtml(instructor.transmission || "Lessons")}</span>
        </div>
        <p class="mt-2 text-sm font-bold text-leaf">${escapeHtml(instructor.area)}</p>
        <p class="mt-2 text-sm leading-6 text-ink/70">${escapeHtml(instructor.bio || "Call the office to check current availability.")}</p>
        ${phone}
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

    const matching = instructors.filter((instructor) => instructor.map_key === selectedArea);
    if (matching.length === 0) {
      instructorList.innerHTML = `<div class="rounded-md border border-ink/10 p-4 text-ink/70">Call the office on 0333 7720143 and we will check availability for ${areaLabels[selectedArea]}.</div>`;
      return;
    }

    instructorList.innerHTML = matching.map(instructorCard).join("");
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
      .select("name, area, map_key, transmission, phone, bio")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    instructors = error || !data || data.length === 0 ? fallbackInstructors : data;
    renderInstructors();
  }

  async function loadPosts() {
    if (!gallery) return;

    if (!hasSupabaseConfig()) {
      renderPassPlaceholder();
      loadInstructors(null);
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
      selectedArea = tab.dataset.mapKey;
      renderInstructors();
    });
  });

  mapAreas.forEach((area) => {
    area.addEventListener("click", () => {
      selectedArea = area.dataset.mapKey;
      renderInstructors();
    });
  });

  loadPosts();
})();
