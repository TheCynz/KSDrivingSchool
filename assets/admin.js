(function () {
  const loginForm = document.querySelector("#login-form");
  const loginMessage = document.querySelector("#login-message");
  const sessionPanel = document.querySelector("#session-panel");
  const sessionEmail = document.querySelector("#session-email");
  const adminPanel = document.querySelector("#admin-panel");
  const signOutButton = document.querySelector("#sign-out");
  const postForm = document.querySelector("#post-form");
  const postMessage = document.querySelector("#post-message");
  const adminPosts = document.querySelector("#admin-posts");
  const refreshPosts = document.querySelector("#refresh-posts");
  const passedAt = document.querySelector("#passed-at");
  const instructorForm = document.querySelector("#instructor-form");
  const instructorMessage = document.querySelector("#instructor-message");
  const adminInstructors = document.querySelector("#admin-instructors");
  const refreshInstructors = document.querySelector("#refresh-instructors");

  if (passedAt) {
    passedAt.valueAsDate = new Date();
  }

  function hasSupabaseConfig() {
    return window.KS_SUPABASE &&
      !window.KS_SUPABASE.url.includes("YOUR_PROJECT_REF") &&
      !window.KS_SUPABASE.publishableKey.includes("YOUR_SUPABASE");
  }

  if (!hasSupabaseConfig()) {
    loginMessage.textContent = "Add Supabase URL and publishable key in assets/supabase-config.js.";
    return;
  }

  const client = window.supabase.createClient(window.KS_SUPABASE.url, window.KS_SUPABASE.publishableKey);

  function setMessage(target, message, isError) {
    target.textContent = message;
    target.classList.toggle("text-red-700", Boolean(isError));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setAuthenticated(user) {
    loginForm.classList.add("hidden");
    sessionPanel.classList.remove("hidden");
    adminPanel.classList.remove("hidden");
    sessionEmail.textContent = user.email;
    loadAdminPosts();
    loadAdminInstructors();
  }

  function setSignedOut() {
    loginForm.classList.remove("hidden");
    sessionPanel.classList.add("hidden");
    adminPanel.classList.add("hidden");
    sessionEmail.textContent = "";
  }

  function cleanFileName(name) {
    const extension = name.split(".").pop().toLowerCase();
    const base = name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);

    return `${base || "pass-photo"}-${crypto.randomUUID()}.${extension}`;
  }

  async function loadSession() {
    const { data } = await client.auth.getSession();
    if (data.session?.user) {
      setAuthenticated(data.session.user);
    } else {
      setSignedOut();
    }
  }

  async function loadAdminPosts() {
    adminPosts.innerHTML = `<p class="text-sm text-ink/60">Loading posts...</p>`;

    const { data, error } = await client
      .from("pass_posts")
      .select("id, student_name, caption, review, image_url, passed_at, published, created_at")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      adminPosts.innerHTML = `<p class="text-sm text-red-700">Could not load posts. Confirm this user is in public.admin_users.</p>`;
      return;
    }

    if (!data || data.length === 0) {
      adminPosts.innerHTML = `<p class="text-sm text-ink/60">No posts yet.</p>`;
      return;
    }

    adminPosts.innerHTML = data.map((post) => {
      const date = post.passed_at
        ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(post.passed_at))
        : "No date";
      const status = post.published ? "Published" : "Draft";
      const studentName = escapeHtml(post.student_name);
      const caption = escapeHtml(post.caption || "Student passed with no faults.");
      const review = post.review ? `<blockquote class="mt-2 border-l-4 border-signal pl-3 text-sm font-bold leading-6 text-ink/78">"${escapeHtml(post.review)}"</blockquote>` : "";

      return `
        <article class="grid gap-4 rounded-md border border-ink/10 p-4 sm:grid-cols-[120px_1fr]">
          <img class="h-28 w-full rounded-md object-cover sm:w-28" src="${post.image_url}" alt="">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-black">${studentName}</h3>
              <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${status}</span>
            </div>
            <p class="mt-1 text-sm font-bold text-leaf">${date}</p>
            <p class="mt-2 text-sm leading-6 text-ink/70">${caption}</p>
            ${review}
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadAdminInstructors() {
    adminInstructors.innerHTML = `<p class="text-sm text-ink/60">Loading instructors...</p>`;

    const { data, error } = await client
      .from("instructors")
      .select("id, name, area, map_key, transmission, phone, bio, active, sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      adminInstructors.innerHTML = `<p class="text-sm text-red-700">Could not load instructors. Confirm the instructors table and RLS policies are installed.</p>`;
      return;
    }

    if (!data || data.length === 0) {
      adminInstructors.innerHTML = `<p class="text-sm text-ink/60">No instructors yet.</p>`;
      return;
    }

    adminInstructors.innerHTML = data.map((instructor) => {
      const status = instructor.active ? "Visible" : "Hidden";
      const phone = instructor.phone ? `<p class="mt-1 text-sm text-ink/60">${escapeHtml(instructor.phone)}</p>` : "";

      return `
        <article class="rounded-md border border-ink/10 p-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="font-black">${escapeHtml(instructor.name)}</h4>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${status}</span>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${escapeHtml(instructor.map_key)}</span>
              </div>
              <p class="mt-1 text-sm font-bold text-leaf">${escapeHtml(instructor.area)}</p>
              <p class="mt-1 text-sm text-ink/70">${escapeHtml(instructor.transmission)}</p>
              ${phone}
              <p class="mt-2 text-sm leading-6 text-ink/70">${escapeHtml(instructor.bio || "")}</p>
            </div>
            <button class="delete-instructor rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50" data-instructor-id="${instructor.id}" type="button">Remove</button>
          </div>
        </article>
      `;
    }).join("");
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(loginMessage, "Signing in...", false);

    const formData = new FormData(loginForm);
    const { data, error } = await client.auth.signInWithPassword({
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (error) {
      setMessage(loginMessage, error.message, true);
      return;
    }

    setMessage(loginMessage, "", false);
    setAuthenticated(data.user);
  });

  signOutButton.addEventListener("click", async () => {
    await client.auth.signOut();
    setSignedOut();
  });

  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(postMessage, "Uploading photo...", false);

    const formData = new FormData(postForm);
    const photo = formData.get("photo");

    if (!photo || photo.size === 0) {
      setMessage(postMessage, "Choose a photo before uploading.", true);
      return;
    }

    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setMessage(postMessage, "Your session expired. Sign in again.", true);
      setSignedOut();
      return;
    }

    const filePath = `${userId}/${cleanFileName(photo.name)}`;
    const { error: uploadError } = await client.storage
      .from(window.KS_SUPABASE.bucket)
      .upload(filePath, photo, {
        cacheControl: "3600",
        upsert: false,
        contentType: photo.type
      });

    if (uploadError) {
      setMessage(postMessage, uploadError.message, true);
      return;
    }

    const { data: publicUrlData } = client.storage
      .from(window.KS_SUPABASE.bucket)
      .getPublicUrl(filePath);

    setMessage(postMessage, "Saving post...", false);
    const { error: insertError } = await client.from("pass_posts").insert({
      student_name: String(formData.get("student-name")).trim(),
      caption: String(formData.get("caption")).trim() || "Student passed with no faults.",
      review: String(formData.get("review")).trim() || null,
      image_path: filePath,
      image_url: publicUrlData.publicUrl,
      passed_at: formData.get("passed-at"),
      published: formData.get("published") === "on"
    });

    if (insertError) {
      setMessage(postMessage, insertError.message, true);
      return;
    }

    postForm.reset();
    passedAt.valueAsDate = new Date();
    document.querySelector("#caption").value = "Student passed with no faults.";
    document.querySelector("#review").value = "";
    document.querySelector("#published").checked = true;
    setMessage(postMessage, "Post uploaded.", false);
    loadAdminPosts();
  });

  instructorForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(instructorMessage, "Saving instructor...", false);

    const formData = new FormData(instructorForm);
    const { error } = await client.from("instructors").insert({
      name: String(formData.get("instructor-name")).trim(),
      area: String(formData.get("instructor-area")).trim(),
      map_key: formData.get("map-key"),
      transmission: formData.get("transmission"),
      phone: String(formData.get("instructor-phone")).trim() || null,
      bio: String(formData.get("instructor-bio")).trim() || null,
      sort_order: Number(formData.get("sort-order")) || 10,
      active: formData.get("instructor-active") === "on"
    });

    if (error) {
      setMessage(instructorMessage, error.message, true);
      return;
    }

    instructorForm.reset();
    document.querySelector("#sort-order").value = "10";
    document.querySelector("#instructor-active").checked = true;
    setMessage(instructorMessage, "Instructor added.", false);
    loadAdminInstructors();
  });

  adminInstructors.addEventListener("click", async (event) => {
    const button = event.target.closest(".delete-instructor");
    if (!button) return;

    const { error } = await client
      .from("instructors")
      .delete()
      .eq("id", button.dataset.instructorId);

    if (error) {
      setMessage(instructorMessage, error.message, true);
      return;
    }

    setMessage(instructorMessage, "Instructor removed.", false);
    loadAdminInstructors();
  });

  refreshPosts.addEventListener("click", loadAdminPosts);
  refreshInstructors.addEventListener("click", loadAdminInstructors);
  loadSession();
})();
