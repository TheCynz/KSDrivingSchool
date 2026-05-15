(function () {
  const loginForm = document.querySelector("#login-form");
  const loginMessage = document.querySelector("#login-message");
  const sessionPanel = document.querySelector("#session-panel");
  const sessionEmail = document.querySelector("#session-email");
  const adminPanel = document.querySelector("#admin-panel");
  const signOutButton = document.querySelector("#sign-out");
  const postForm = document.querySelector("#post-form");
  const postId = document.querySelector("#post-id");
  const postImagePath = document.querySelector("#post-image-path");
  const postFormTitle = document.querySelector("#post-form-title");
  const postSubmit = document.querySelector("#post-submit");
  const postCancelEdit = document.querySelector("#post-cancel-edit");
  const postPhoto = document.querySelector("#photo");
  const postPhotoHelp = document.querySelector("#post-photo-help");
  const postMessage = document.querySelector("#post-message");
  const adminPosts = document.querySelector("#admin-posts");
  const refreshPosts = document.querySelector("#refresh-posts");
  const passedAt = document.querySelector("#passed-at");
  const instructorForm = document.querySelector("#instructor-form");
  const instructorId = document.querySelector("#instructor-id");
  const instructorCurrentPhotoPath = document.querySelector("#instructor-current-photo-path");
  const instructorFormTitle = document.querySelector("#instructor-form-title");
  const instructorSubmit = document.querySelector("#instructor-submit");
  const instructorCancelEdit = document.querySelector("#instructor-cancel-edit");
  const instructorMessage = document.querySelector("#instructor-message");
  const adminInstructors = document.querySelector("#admin-instructors");
  const refreshInstructors = document.querySelector("#refresh-instructors");
  const mapKeyInputs = Array.from(document.querySelectorAll('input[name="map-keys"]'));
  const settingsForm = document.querySelector("#settings-form");
  const settingsMessage = document.querySelector("#settings-message");
  const adminUserForm = document.querySelector("#admin-user-form");
  const adminUserId = document.querySelector("#admin-user-id");
  const adminUserEmail = document.querySelector("#admin-user-email");
  const adminUserName = document.querySelector("#admin-user-name");
  const adminUserRole = document.querySelector("#admin-user-role");
  const adminUserPassword = document.querySelector("#admin-user-password");
  const adminUserPasswordHelp = document.querySelector("#admin-user-password-help");
  const adminUserActive = document.querySelector("#admin-user-active");
  const adminUserSubmit = document.querySelector("#admin-user-submit");
  const adminUserCancelEdit = document.querySelector("#admin-user-cancel-edit");
  const adminUserMessage = document.querySelector("#admin-user-message");
  const adminUsers = document.querySelector("#admin-users");
  const refreshAdminUsers = document.querySelector("#refresh-admin-users");
  const adminNavCards = Array.from(document.querySelectorAll(".admin-nav-card"));
  const adminViews = Array.from(document.querySelectorAll(".admin-view"));
  const maxPhotoSize = 5 * 1024 * 1024;
  const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  const passwordRequirements = "Minimum 6 characters with lowercase, uppercase, digit, and symbol.";
  const areaLabels = {
    shrewsbury: "Shrewsbury",
    telford: "Telford",
    shawbury: "Shawbury",
    boomerheath: "Boomerheath"
  };
  let cachedPosts = [];
  let cachedInstructors = [];
  let cachedAdminUsers = [];
  const settingLabels = {
    phone_display: "Displayed phone number",
    phone_href: "Telephone link number",
    email: "Public email address",
    facebook_url: "Facebook page URL"
  };

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

  function showAdminView(viewName) {
    adminViews.forEach((view) => {
      view.classList.toggle("hidden", view.dataset.adminSection !== viewName);
    });

    adminNavCards.forEach((card) => {
      const active = card.dataset.adminView === viewName;
      card.classList.toggle("ring-2", active);
      card.classList.toggle("ring-road", active);
      card.classList.toggle("ring-1", !active);
      card.classList.toggle("ring-ink/8", !active);
    });
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
    sessionPanel.classList.add("flex", "flex-col", "gap-3", "sm:flex-row", "sm:items-center", "sm:justify-between");
    adminPanel.classList.remove("hidden");
    sessionEmail.textContent = user.email;
    loadAdminPosts();
    loadAdminInstructors();
    loadSiteSettings();
    loadAdminUsers();
  }

  function setSignedOut() {
    loginForm.classList.remove("hidden");
    sessionPanel.classList.remove("flex", "flex-col", "gap-3", "sm:flex-row", "sm:items-center", "sm:justify-between");
    sessionPanel.classList.add("hidden");
    adminPanel.classList.add("hidden");
    sessionEmail.textContent = "";
  }

  function cleanFileName(file, fallbackName = "pass-photo") {
    const extensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    };
    const extension = extensions[file.type] || "jpg";
    const name = file.name || fallbackName;
    const base = name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);

    return `${base || fallbackName}-${crypto.randomUUID()}.${extension}`;
  }

  function slugify(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || `instructor-${crypto.randomUUID().slice(0, 8)}`;
  }

  function isValidPhoto(file) {
    return allowedPhotoTypes.has(file.type) && file.size > 0 && file.size <= maxPhotoSize;
  }

  function resetPostForm() {
    postForm.reset();
    postId.value = "";
    postImagePath.value = "";
    passedAt.valueAsDate = new Date();
    document.querySelector("#caption").value = "Student passed with no faults.";
    document.querySelector("#review").value = "";
    document.querySelector("#published").checked = true;
    postPhoto.required = true;
    postPhotoHelp.textContent = "JPEG, PNG, or WebP. Keep student consent on file before publishing.";
    postFormTitle.textContent = "Student passed with no faults";
    postSubmit.textContent = "Upload post";
    postCancelEdit.classList.add("hidden");
  }

  function getInstructorMapKeys(instructor) {
    if (Array.isArray(instructor.map_keys) && instructor.map_keys.length > 0) {
      return instructor.map_keys.filter((key) => areaLabels[key]);
    }
    return ["shrewsbury"];
  }

  function setMapKeySelection(keys) {
    const selected = new Set(keys.filter((key) => areaLabels[key]));
    mapKeyInputs.forEach((input) => {
      input.checked = selected.has(input.value);
    });
  }

  function selectedMapKeys() {
    return mapKeyInputs
      .filter((input) => input.checked)
      .map((input) => input.value);
  }

  function mapKeyLabel(keys) {
    return keys
      .filter((key) => areaLabels[key])
      .map((key) => areaLabels[key])
      .join(", ");
  }

  function resetInstructorForm() {
    instructorForm.reset();
    instructorId.value = "";
    instructorCurrentPhotoPath.value = "";
    setMapKeySelection(["shrewsbury"]);
    document.querySelector("#instructor-active").checked = true;
    instructorFormTitle.textContent = "Instructors and areas";
    instructorSubmit.textContent = "Add instructor";
    instructorCancelEdit.classList.add("hidden");
  }

  function resetAdminUserForm() {
    adminUserForm.reset();
    adminUserId.value = "";
    adminUserEmail.disabled = false;
    adminUserEmail.required = true;
    adminUserPassword.required = true;
    adminUserActive.checked = true;
    adminUserRole.value = "admin";
    adminUserPasswordHelp.textContent = `${passwordRequirements} Required when creating a new admin or resetting a password.`;
    adminUserSubmit.textContent = "Create admin";
    adminUserCancelEdit.classList.add("hidden");
  }

  function passwordMeetsPolicy(password) {
    return password.length >= 6 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password);
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
      .select("id, student_name, caption, review, image_path, image_url, passed_at, published, created_at")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      adminPosts.innerHTML = `<p class="text-sm text-red-700">Could not load posts. Confirm this user is in public.admin_users.</p>`;
      return;
    }

    if (!data || data.length === 0) {
      cachedPosts = [];
      adminPosts.innerHTML = `<p class="text-sm text-ink/60">No posts yet.</p>`;
      return;
    }

    cachedPosts = data;
    adminPosts.innerHTML = data.map((post) => {
      const date = post.passed_at
        ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(post.passed_at))
        : "No date";
      const status = post.published ? "Published" : "Draft";
      const studentName = escapeHtml(post.student_name);
      const caption = escapeHtml(post.caption || "Student passed with no faults.");
      const review = post.review ? `<blockquote class="mt-2 border-l-4 border-signal pl-3 text-sm font-bold leading-6 text-ink/78">"${escapeHtml(post.review)}"</blockquote>` : "";
      const image = post.image_url
        ? `<img class="h-28 w-full rounded-md object-cover sm:w-28" src="${escapeHtml(post.image_url)}" alt="">`
        : `<div class="flex h-28 w-full items-center justify-center rounded-md bg-kerb text-sm font-black text-road sm:w-28">No photo</div>`;

      return `
        <article class="grid gap-4 rounded-md border border-ink/10 p-4 sm:grid-cols-[120px_1fr]">
          ${image}
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-black">${studentName}</h3>
              <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${status}</span>
            </div>
            <p class="mt-1 text-sm font-bold text-leaf">${date}</p>
            <p class="mt-2 text-sm leading-6 text-ink/70">${caption}</p>
            ${review}
            <div class="mt-4 flex flex-wrap gap-2">
              <button class="edit-post rounded-md bg-kerb px-4 py-2 text-sm font-bold text-road transition hover:bg-signal hover:text-ink" data-post-id="${post.id}" type="button">Edit</button>
              <button class="delete-post rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50" data-post-id="${post.id}" data-image-path="${escapeHtml(post.image_path || "")}" type="button">Delete</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadAdminInstructors() {
    adminInstructors.innerHTML = `<p class="text-sm text-ink/60">Loading instructors...</p>`;

    const { data, error } = await client
      .from("instructors")
      .select("id, name, map_keys, transmission, phone, bio, profile_bio, photo_path, photo_url, active")
      .order("name", { ascending: true });

    if (error) {
      adminInstructors.innerHTML = `<p class="text-sm text-red-700">Could not load instructors. Confirm the instructors table and RLS policies are installed.</p>`;
      return;
    }

    if (!data || data.length === 0) {
      cachedInstructors = [];
      adminInstructors.innerHTML = `<p class="text-sm text-ink/60">No instructors yet.</p>`;
      return;
    }

    cachedInstructors = data;
    adminInstructors.innerHTML = data.map((instructor) => {
      const status = instructor.active ? "Visible" : "Hidden";
      const phone = instructor.phone ? `<p class="mt-1 text-sm text-ink/60">${escapeHtml(instructor.phone)}</p>` : "";
      const profileDescription = instructor.profile_bio ? `<p class="mt-2 text-sm leading-6 text-ink/70">${escapeHtml(instructor.profile_bio)}</p>` : "";
      const mapKeys = getInstructorMapKeys(instructor);
      const photo = instructor.photo_url
        ? `<img class="h-20 w-20 rounded-md object-cover" src="${escapeHtml(instructor.photo_url)}" alt="">`
        : `<div class="flex h-20 w-20 items-center justify-center rounded-md bg-kerb text-xl font-black text-road">${escapeHtml(instructor.name.slice(0, 1))}</div>`;

      return `
        <article class="rounded-md border border-ink/10 p-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex gap-4">
              ${photo}
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="font-black">${escapeHtml(instructor.name)}</h4>
                  <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${status}</span>
                  <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${escapeHtml(mapKeyLabel(mapKeys))}</span>
                </div>
                <p class="mt-1 text-sm font-bold text-leaf">${escapeHtml(mapKeyLabel(mapKeys))}</p>
                <p class="mt-1 text-sm text-ink/70">${escapeHtml(instructor.transmission)}</p>
                ${phone}
                <p class="mt-2 text-sm leading-6 text-ink/70">${escapeHtml(instructor.bio || "")}</p>
                ${profileDescription}
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="edit-instructor rounded-md bg-kerb px-4 py-2 text-sm font-bold text-road transition hover:bg-signal hover:text-ink" data-instructor-id="${instructor.id}" type="button">Edit</button>
              <button class="delete-instructor rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50" data-instructor-id="${instructor.id}" data-photo-path="${escapeHtml(instructor.photo_path || "")}" type="button">Remove</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadSiteSettings() {
    if (!settingsForm) return;
    setMessage(settingsMessage, "Loading site settings...", false);

    const { data, error } = await client
      .from("site_settings")
      .select("key, value")
      .in("key", Object.keys(settingLabels));

    if (error) {
      setMessage(settingsMessage, "Could not load site settings. Confirm the latest schema has been applied.", true);
      return;
    }

    const settings = Object.fromEntries((data || []).map((setting) => [setting.key, setting.value]));
    Object.keys(settingLabels).forEach((key) => {
      const input = settingsForm.elements[key];
      if (input) input.value = settings[key] || "";
    });
    setMessage(settingsMessage, "", false);
  }

  async function invokeAdminUsers(body) {
    const { data, error } = await client.functions.invoke("admin-users", { body });
    if (error) {
      let message = error.message || "Admin user action failed.";
      if (error.context && typeof error.context.json === "function") {
        try {
          const payload = await error.context.json();
          message = payload.error || message;
        } catch (_parseError) {
          message = error.message || message;
        }
      }
      throw new Error(message);
    }
    if (data?.error) {
      throw new Error(data.error);
    }
    return data;
  }

  async function loadAdminUsers() {
    adminUsers.innerHTML = `<p class="text-sm text-ink/60">Loading admins...</p>`;

    try {
      const data = await invokeAdminUsers({ action: "list" });
      cachedAdminUsers = data.admins || [];
    } catch (error) {
      cachedAdminUsers = [];
      adminUsers.innerHTML = `<p class="text-sm text-red-700">${escapeHtml(error.message)} Confirm the admin-users Edge Function is deployed.</p>`;
      return;
    }

    if (cachedAdminUsers.length === 0) {
      adminUsers.innerHTML = `<p class="text-sm text-ink/60">No admins returned.</p>`;
      return;
    }

    adminUsers.innerHTML = cachedAdminUsers.map((admin) => {
      const name = admin.full_name ? escapeHtml(admin.full_name) : "No name";
      const email = admin.email ? escapeHtml(admin.email) : "Email not stored yet";
      const status = admin.active ? "Active" : "Inactive";
      const role = escapeHtml(admin.role || "admin");
      const created = admin.created_at
        ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(admin.created_at))
        : "No date";

      return `
        <article class="rounded-md border border-ink/10 p-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="font-black">${name}</h4>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${role}</span>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${status}</span>
              </div>
              <p class="mt-1 break-all text-sm font-bold text-leaf">${email}</p>
              <p class="mt-1 text-sm text-ink/60">Added ${created}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="edit-admin-user rounded-md bg-kerb px-4 py-2 text-sm font-bold text-road transition hover:bg-signal hover:text-ink" data-admin-user-id="${admin.user_id}" type="button">Edit</button>
              <button class="reset-admin-password rounded-md border border-ink/15 px-4 py-2 text-sm font-bold text-ink transition hover:border-leaf hover:text-leaf" data-admin-user-id="${admin.user_id}" type="button">Reset password</button>
              <button class="delete-admin-user rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50" data-admin-user-id="${admin.user_id}" type="button">Remove</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function dateInputValue(value) {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
  }

  function editPost(id) {
    const post = cachedPosts.find((item) => item.id === id);
    if (!post) return;

    showAdminView("passes");
    postId.value = post.id;
    postImagePath.value = post.image_path || "";
    document.querySelector("#student-name").value = post.student_name || "";
    passedAt.value = dateInputValue(post.passed_at);
    document.querySelector("#caption").value = post.caption || "Student passed with no faults.";
    document.querySelector("#review").value = post.review || "";
    document.querySelector("#published").checked = Boolean(post.published);
    postPhoto.value = "";
    postPhoto.required = false;
    postPhotoHelp.textContent = "Leave blank to keep the current photo, or choose a new JPEG, PNG, or WebP to replace it.";
    postFormTitle.textContent = `Edit ${post.student_name || "pass post"}`;
    postSubmit.textContent = "Save post";
    postCancelEdit.classList.remove("hidden");
    postForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function editInstructor(id) {
    const instructor = cachedInstructors.find((item) => item.id === id);
    if (!instructor) return;

    showAdminView("instructors");
    instructorId.value = instructor.id;
    instructorCurrentPhotoPath.value = instructor.photo_path || "";
    document.querySelector("#instructor-name").value = instructor.name || "";
    setMapKeySelection(getInstructorMapKeys(instructor));
    document.querySelector("#transmission").value = instructor.transmission || "Manual";
    document.querySelector("#instructor-phone").value = instructor.phone || "";
    document.querySelector("#instructor-photo").value = "";
    document.querySelector("#instructor-bio").value = instructor.bio || "";
    document.querySelector("#instructor-profile-bio").value = instructor.profile_bio || "";
    document.querySelector("#instructor-active").checked = Boolean(instructor.active);
    instructorFormTitle.textContent = `Edit ${instructor.name || "instructor"}`;
    instructorSubmit.textContent = "Save instructor";
    instructorCancelEdit.classList.remove("hidden");
    instructorForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function editAdminUser(id) {
    const admin = cachedAdminUsers.find((item) => item.user_id === id);
    if (!admin) return;

    showAdminView("admins");
    adminUserId.value = admin.user_id;
    adminUserEmail.value = admin.email || "";
    adminUserEmail.disabled = true;
    adminUserEmail.required = false;
    adminUserName.value = admin.full_name || "";
    adminUserRole.value = admin.role || "admin";
    adminUserActive.checked = Boolean(admin.active);
    adminUserPassword.value = "";
    adminUserPassword.required = false;
    adminUserPasswordHelp.textContent = `Leave blank to update access details only. Use Reset password to set a new temporary password. ${passwordRequirements}`;
    adminUserSubmit.textContent = "Save admin";
    adminUserCancelEdit.classList.remove("hidden");
    adminUserForm.scrollIntoView({ behavior: "smooth", block: "start" });
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
    setMessage(postMessage, "Saving post...", false);

    const formData = new FormData(postForm);
    const editingPostId = String(formData.get("post-id")).trim();
    const photo = formData.get("photo");
    let filePath = String(formData.get("post-image-path")).trim() || null;
    let imageUrl = null;
    let uploadedNewPhoto = false;

    if (!editingPostId && (!photo || photo.size === 0)) {
      setMessage(postMessage, "Choose a photo before uploading.", true);
      return;
    }

    if (photo && photo.size > 0 && !isValidPhoto(photo)) {
      setMessage(postMessage, "Photo must be a JPEG, PNG, or WebP under 5MB.", true);
      return;
    }

    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setMessage(postMessage, "Your session expired. Sign in again.", true);
      setSignedOut();
      return;
    }

    if (photo && photo.size > 0) {
      setMessage(postMessage, "Uploading photo...", false);
      filePath = `${userId}/${cleanFileName(photo)}`;
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
      imageUrl = publicUrlData.publicUrl;
      uploadedNewPhoto = true;
    }

    const postPayload = {
      student_name: String(formData.get("student-name")).trim(),
      caption: String(formData.get("caption")).trim() || "Student passed with no faults.",
      review: String(formData.get("review")).trim() || null,
      passed_at: formData.get("passed-at"),
      published: formData.get("published") === "on"
    };

    if (filePath && imageUrl) {
      postPayload.image_path = filePath;
      postPayload.image_url = imageUrl;
    }

    const { error: saveError } = editingPostId
      ? await client.from("pass_posts").update(postPayload).eq("id", editingPostId)
      : await client.from("pass_posts").insert(postPayload);

    if (saveError) {
      if (uploadedNewPhoto && filePath) {
        await client.storage.from(window.KS_SUPABASE.bucket).remove([filePath]);
      }
      setMessage(postMessage, saveError.message, true);
      return;
    }

    if (editingPostId && uploadedNewPhoto && formData.get("post-image-path")) {
      await client.storage.from(window.KS_SUPABASE.bucket).remove([String(formData.get("post-image-path"))]);
    }

    resetPostForm();
    setMessage(postMessage, editingPostId ? "Post updated." : "Post uploaded.", false);
    loadAdminPosts();
  });

  instructorForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(instructorMessage, "Saving instructor...", false);

    const formData = new FormData(instructorForm);
    const photo = formData.get("instructor-photo");
    const editingInstructorId = String(formData.get("instructor-id")).trim();
    const oldPhotoPath = String(formData.get("instructor-current-photo-path")).trim();
    const name = String(formData.get("instructor-name")).trim();
    const mapKeys = selectedMapKeys();
    let photoPath = oldPhotoPath || null;
    let photoUrl = null;
    let uploadedNewPhoto = false;

    if (mapKeys.length === 0) {
      setMessage(instructorMessage, "Choose at least one map area.", true);
      return;
    }

    if (photo && photo.size > 0) {
      if (!isValidPhoto(photo)) {
        setMessage(instructorMessage, "Photo must be a JPEG, PNG, or WebP under 5MB.", true);
        return;
      }

      const { data: sessionData } = await client.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        setMessage(instructorMessage, "Your session expired. Sign in again.", true);
        setSignedOut();
        return;
      }

      photoPath = `${userId}/instructors/${cleanFileName(photo, "instructor-photo")}`;
      const { error: uploadError } = await client.storage
        .from(window.KS_SUPABASE.bucket)
        .upload(photoPath, photo, {
          cacheControl: "3600",
          upsert: false,
          contentType: photo.type
        });

      if (uploadError) {
        setMessage(instructorMessage, uploadError.message, true);
        return;
      }

      const { data: publicUrlData } = client.storage
        .from(window.KS_SUPABASE.bucket)
        .getPublicUrl(photoPath);
      photoUrl = publicUrlData.publicUrl;
      uploadedNewPhoto = true;
    }

    const instructorPayload = {
      name: String(formData.get("instructor-name")).trim(),
      map_keys: mapKeys,
      transmission: formData.get("transmission"),
      phone: String(formData.get("instructor-phone")).trim() || null,
      bio: String(formData.get("instructor-bio")).trim() || null,
      profile_bio: String(formData.get("instructor-profile-bio")).trim() || String(formData.get("instructor-bio")).trim() || null,
      active: formData.get("instructor-active") === "on"
    };

    if (!editingInstructorId) {
      instructorPayload.slug = slugify(name);
    }

    if (uploadedNewPhoto) {
      instructorPayload.photo_path = photoPath;
      instructorPayload.photo_url = photoUrl;
    }

    const { error } = editingInstructorId
      ? await client.from("instructors").update(instructorPayload).eq("id", editingInstructorId)
      : await client.from("instructors").insert(instructorPayload);

    if (error) {
      if (uploadedNewPhoto && photoPath) {
        await client.storage.from(window.KS_SUPABASE.bucket).remove([photoPath]);
      }
      setMessage(instructorMessage, error.message, true);
      return;
    }

    if (editingInstructorId && uploadedNewPhoto && oldPhotoPath) {
      await client.storage.from(window.KS_SUPABASE.bucket).remove([oldPhotoPath]);
    }

    resetInstructorForm();
    setMessage(instructorMessage, editingInstructorId ? "Instructor updated." : "Instructor added.", false);
    loadAdminInstructors();
  });

  settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(settingsMessage, "Saving site settings...", false);

    const formData = new FormData(settingsForm);
    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user?.id;
    const rows = Object.entries(settingLabels).map(([key, label]) => ({
      key,
      label,
      value: String(formData.get(key)).trim(),
      public: true,
      updated_by: userId || null,
      updated_at: new Date().toISOString()
    }));

    if (rows.some((row) => row.value.length === 0)) {
      setMessage(settingsMessage, "All site settings are required.", true);
      return;
    }

    const { error } = await client
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      setMessage(settingsMessage, error.message, true);
      return;
    }

    setMessage(settingsMessage, "Site settings saved.", false);
  });

  adminUserForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(adminUserMessage, "Saving admin user...", false);

    const formData = new FormData(adminUserForm);
    const editingAdminId = String(formData.get("admin-user-id")).trim();
    const password = String(formData.get("admin-user-password")).trim();

    if ((!editingAdminId || password) && !passwordMeetsPolicy(password)) {
      setMessage(adminUserMessage, passwordRequirements, true);
      return;
    }

    try {
      if (editingAdminId) {
        await invokeAdminUsers({
          action: "update",
          userId: editingAdminId,
          fullName: formData.get("admin-user-name"),
          role: formData.get("admin-user-role"),
          active: formData.get("admin-user-active") === "on"
        });
        if (password) {
          await invokeAdminUsers({
            action: "reset-password",
            userId: editingAdminId,
            password
          });
        }
        setMessage(adminUserMessage, password ? "Admin updated and password reset." : "Admin updated.", false);
      } else {
        await invokeAdminUsers({
          action: "create",
          email: formData.get("admin-user-email"),
          fullName: formData.get("admin-user-name"),
          role: formData.get("admin-user-role"),
          password
        });
        setMessage(adminUserMessage, "Admin created. Share the temporary password privately.", false);
      }
    } catch (error) {
      setMessage(adminUserMessage, error.message, true);
      return;
    }

    resetAdminUserForm();
    loadAdminUsers();
  });

  adminInstructors.addEventListener("click", async (event) => {
    const editButton = event.target.closest(".edit-instructor");
    if (editButton) {
      editInstructor(editButton.dataset.instructorId);
      return;
    }

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

    if (button.dataset.photoPath) {
      await client.storage.from(window.KS_SUPABASE.bucket).remove([button.dataset.photoPath]);
    }

    if (instructorId.value === button.dataset.instructorId) {
      resetInstructorForm();
    }

    setMessage(instructorMessage, "Instructor removed.", false);
    loadAdminInstructors();
  });

  adminPosts.addEventListener("click", async (event) => {
    const editButton = event.target.closest(".edit-post");
    if (editButton) {
      editPost(editButton.dataset.postId);
      return;
    }

    const deleteButton = event.target.closest(".delete-post");
    if (!deleteButton) return;

    const { error } = await client
      .from("pass_posts")
      .delete()
      .eq("id", deleteButton.dataset.postId);

    if (error) {
      setMessage(postMessage, error.message, true);
      return;
    }

    if (deleteButton.dataset.imagePath) {
      await client.storage.from(window.KS_SUPABASE.bucket).remove([deleteButton.dataset.imagePath]);
    }

    if (postId.value === deleteButton.dataset.postId) {
      resetPostForm();
    }

    setMessage(postMessage, "Post deleted.", false);
    loadAdminPosts();
  });

  adminUsers.addEventListener("click", async (event) => {
    const editButton = event.target.closest(".edit-admin-user");
    if (editButton) {
      editAdminUser(editButton.dataset.adminUserId);
      return;
    }

    const resetButton = event.target.closest(".reset-admin-password");
    if (resetButton) {
      editAdminUser(resetButton.dataset.adminUserId);
      adminUserPasswordHelp.textContent = `Enter a new temporary password, then save admin. ${passwordRequirements}`;
      adminUserPassword.required = true;
      adminUserPassword.focus();
      return;
    }

    const deleteButton = event.target.closest(".delete-admin-user");
    if (!deleteButton) return;

    if (!window.confirm("Remove admin access for this user?")) return;

    try {
      await invokeAdminUsers({
        action: "remove",
        userId: deleteButton.dataset.adminUserId
      });
      if (adminUserId.value === deleteButton.dataset.adminUserId) {
        resetAdminUserForm();
      }
      setMessage(adminUserMessage, "Admin access removed.", false);
      loadAdminUsers();
    } catch (error) {
      setMessage(adminUserMessage, error.message, true);
    }
  });

  adminNavCards.forEach((card) => {
    card.addEventListener("click", () => {
      showAdminView(card.dataset.adminView);
    });
  });

  postCancelEdit.addEventListener("click", () => {
    resetPostForm();
    setMessage(postMessage, "", false);
  });

  instructorCancelEdit.addEventListener("click", () => {
    resetInstructorForm();
    setMessage(instructorMessage, "", false);
  });

  adminUserCancelEdit.addEventListener("click", () => {
    resetAdminUserForm();
    setMessage(adminUserMessage, "", false);
  });

  refreshPosts.addEventListener("click", loadAdminPosts);
  refreshInstructors.addEventListener("click", loadAdminInstructors);
  refreshAdminUsers.addEventListener("click", loadAdminUsers);
  showAdminView("passes");
  loadSession();
})();
