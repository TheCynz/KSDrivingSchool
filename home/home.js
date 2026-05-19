"use strict";
(function () {
    const shared = window.KS_SHARED;
    const gallery = document.querySelector("#pass-gallery");
    const dealPreview = document.querySelector("#deal-preview");
    const dealList = document.querySelector("#deal-list");
    const dealCarouselDots = document.querySelector("#deal-carousel-dots");
    const dealCarouselPrev = document.querySelector("#deal-carousel-prev");
    const dealCarouselNext = document.querySelector("#deal-carousel-next");
    const reviewCarousel = document.querySelector("#review-carousel");
    const reviewCarouselStatus = document.querySelector("#review-carousel-status");
    const reviewCarouselDots = document.querySelector("#review-carousel-dots");
    const reviewCarouselPrev = document.querySelector("#review-carousel-prev");
    const reviewCarouselNext = document.querySelector("#review-carousel-next");
    const instructorList = document.querySelector("#instructor-list");
    const selectedAreaTitle = document.querySelector("#selected-area-title");
    const instructorMatchMessage = document.querySelector("#instructor-match-message");
    const lessonFinder = document.querySelector("#lesson-finder");
    const lessonFinderMessage = document.querySelector("#lesson-finder-message");
    const areaTabsContainer = document.querySelector("#area-tabs");
    const coverageMapMarkers = document.querySelector("#coverage-map-markers");
    const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
    const primaryNav = document.querySelector("#primary-nav");
    const areaMapWidth = 1000;
    const areaMapHeight = 720;
    const areaMapCenterX = areaMapWidth / 2;
    const areaMapCenterY = 430;
    let selectedAreaSlug = "";
    let preferredTransmission = "";
    let instructors = [];
    let areas = [];
    let cachedVisibleAreaSlugs = [];
    let visibleDeals = [];
    let dealAutoAdvanceTimer = 0;
    let activeDealIndex = 0;
    let visibleReviews = [];
    let reviewAutoAdvanceTimer = 0;
    let activeReviewIndex = 0;
    const safeUrlPattern = /^(https?:)?\/\//i;
    function alignHashTarget() {
        const targetId = decodeURIComponent(window.location.hash || "").replace(/^#/, "");
        if (!targetId)
            return;
        const target = document.getElementById(targetId);
        if (!target)
            return;
        window.requestAnimationFrame(() => {
            target.scrollIntoView({ block: "start" });
        });
    }
    function renderPassPlaceholder() {
        if (!gallery)
            return;
        gallery.innerHTML = `
      <div class="rounded-md bg-white p-6 text-ink/70 sm:col-span-2 lg:col-span-3">
        <p class="text-xl font-black text-ink">Recent pass photos will appear here.</p>
        <p class="mt-2 leading-7">Recent student pass photos and reviews will be published here after the team adds them.</p>
      </div>
    `;
    }
    function dealEnquiryHref(deal) {
        var _a;
        const email = shared.safeEmail((_a = window.KS_SITE) === null || _a === void 0 ? void 0 : _a.email, "ksdrivingschool66@gmail.com");
        const validUntil = deal.valid_until
            ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(deal.valid_until))
            : "";
        const bodyLines = [
            "Hi KS Driving School,",
            "",
            "I am interested in this current offer:",
            "",
            `Offer: ${deal.title || "Current driving lesson offer"}`,
            deal.summary ? `Summary: ${deal.summary}` : "",
            deal.details ? `Details: ${deal.details}` : "",
            validUntil ? `Valid until: ${validUntil}` : "",
            "",
            "Please can you send me more details and current availability?",
            "",
            "Name:",
            "Phone:",
            "Postcode:",
            "Preferred transmission:"
        ].filter(Boolean);
        return `mailto:${email}?subject=${encodeURIComponent(`Current lesson offer enquiry: ${deal.title || "KS Driving School"}`)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    }
    function dealCard(deal, options = {}) {
        const validUntil = deal.valid_until
            ? `<p class="mt-3 text-sm font-bold text-leaf">Valid until ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(deal.valid_until))}</p>`
            : "";
        const details = deal.details ? `<p class="mt-3 text-sm leading-6 text-ink/72">${escapeHtml(deal.details)}</p>` : "";
        const compact = Boolean(options.compact);
        return `
      <article class="${compact ? "rounded-md border border-ink/10 bg-kerb p-5" : "rounded-md bg-white p-6 shadow-xl shadow-ink/8 sm:p-8"}">
        <p class="text-sm font-black uppercase text-leaf">Current deal</p>
        <h2 class="mt-3 ${compact ? "text-3xl" : "text-3xl sm:text-4xl"} font-black">${escapeHtml(deal.title)}</h2>
        <p class="mt-4 text-base leading-7 text-ink/72">${escapeHtml(deal.summary)}</p>
        ${details}
        ${validUntil}
        <div class="mt-6 flex flex-col gap-3 sm:flex-row ${compact ? "lg:flex-col" : ""}">
          <a class="inline-flex items-center justify-center rounded-md bg-signal px-5 py-3 text-sm font-black text-ink transition hover:bg-road hover:text-white" href="${compact ? "../deals/" : escapeHtml(dealEnquiryHref(deal))}">${escapeHtml(deal.cta_label || "Ask about this deal")}</a>
          <a class="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-5 py-3 text-sm font-black text-ink transition hover:border-leaf hover:text-leaf" data-phone-link data-phone-label="Call the office" href="tel:+443337720143">Call the office</a>
        </div>
      </article>
    `;
    }
    function homeDealCard(deal, index, position) {
        const active = position === "active";
        const validUntil = deal.valid_until
            ? `<p class="mt-3 text-xs font-black uppercase text-leaf">Valid until ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(deal.valid_until))}</p>`
            : "";
        const actions = active
            ? `
        <div class="mt-6 flex flex-col gap-2">
          <a class="inline-flex items-center justify-center rounded-md bg-road px-4 py-3 text-sm font-black text-white transition hover:bg-signal hover:text-ink" href="${escapeHtml(dealEnquiryHref(deal))}">${escapeHtml(deal.cta_label || "Ask about this deal")}</a>
          <a class="inline-flex items-center justify-center rounded-md border border-ink/12 bg-white px-4 py-3 text-sm font-black text-ink transition hover:border-leaf hover:text-leaf" data-phone-link data-phone-label="Call the office" href="tel:+443337720143">Call the office</a>
        </div>
      `
            : "";
        return `
      <article class="deal-offer-card ${active ? "deal-offer-card-active" : ""} flex min-h-[240px] flex-col justify-between rounded-md border border-ink/10 bg-white p-4 text-ink sm:min-h-[280px] sm:p-5 lg:p-6" data-deal-slide="${index}" data-deal-position="${position}">
        <div>
          <span class="inline-flex rounded-full bg-signal px-3 py-1 text-xs font-black uppercase text-ink">Offer</span>
          <h3 class="mt-4 text-xl font-black leading-tight sm:text-2xl">${escapeHtml(deal.title)}</h3>
          <p class="mt-3 text-sm leading-6 text-ink/70">${escapeHtml(deal.summary)}</p>
          ${validUntil}
        </div>
        ${actions}
      </article>
    `;
    }
    function setDealControlsVisible(visible) {
        dealCarouselPrev === null || dealCarouselPrev === void 0 ? void 0 : dealCarouselPrev.classList.toggle("hidden", !visible);
        dealCarouselNext === null || dealCarouselNext === void 0 ? void 0 : dealCarouselNext.classList.toggle("hidden", !visible);
    }
    function updateDealDots() {
        if (!dealCarouselDots)
            return;
        Array.from(dealCarouselDots.querySelectorAll("button")).forEach((dot, index) => {
            const active = index === activeDealIndex;
            dot.classList.toggle("bg-road", active);
            dot.classList.toggle("w-7", active);
            dot.classList.toggle("w-2", !active);
            dot.classList.toggle("bg-ink/18", !active);
            dot.setAttribute("aria-current", active ? "true" : "false");
        });
    }
    function dealAt(index) {
        const total = visibleDeals.length;
        if (total === 0)
            return null;
        return visibleDeals[((index % total) + total) % total];
    }
    function renderDealWindow() {
        if (!dealPreview || visibleDeals.length === 0)
            return;
        const total = visibleDeals.length;
        const slots = [
            { index: activeDealIndex - 1, position: "previous" },
            { index: activeDealIndex, position: "active" },
            { index: activeDealIndex + 1, position: "next" }
        ];
        dealPreview.innerHTML = slots.map((slot) => {
            const deal = dealAt(slot.index);
            const normalizedIndex = ((slot.index % total) + total) % total;
            return deal ? homeDealCard(deal, normalizedIndex, slot.position) : "";
        }).join("");
        updateDealDots();
        bindSiteContactLinks();
    }
    function setActiveDealIndex(index) {
        if (visibleDeals.length === 0)
            return;
        activeDealIndex = ((index % visibleDeals.length) + visibleDeals.length) % visibleDeals.length;
        renderDealWindow();
    }
    function stopDealAutoAdvance() {
        if (!dealAutoAdvanceTimer)
            return;
        window.clearInterval(dealAutoAdvanceTimer);
        dealAutoAdvanceTimer = 0;
    }
    function startDealAutoAdvance() {
        stopDealAutoAdvance();
        if (visibleDeals.length <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
        dealAutoAdvanceTimer = window.setInterval(() => {
            if (document.hidden)
                return;
            setActiveDealIndex(activeDealIndex + 1);
        }, 5600);
    }
    function bindDealCarouselControls() {
        const move = (direction) => setActiveDealIndex(activeDealIndex + direction);
        dealCarouselPrev === null || dealCarouselPrev === void 0 ? void 0 : dealCarouselPrev.addEventListener("click", () => move(-1));
        dealCarouselNext === null || dealCarouselNext === void 0 ? void 0 : dealCarouselNext.addEventListener("click", () => move(1));
    }
    function bindSiteContactLinks() {
        if (!window.KS_SITE)
            return;
        document.querySelectorAll("[data-phone-link]").forEach((element) => {
            const phoneDisplay = window.KS_SITE.phoneDisplay || "0333 7720143";
            element.href = `tel:${window.KS_SITE.phoneHref || "+443337720143"}`;
            if (element.dataset.phoneLabel || element.children.length === 0) {
                element.textContent = element.dataset.phoneLabel || phoneDisplay;
            }
        });
    }
    function renderDeals(deals) {
        const currentDeals = deals || [];
        if (dealPreview) {
            const homeDealSection = dealPreview.closest("[data-home-deals]");
            stopDealAutoAdvance();
            visibleDeals = currentDeals;
            activeDealIndex = 0;
            if (currentDeals.length > 0) {
                homeDealSection === null || homeDealSection === void 0 ? void 0 : homeDealSection.classList.remove("hidden");
                setDealControlsVisible(currentDeals.length > 1);
                if (dealCarouselDots) {
                    dealCarouselDots.innerHTML = currentDeals.map((deal, index) => `
            <button class="h-2.5 ${index === 0 ? "w-7 bg-road" : "w-2 bg-ink/18"} rounded-full transition-all duration-300" type="button" data-deal-dot="${index}" aria-label="Show offer ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"></button>
          `).join("");
                    dealCarouselDots.querySelectorAll("[data-deal-dot]").forEach((dot) => {
                        dot.addEventListener("click", () => setActiveDealIndex(Number(dot.dataset.dealDot || 0)));
                    });
                }
                renderDealWindow();
                startDealAutoAdvance();
            }
            else {
                dealPreview.innerHTML = "";
                if (dealCarouselDots)
                    dealCarouselDots.innerHTML = "";
                setDealControlsVisible(false);
                homeDealSection === null || homeDealSection === void 0 ? void 0 : homeDealSection.classList.add("hidden");
            }
        }
        if (dealList) {
            dealList.innerHTML = currentDeals.length > 0
                ? currentDeals.map((deal) => dealCard(deal)).join("")
                : `
          <div class="rounded-md border border-ink/10 bg-kerb p-5 text-ink/70">
            <p class="text-lg font-black text-ink">No active deals currently.</p>
            <p class="mt-2 text-sm leading-6">Check back soon or call the office to ask about lesson availability.</p>
          </div>
        `;
        }
        bindSiteContactLinks();
        alignHashTarget();
    }
    function reviewStars(rating) {
        const safeRating = Math.max(0, Math.min(5, Number.parseInt(String(rating || 0), 10) || 0));
        return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
    }
    function reviewCard(review, index, position) {
        const rating = Math.max(0, Math.min(5, Number.parseInt(String(review.rating || 0), 10) || 0));
        const active = position === "active";
        return `
      <article class="review-slide ${active ? "review-slide-active" : ""} relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-md border border-ink/8 bg-white p-4 ring-1 ring-ink/5 sm:min-h-[300px] sm:p-6 lg:p-7" data-review-slide="${index}" data-review-position="${position}">
        <div class="relative">
          <div class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-kerb px-2.5 py-1.5 text-xs font-black text-road sm:gap-2 sm:px-3 sm:text-sm">
            <span class="text-signal" aria-label="${rating} out of 5 stars">${reviewStars(rating)}</span>
            <span class="text-xs text-ink/45">${rating}/5</span>
          </div>
          <blockquote class="mt-6 text-lg font-black leading-7 text-ink sm:mt-7 sm:text-xl sm:leading-8 lg:text-2xl lg:leading-9">"${escapeHtml(review.review_text)}"</blockquote>
        </div>
        <div class="relative mt-8 flex items-center justify-between gap-4 border-t border-ink/8 pt-4">
          <div>
            <p class="text-sm font-black text-ink">${escapeHtml(review.reviewer_name)}</p>
            <p class="mt-1 text-[0.68rem] font-bold uppercase text-leaf/80 sm:text-xs">Learner review</p>
          </div>
          <span class="h-2.5 w-2.5 rounded-full bg-signal shadow-[0_0_0_5px_rgba(246,196,69,.18)]" aria-hidden="true"></span>
        </div>
      </article>
    `;
    }
    function setReviewControlsVisible(visible) {
        reviewCarouselPrev === null || reviewCarouselPrev === void 0 ? void 0 : reviewCarouselPrev.classList.toggle("hidden", !visible);
        reviewCarouselNext === null || reviewCarouselNext === void 0 ? void 0 : reviewCarouselNext.classList.toggle("hidden", !visible);
    }
    function renderReviewState(kind, message) {
        if (!reviewCarousel)
            return;
        stopReviewAutoAdvance();
        const tone = kind === "error" ? "text-ink/60" : "text-ink/62";
        reviewCarousel.innerHTML = `
      <div class="w-full rounded-md border border-ink/8 bg-kerb/70 p-6 ${tone}">
        <p class="text-base font-black text-ink">${escapeHtml(message.title)}</p>
        <p class="mt-2 max-w-xl text-sm leading-6">${escapeHtml(message.body)}</p>
      </div>
    `;
        if (reviewCarouselStatus)
            reviewCarouselStatus.textContent = message.title;
        if (reviewCarouselDots)
            reviewCarouselDots.innerHTML = "";
        setReviewControlsVisible(false);
    }
    function updateReviewDots() {
        if (!reviewCarousel || !reviewCarouselDots)
            return;
        Array.from(reviewCarouselDots.querySelectorAll("button")).forEach((dot, index) => {
            const active = index === activeReviewIndex;
            dot.classList.toggle("bg-road", active);
            dot.classList.toggle("w-7", active);
            dot.classList.toggle("w-2", !active);
            dot.classList.toggle("bg-ink/18", !active);
            dot.setAttribute("aria-current", active ? "true" : "false");
        });
    }
    function reviewAt(index) {
        const total = visibleReviews.length;
        if (total === 0)
            return null;
        return visibleReviews[((index % total) + total) % total];
    }
    function renderReviewWindow() {
        if (!reviewCarousel || visibleReviews.length === 0)
            return;
        const total = visibleReviews.length;
        const slots = [
            { index: activeReviewIndex - 1, position: "previous" },
            { index: activeReviewIndex, position: "active" },
            { index: activeReviewIndex + 1, position: "next" }
        ];
        reviewCarousel.innerHTML = slots.map((slot) => {
            const review = reviewAt(slot.index);
            const normalizedIndex = ((slot.index % total) + total) % total;
            return review ? reviewCard(review, normalizedIndex, slot.position) : "";
        }).join("");
        updateReviewDots();
    }
    function setActiveReviewIndex(index) {
        if (visibleReviews.length === 0)
            return;
        activeReviewIndex = ((index % visibleReviews.length) + visibleReviews.length) % visibleReviews.length;
        renderReviewWindow();
    }
    function stopReviewAutoAdvance() {
        if (!reviewAutoAdvanceTimer)
            return;
        window.clearInterval(reviewAutoAdvanceTimer);
        reviewAutoAdvanceTimer = 0;
    }
    function startReviewAutoAdvance() {
        stopReviewAutoAdvance();
        if (visibleReviews.length <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
        reviewAutoAdvanceTimer = window.setInterval(() => {
            if (document.hidden)
                return;
            setActiveReviewIndex(activeReviewIndex + 1);
        }, 5200);
    }
    function bindReviewCarouselControls() {
        if (!reviewCarousel)
            return;
        const scrollOneSlide = (direction) => {
            setActiveReviewIndex(activeReviewIndex + direction);
        };
        reviewCarouselPrev === null || reviewCarouselPrev === void 0 ? void 0 : reviewCarouselPrev.addEventListener("click", () => scrollOneSlide(-1));
        reviewCarouselNext === null || reviewCarouselNext === void 0 ? void 0 : reviewCarouselNext.addEventListener("click", () => scrollOneSlide(1));
    }
    function renderReviews(reviews) {
        if (!reviewCarousel)
            return;
        if (!reviews || reviews.length === 0) {
            renderReviewState("empty", {
                title: "Learner reviews are coming soon.",
                body: "Recent feedback will appear here once the team adds it."
            });
            return;
        }
        visibleReviews = reviews;
        setReviewControlsVisible(reviews.length > 1);
        activeReviewIndex = 0;
        if (reviewCarouselStatus) {
            reviewCarouselStatus.textContent = `${reviews.length} learner review${reviews.length === 1 ? "" : "s"} loaded.`;
        }
        if (reviewCarouselDots) {
            reviewCarouselDots.innerHTML = reviews.map((review, index) => `
        <button class="h-2.5 ${index === 0 ? "w-7 bg-road" : "w-2 bg-ink/18"} rounded-full transition-all duration-300" type="button" data-review-dot="${index}" aria-label="Show review ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"></button>
      `).join("");
            reviewCarouselDots.querySelectorAll("[data-review-dot]").forEach((dot) => {
                dot.addEventListener("click", () => {
                    setActiveReviewIndex(Number(dot.dataset.reviewDot || 0));
                });
            });
        }
        window.requestAnimationFrame(() => {
            renderReviewWindow();
            startReviewAutoAdvance();
        });
    }
    async function loadReviews(client) {
        if (!reviewCarousel)
            return;
        if (!client) {
            renderReviewState("empty", {
                title: "Learner reviews are coming soon.",
                body: "Recent feedback will appear here once the team adds it."
            });
            return;
        }
        const { data, error } = await client
            .from("reviews")
            .select("reviewer_name, rating, review_text, is_featured, created_at")
            .eq("is_visible", true)
            .order("is_featured", { ascending: false })
            .order("rating", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(8);
        if (error) {
            renderReviewState("error", {
                title: "Reviews are temporarily unavailable.",
                body: "Call the office if you would like to hear from recent learners."
            });
            return;
        }
        renderReviews(data || []);
    }
    async function loadDeals(client) {
        if (!dealPreview && !dealList)
            return;
        if (!client) {
            renderDeals([]);
            return;
        }
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await client
            .from("current_deals")
            .select("title, summary, details, cta_label, valid_from, valid_until")
            .eq("deal_type", "pupil")
            .eq("published", true)
            .or(`valid_from.is.null,valid_from.lte.${today}`)
            .or(`valid_until.is.null,valid_until.gte.${today}`)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false })
            .limit(6);
        renderDeals(error || !data ? [] : data);
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
    function normalizeArea(area) {
        if (!area || !area.slug || !area.name)
            return null;
        return {
            id: area.id || "",
            name: String(area.name),
            slug: String(area.slug),
            is_visible: area.is_visible !== false,
            map_x: Number(area.map_x),
            map_y: Number(area.map_y),
            is_primary: Boolean(area.is_primary),
            match_terms: Array.isArray(area.match_terms) ? area.match_terms.map((term) => String(term).toLowerCase()) : [],
            postcode_prefixes: Array.isArray(area.postcode_prefixes) ? area.postcode_prefixes.map((prefix) => String(prefix).toLowerCase().replace(/\s+/g, "")) : [],
            sort_order: Number.isFinite(Number(area.sort_order)) ? Number(area.sort_order) : 100
        };
    }
    function sortAreas(areaA, areaB) {
        const order = areaA.sort_order - areaB.sort_order;
        if (order !== 0)
            return order;
        return areaA.name.localeCompare(areaB.name, "en-GB");
    }
    function normalizeInstructor(instructor) {
        const instructorAreas = Array.isArray(instructor.instructor_areas)
            ? instructor.instructor_areas
                .map((row) => normalizeArea(row.area))
                .filter(Boolean)
                .filter((area) => area.is_visible)
                .sort(sortAreas)
            : [];
        return {
            ...instructor,
            areas: instructorAreas
        };
    }
    function instructorAreas(instructor) {
        if (Array.isArray(instructor.areas)) {
            return instructor.areas.filter((area) => area && area.slug && area.name);
        }
        return [];
    }
    function instructorAreaLabel(instructor) {
        const labels = instructorAreas(instructor).map((area) => area.name);
        return labels.length > 0 ? labels.join(", ") : "Shropshire";
    }
    function visibleAreas() {
        return cachedVisibleAreaSlugs
            .map((slug) => areas.find((area) => area.slug === slug))
            .filter(Boolean);
    }
    function selectedArea() {
        return areas.find((area) => area.slug === selectedAreaSlug) || null;
    }
    function instructorSortValue(instructor) {
        return slugify(instructor.slug || instructor.name) === "karen-jones" ? 0 : 1;
    }
    function sortPublicInstructors(instructorA, instructorB) {
        const ownerOrder = instructorSortValue(instructorA) - instructorSortValue(instructorB);
        if (ownerOrder !== 0)
            return ownerOrder;
        return String(instructorA.name || "").localeCompare(String(instructorB.name || ""), "en-GB");
    }
    function matchesTransmission(instructor) {
        if (!preferredTransmission)
            return false;
        return String(instructor.transmission || "").toLowerCase().includes(preferredTransmission);
    }
    function instructorCard(instructor) {
        const phoneHref = instructor.phone ? instructor.phone.replace(/[^\d+]/g, "") : "";
        const phone = phoneHref ? `<a class="mt-3 inline-flex rounded-md bg-kerb px-3 py-2 text-sm font-black text-road transition hover:bg-signal hover:text-ink" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(instructor.phone)}</a>` : "";
        const imageUrl = instructor.photo_url && safeUrlPattern.test(instructor.photo_url) ? escapeHtml(instructor.photo_url) : "";
        const photo = imageUrl
            ? `<img class="h-16 w-16 shrink-0 rounded-md object-cover" src="${imageUrl}" alt="${escapeHtml(instructor.name)}" loading="lazy" decoding="async">`
            : `<div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-kerb text-lg font-black text-road">${escapeHtml(initials(instructor.name))}</div>`;
        const profileHref = `../instructors/?instructor=${encodeURIComponent(instructor.slug || slugify(instructor.name))}`;
        const highlighted = matchesTransmission(instructor);
        return `
      <article class="rounded-md border border-ink/10 p-4 transition hover:border-leaf hover:shadow-md ${highlighted ? "instructor-match instructor-match-pulse" : ""}">
        <a class="block" href="${profileHref}" aria-label="View ${escapeHtml(instructor.name)} profile">
          <div class="flex gap-4">
            ${photo}
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="text-lg font-black">${escapeHtml(instructor.name)}</h4>
                <span class="rounded bg-kerb px-2 py-1 text-xs font-bold text-road">${escapeHtml(instructor.transmission || "Lessons")}</span>
                ${highlighted ? `<span class="rounded bg-signal px-2 py-1 text-xs font-black text-ink">Match</span>` : ""}
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
        if (!instructorList || !selectedAreaTitle)
            return;
        const visible = visibleAreas();
        const availableSlugs = visible.map((area) => area.slug);
        if (!availableSlugs.includes(selectedAreaSlug)) {
            selectedAreaSlug = availableSlugs[0] || "";
        }
        renderAreaTabs(visible);
        renderMapMarkers(visible);
        const activeArea = selectedArea();
        if (!activeArea) {
            selectedAreaTitle.textContent = "No instructors listed yet";
            instructorMatchMessage === null || instructorMatchMessage === void 0 ? void 0 : instructorMatchMessage.classList.add("hidden");
            instructorList.innerHTML = `<div class="rounded-md border border-ink/10 p-4 text-ink/70">Call the office on 0333 7720143 and we will check current lesson availability.</div>`;
            alignHashTarget();
            return;
        }
        selectedAreaTitle.textContent = `${activeArea.name} instructors`;
        const matching = instructors
            .filter((instructor) => instructorAreas(instructor).some((area) => area.slug === selectedAreaSlug))
            .sort(sortPublicInstructors);
        const transmissionMatches = matching.filter(matchesTransmission);
        if (instructorMatchMessage) {
            if (preferredTransmission) {
                instructorMatchMessage.textContent = transmissionMatches.length
                    ? `${transmissionMatches.length} ${preferredTransmission} match${transmissionMatches.length === 1 ? "" : "es"} highlighted. Tap a card to view the instructor profile.`
                    : `No ${preferredTransmission} match is listed for ${activeArea.name} yet.`;
                instructorMatchMessage.classList.remove("hidden");
            }
            else {
                instructorMatchMessage.classList.add("hidden");
            }
        }
        if (matching.length === 0) {
            instructorList.innerHTML = `<div class="rounded-md border border-ink/10 p-4 text-ink/70">Call the office on 0333 7720143 and we will check availability for ${escapeHtml(activeArea.name)}.</div>`;
            alignHashTarget();
            return;
        }
        instructorList.innerHTML = matching.map(instructorCard).join("");
        alignHashTarget();
    }
    function renderAreaTabs(visible) {
        if (!areaTabsContainer)
            return;
        areaTabsContainer.innerHTML = visible.map((area) => {
            const active = area.slug === selectedAreaSlug;
            return `
        <button class="area-tab rounded-md border border-ink/10 px-3 py-2 text-sm font-black transition ${active ? "bg-road text-white" : "bg-white text-ink hover:border-leaf hover:text-leaf"}" data-area-slug="${escapeHtml(area.slug)}" type="button">${escapeHtml(area.name)}</button>
      `;
        }).join("");
        areaTabsContainer.querySelectorAll("[data-area-slug]").forEach((tab) => {
            tab.addEventListener("click", () => setSelectedArea(tab.dataset.areaSlug));
        });
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
    function renderMapMarkers(visible) {
        if (!coverageMapMarkers)
            return;
        coverageMapMarkers.innerHTML = visible.map((area) => {
            const point = areaStoredPointToSvg(area.map_x, area.map_y);
            const x = Math.max(0, Math.min(areaMapWidth, point.x));
            const y = Math.max(0, Math.min(areaMapHeight, point.y));
            const active = area.slug === selectedAreaSlug;
            const primary = area.is_primary;
            const haloRadius = primary ? 82 : 52;
            const markerRadius = primary ? 46 : 29;
            const fill = primary ? (active ? "#0b3a78" : "#1769aa") : "#f6c445";
            const labelWidth = Math.min(172, Math.max(92, area.name.length * 10 + 28));
            const labelX = Math.max(8, Math.min(areaMapWidth - labelWidth - 8, x - labelWidth / 2));
            const labelY = y > areaMapHeight - 90 ? y - 58 : y - 46;
            const textY = labelY + 20;
            return `
        <g class="map-area cursor-pointer ${active ? "map-area-active" : ""}" data-area-slug="${escapeHtml(area.slug)}" role="button" tabindex="0" aria-label="${escapeHtml(area.name)} instructors">
          <circle cx="${x}" cy="${y}" r="${haloRadius}" fill="${fill}" opacity=".16"></circle>
          <circle cx="${x}" cy="${y}" r="${markerRadius}" fill="${fill}" opacity=".96"></circle>
          <circle cx="${x}" cy="${y}" r="6" fill="${primary ? "#fff" : "#17211d"}"></circle>
          <rect x="${labelX}" y="${labelY}" width="${labelWidth}" height="30" rx="15" fill="${fill}"></rect>
          <text x="${labelX + labelWidth / 2}" y="${textY}" text-anchor="middle" class="${primary ? "fill-white" : "fill-ink"} text-[15px] font-black">${escapeHtml(area.name)}</text>
        </g>
      `;
        }).join("");
        coverageMapMarkers.querySelectorAll("[data-area-slug]").forEach((marker) => {
            const choose = () => setSelectedArea(marker.dataset.areaSlug);
            marker.addEventListener("click", choose);
            marker.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ")
                    return;
                event.preventDefault();
                choose();
            });
        });
    }
    function setSelectedArea(areaSlug, options = {}) {
        if (!cachedVisibleAreaSlugs.includes(areaSlug))
            return;
        selectedAreaSlug = areaSlug;
        if (!options.keepTransmission) {
            preferredTransmission = "";
        }
        renderInstructors();
    }
    function matchArea(value) {
        const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
        const compact = normalized.replace(/\s+/g, "");
        if (!normalized)
            return "";
        const directArea = areas.find((area) => {
            const areaName = area.name.toLowerCase();
            const areaSlug = area.slug.replace(/-/g, " ");
            const terms = new Set([areaName, areaSlug, ...(area.match_terms || [])]);
            return Array.from(terms).some((term) => term && normalized.includes(term));
        });
        if (directArea)
            return directArea.slug;
        const postcodeArea = areas.find((area) => {
            return (area.postcode_prefixes || []).some((prefix) => prefix && compact.startsWith(prefix));
        });
        if (postcodeArea)
            return postcodeArea.slug;
        return "";
    }
    function applyLessonFinder(formData) {
        var _a, _b, _c;
        const area = matchArea(formData.get("lesson-postcode"));
        preferredTransmission = String(formData.get("lesson-transmission") || "").toLowerCase();
        if (!area) {
            if (lessonFinderMessage) {
                lessonFinderMessage.textContent = "We do not recognise that area yet. Call 0333 7720143 and we will check availability.";
            }
            return;
        }
        if (!cachedVisibleAreaSlugs.includes(area)) {
            if (lessonFinderMessage) {
                const areaName = ((_a = areas.find((item) => item.slug === area)) === null || _a === void 0 ? void 0 : _a.name) || "that area";
                lessonFinderMessage.textContent = `No instructor is listed for ${areaName} yet. Call 0333 7720143 and we will check availability.`;
            }
            return;
        }
        setSelectedArea(area, { keepTransmission: true });
        (_b = document.querySelector("#instructors")) === null || _b === void 0 ? void 0 : _b.scrollIntoView({ behavior: "smooth", block: "start" });
        if (lessonFinderMessage) {
            const areaName = ((_c = areas.find((item) => item.slug === area)) === null || _c === void 0 ? void 0 : _c.name) || "Area";
            lessonFinderMessage.textContent = `${areaName} selected below. Matching ${preferredTransmission} instructors are highlighted.`;
        }
    }
    async function loadAreas(client) {
        if (!client) {
            areas = [];
            cacheVisibleAreas();
            renderInstructors();
            return;
        }
        const { data, error } = await client
            .from("areas")
            .select("id, name, slug, is_visible, map_x, map_y, is_primary, match_terms, postcode_prefixes, sort_order")
            .eq("is_visible", true)
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true });
        areas = error || !data ? [] : data.map(normalizeArea).filter(Boolean).sort(sortAreas);
        cacheVisibleAreas();
        renderInstructors();
    }
    async function loadInstructors(client) {
        if (!instructorList)
            return;
        if (!client) {
            instructors = [];
            cacheVisibleAreas();
            renderInstructors();
            return;
        }
        const { data, error } = await client
            .from("instructors")
            .select("name, transmission, phone, bio, slug, photo_url, instructor_areas(area:areas(id, name, slug, is_visible, map_x, map_y, is_primary, match_terms, postcode_prefixes, sort_order))")
            .eq("active", true)
            .order("name", { ascending: true });
        instructors = error || !data ? [] : data.map(normalizeInstructor);
        cacheVisibleAreas();
        renderInstructors();
    }
    function cacheVisibleAreas() {
        const availableSlugs = new Set(areas.map((area) => area.slug));
        instructors.forEach((instructor) => {
            instructorAreas(instructor).forEach((area) => {
                availableSlugs.add(area.slug);
            });
        });
        cachedVisibleAreaSlugs = areas
            .filter((area) => area.is_visible && availableSlugs.has(area.slug))
            .sort(sortAreas)
            .map((area) => area.slug);
    }
    async function loadPosts() {
        var _a;
        loadAreas(null);
        loadInstructors(null);
        loadDeals(null);
        loadReviews(null);
        if (!shared.hasSupabaseConfig()) {
            renderPassPlaceholder();
            alignHashTarget();
            return;
        }
        const supabase = await ((_a = window.KS_LOAD_SUPABASE) === null || _a === void 0 ? void 0 : _a.call(window));
        if (!supabase) {
            renderPassPlaceholder();
            alignHashTarget();
            return;
        }
        const client = shared.getSupabaseClient(supabase);
        if (!client) {
            renderPassPlaceholder();
            alignHashTarget();
            return;
        }
        await Promise.all([
            loadAreas(client),
            loadInstructors(client)
        ]);
        loadDeals(client);
        loadReviews(client);
        if (!gallery)
            return;
        const { data, error } = await client
            .from("pass_posts")
            .select("student_name, caption, review, image_url, passed_at")
            .eq("published", true)
            .order("passed_at", { ascending: false })
            .limit(9);
        if (error) {
            renderPassPlaceholder();
            alignHashTarget();
            return;
        }
        if (!data || data.length === 0) {
            renderPassPlaceholder();
            alignHashTarget();
            return;
        }
        gallery.innerHTML = data.map(postCard).join("");
        alignHashTarget();
    }
    lessonFinder === null || lessonFinder === void 0 ? void 0 : lessonFinder.addEventListener("submit", (event) => {
        event.preventDefault();
        applyLessonFinder(new FormData(lessonFinder));
    });
    shared.bindMobileNav(mobileNavToggle, primaryNav);
    bindDealCarouselControls();
    bindReviewCarouselControls();
    loadPosts();
    window.addEventListener("hashchange", alignHashTarget);
})();
