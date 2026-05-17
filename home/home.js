"use strict";
(function () {
    const shared = window.KS_SHARED;
    const gallery = document.querySelector("#pass-gallery");
    const dealPreview = document.querySelector("#deal-preview");
    const dealList = document.querySelector("#deal-list");
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
    let selectedAreaSlug = "";
    let preferredTransmission = "";
    let instructors = [];
    let areas = [];
    let cachedVisibleAreaSlugs = [];
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
    function dealCard(deal, options = {}) {
        const validUntil = deal.valid_until
            ? `<p class="mt-3 text-sm font-bold text-leaf">Valid until ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(deal.valid_until))}</p>`
            : "";
        const details = deal.details ? `<p class="mt-3 text-sm leading-6 text-ink/72">${escapeHtml(deal.details)}</p>` : "";
        const compact = Boolean(options.compact);
        return `
      <article class="${compact ? "rounded-md border border-ink/10 bg-kerb p-5" : "rounded-md bg-white p-6 shadow-xl shadow-ink/8 sm:p-8"}">
        <p class="text-sm font-black uppercase tracking-[.18em] text-leaf">Current deal</p>
        <h2 class="mt-3 ${compact ? "text-3xl" : "text-3xl sm:text-4xl"} font-black tracking-normal">${escapeHtml(deal.title)}</h2>
        <p class="mt-4 text-base leading-7 text-ink/72">${escapeHtml(deal.summary)}</p>
        ${details}
        ${validUntil}
        <div class="mt-6 flex flex-col gap-3 sm:flex-row ${compact ? "lg:flex-col" : ""}">
          <a class="inline-flex items-center justify-center rounded-md bg-signal px-5 py-3 text-sm font-black text-ink transition hover:bg-road hover:text-white" href="${compact ? "../deals/" : "mailto:ksdrivingschool66@gmail.com?subject=Current%20lesson%20deals%20enquiry"}">${escapeHtml(deal.cta_label || "Ask about this deal")}</a>
          <a class="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-5 py-3 text-sm font-black text-ink transition hover:border-leaf hover:text-leaf" data-phone-link data-phone-label="Call the office" href="tel:+443337720143">Call the office</a>
        </div>
      </article>
    `;
    }
    function renderDeals(deals) {
        const visibleDeals = deals || [];
        if (dealPreview) {
            const homeDealSection = dealPreview.closest("[data-home-deals]");
            if (visibleDeals.length > 0) {
                dealPreview.innerHTML = dealCard(visibleDeals[0], { compact: true });
                homeDealSection?.classList.remove("hidden");
            }
            else {
                dealPreview.innerHTML = "";
                homeDealSection?.classList.add("hidden");
            }
        }
        if (dealList) {
            dealList.innerHTML = visibleDeals.length > 0
                ? visibleDeals.map((deal) => dealCard(deal)).join("")
                : `
          <div class="rounded-md border border-ink/10 bg-kerb p-5 text-ink/70">
            <p class="text-lg font-black text-ink">No active deals currently.</p>
            <p class="mt-2 text-sm leading-6">Check back soon or call the office to ask about lesson availability.</p>
          </div>
        `;
        }
        if (window.KS_SITE) {
            document.querySelectorAll("[data-phone-link]").forEach((element) => {
                const phoneDisplay = window.KS_SITE.phoneDisplay || "0333 7720143";
                element.href = `tel:${window.KS_SITE.phoneHref || "+443337720143"}`;
                if (element.dataset.phoneLabel || element.children.length === 0) {
                    element.textContent = element.dataset.phoneLabel || phoneDisplay;
                }
            });
        }
        alignHashTarget();
    }
    function reviewStars(rating) {
        const safeRating = Math.max(0, Math.min(5, Number.parseInt(String(rating || 0), 10) || 0));
        return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
    }
    function reviewCard(review, index) {
        const rating = Math.max(0, Math.min(5, Number.parseInt(String(review.rating || 0), 10) || 0));
        return `
      <article class="flex min-h-[270px] min-w-[88%] snap-start flex-col justify-between rounded-md border border-ink/8 bg-white p-6 shadow-sm shadow-ink/5 transition sm:min-w-[48%] sm:p-7 lg:min-w-[32%]" data-review-slide="${index}">
        <div>
          <p class="text-sm font-black tracking-[.12em] text-signal" aria-label="${rating} out of 5 stars">${reviewStars(rating)}</p>
          <blockquote class="mt-6 text-xl font-black leading-8 tracking-normal text-ink sm:text-2xl sm:leading-9">"${escapeHtml(review.review_text)}"</blockquote>
        </div>
        <div class="mt-8 flex items-center justify-between gap-4 border-t border-ink/8 pt-4">
          <p class="text-sm font-black text-ink">${escapeHtml(review.reviewer_name)}</p>
          <p class="text-xs font-bold text-ink/50">${rating}/5</p>
        </div>
      </article>
    `;
    }
    function setReviewControlsVisible(visible) {
        reviewCarouselPrev?.classList.toggle("hidden", !visible);
        reviewCarouselNext?.classList.toggle("hidden", !visible);
    }
    function renderReviewState(kind, message) {
        if (!reviewCarousel)
            return;
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
        const slides = Array.from(reviewCarousel.querySelectorAll("[data-review-slide]"));
        if (slides.length === 0)
            return;
        const activeIndex = slides.reduce((closestIndex, slide, index) => {
            const currentDistance = Math.abs(slide.getBoundingClientRect().left - reviewCarousel.getBoundingClientRect().left);
            const closestSlide = slides[closestIndex];
            const closestDistance = Math.abs(closestSlide.getBoundingClientRect().left - reviewCarousel.getBoundingClientRect().left);
            return currentDistance < closestDistance ? index : closestIndex;
        }, 0);
        Array.from(reviewCarouselDots.querySelectorAll("button")).forEach((dot, index) => {
            const active = index === activeIndex;
            dot.classList.toggle("bg-road", active);
            dot.classList.toggle("bg-ink/18", !active);
            dot.setAttribute("aria-current", active ? "true" : "false");
        });
    }
    function bindReviewCarouselControls() {
        if (!reviewCarousel)
            return;
        const scrollOneSlide = (direction) => {
            const firstSlide = reviewCarousel.querySelector("[data-review-slide]");
            const width = firstSlide ? firstSlide.getBoundingClientRect().width + 16 : reviewCarousel.clientWidth;
            reviewCarousel.scrollBy({ left: direction * width, behavior: "smooth" });
        };
        reviewCarouselPrev?.addEventListener("click", () => scrollOneSlide(-1));
        reviewCarouselNext?.addEventListener("click", () => scrollOneSlide(1));
        reviewCarousel.addEventListener("scroll", () => {
            window.requestAnimationFrame(updateReviewDots);
        }, { passive: true });
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
        reviewCarousel.innerHTML = reviews.map(reviewCard).join("");
        setReviewControlsVisible(reviews.length > 1);
        if (reviewCarouselStatus) {
            reviewCarouselStatus.textContent = `${reviews.length} learner review${reviews.length === 1 ? "" : "s"} loaded.`;
        }
        if (reviewCarouselDots) {
            reviewCarouselDots.innerHTML = reviews.map((review, index) => `
        <button class="h-2 w-2 rounded-full ${index === 0 ? "bg-road" : "bg-ink/18"} transition sm:h-2.5 sm:w-2.5" type="button" data-review-dot="${index}" aria-label="Show review ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"></button>
      `).join("");
            reviewCarouselDots.querySelectorAll("[data-review-dot]").forEach((dot) => {
                dot.addEventListener("click", () => {
                    const slide = reviewCarousel.querySelector(`[data-review-slide="${dot.dataset.reviewDot}"]`);
                    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
                });
            });
        }
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
            instructorMatchMessage?.classList.add("hidden");
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
    function renderMapMarkers(visible) {
        if (!coverageMapMarkers)
            return;
        coverageMapMarkers.innerHTML = visible.map((area) => {
            const x = Math.max(0, Math.min(720, Number(area.map_x) || 360));
            const y = Math.max(0, Math.min(520, Number(area.map_y) || 260));
            const active = area.slug === selectedAreaSlug;
            const primary = area.is_primary;
            const haloRadius = primary ? 82 : 52;
            const markerRadius = primary ? 46 : 29;
            const fill = primary ? (active ? "#0b3a78" : "#1769aa") : "#f6c445";
            const labelWidth = Math.min(172, Math.max(92, area.name.length * 10 + 28));
            const labelX = Math.max(8, Math.min(720 - labelWidth - 8, x - labelWidth / 2));
            const labelY = y > 430 ? y - 58 : y - 46;
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
                const areaName = areas.find((item) => item.slug === area)?.name || "that area";
                lessonFinderMessage.textContent = `No instructor is listed for ${areaName} yet. Call 0333 7720143 and we will check availability.`;
            }
            return;
        }
        setSelectedArea(area, { keepTransmission: true });
        document.querySelector("#instructors")?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (lessonFinderMessage) {
            const areaName = areas.find((item) => item.slug === area)?.name || "Area";
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
        loadAreas(null);
        loadInstructors(null);
        loadDeals(null);
        loadReviews(null);
        if (!shared.hasSupabaseConfig()) {
            renderPassPlaceholder();
            alignHashTarget();
            return;
        }
        const supabase = await window.KS_LOAD_SUPABASE?.();
        if (!supabase) {
            renderPassPlaceholder();
            alignHashTarget();
            return;
        }
        const client = supabase.createClient(window.KS_SUPABASE.url, window.KS_SUPABASE.publishableKey);
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
    lessonFinder?.addEventListener("submit", (event) => {
        event.preventDefault();
        applyLessonFinder(new FormData(lessonFinder));
    });
    shared.bindMobileNav(mobileNavToggle, primaryNav);
    bindReviewCarouselControls();
    loadPosts();
    window.addEventListener("hashchange", alignHashTarget);
})();
