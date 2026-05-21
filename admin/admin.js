"use strict";
(function () {
    const shared = window.KS_SHARED;
    const loginForm = document.querySelector("#login-form");
    const loginMessage = document.querySelector("#login-message");
    const passwordResetForm = document.querySelector("#password-reset-form");
    const newPassword = document.querySelector("#new-password");
    const confirmPassword = document.querySelector("#confirm-password");
    const passwordResetMessage = document.querySelector("#password-reset-message");
    const sessionPanel = document.querySelector("#session-panel");
    const sessionEmail = document.querySelector("#session-email");
    const sessionTimeoutMessage = document.querySelector("#session-timeout-message");
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
    const dealForm = document.querySelector("#deal-form");
    const dealId = document.querySelector("#deal-id");
    const dealFormTitle = document.querySelector("#deal-form-title");
    const dealSubmit = document.querySelector("#deal-submit");
    const dealCancelEdit = document.querySelector("#deal-cancel-edit");
    const dealMessage = document.querySelector("#deal-message");
    const adminDeals = document.querySelector("#admin-deals");
    const refreshDeals = document.querySelector("#refresh-deals");
    const dealValidFrom = document.querySelector("#deal-valid-from");
    const dealValidUntil = document.querySelector("#deal-valid-until");
    const dealStatusPreview = document.querySelector("#deal-status-preview");
    const datePickers = Array.from(document.querySelectorAll("[data-date-picker]"));
    const reviewForm = document.querySelector("#review-form");
    const reviewId = document.querySelector("#review-id");
    const reviewFormTitle = document.querySelector("#review-form-title");
    const reviewSubmit = document.querySelector("#review-submit");
    const reviewCancelEdit = document.querySelector("#review-cancel-edit");
    const reviewMessage = document.querySelector("#review-message");
    const adminReviews = document.querySelector("#admin-reviews");
    const refreshReviews = document.querySelector("#refresh-reviews");
    const instructorForm = document.querySelector("#instructor-form");
    const instructorId = document.querySelector("#instructor-id");
    const instructorCurrentPhotoPath = document.querySelector("#instructor-current-photo-path");
    const instructorFormTitle = document.querySelector("#instructor-form-title");
    const instructorSubmit = document.querySelector("#instructor-submit");
    const instructorCancelEdit = document.querySelector("#instructor-cancel-edit");
    const instructorMessage = document.querySelector("#instructor-message");
    const adminInstructors = document.querySelector("#admin-instructors");
    const refreshInstructors = document.querySelector("#refresh-instructors");
    const toggleInstructorForm = document.querySelector("#toggle-instructor-form");
    const instructorFormPanel = document.querySelector("#instructor-form-panel");
    const instructorListPanel = document.querySelector("#instructor-list-panel");
    const mapKeys = document.querySelector("#map-keys");
    const areaForm = document.querySelector("#area-form");
    const areaId = document.querySelector("#area-id");
    const areaFormTitle = document.querySelector("#area-form-title");
    const areaSubmit = document.querySelector("#area-submit");
    const areaCancelEdit = document.querySelector("#area-cancel-edit");
    const areaMessage = document.querySelector("#area-message");
    const adminAreas = document.querySelector("#admin-areas");
    const refreshAreas = document.querySelector("#refresh-areas");
    const toggleAreaForm = document.querySelector("#toggle-area-form");
    const areaFormPanel = document.querySelector("#area-form-panel");
    const areaListPanel = document.querySelector("#area-list-panel");
    const areaMapPicker = document.querySelector("#area-map-picker");
    const areaMapPickerStatus = document.querySelector("#area-map-picker-status");
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
    const toggleAdminUserForm = document.querySelector("#toggle-admin-user-form");
    const adminUserFormPanel = document.querySelector("#admin-user-form-panel");
    const adminUserListPanel = document.querySelector("#admin-user-list-panel");
    const adminNavCards = Array.from(document.querySelectorAll(".admin-nav-card"));
    const adminViews = Array.from(document.querySelectorAll(".admin-view"));
    const adminConfigNav = document.querySelector("#admin-config-nav");
    const areaMapWidth = 1000;
    const areaMapHeight = 720;
    const areaMapCenterX = areaMapWidth / 2;
    const areaMapCenterY = 430;
    const maxPhotoSize = 5 * 1024 * 1024;
    const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const passwordRequirements = "Minimum 12 characters with lowercase, uppercase, digit, and symbol.";
    const adminIdleTimeoutMs = 2 * 60 * 60 * 1000;
    const adminIdleWarningMs = 5 * 60 * 1000;
    const adminLastActivityKey = "ks_admin_last_activity";
    let cachedPosts = [];
    let cachedDeals = [];
    let cachedReviews = [];
    let cachedInstructors = [];
    let cachedAreas = [];
    let cachedAdminUsers = [];
    let dealsSupportFeatured = true;
    let adminLogoutTimer = 0;
    let adminWarningTimer = 0;
    let adminIdleWarningShown = false;
    const settingLabels = {
        phone_display: "Displayed phone number",
        phone_href: "Telephone link number",
        email: "Public email address",
        facebook_url: "Facebook page URL"
    };
    const settingDefaults = {
        phone_display: "0333 7720143",
        phone_href: "+443337720143",
        email: "ksdrivingschool66@gmail.com",
        facebook_url: "https://www.facebook.com/drivinglessonsshrewsbury/"
    };
    function hasSupabaseConfig() {
        return shared.hasSupabaseConfig();
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
            card.setAttribute("aria-pressed", String(active));
        });
        const activeCard = adminNavCards.find((card) => card.dataset.adminView === viewName);
        if (adminConfigNav && activeCard && adminConfigNav.contains(activeCard)) {
            adminConfigNav.open = true;
        }
    }
    function setPanelOpen(panel, button, open, listPanel) {
        if (!panel || !button)
            return;
        panel.classList.toggle("hidden", !open);
        button.setAttribute("aria-expanded", String(open));
        listPanel === null || listPanel === void 0 ? void 0 : listPanel.classList.toggle("hidden", open);
    }
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    function setAuthenticated(user, resetActivity = false) {
        loginForm.classList.add("hidden");
        passwordResetForm.classList.add("hidden");
        sessionPanel.classList.remove("hidden");
        sessionPanel.classList.add("flex", "flex-col", "gap-3", "sm:flex-row", "sm:items-center", "sm:justify-between");
        adminPanel.classList.remove("hidden");
        sessionEmail.textContent = user.email;
        if (sessionTimeoutMessage) {
            sessionTimeoutMessage.classList.add("hidden");
            sessionTimeoutMessage.textContent = "";
        }
        startAdminAutoLogout(resetActivity);
        loadAdminPosts();
        loadAdminDeals();
        loadAdminReviews();
        loadAdminAreas();
        loadAdminInstructors();
        loadSiteSettings();
        loadAdminUsers();
    }
    function setSignedOut() {
        stopAdminAutoLogout();
        loginForm.classList.remove("hidden");
        passwordResetForm.classList.add("hidden");
        sessionPanel.classList.remove("flex", "flex-col", "gap-3", "sm:flex-row", "sm:items-center", "sm:justify-between");
        sessionPanel.classList.add("hidden");
        adminPanel.classList.add("hidden");
        sessionEmail.textContent = "";
    }
    function isPasswordRecoveryRoute() {
        return window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery");
    }
    function setPasswordRecoveryMode(user) {
        stopAdminAutoLogout();
        loginForm.classList.add("hidden");
        passwordResetForm.classList.remove("hidden");
        sessionPanel.classList.add("hidden");
        sessionPanel.classList.remove("flex", "flex-col", "gap-3", "sm:flex-row", "sm:items-center", "sm:justify-between");
        adminPanel.classList.add("hidden");
        sessionEmail.textContent = "";
        newPassword.value = "";
        confirmPassword.value = "";
        setMessage(passwordResetMessage, `Set a new password for ${user.email || "this admin account"}.`, false);
    }
    function stopAdminAutoLogout() {
        window.clearTimeout(adminLogoutTimer);
        window.clearTimeout(adminWarningTimer);
        adminLogoutTimer = 0;
        adminWarningTimer = 0;
        adminIdleWarningShown = false;
        localStorage.removeItem(adminLastActivityKey);
    }
    function lastAdminActivity() {
        return Number(localStorage.getItem(adminLastActivityKey) || 0);
    }
    function recordAdminActivity() {
        if (adminPanel.classList.contains("hidden"))
            return;
        localStorage.setItem(adminLastActivityKey, String(Date.now()));
        adminIdleWarningShown = false;
        if (sessionTimeoutMessage) {
            sessionTimeoutMessage.classList.add("hidden");
            sessionTimeoutMessage.textContent = "";
        }
        scheduleAdminAutoLogout();
    }
    function showAdminIdleWarning() {
        if (adminPanel.classList.contains("hidden") || adminIdleWarningShown)
            return;
        adminIdleWarningShown = true;
        if (sessionTimeoutMessage) {
            sessionTimeoutMessage.textContent = "Auto logout in 5 minutes unless you keep working.";
            sessionTimeoutMessage.classList.remove("hidden");
        }
    }
    async function autoSignOutAdmin() {
        if (adminPanel.classList.contains("hidden"))
            return;
        await client.auth.signOut();
        setSignedOut();
        setMessage(loginMessage, "Signed out after 2 hours of inactivity.", false);
    }
    function scheduleAdminAutoLogout() {
        window.clearTimeout(adminLogoutTimer);
        window.clearTimeout(adminWarningTimer);
        const lastActivity = lastAdminActivity();
        if (!lastActivity)
            return;
        const elapsed = Date.now() - lastActivity;
        const logoutDelay = adminIdleTimeoutMs - elapsed;
        const warningDelay = logoutDelay - adminIdleWarningMs;
        if (logoutDelay <= 0) {
            autoSignOutAdmin();
            return;
        }
        if (warningDelay <= 0) {
            showAdminIdleWarning();
        }
        else {
            adminWarningTimer = window.setTimeout(showAdminIdleWarning, warningDelay);
        }
        adminLogoutTimer = window.setTimeout(autoSignOutAdmin, logoutDelay);
    }
    function startAdminAutoLogout(resetActivity = false) {
        const existingActivity = lastAdminActivity();
        if (resetActivity || !existingActivity) {
            localStorage.setItem(adminLastActivityKey, String(Date.now()));
        }
        scheduleAdminAutoLogout();
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
    function canvasToBlob(canvas, type, quality) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), type, quality);
        });
    }
    async function loadImageFile(file) {
        if ("createImageBitmap" in window) {
            return createImageBitmap(file);
        }
        return new Promise((resolve, reject) => {
            const image = new Image();
            const url = URL.createObjectURL(file);
            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };
            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Could not read the image file."));
            };
            image.src = url;
        });
    }
    async function preparePhotoForUpload(file, fallbackName = "photo") {
        if (!allowedPhotoTypes.has(file.type) || file.size <= 0) {
            throw new Error("Photo must be a JPEG, PNG, or WebP image.");
        }
        if (file.size <= maxPhotoSize)
            return file;
        const image = await loadImageFile(file);
        const width = image.width || image.naturalWidth;
        const height = image.height || image.naturalHeight;
        if (!width || !height)
            throw new Error("Could not read the image dimensions.");
        const maxEdge = 1800;
        const scale = Math.min(1, maxEdge / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const context = canvas.getContext("2d");
        if (!context)
            throw new Error("Could not prepare the image for upload.");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        if ("close" in image && typeof image.close === "function")
            image.close();
        const outputType = "image/webp";
        const qualities = [0.82, 0.72, 0.62, 0.52, 0.42];
        let smallestBlob = null;
        for (const quality of qualities) {
            const blob = await canvasToBlob(canvas, outputType, quality);
            if (!blob)
                continue;
            smallestBlob = blob;
            if (blob.size <= maxPhotoSize) {
                return new File([blob], cleanFileName(file, fallbackName).replace(/\.[^.]+$/, outputType === "image/png" ? ".png" : ".webp"), {
                    type: outputType
                });
            }
        }
        if (smallestBlob && smallestBlob.size <= maxPhotoSize) {
            return new File([smallestBlob], cleanFileName(file, fallbackName).replace(/\.[^.]+$/, outputType === "image/png" ? ".png" : ".webp"), {
                type: outputType
            });
        }
        throw new Error("Photo is too large to compress under 5MB. Try a smaller image.");
    }
    function safeImageUrl(value) {
        try {
            const url = new URL(String(value || ""), window.location.href);
            return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
        }
        catch (_error) {
            return "";
        }
    }
    function todayIso() {
        return new Date().toISOString().slice(0, 10);
    }
    function parseIsoDate(value) {
        const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match)
            return null;
        const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        return Number.isNaN(date.getTime()) ? null : date;
    }
    function isoDate(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }
    function formatDateLabel(value, emptyLabel) {
        const date = parseIsoDate(value);
        return date ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date) : emptyLabel;
    }
    function setDateValue(inputId, value) {
        const input = document.querySelector(`#${inputId}`);
        if (!input)
            return;
        input.value = value || "";
        const picker = document.querySelector(`[data-date-input="${inputId}"]`);
        const label = picker === null || picker === void 0 ? void 0 : picker.querySelector("[data-date-label]");
        const emptyLabel = (picker === null || picker === void 0 ? void 0 : picker.dataset.emptyLabel) || (inputId === "deal-valid-from" ? "Start immediately" : "No end date");
        if (label)
            label.textContent = formatDateLabel(input.value, emptyLabel);
        renderDatePicker(picker);
        if (inputId.startsWith("deal-"))
            updateDealStatusPreview();
    }
    function datePickerMonth(picker) {
        const input = document.querySelector(`#${picker.dataset.dateInput}`);
        const selected = parseIsoDate(input === null || input === void 0 ? void 0 : input.value);
        const stored = picker.dataset.visibleMonth ? parseIsoDate(`${picker.dataset.visibleMonth}-01`) : null;
        const date = selected || stored || new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    function setDatePickerMonth(picker, date) {
        picker.dataset.visibleMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
    function setDatePickerOpen(picker, open) {
        var _a, _b;
        (_a = picker === null || picker === void 0 ? void 0 : picker.querySelector("[data-date-popover]")) === null || _a === void 0 ? void 0 : _a.classList.toggle("hidden", !open);
        (_b = picker === null || picker === void 0 ? void 0 : picker.querySelector("[data-date-toggle]")) === null || _b === void 0 ? void 0 : _b.setAttribute("aria-expanded", String(open));
        if (open)
            renderDatePicker(picker);
    }
    function eventMatch(event, selector, scope) {
        var _a, _b, _c;
        const path = typeof event.composedPath === "function" ? event.composedPath() : [];
        const match = path.find((item) => { var _a; return ((_a = item === null || item === void 0 ? void 0 : item.matches) === null || _a === void 0 ? void 0 : _a.call(item, selector)) && (!scope || scope.contains(item)); });
        if (match)
            return match;
        const target = ((_a = event.target) === null || _a === void 0 ? void 0 : _a.nodeType) === 1 ? event.target : (_b = event.target) === null || _b === void 0 ? void 0 : _b.parentElement;
        const fallback = (_c = target === null || target === void 0 ? void 0 : target.closest) === null || _c === void 0 ? void 0 : _c.call(target, selector);
        return fallback && (!scope || scope.contains(fallback)) ? fallback : null;
    }
    function renderDatePicker(picker) {
        if (!picker)
            return;
        const input = document.querySelector(`#${picker.dataset.dateInput}`);
        const grid = picker.querySelector("[data-date-grid]");
        const monthLabel = picker.querySelector("[data-date-month]");
        if (!input || !grid || !monthLabel)
            return;
        const monthStart = datePickerMonth(picker);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        const selected = input.value;
        const today = todayIso();
        const maxDate = picker.dataset.dateMax === "today" ? today : "";
        const offset = (monthStart.getDay() + 6) % 7;
        const cells = [];
        monthLabel.textContent = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(monthStart);
        for (let index = 0; index < offset; index += 1) {
            cells.push(`<span class="h-10 rounded-md"></span>`);
        }
        for (let day = 1; day <= monthEnd.getDate(); day += 1) {
            const value = isoDate(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
            const active = value === selected;
            const isToday = value === today;
            const disabled = maxDate && value > maxDate;
            cells.push(`
        <button class="h-10 rounded-md text-sm font-black transition ${active ? "bg-road text-white shadow-sm" : "bg-kerb text-ink hover:bg-signal"} ${isToday && !active ? "ring-2 ring-leaf/40" : ""} ${disabled ? "cursor-not-allowed opacity-35 hover:bg-kerb" : ""}" data-date-day="${value}" type="button" aria-pressed="${active}" ${disabled ? "disabled" : ""}>
          ${day}
        </button>
      `);
        }
        grid.innerHTML = cells.join("");
    }
    function dealStatus(deal) {
        if (!deal.published) {
            return {
                label: "Draft",
                description: "This deal is saved but hidden from the website.",
                className: "border-ink/10 bg-kerb text-ink"
            };
        }
        const today = todayIso();
        if (deal.valid_from && deal.valid_from > today) {
            return {
                label: "Scheduled",
                description: `This deal will appear on ${formatDateLabel(deal.valid_from, "")}.`,
                className: "border-road/20 bg-road/10 text-road"
            };
        }
        if (deal.valid_until && deal.valid_until < today) {
            return {
                label: "Expired",
                description: "This deal has passed its valid-until date and is hidden from the website.",
                className: "border-red-200 bg-red-50 text-red-800"
            };
        }
        return {
            label: "Active now",
            description: "This deal is visible on the website.",
            className: "border-leaf/25 bg-leaf/10 text-road"
        };
    }
    function updateDealStatusPreview() {
        var _a;
        if (!dealStatusPreview)
            return;
        const status = dealStatus({
            published: (_a = document.querySelector("#deal-published")) === null || _a === void 0 ? void 0 : _a.checked,
            valid_from: (dealValidFrom === null || dealValidFrom === void 0 ? void 0 : dealValidFrom.value) || null,
            valid_until: (dealValidUntil === null || dealValidUntil === void 0 ? void 0 : dealValidUntil.value) || null
        });
        dealStatusPreview.className = `rounded-md border p-4 text-sm leading-6 ${status.className}`;
        dealStatusPreview.innerHTML = `<p class="text-base font-black">${status.label}</p><p class="mt-1">${status.description}</p>`;
    }
    function isMissingDealsTable(error) {
        const message = String((error === null || error === void 0 ? void 0 : error.message) || "");
        return message.includes("current_deals") || message.includes("schema cache") || message.includes("Could not find the table");
    }
    function isMissingReviewsTable(error) {
        const message = String((error === null || error === void 0 ? void 0 : error.message) || "");
        return message.includes("reviews") || message.includes("schema cache") || message.includes("Could not find the table");
    }
    function ratingStars(rating) {
        const safeRating = Math.max(0, Math.min(5, Number.parseInt(String(rating || 0), 10) || 0));
        return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
    }
    function resetPostForm() {
        postForm.reset();
        postId.value = "";
        postImagePath.value = "";
        setDateValue("passed-at", todayIso());
        document.querySelector("#caption").value = "Student passed with no faults.";
        document.querySelector("#review").value = "";
        document.querySelector("#published").checked = true;
        postPhoto.required = true;
        postPhotoHelp.textContent = "JPEG, PNG, or WebP. Keep student consent on file before publishing.";
        postFormTitle.textContent = "Student passed with no faults";
        postSubmit.textContent = "Upload post";
        postCancelEdit.classList.add("hidden");
    }
    function resetDealForm() {
        dealForm.reset();
        dealId.value = "";
        document.querySelector("#deal-type").value = "pupil";
        document.querySelector("#deal-cta-label").value = "Ask about this deal";
        document.querySelector("#deal-sort-order").value = "1";
        setDateValue("deal-valid-from", "");
        setDateValue("deal-valid-until", "");
        document.querySelector("#deal-published").checked = true;
        dealFormTitle.textContent = "Learner offer";
        dealSubmit.textContent = "Save deal";
        dealCancelEdit.classList.add("hidden");
        updateDealStatusPreview();
    }
    function resetReviewForm() {
        reviewForm.reset();
        reviewId.value = "";
        document.querySelector("#review-rating").value = "5";
        document.querySelector("#review-visible").checked = true;
        document.querySelector("#review-featured").checked = false;
        reviewFormTitle.textContent = "Learner reviews";
        reviewSubmit.textContent = "Save review";
        reviewCancelEdit.classList.add("hidden");
    }
    function normalizeArea(area) {
        return {
            ...area,
            match_terms: Array.isArray(area.match_terms) ? area.match_terms : [],
            postcode_prefixes: Array.isArray(area.postcode_prefixes) ? area.postcode_prefixes : [],
            sort_order: Number.isFinite(Number(area.sort_order)) ? Number(area.sort_order) : 100
        };
    }
    function sortAreas(areaA, areaB) {
        const order = (Number(areaA.sort_order) || 100) - (Number(areaB.sort_order) || 100);
        if (order !== 0)
            return order;
        return String(areaA.name || "").localeCompare(String(areaB.name || ""), "en-GB");
    }
    function instructorAreas(instructor) {
        return Array.isArray(instructor.areas)
            ? instructor.areas.filter(Boolean).sort(sortAreas)
            : [];
    }
    function getInstructorAreaIds(instructor) {
        return instructorAreas(instructor).map((area) => area.id).filter(Boolean);
    }
    function setAreaSelection(areaIds) {
        const selected = new Set(areaIds);
        areaInputs().forEach((input) => {
            input.checked = selected.has(input.value);
        });
    }
    function selectedAreaIds() {
        return areaInputs()
            .filter((input) => input.checked)
            .map((input) => input.value);
    }
    function areaInputs() {
        return Array.from(document.querySelectorAll('input[name="area-ids"]'));
    }
    function areaLabel(areas) {
        return areas.map((area) => area.name).join(", ");
    }
    function commaList(value) {
        return String(value || "")
            .split(",")
            .map((part) => part.trim().toLowerCase())
            .filter(Boolean);
    }
    function clampNumber(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    function areaMapInputs() {
        return {
            x: document.querySelector("#area-map-x"),
            y: document.querySelector("#area-map-y")
        };
    }
    function areaStoredPointToSvg(mapX, mapY) {
        const storedX = Number(mapX);
        const storedY = Number(mapY);
        if (!Number.isFinite(storedX) || !Number.isFinite(storedY))
            return { x: areaMapCenterX, y: areaMapCenterY };
        if (storedX === 0 && storedY === 0)
            return { x: areaMapCenterX, y: areaMapCenterY };
        if (storedX >= 0 && storedX <= 100 && storedY >= 0 && storedY <= 100) {
            return { x: (storedX / 100) * areaMapWidth, y: (storedY / 100) * areaMapHeight };
        }
        if (storedX < 0 || storedY < 0) {
            return { x: areaMapCenterX + storedX, y: areaMapCenterY + storedY };
        }
        return { x: storedX, y: storedY };
    }
    function setAreaMapSvgPosition(svgX, svgY) {
        const safeSvgX = Math.round(clampNumber(Number(svgX) || areaMapCenterX, 0, areaMapWidth));
        const safeSvgY = Math.round(clampNumber(Number(svgY) || areaMapCenterY, 0, areaMapHeight));
        const { x, y } = areaMapInputs();
        if (x)
            x.value = String(Math.round((safeSvgX / areaMapWidth) * 10000) / 100);
        if (y)
            y.value = String(Math.round((safeSvgY / areaMapHeight) * 10000) / 100);
        ["#area-map-picker-marker-halo", "#area-map-picker-marker", "#area-map-picker-marker-dot"].forEach((selector) => {
            const marker = document.querySelector(selector);
            marker === null || marker === void 0 ? void 0 : marker.setAttribute("cx", String(safeSvgX));
            marker === null || marker === void 0 ? void 0 : marker.setAttribute("cy", String(safeSvgY));
        });
        if (areaMapPickerStatus) {
            areaMapPickerStatus.textContent = safeSvgX === areaMapCenterX && safeSvgY === areaMapCenterY
                ? "Marker is centred. Click the map, or use arrow keys, to place it where this area appears."
                : "Marker position selected.";
        }
    }
    function setAreaMapPosition(mapX, mapY) {
        const point = areaStoredPointToSvg(mapX, mapY);
        setAreaMapSvgPosition(point.x, point.y);
    }
    function chooseAreaMapPosition(event) {
        var _a, _b;
        if (!areaMapPicker)
            return;
        const svg = areaMapPicker.querySelector("svg");
        if (!svg)
            return;
        const rect = svg.getBoundingClientRect();
        const clientX = (_a = event.clientX) !== null && _a !== void 0 ? _a : rect.left + rect.width / 2;
        const clientY = (_b = event.clientY) !== null && _b !== void 0 ? _b : rect.top + rect.height / 2;
        const svgX = ((clientX - rect.left) / rect.width) * areaMapWidth;
        const svgY = ((clientY - rect.top) / rect.height) * areaMapHeight;
        setAreaMapSvgPosition(svgX, svgY);
    }
    function moveAreaMapPosition(event) {
        const { x, y } = areaMapInputs();
        const current = areaStoredPointToSvg((x === null || x === void 0 ? void 0 : x.value) || 50, (y === null || y === void 0 ? void 0 : y.value) || 50);
        const step = event.shiftKey ? 24 : 12;
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            setAreaMapSvgPosition(current.x - step, current.y);
        }
        else if (event.key === "ArrowRight") {
            event.preventDefault();
            setAreaMapSvgPosition(current.x + step, current.y);
        }
        else if (event.key === "ArrowUp") {
            event.preventDefault();
            setAreaMapSvgPosition(current.x, current.y - step);
        }
        else if (event.key === "ArrowDown") {
            event.preventDefault();
            setAreaMapSvgPosition(current.x, current.y + step);
        }
        else if (event.key === "Home") {
            event.preventDefault();
            setAreaMapSvgPosition(areaMapCenterX, areaMapCenterY);
        }
    }
    function renderAreaCheckboxes(selectedIds = []) {
        if (!mapKeys)
            return;
        if (cachedAreas.length === 0) {
            mapKeys.innerHTML = `<p class="rounded-md border border-ink/10 bg-kerb px-4 py-3 text-sm font-bold text-ink/60">Add at least one visible area before assigning instructors.</p>`;
            return;
        }
        const selected = new Set(selectedIds);
        mapKeys.innerHTML = cachedAreas.map((area) => `
      <label class="flex items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-bold text-ink transition has-[:checked]:border-leaf has-[:checked]:bg-kerb">
        <input class="h-5 w-5 rounded border-ink/20 text-leaf" name="area-ids" type="checkbox" value="${escapeHtml(area.id)}" ${selected.has(area.id) ? "checked" : ""}>
        ${escapeHtml(area.name)}
      </label>
    `).join("");
    }
    function resetInstructorForm() {
        instructorForm.reset();
        instructorId.value = "";
        instructorCurrentPhotoPath.value = "";
        renderAreaCheckboxes(cachedAreas.filter((area) => area.is_primary).map((area) => area.id));
        document.querySelector("#instructor-active").checked = true;
        instructorFormTitle.textContent = "Instructors and areas";
        instructorSubmit.textContent = "Add instructor";
        instructorCancelEdit.classList.add("hidden");
    }
    function resetAreaForm() {
        areaForm.reset();
        areaId.value = "";
        setAreaMapPosition(0, 0);
        document.querySelector("#area-sort-order").value = "100";
        document.querySelector("#area-visible").checked = true;
        document.querySelector("#area-primary").checked = false;
        areaFormTitle.textContent = "Lesson areas";
        areaSubmit.textContent = "Add area";
        areaCancelEdit.classList.add("hidden");
    }
    function resetAdminUserForm() {
        adminUserForm.reset();
        adminUserId.value = "";
        adminUserEmail.disabled = false;
        adminUserEmail.required = true;
        adminUserPassword.required = false;
        adminUserPassword.value = "";
        adminUserActive.checked = true;
        adminUserRole.value = "admin";
        adminUserPasswordHelp.textContent = "New admins receive a Supabase email link to set their password. Existing admins can be sent a reset email from the admin list.";
        adminUserSubmit.textContent = "Create admin";
        adminUserCancelEdit.classList.add("hidden");
    }
    function passwordMeetsPolicy(password) {
        return password.length >= 12 &&
            /[a-z]/.test(password) &&
            /[A-Z]/.test(password) &&
            /\d/.test(password) &&
            /[^A-Za-z0-9]/.test(password);
    }
    async function loadSession() {
        var _a;
        const { data } = await client.auth.getSession();
        if ((_a = data.session) === null || _a === void 0 ? void 0 : _a.user) {
            if (isPasswordRecoveryRoute()) {
                setPasswordRecoveryMode(data.session.user);
            }
            else {
                setAuthenticated(data.session.user);
            }
        }
        else {
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
            const postImageUrl = safeImageUrl(post.image_url);
            const image = postImageUrl
                ? `<img class="h-28 w-full rounded-md object-cover sm:w-28" src="${escapeHtml(postImageUrl)}" alt="" loading="lazy" decoding="async">`
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
    async function loadAdminDeals() {
        adminDeals.innerHTML = `<p class="text-sm text-ink/60">Loading deals...</p>`;
        const { data, error } = await client
            .from("current_deals")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false });
        dealsSupportFeatured = Boolean((data || []).some((deal) => Object.prototype.hasOwnProperty.call(deal, "is_featured")));
        if (error) {
            cachedDeals = [];
            adminDeals.innerHTML = `<p class="text-sm text-ink/60">No active deals yet.</p>`;
            return;
        }
        if (!data || data.length === 0) {
            cachedDeals = [];
            adminDeals.innerHTML = `<p class="text-sm text-ink/60">No active deals yet.</p>`;
            return;
        }
        cachedDeals = data;
        adminDeals.innerHTML = data.map((deal) => {
            const status = dealStatus(deal);
            const featured = deal.is_featured ? "Featured" : "Standard";
            const dealType = deal.deal_type === "pupil" ? "Pupil" : deal.deal_type || "Deal";
            const validFrom = deal.valid_from
                ? `Starts ${formatDateLabel(deal.valid_from, "")}`
                : "Starts immediately";
            const validUntil = deal.valid_until
                ? `Ends ${formatDateLabel(deal.valid_until, "")}`
                : "No end date";
            const details = deal.details ? `<p class="mt-2 text-sm leading-6 text-ink/70">${escapeHtml(deal.details)}</p>` : "";
            const featuredButton = dealsSupportFeatured
                ? `<button class="toggle-deal-featured rounded-md border border-ink/15 px-4 py-2 text-sm font-bold text-ink transition hover:border-leaf hover:text-leaf" data-deal-id="${deal.id}" type="button">${deal.is_featured ? "Unfeature" : "Feature"}</button>`
                : "";
            return `
        <article class="rounded-md border border-ink/10 p-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-black">${escapeHtml(deal.title)}</h3>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${escapeHtml(dealType)}</span>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${escapeHtml(featured)}</span>
                <span class="rounded-md border px-3 py-1 text-xs font-black ${status.className}">${escapeHtml(status.label)}</span>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">Order ${escapeHtml(deal.sort_order)}</span>
              </div>
              <p class="mt-2 text-sm font-bold text-leaf">${escapeHtml(`${validFrom} · ${validUntil}`)}</p>
              <p class="mt-1 text-sm text-ink/62">${escapeHtml(status.description)}</p>
              <p class="mt-2 text-sm leading-6 text-ink/70">${escapeHtml(deal.summary)}</p>
              ${details}
              <p class="mt-2 text-sm font-bold text-road">${escapeHtml(deal.cta_label || "Ask about this deal")}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="edit-deal rounded-md bg-kerb px-4 py-2 text-sm font-bold text-road transition hover:bg-signal hover:text-ink" data-deal-id="${deal.id}" type="button">Edit</button>
              ${featuredButton}
              <button class="delete-deal rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50" data-deal-id="${deal.id}" type="button">Delete</button>
            </div>
          </div>
        </article>
      `;
        }).join("");
    }
    async function loadAdminReviews() {
        adminReviews.innerHTML = `<p class="text-sm text-ink/60">Loading reviews...</p>`;
        const { data, error } = await client
            .from("reviews")
            .select("id, reviewer_name, rating, review_text, is_featured, is_visible, created_at, updated_at")
            .order("is_featured", { ascending: false })
            .order("rating", { ascending: false })
            .order("created_at", { ascending: false });
        if (error) {
            cachedReviews = [];
            const message = isMissingReviewsTable(error)
                ? "Reviews storage is not installed yet. Apply the reviews migration or supabase/schema.sql, then refresh this page."
                : "Could not load reviews. Confirm this user is in public.admin_users.";
            adminReviews.innerHTML = `<p class="text-sm text-red-700">${escapeHtml(message)}</p>`;
            return;
        }
        if (!data || data.length === 0) {
            cachedReviews = [];
            adminReviews.innerHTML = `<p class="text-sm text-ink/60">No reviews yet.</p>`;
            return;
        }
        cachedReviews = data;
        adminReviews.innerHTML = data.map((review) => {
            const created = review.created_at
                ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(review.created_at))
                : "No date";
            const visibility = review.is_visible ? "Visible" : "Hidden";
            const featured = review.is_featured ? "Featured" : "Standard";
            return `
        <article class="rounded-md border border-ink/10 p-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-black">${escapeHtml(review.reviewer_name)}</h3>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${escapeHtml(visibility)}</span>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${escapeHtml(featured)}</span>
              </div>
              <p class="mt-2 text-sm font-black text-signal" aria-label="${escapeHtml(`${review.rating} out of 5 stars`)}">${ratingStars(review.rating)}</p>
              <p class="mt-1 text-xs font-bold text-leaf">Added ${created}</p>
              <blockquote class="mt-3 max-w-3xl text-sm leading-6 text-ink/72">"${escapeHtml(review.review_text)}"</blockquote>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="edit-review rounded-md bg-kerb px-4 py-2 text-sm font-bold text-road transition hover:bg-signal hover:text-ink" data-review-id="${review.id}" type="button">Edit</button>
              <button class="toggle-review-visible rounded-md border border-ink/15 px-4 py-2 text-sm font-bold text-ink transition hover:border-leaf hover:text-leaf" data-review-id="${review.id}" type="button">${review.is_visible ? "Hide" : "Show"}</button>
              <button class="toggle-review-featured rounded-md border border-ink/15 px-4 py-2 text-sm font-bold text-ink transition hover:border-leaf hover:text-leaf" data-review-id="${review.id}" type="button">${review.is_featured ? "Unfeature" : "Feature"}</button>
              <button class="delete-review rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50" data-review-id="${review.id}" type="button">Delete</button>
            </div>
          </div>
        </article>
      `;
        }).join("");
    }
    async function loadAdminAreas() {
        if (!adminAreas)
            return;
        adminAreas.innerHTML = `<p class="text-sm text-ink/60">Loading areas...</p>`;
        const { data, error } = await client
            .from("areas")
            .select("id, name, slug, is_visible, map_x, map_y, is_primary, match_terms, postcode_prefixes, sort_order, updated_at, created_at")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true });
        if (error) {
            cachedAreas = [];
            adminAreas.innerHTML = `<p class="text-sm text-red-700">Could not load areas. Confirm the area migration is installed.</p>`;
            renderAreaCheckboxes();
            return;
        }
        cachedAreas = (data || []).map(normalizeArea).sort(sortAreas);
        renderAreaCheckboxes();
        if (cachedAreas.length === 0) {
            adminAreas.innerHTML = `<p class="text-sm text-ink/60">No areas yet.</p>`;
            return;
        }
        adminAreas.innerHTML = cachedAreas.map((area) => {
            const status = area.is_visible ? "Visible" : "Hidden";
            const primary = area.is_primary ? "Primary" : "Standard";
            const prefixes = area.postcode_prefixes.length > 0 ? area.postcode_prefixes.join(", ") : "No prefixes";
            const terms = area.match_terms.length > 0 ? area.match_terms.join(", ") : "Name only";
            const markerStatus = Number(area.map_x) === 0 && Number(area.map_y) === 0 ? "Centred marker" : "Custom marker position";
            return `
        <article class="rounded-md border border-ink/10 p-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-black">${escapeHtml(area.name)}</h3>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${escapeHtml(status)}</span>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${escapeHtml(primary)}</span>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">Order ${escapeHtml(area.sort_order)}</span>
              </div>
              <p class="mt-2 text-sm font-bold text-leaf">${escapeHtml(area.slug)}</p>
              <p class="mt-2 text-sm leading-6 text-ink/70">${escapeHtml(markerStatus)}</p>
              <p class="mt-1 text-sm leading-6 text-ink/62">Prefixes: ${escapeHtml(prefixes)}</p>
              <p class="mt-1 text-sm leading-6 text-ink/62">Search terms: ${escapeHtml(terms)}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="edit-area rounded-md bg-kerb px-4 py-2 text-sm font-bold text-road transition hover:bg-signal hover:text-ink" data-area-id="${area.id}" type="button">Edit</button>
              <button class="toggle-area-visible rounded-md border border-ink/15 px-4 py-2 text-sm font-bold text-ink transition hover:border-leaf hover:text-leaf" data-area-id="${area.id}" type="button">${area.is_visible ? "Hide" : "Show"}</button>
              <button class="delete-area rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50" data-area-id="${area.id}" type="button">Delete</button>
            </div>
          </div>
        </article>
      `;
        }).join("");
    }
    async function loadAdminInstructors() {
        adminInstructors.innerHTML = `<p class="text-sm text-ink/60">Loading instructors...</p>`;
        if (cachedAreas.length === 0) {
            await loadAdminAreas();
        }
        const { data, error } = await client
            .from("instructors")
            .select("id, name, transmission, phone, bio, profile_bio, photo_path, photo_url, active")
            .order("name", { ascending: true });
        if (error) {
            adminInstructors.innerHTML = `<p class="text-sm text-red-700">Could not load instructors. Confirm the instructors table and RLS policies are installed. ${escapeHtml(error.message || "")}</p>`;
            return;
        }
        if (!data || data.length === 0) {
            cachedInstructors = [];
            adminInstructors.innerHTML = `<p class="text-sm text-ink/60">No instructors yet.</p>`;
            return;
        }
        const instructorIds = data.map((instructor) => instructor.id).filter(Boolean);
        const { data: assignments, error: assignmentError } = await client
            .from("instructor_areas")
            .select("instructor_id, area_id")
            .in("instructor_id", instructorIds);
        if (assignmentError) {
            adminInstructors.innerHTML = `<p class="text-sm text-red-700">Could not load instructor area assignments. Confirm the instructor_areas table and RLS policies are installed. ${escapeHtml(assignmentError.message || "")}</p>`;
            return;
        }
        const areasById = new Map(cachedAreas.map((area) => [area.id, area]));
        const assignmentsByInstructor = new Map();
        (assignments || []).forEach((assignment) => {
            const area = areasById.get(assignment.area_id);
            if (!area)
                return;
            const instructorAreas = assignmentsByInstructor.get(assignment.instructor_id) || [];
            instructorAreas.push(area);
            assignmentsByInstructor.set(assignment.instructor_id, instructorAreas);
        });
        cachedInstructors = data.map((instructor) => ({
            ...instructor,
            areas: assignmentsByInstructor.get(instructor.id) || []
        }));
        adminInstructors.innerHTML = cachedInstructors.map((instructor) => {
            const status = instructor.active ? "Visible" : "Hidden";
            const phone = instructor.phone ? `<p class="mt-1 text-sm text-ink/60">${escapeHtml(instructor.phone)}</p>` : "";
            const profileDescription = instructor.profile_bio ? `<p class="mt-2 text-sm leading-6 text-ink/70">${escapeHtml(instructor.profile_bio)}</p>` : "";
            const assignedAreas = instructorAreas(instructor);
            const assignedAreaLabel = areaLabel(assignedAreas) || "No areas assigned";
            const instructorPhotoUrl = safeImageUrl(instructor.photo_url);
            const photo = instructorPhotoUrl
                ? `<img class="h-20 w-20 rounded-md object-cover" src="${escapeHtml(instructorPhotoUrl)}" alt="" loading="lazy" decoding="async">`
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
                  <span class="rounded bg-kerb px-2 py-1 text-xs font-bold">${escapeHtml(assignedAreaLabel)}</span>
                </div>
                <p class="mt-1 text-sm font-bold text-leaf">${escapeHtml(assignedAreaLabel)}</p>
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
        if (!settingsForm)
            return;
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
            if (input)
                input.value = settings[key] || settingDefaults[key] || "";
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
                }
                catch (_parseError) {
                    message = error.message || message;
                }
            }
            throw new Error(message);
        }
        if (data === null || data === void 0 ? void 0 : data.error) {
            throw new Error(data.error);
        }
        return data;
    }
    async function loadAdminUsers() {
        adminUsers.innerHTML = `<p class="text-sm text-ink/60">Loading admins...</p>`;
        try {
            const data = await invokeAdminUsers({ action: "list" });
            cachedAdminUsers = data.admins || [];
        }
        catch (error) {
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
        if (!value)
            return "";
        return new Date(value).toISOString().slice(0, 10);
    }
    function editPost(id) {
        const post = cachedPosts.find((item) => item.id === id);
        if (!post)
            return;
        showAdminView("passes");
        postId.value = post.id;
        postImagePath.value = post.image_path || "";
        document.querySelector("#student-name").value = post.student_name || "";
        setDateValue("passed-at", dateInputValue(post.passed_at));
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
    function editDeal(id) {
        var _a;
        const deal = cachedDeals.find((item) => item.id === id);
        if (!deal)
            return;
        showAdminView("deals");
        dealId.value = deal.id;
        document.querySelector("#deal-type").value = deal.deal_type || "pupil";
        document.querySelector("#deal-title").value = deal.title || "";
        document.querySelector("#deal-summary").value = deal.summary || "";
        document.querySelector("#deal-details").value = deal.details || "";
        document.querySelector("#deal-cta-label").value = deal.cta_label || "Ask about this deal";
        document.querySelector("#deal-sort-order").value = String((_a = deal.sort_order) !== null && _a !== void 0 ? _a : 100);
        setDateValue("deal-valid-from", dateInputValue(deal.valid_from));
        setDateValue("deal-valid-until", dateInputValue(deal.valid_until));
        document.querySelector("#deal-published").checked = Boolean(deal.published);
        dealFormTitle.textContent = `Edit ${deal.title || "deal"}`;
        dealSubmit.textContent = "Save deal";
        dealCancelEdit.classList.remove("hidden");
        updateDealStatusPreview();
        dealForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function editReview(id) {
        var _a;
        const review = cachedReviews.find((item) => item.id === id);
        if (!review)
            return;
        showAdminView("reviews");
        reviewId.value = review.id;
        document.querySelector("#reviewer-name").value = review.reviewer_name || "";
        document.querySelector("#review-rating").value = String((_a = review.rating) !== null && _a !== void 0 ? _a : 5);
        document.querySelector("#review-text").value = review.review_text || "";
        document.querySelector("#review-visible").checked = Boolean(review.is_visible);
        document.querySelector("#review-featured").checked = Boolean(review.is_featured);
        reviewFormTitle.textContent = `Edit ${review.reviewer_name || "review"}`;
        reviewSubmit.textContent = "Save review";
        reviewCancelEdit.classList.remove("hidden");
        reviewForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function editArea(id) {
        var _a;
        const area = cachedAreas.find((item) => item.id === id);
        if (!area)
            return;
        showAdminView("areas");
        setPanelOpen(areaFormPanel, toggleAreaForm, true, areaListPanel);
        areaId.value = area.id;
        document.querySelector("#area-name").value = area.name || "";
        document.querySelector("#area-slug").value = area.slug || "";
        setAreaMapPosition(Number.isFinite(Number(area.map_x)) ? Number(area.map_x) : 0, Number.isFinite(Number(area.map_y)) ? Number(area.map_y) : 0);
        document.querySelector("#area-sort-order").value = String((_a = area.sort_order) !== null && _a !== void 0 ? _a : 100);
        document.querySelector("#area-postcode-prefixes").value = area.postcode_prefixes.join(", ");
        document.querySelector("#area-match-terms").value = area.match_terms.join(", ");
        document.querySelector("#area-visible").checked = Boolean(area.is_visible);
        document.querySelector("#area-primary").checked = Boolean(area.is_primary);
        areaFormTitle.textContent = `Edit ${area.name || "area"}`;
        areaSubmit.textContent = "Save area";
        areaCancelEdit.classList.remove("hidden");
        areaForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function editInstructor(id) {
        const instructor = cachedInstructors.find((item) => item.id === id);
        if (!instructor)
            return;
        showAdminView("instructors");
        setPanelOpen(instructorFormPanel, toggleInstructorForm, true, instructorListPanel);
        instructorId.value = instructor.id;
        instructorCurrentPhotoPath.value = instructor.photo_path || "";
        document.querySelector("#instructor-name").value = instructor.name || "";
        renderAreaCheckboxes(getInstructorAreaIds(instructor));
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
        if (!admin)
            return;
        showAdminView("admins");
        setPanelOpen(adminUserFormPanel, toggleAdminUserForm, true, adminUserListPanel);
        adminUserId.value = admin.user_id;
        adminUserEmail.value = admin.email || "";
        adminUserEmail.disabled = true;
        adminUserEmail.required = false;
        adminUserName.value = admin.full_name || "";
        adminUserRole.value = admin.role || "admin";
        adminUserActive.checked = Boolean(admin.active);
        adminUserPassword.value = "";
        adminUserPassword.required = false;
        adminUserPasswordHelp.textContent = "Save access details here. Use Reset password to send this admin a Supabase password reset email.";
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
        setAuthenticated(data.user, true);
    });
    passwordResetForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const password = newPassword.value.trim();
        const confirmation = confirmPassword.value.trim();
        if (!passwordMeetsPolicy(password)) {
            setMessage(passwordResetMessage, passwordRequirements, true);
            return;
        }
        if (password !== confirmation) {
            setMessage(passwordResetMessage, "Passwords do not match.", true);
            return;
        }
        setMessage(passwordResetMessage, "Updating password...", false);
        const { error } = await client.auth.updateUser({ password });
        if (error) {
            setMessage(passwordResetMessage, error.message, true);
            return;
        }
        await client.auth.signOut();
        window.history.replaceState(null, "", window.location.pathname);
        setSignedOut();
        setMessage(loginMessage, "Password updated. Sign in with your new password.", false);
    });
    signOutButton.addEventListener("click", async () => {
        await client.auth.signOut();
        setSignedOut();
        window.location.href = "../home/";
    });
    postForm.addEventListener("submit", async (event) => {
        var _a, _b;
        event.preventDefault();
        setMessage(postMessage, "Saving post...", false);
        const formData = new FormData(postForm);
        const editingPostId = String(formData.get("post-id")).trim();
        const passedAtValue = String(formData.get("passed-at") || "").trim();
        const photo = formData.get("photo");
        let uploadPhoto = null;
        let filePath = String(formData.get("post-image-path")).trim() || null;
        let imageUrl = null;
        let uploadedNewPhoto = false;
        if (!editingPostId && (!photo || photo.size === 0)) {
            setMessage(postMessage, "Choose a photo before uploading.", true);
            return;
        }
        if (photo && photo.size > 0) {
            try {
                uploadPhoto = await preparePhotoForUpload(photo, "pass-photo");
            }
            catch (error) {
                setMessage(postMessage, error instanceof Error ? error.message : "Photo must be a JPEG, PNG, or WebP under 5MB.", true);
                return;
            }
        }
        if (!passedAtValue) {
            setMessage(postMessage, "Choose the pass date.", true);
            return;
        }
        if (passedAtValue > todayIso()) {
            setMessage(postMessage, "Pass date cannot be in the future.", true);
            return;
        }
        const { data: sessionData } = await client.auth.getSession();
        const userId = (_b = (_a = sessionData.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!userId) {
            setMessage(postMessage, "Your session expired. Sign in again.", true);
            setSignedOut();
            return;
        }
        if (uploadPhoto) {
            setMessage(postMessage, "Uploading photo...", false);
            filePath = `${userId}/${cleanFileName(uploadPhoto, "pass-photo")}`;
            const { error: uploadError } = await client.storage
                .from(window.KS_SUPABASE.bucket)
                .upload(filePath, uploadPhoto, {
                cacheControl: "3600",
                upsert: false,
                contentType: uploadPhoto.type
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
            passed_at: passedAtValue,
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
    dealForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setMessage(dealMessage, "Saving deal...", false);
        const formData = new FormData(dealForm);
        const editingDealId = String(formData.get("deal-id")).trim();
        const sortOrder = Number.parseInt(String(formData.get("deal-sort-order") || "1"), 10);
        const dealPayload = {
            deal_type: String(formData.get("deal-type") || "pupil"),
            title: String(formData.get("deal-title")).trim(),
            summary: String(formData.get("deal-summary")).trim(),
            details: String(formData.get("deal-details")).trim() || null,
            cta_label: String(formData.get("deal-cta-label")).trim() || "Ask about this deal",
            sort_order: Number.isFinite(sortOrder) ? Math.max(1, sortOrder) : 1,
            valid_from: String(formData.get("deal-valid-from")).trim() || null,
            valid_until: String(formData.get("deal-valid-until")).trim() || null,
            published: formData.get("deal-published") === "on",
            updated_at: new Date().toISOString()
        };
        if (dealPayload.deal_type !== "pupil") {
            setMessage(dealMessage, "Only pupil deals are supported right now.", true);
            return;
        }
        if (!dealPayload.title || !dealPayload.summary || !dealPayload.cta_label) {
            setMessage(dealMessage, "Title, summary, and button label are required.", true);
            return;
        }
        if (dealPayload.valid_from && dealPayload.valid_until && dealPayload.valid_from > dealPayload.valid_until) {
            setMessage(dealMessage, "Valid from must be before valid until.", true);
            return;
        }
        const { error } = editingDealId
            ? await client.from("current_deals").update(dealPayload).eq("id", editingDealId)
            : await client.from("current_deals").insert(dealPayload);
        if (error) {
            const message = isMissingDealsTable(error)
                ? "Deals storage is not installed yet. Apply supabase/schema.sql to the Supabase project, then refresh this page."
                : error.message;
            setMessage(dealMessage, message, true);
            return;
        }
        resetDealForm();
        setMessage(dealMessage, editingDealId ? "Deal updated." : "Deal created.", false);
        loadAdminDeals();
    });
    reviewForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setMessage(reviewMessage, "Saving review...", false);
        const formData = new FormData(reviewForm);
        const editingReviewId = String(formData.get("review-id")).trim();
        const rating = Number.parseInt(String(formData.get("review-rating") || "5"), 10);
        const reviewPayload = {
            reviewer_name: String(formData.get("reviewer-name")).trim(),
            rating: Number.isFinite(rating) ? rating : 5,
            review_text: String(formData.get("review-text")).trim(),
            is_visible: formData.get("review-visible") === "on",
            is_featured: formData.get("review-featured") === "on"
        };
        if (!reviewPayload.reviewer_name || !reviewPayload.review_text) {
            setMessage(reviewMessage, "Reviewer name and review text are required.", true);
            return;
        }
        if (reviewPayload.rating < 0 || reviewPayload.rating > 5) {
            setMessage(reviewMessage, "Rating must be between 0 and 5.", true);
            return;
        }
        const { error } = editingReviewId
            ? await client.from("reviews").update(reviewPayload).eq("id", editingReviewId)
            : await client.from("reviews").insert(reviewPayload);
        if (error) {
            const message = isMissingReviewsTable(error)
                ? "Reviews storage is not installed yet. Apply the reviews migration or supabase/schema.sql, then refresh this page."
                : error.message;
            setMessage(reviewMessage, message, true);
            return;
        }
        resetReviewForm();
        setMessage(reviewMessage, editingReviewId ? "Review updated." : "Review created.", false);
        loadAdminReviews();
    });
    areaForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setMessage(areaMessage, "Saving area...", false);
        const formData = new FormData(areaForm);
        const editingAreaId = String(formData.get("area-id")).trim();
        const name = String(formData.get("area-name")).trim();
        const slug = slugify(formData.get("area-slug") || name);
        const mapX = Number(formData.get("area-map-x"));
        const mapY = Number(formData.get("area-map-y"));
        const sortOrder = Number(formData.get("area-sort-order"));
        const matchTerms = commaList(formData.get("area-match-terms"));
        const postcodePrefixes = commaList(formData.get("area-postcode-prefixes")).map((prefix) => prefix.replace(/\s+/g, ""));
        if (!name || !slug) {
            setMessage(areaMessage, "Area name and slug are required.", true);
            return;
        }
        if (!Number.isFinite(mapX) || mapX < 0 || mapX > 100 || !Number.isFinite(mapY) || mapY < 0 || mapY > 100) {
            setMessage(areaMessage, "Choose a marker position inside the coverage map.", true);
            return;
        }
        const areaPayload = {
            name,
            slug,
            is_visible: formData.get("area-visible") === "on",
            map_x: mapX,
            map_y: mapY,
            is_primary: formData.get("area-primary") === "on",
            sort_order: Number.isFinite(sortOrder) ? sortOrder : 100,
            match_terms: matchTerms.length > 0 ? matchTerms : [name.toLowerCase()],
            postcode_prefixes: postcodePrefixes
        };
        const { error } = editingAreaId
            ? await client.from("areas").update(areaPayload).eq("id", editingAreaId)
            : await client.from("areas").insert(areaPayload);
        if (error) {
            setMessage(areaMessage, error.message, true);
            return;
        }
        resetAreaForm();
        setPanelOpen(areaFormPanel, toggleAreaForm, false, areaListPanel);
        setMessage(areaMessage, editingAreaId ? "Area updated." : "Area created.", false);
        await loadAdminAreas();
        loadAdminInstructors();
    });
    instructorForm.addEventListener("submit", async (event) => {
        var _a, _b;
        event.preventDefault();
        setMessage(instructorMessage, "Saving instructor...", false);
        const formData = new FormData(instructorForm);
        const photo = formData.get("instructor-photo");
        let uploadPhoto = null;
        const editingInstructorId = String(formData.get("instructor-id")).trim();
        const oldPhotoPath = String(formData.get("instructor-current-photo-path")).trim();
        const name = String(formData.get("instructor-name")).trim();
        const assignedAreaIds = selectedAreaIds();
        let photoPath = oldPhotoPath || null;
        let photoUrl = null;
        let uploadedNewPhoto = false;
        if (assignedAreaIds.length === 0) {
            setMessage(instructorMessage, "Choose at least one lesson area.", true);
            return;
        }
        if (photo && photo.size > 0) {
            try {
                uploadPhoto = await preparePhotoForUpload(photo, "instructor-photo");
            }
            catch (error) {
                setMessage(instructorMessage, error instanceof Error ? error.message : "Photo must be a JPEG, PNG, or WebP under 5MB.", true);
                return;
            }
        }
        if (uploadPhoto) {
            const { data: sessionData } = await client.auth.getSession();
            const userId = (_b = (_a = sessionData.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
            if (!userId) {
                setMessage(instructorMessage, "Your session expired. Sign in again.", true);
                setSignedOut();
                return;
            }
            photoPath = `${userId}/instructors/${cleanFileName(uploadPhoto, "instructor-photo")}`;
            const { error: uploadError } = await client.storage
                .from(window.KS_SUPABASE.bucket)
                .upload(photoPath, uploadPhoto, {
                cacheControl: "3600",
                upsert: false,
                contentType: uploadPhoto.type
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
        let savedInstructorId = editingInstructorId;
        if (!savedInstructorId) {
            const { data: createdInstructor, error: lookupError } = await client
                .from("instructors")
                .select("id")
                .eq("slug", instructorPayload.slug)
                .maybeSingle();
            if (lookupError || !(createdInstructor === null || createdInstructor === void 0 ? void 0 : createdInstructor.id)) {
                setMessage(instructorMessage, (lookupError === null || lookupError === void 0 ? void 0 : lookupError.message) || "Instructor saved, but area assignment could not be confirmed.", true);
                return;
            }
            savedInstructorId = createdInstructor.id;
        }
        const { error: deleteAreaError } = await client
            .from("instructor_areas")
            .delete()
            .eq("instructor_id", savedInstructorId);
        if (deleteAreaError) {
            setMessage(instructorMessage, deleteAreaError.message, true);
            return;
        }
        const areaRows = assignedAreaIds.map((assignedAreaId) => ({
            instructor_id: savedInstructorId,
            area_id: assignedAreaId
        }));
        const { error: insertAreaError } = await client
            .from("instructor_areas")
            .insert(areaRows);
        if (insertAreaError) {
            setMessage(instructorMessage, insertAreaError.message, true);
            return;
        }
        if (editingInstructorId && uploadedNewPhoto && oldPhotoPath) {
            await client.storage.from(window.KS_SUPABASE.bucket).remove([oldPhotoPath]);
        }
        resetInstructorForm();
        setPanelOpen(instructorFormPanel, toggleInstructorForm, false, instructorListPanel);
        setMessage(instructorMessage, editingInstructorId ? "Instructor updated." : "Instructor added.", false);
        loadAdminInstructors();
    });
    settingsForm.addEventListener("submit", async (event) => {
        var _a, _b;
        event.preventDefault();
        setMessage(settingsMessage, "Saving site settings...", false);
        const formData = new FormData(settingsForm);
        const { data: sessionData } = await client.auth.getSession();
        const userId = (_b = (_a = sessionData.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
        const rows = Object.entries(settingLabels).map(([key, label]) => ({
            key,
            label,
            value: String(formData.get(key)).trim(),
            public: true,
            updated_by: userId || null,
            updated_at: new Date().toISOString()
        }));
        if (rows.some((row) => row.key !== "deals_details" && row.value.length === 0)) {
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
        try {
            if (editingAdminId) {
                await invokeAdminUsers({
                    action: "update",
                    userId: editingAdminId,
                    fullName: formData.get("admin-user-name"),
                    role: formData.get("admin-user-role"),
                    active: formData.get("admin-user-active") === "on"
                });
                setMessage(adminUserMessage, "Admin updated.", false);
            }
            else {
                await invokeAdminUsers({
                    action: "create",
                    email: formData.get("admin-user-email"),
                    fullName: formData.get("admin-user-name"),
                    role: formData.get("admin-user-role")
                });
                setMessage(adminUserMessage, "Admin created and password setup email sent.", false);
            }
        }
        catch (error) {
            setMessage(adminUserMessage, error.message, true);
            return;
        }
        resetAdminUserForm();
        setPanelOpen(adminUserFormPanel, toggleAdminUserForm, false, adminUserListPanel);
        loadAdminUsers();
    });
    adminInstructors.addEventListener("click", async (event) => {
        const editButton = event.target.closest(".edit-instructor");
        if (editButton) {
            editInstructor(editButton.dataset.instructorId);
            return;
        }
        const button = event.target.closest(".delete-instructor");
        if (!button)
            return;
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
    adminAreas.addEventListener("click", async (event) => {
        const editButton = event.target.closest(".edit-area");
        if (editButton) {
            editArea(editButton.dataset.areaId);
            return;
        }
        const visibleButton = event.target.closest(".toggle-area-visible");
        if (visibleButton) {
            const area = cachedAreas.find((item) => item.id === visibleButton.dataset.areaId);
            if (!area)
                return;
            const { error } = await client
                .from("areas")
                .update({ is_visible: !area.is_visible })
                .eq("id", area.id);
            if (error) {
                setMessage(areaMessage, error.message, true);
                return;
            }
            setMessage(areaMessage, area.is_visible ? "Area hidden." : "Area visible.", false);
            await loadAdminAreas();
            loadAdminInstructors();
            return;
        }
        const deleteButton = event.target.closest(".delete-area");
        if (!deleteButton)
            return;
        const { error } = await client
            .from("areas")
            .delete()
            .eq("id", deleteButton.dataset.areaId);
        if (error) {
            setMessage(areaMessage, error.message, true);
            return;
        }
        if (areaId.value === deleteButton.dataset.areaId) {
            resetAreaForm();
            setPanelOpen(areaFormPanel, toggleAreaForm, false, areaListPanel);
        }
        setMessage(areaMessage, "Area deleted.", false);
        await loadAdminAreas();
        loadAdminInstructors();
    });
    adminPosts.addEventListener("click", async (event) => {
        const editButton = event.target.closest(".edit-post");
        if (editButton) {
            editPost(editButton.dataset.postId);
            return;
        }
        const deleteButton = event.target.closest(".delete-post");
        if (!deleteButton)
            return;
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
    adminDeals.addEventListener("click", async (event) => {
        const editButton = event.target.closest(".edit-deal");
        if (editButton) {
            editDeal(editButton.dataset.dealId);
            return;
        }
        const featuredButton = event.target.closest(".toggle-deal-featured");
        if (featuredButton) {
            const deal = cachedDeals.find((item) => item.id === featuredButton.dataset.dealId);
            if (!deal)
                return;
            if (deal.is_featured) {
                const { error } = await client
                    .from("current_deals")
                    .update({ is_featured: false })
                    .eq("id", deal.id);
                if (error) {
                    setMessage(dealMessage, error.message, true);
                    return;
                }
                setMessage(dealMessage, "Deal removed from featured.", false);
                loadAdminDeals();
                return;
            }
            const { error: clearError } = await client
                .from("current_deals")
                .update({ is_featured: false })
                .eq("deal_type", deal.deal_type || "pupil");
            if (clearError) {
                setMessage(dealMessage, clearError.message, true);
                return;
            }
            const { error: featureError } = await client
                .from("current_deals")
                .update({ is_featured: true })
                .eq("id", deal.id);
            if (featureError) {
                setMessage(dealMessage, featureError.message, true);
                return;
            }
            setMessage(dealMessage, "Deal featured. Other deals were unfeatured.", false);
            loadAdminDeals();
            return;
        }
        const deleteButton = event.target.closest(".delete-deal");
        if (!deleteButton)
            return;
        const { error } = await client
            .from("current_deals")
            .delete()
            .eq("id", deleteButton.dataset.dealId);
        if (error) {
            const message = isMissingDealsTable(error)
                ? "Deals storage is not installed yet. Apply supabase/schema.sql to the Supabase project, then refresh this page."
                : error.message;
            setMessage(dealMessage, message, true);
            return;
        }
        if (dealId.value === deleteButton.dataset.dealId) {
            resetDealForm();
        }
        setMessage(dealMessage, "Deal deleted.", false);
        loadAdminDeals();
    });
    adminReviews.addEventListener("click", async (event) => {
        const editButton = event.target.closest(".edit-review");
        if (editButton) {
            editReview(editButton.dataset.reviewId);
            return;
        }
        const visibleButton = event.target.closest(".toggle-review-visible");
        if (visibleButton) {
            const review = cachedReviews.find((item) => item.id === visibleButton.dataset.reviewId);
            if (!review)
                return;
            const { error } = await client
                .from("reviews")
                .update({ is_visible: !review.is_visible })
                .eq("id", review.id);
            if (error) {
                setMessage(reviewMessage, error.message, true);
                return;
            }
            setMessage(reviewMessage, review.is_visible ? "Review hidden." : "Review visible.", false);
            loadAdminReviews();
            return;
        }
        const featuredButton = event.target.closest(".toggle-review-featured");
        if (featuredButton) {
            const review = cachedReviews.find((item) => item.id === featuredButton.dataset.reviewId);
            if (!review)
                return;
            const { error } = await client
                .from("reviews")
                .update({ is_featured: !review.is_featured })
                .eq("id", review.id);
            if (error) {
                setMessage(reviewMessage, error.message, true);
                return;
            }
            setMessage(reviewMessage, review.is_featured ? "Review removed from featured." : "Review featured.", false);
            loadAdminReviews();
            return;
        }
        const deleteButton = event.target.closest(".delete-review");
        if (!deleteButton)
            return;
        const { error } = await client
            .from("reviews")
            .delete()
            .eq("id", deleteButton.dataset.reviewId);
        if (error) {
            setMessage(reviewMessage, error.message, true);
            return;
        }
        if (reviewId.value === deleteButton.dataset.reviewId) {
            resetReviewForm();
        }
        setMessage(reviewMessage, "Review deleted.", false);
        loadAdminReviews();
    });
    adminUsers.addEventListener("click", async (event) => {
        const editButton = event.target.closest(".edit-admin-user");
        if (editButton) {
            editAdminUser(editButton.dataset.adminUserId);
            return;
        }
        const resetButton = event.target.closest(".reset-admin-password");
        if (resetButton) {
            setMessage(adminUserMessage, "Sending password reset email...", false);
            try {
                await invokeAdminUsers({
                    action: "reset-password",
                    userId: resetButton.dataset.adminUserId
                });
            }
            catch (error) {
                setMessage(adminUserMessage, error.message, true);
                return;
            }
            setMessage(adminUserMessage, "Password reset email sent.", false);
            return;
        }
        const deleteButton = event.target.closest(".delete-admin-user");
        if (!deleteButton)
            return;
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
        }
        catch (error) {
            setMessage(adminUserMessage, error.message, true);
        }
    });
    adminNavCards.forEach((card) => {
        card.addEventListener("click", () => {
            showAdminView(card.dataset.adminView);
        });
    });
    datePickers.forEach((picker) => {
        setDatePickerMonth(picker, datePickerMonth(picker));
        renderDatePicker(picker);
        picker.addEventListener("click", (event) => {
            const inputId = picker.dataset.dateInput;
            if (eventMatch(event, "[data-date-toggle]", picker)) {
                const popover = picker.querySelector("[data-date-popover]");
                const willOpen = popover === null || popover === void 0 ? void 0 : popover.classList.contains("hidden");
                datePickers.forEach((item) => setDatePickerOpen(item, false));
                setDatePickerOpen(picker, willOpen);
                return;
            }
            if (eventMatch(event, "[data-date-prev]", picker)) {
                const month = datePickerMonth(picker);
                setDatePickerMonth(picker, new Date(month.getFullYear(), month.getMonth() - 1, 1));
                renderDatePicker(picker);
                return;
            }
            if (eventMatch(event, "[data-date-next]", picker)) {
                const month = datePickerMonth(picker);
                setDatePickerMonth(picker, new Date(month.getFullYear(), month.getMonth() + 1, 1));
                renderDatePicker(picker);
                return;
            }
            if (eventMatch(event, "[data-date-clear]", picker)) {
                setDateValue(inputId, "");
                setDatePickerOpen(picker, false);
                return;
            }
            if (eventMatch(event, "[data-date-today]", picker)) {
                const value = todayIso();
                setDateValue(inputId, value);
                setDatePickerMonth(picker, datePickerMonth(picker));
                setDatePickerOpen(picker, false);
                return;
            }
            const dayButton = eventMatch(event, "[data-date-day]", picker);
            if (dayButton) {
                setDateValue(inputId, dayButton.dataset.dateDay);
                setDatePickerMonth(picker, datePickerMonth(picker));
                setDatePickerOpen(picker, false);
            }
        });
    });
    document.addEventListener("click", (event) => {
        if (datePickers.some((picker) => picker.contains(event.target)))
            return;
        datePickers.forEach((picker) => setDatePickerOpen(picker, false));
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            datePickers.forEach((picker) => setDatePickerOpen(picker, false));
        }
    });
    ["click", "keydown", "input", "pointerdown", "touchstart"].forEach((eventName) => {
        document.addEventListener(eventName, recordAdminActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            scheduleAdminAutoLogout();
        }
    });
    dealForm === null || dealForm === void 0 ? void 0 : dealForm.addEventListener("input", updateDealStatusPreview);
    dealForm === null || dealForm === void 0 ? void 0 : dealForm.addEventListener("change", updateDealStatusPreview);
    postCancelEdit.addEventListener("click", () => {
        resetPostForm();
        setMessage(postMessage, "", false);
    });
    dealCancelEdit.addEventListener("click", () => {
        resetDealForm();
        setMessage(dealMessage, "", false);
    });
    reviewCancelEdit.addEventListener("click", () => {
        resetReviewForm();
        setMessage(reviewMessage, "", false);
    });
    areaCancelEdit.addEventListener("click", () => {
        resetAreaForm();
        setPanelOpen(areaFormPanel, toggleAreaForm, false, areaListPanel);
        setMessage(areaMessage, "", false);
    });
    instructorCancelEdit.addEventListener("click", () => {
        resetInstructorForm();
        setPanelOpen(instructorFormPanel, toggleInstructorForm, false, instructorListPanel);
        setMessage(instructorMessage, "", false);
    });
    adminUserCancelEdit.addEventListener("click", () => {
        resetAdminUserForm();
        setPanelOpen(adminUserFormPanel, toggleAdminUserForm, false, adminUserListPanel);
        setMessage(adminUserMessage, "", false);
    });
    refreshPosts.addEventListener("click", loadAdminPosts);
    refreshDeals.addEventListener("click", loadAdminDeals);
    refreshReviews.addEventListener("click", loadAdminReviews);
    refreshAreas.addEventListener("click", loadAdminAreas);
    refreshInstructors.addEventListener("click", loadAdminInstructors);
    refreshAdminUsers.addEventListener("click", loadAdminUsers);
    areaMapPicker === null || areaMapPicker === void 0 ? void 0 : areaMapPicker.addEventListener("click", chooseAreaMapPosition);
    areaMapPicker === null || areaMapPicker === void 0 ? void 0 : areaMapPicker.addEventListener("keydown", moveAreaMapPosition);
    toggleAreaForm === null || toggleAreaForm === void 0 ? void 0 : toggleAreaForm.addEventListener("click", () => {
        const open = areaFormPanel.classList.contains("hidden");
        setPanelOpen(areaFormPanel, toggleAreaForm, open, areaListPanel);
        if (open) {
            resetAreaForm();
            setMessage(areaMessage, "", false);
        }
    });
    toggleInstructorForm === null || toggleInstructorForm === void 0 ? void 0 : toggleInstructorForm.addEventListener("click", () => {
        const open = instructorFormPanel.classList.contains("hidden");
        setPanelOpen(instructorFormPanel, toggleInstructorForm, open, instructorListPanel);
        if (open) {
            resetInstructorForm();
            setMessage(instructorMessage, "", false);
        }
    });
    toggleAdminUserForm === null || toggleAdminUserForm === void 0 ? void 0 : toggleAdminUserForm.addEventListener("click", () => {
        const open = adminUserFormPanel.classList.contains("hidden");
        setPanelOpen(adminUserFormPanel, toggleAdminUserForm, open, adminUserListPanel);
        if (open) {
            resetAdminUserForm();
            setMessage(adminUserMessage, "", false);
        }
    });
    setDateValue("passed-at", todayIso());
    updateDealStatusPreview();
    resetReviewForm();
    showAdminView("passes");
    client.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && (session === null || session === void 0 ? void 0 : session.user)) {
            setPasswordRecoveryMode(session.user);
        }
    });
    loadSession();
})();
