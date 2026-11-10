/**
 * Environmental Futures Archive - Client Scripts
 * Handles:
 * 1. Email contact obfuscation
 * 2. Stories list pagination & rendering
 * 3. Single story view rendering from URL param (?id=...)
 * 4. Submit form validation, live word counter, unsaved warnings, and submission handling
 */

// -------------------------------------------------------------
// Bundled Stories Dataset
// -------------------------------------------------------------
const SAMPLE_STORIES = [];
const API_BASE = window.EFA_API_BASE || "https://environmental-futures-api.bits-environmental-futures.workers.dev/api";

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  setupContactLink();
  setupHeroSlider();
  renderRecentStories();
  setupStoriesArchive();
  setupSingleStory();
  setupSubmitForm();
});

// -------------------------------------------------------------
// 1. Obfuscated Contact Link
// -------------------------------------------------------------
function setupContactLink() {
  const contactLinks = document.querySelectorAll(".contact-obfuscated");
  contactLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const user = link.getAttribute("data-user") || "archive";
      const domain = link.getAttribute("data-domain") || "environmental-futures.org";
      window.location.href = `mailto:${user}@${domain}?subject=Archive%20Inquiry`;
    });
  });
}

// -------------------------------------------------------------
// 1b. Hero Slider Logic (Philosophy World Democracy style)
// -------------------------------------------------------------
function setupHeroSlider() {
  const track = document.getElementById("hero-slider-track");
  if (!track) return;

  const slides = track.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".slider-dot");
  const prevBtn = document.getElementById("slider-prev");
  const nextBtn = document.getElementById("slider-next");
  const captionEl = document.getElementById("hero-caption");

  if (!slides.length) return;

  let currentSlide = 0;
  let autoplayTimer = null;

  function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;

    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add("is-active");
        if (captionEl) {
          const captionText = slide.getAttribute("data-caption") || "";
          captionEl.textContent = captionText;
        }
      } else {
        slide.classList.remove("is-active");
      }
    });

    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add("is-active");
      } else {
        dot.classList.remove("is-active");
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000); // Transitions smoothly every 6 seconds
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopAutoplay();
      showSlide(currentSlide - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopAutoplay();
      showSlide(currentSlide + 1);
      startAutoplay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      stopAutoplay();
      const targetIndex = parseInt(dot.getAttribute("data-slide"), 10);
      showSlide(targetIndex);
      startAutoplay();
    });
  });

  // Pause on hover
  track.parentElement.addEventListener("mouseenter", stopAutoplay);
  track.parentElement.addEventListener("mouseleave", startAutoplay);

  // Initialize first slide and start autoplay
  showSlide(0);
  startAutoplay();
}

// -------------------------------------------------------------
// 1c. Render Recent Stories Grid (Small boxes below description)
// -------------------------------------------------------------
async function renderRecentStories() {
  const gridEl = document.getElementById("recent-stories-grid");
  if (!gridEl) return;

  const stories = await getArchiveStories();
  const sectionEl = gridEl.closest(".recent-stories-section");
  if (!stories.length) {
    if (sectionEl) sectionEl.hidden = true;
    return;
  }
  const recentStories = stories.slice(0, 3); // 3 recent stories

  gridEl.innerHTML = "";
  recentStories.forEach(story => {
    const card = document.createElement("article");
    card.className = "story-box";

    const titleH3 = document.createElement("h3");
    titleH3.className = "story-box-title";

    const link = document.createElement("a");
    link.href = `./story.html?id=${encodeURIComponent(story.id)}`;
    link.textContent = story.title;
    titleH3.appendChild(link);

    const meta = document.createElement("div");
    meta.className = "story-box-meta";
    meta.textContent = story.anonymous ? "Anonymous" : story.author;

    // First paragraph excerpt (up to 130 characters)
    const firstP = story.body.split(/\n\s*\n/)[0].trim().replace(/^>\s*/, "");
    const excerptText = firstP.length > 140 ? firstP.slice(0, 140) + "…" : firstP;

    const excerpt = document.createElement("p");
    excerpt.className = "story-box-excerpt";
    excerpt.textContent = excerptText;

    const readLink = document.createElement("a");
    readLink.className = "story-box-link";
    readLink.href = `./story.html?id=${encodeURIComponent(story.id)}`;
    readLink.textContent = "Read story →";

    card.appendChild(titleH3);
    card.appendChild(meta);
    card.appendChild(excerpt);
    card.appendChild(readLink);

    gridEl.appendChild(card);
  });
}

// -------------------------------------------------------------
// 2. Stories Archive Logic & Pagination
// -------------------------------------------------------------
async function getArchiveStories() {
  const result = await fetch(`${API_BASE}/stories`);
  if (!result.ok) throw new Error("Could not load stories.");
  return [...await result.json(), ...SAMPLE_STORIES];
}

async function setupStoriesArchive() {
  const listEl = document.getElementById("stories-list");
  if (!listEl) return;

  const emptyStateEl = document.getElementById("stories-empty-state");
  const paginationNav = document.getElementById("pagination-nav");
  const prevLink = document.getElementById("prev-page");
  const nextLink = document.getElementById("next-page");
  const pageIndicator = document.getElementById("page-indicator");

  let stories;
  try {
    stories = await getArchiveStories();
  } catch (error) {
    console.error(error);
    if (emptyStateEl) {
      emptyStateEl.style.display = "block";
      emptyStateEl.textContent = "The archive is temporarily unavailable. Please try again later.";
    }
    if (paginationNav) paginationNav.style.display = "none";
    return;
  }

  if (stories.length === 0) {
    listEl.style.display = "none";
    if (emptyStateEl) emptyStateEl.style.display = "block";
    if (paginationNav) paginationNav.style.display = "none";
    return;
  }

  const perPage = 20;
  const urlParams = new URLSearchParams(window.location.search);
  let currentPage = parseInt(urlParams.get("page") || "1", 10);
  const totalPages = Math.ceil(stories.length / perPage);

  if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * perPage;
  const pageStories = stories.slice(startIndex, startIndex + perPage);

  listEl.innerHTML = "";
  pageStories.forEach(story => {
    const li = document.createElement("li");
    li.className = "story-item";

    const titleH2 = document.createElement("h2");
    titleH2.className = "story-item-title";

    const a = document.createElement("a");
    a.href = `./story.html?id=${encodeURIComponent(story.id)}`;
    a.textContent = story.title;
    titleH2.appendChild(a);

    const metaP = document.createElement("p");
    metaP.className = "story-item-meta";
    metaP.textContent = story.anonymous ? "Anonymous" : story.author;

    li.appendChild(titleH2);
    li.appendChild(metaP);
    listEl.appendChild(li);
  });

  // Update pagination controls
  if (pageIndicator) {
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  if (prevLink) {
    if (currentPage > 1) {
      prevLink.href = `./stories.html?page=${currentPage - 1}`;
      prevLink.removeAttribute("aria-disabled");
    } else {
      prevLink.removeAttribute("href");
      prevLink.setAttribute("aria-disabled", "true");
    }
  }

  if (nextLink) {
    if (currentPage < totalPages) {
      nextLink.href = `./stories.html?page=${currentPage + 1}`;
      nextLink.removeAttribute("aria-disabled");
    } else {
      nextLink.removeAttribute("href");
      nextLink.setAttribute("aria-disabled", "true");
    }
  }
}

// -------------------------------------------------------------
// 3. Single Story Viewer Logic
// -------------------------------------------------------------
async function setupSingleStory() {
  const titleEl = document.getElementById("story-title");
  if (!titleEl) return;

  const bylineEl = document.getElementById("story-byline");
  const bodyEl = document.getElementById("story-body");
  const bioContainer = document.getElementById("author-bio-container");
  const bioText = document.getElementById("author-bio-text");
  const prevStoryLink = document.getElementById("prev-story-link");
  const nextStoryLink = document.getElementById("next-story-link");
  const prevWrapper = document.getElementById("prev-story-wrapper");
  const nextWrapper = document.getElementById("next-story-wrapper");

  let stories;
  try {
    stories = await getArchiveStories();
  } catch (error) {
    console.error(error);
    titleEl.textContent = "Story unavailable";
    bodyEl.innerHTML = "<p>The archive is temporarily unavailable. Please try again later.</p>";
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get("id");

  let storyIndex = stories.findIndex(s => s.id === storyId);
  if (storyIndex === -1) {
    storyIndex = 0; // Default to first story if not specified
  }

  const story = stories[storyIndex];
  if (!story) {
    titleEl.textContent = "Story not found";
    bodyEl.innerHTML = "<p>The requested story could not be located in the archive.</p>";
    return;
  }

  document.title = `${story.title} — Environmental Futures Archive`;
  titleEl.textContent = story.title;
  bylineEl.textContent = story.anonymous ? "by Anonymous" : `by ${story.author}`;

  // Preserve paragraph breaks and handle formatting
  bodyEl.innerHTML = "";
  const paragraphs = story.body.split(/\n\s*\n/);
  paragraphs.forEach(pText => {
    const trimmed = pText.trim();
    if (trimmed === "---" || trimmed === "***") {
      const hr = document.createElement("hr");
      hr.className = "scene-break";
      bodyEl.appendChild(hr);
    } else if (trimmed.startsWith(">")) {
      const bq = document.createElement("blockquote");
      bq.textContent = trimmed.replace(/^>\s*/, "");
      bodyEl.appendChild(bq);
    } else if (trimmed) {
      const p = document.createElement("p");
      p.textContent = trimmed;
      bodyEl.appendChild(p);
    }
  });

  // Author Bio
  if (!story.anonymous && story.bio && story.bio.trim()) {
    bioContainer.style.display = "block";
    bioText.textContent = story.bio;
  } else {
    bioContainer.style.display = "none";
  }

  // Navigation Links
  if (storyIndex > 0) {
    const prevStory = stories[storyIndex - 1];
    prevStoryLink.href = `./story.html?id=${encodeURIComponent(prevStory.id)}`;
  } else {
    prevWrapper.style.visibility = "hidden";
  }

  if (storyIndex < stories.length - 1) {
    const nextStory = stories[storyIndex + 1];
    nextStoryLink.href = `./story.html?id=${encodeURIComponent(nextStory.id)}`;
  } else {
    nextWrapper.style.visibility = "hidden";
  }
}

// -------------------------------------------------------------
// 4. Submission Form Logic
// -------------------------------------------------------------
function setupSubmitForm() {
  const form = document.getElementById("submission-form");
  if (!form) return;

  const titleInput = document.getElementById("story-title-input");
  const titleCharCounter = document.getElementById("title-char-counter");

  const storyInput = document.getElementById("story-content-input");
  const storyWordCounter = document.getElementById("story-word-counter");
  const fileInput = document.getElementById("story-file-upload");
  const fileInfoNote = document.getElementById("file-info-note");

  const bioInput = document.getElementById("author-bio-input");
  const bioWordCounter = document.getElementById("bio-word-counter");

  const errorSummary = document.getElementById("error-summary");
  const errorSummaryList = document.getElementById("error-summary-list");

  let formIsDirty = false;
  let attachedFile = null;

  // Track file selection
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      formIsDirty = true;
      const file = fileInput.files[0];
      if (!file) {
        attachedFile = null;
        if (fileInfoNote) fileInfoNote.textContent = "";
        return;
      }
      attachedFile = {
        name: file.name,
        size: file.size,
        type: file.type
      };

      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt') {
        const reader = new FileReader();
        reader.onload = (event) => {
          storyInput.value = event.target.result;
          storyInput.dispatchEvent(new Event('input'));
          if (fileInfoNote) {
            fileInfoNote.textContent = `Loaded text from "${file.name}" (${(file.size / 1024).toFixed(1)} KB).`;
          }
        };
        reader.readAsText(file);
      } else {
        if (fileInfoNote) {
          fileInfoNote.textContent = `Attached file "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Story can also be reviewed from this document.`;
        }
      }
    });
  }

  // Track dirty state to prevent accidental loss
  form.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", () => {
      formIsDirty = true;
    });
  });

  window.addEventListener("beforeunload", (e) => {
    if (formIsDirty) {
      e.preventDefault();
      e.returnValue = "You have unsaved text in your story submission. Are you sure you want to leave?";
    }
  });

  // Word counting helper
  function countWords(str) {
    if (!str) return 0;
    const matches = str.trim().match(/\S+/g);
    return matches ? matches.length : 0;
  }

  // Story live counter
  storyInput.addEventListener("input", () => {
    const count = countWords(storyInput.value);
    storyWordCounter.textContent = `${count} / 1000 words`;
    if (count > 1000) {
      storyWordCounter.classList.add("over-limit");
    } else {
      storyWordCounter.classList.remove("over-limit");
    }
  });

  // Title character counter
  titleInput.addEventListener("input", () => {
    const len = titleInput.value.length;
    titleCharCounter.textContent = `${len} / 120 characters`;
    if (len > 120) {
      titleCharCounter.classList.add("over-limit");
    } else {
      titleCharCounter.classList.remove("over-limit");
    }
  });

  // Bio live counter
  bioInput.addEventListener("input", () => {
    const count = countWords(bioInput.value);
    bioWordCounter.textContent = `${count} / 60 words`;
    if (count > 60) {
      bioWordCounter.classList.add("over-limit");
    } else {
      bioWordCounter.classList.remove("over-limit");
    }
  });

  // Form submission validation
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Check Honeypot
    const hp = document.getElementById("form-website-hp");
    if (hp && hp.value.trim() !== "") {
      console.warn("Spam honeypot triggered");
      window.location.href = "./thank-you.html";
      return;
    }

    // Reset errors
    const errors = [];
    document.querySelectorAll(".field-error").forEach(el => {
      el.classList.remove("is-active");
    });
    document.querySelectorAll(".form-control").forEach(el => {
      el.classList.remove("has-error");
    });
    errorSummary.classList.remove("is-active");
    errorSummaryList.innerHTML = "";

    // 1. Author Name
    const nameInput = document.getElementById("author-name");
    if (!nameInput.value.trim()) {
      showError(nameInput, "author-name-error", "Enter your full name.", errors);
    }

    // 2. Email
    const emailInput = document.getElementById("author-email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, "author-email-error", "Enter a valid email address.", errors);
    }

    // 3. Institution
    const instInput = document.getElementById("author-institution");
    if (!instInput.value.trim()) {
      showError(instInput, "author-institution-error", "Enter your university or institution.", errors);
    }

    // 4. Story Title
    const titleVal = titleInput.value.trim();
    if (!titleVal) {
      showError(titleInput, "story-title-error", "Enter a story title.", errors);
    } else if (titleVal.length > 120) {
      showError(titleInput, "story-title-error", `Your title is ${titleVal.length} characters. Shorten it to 120 or fewer.`, errors);
    }

    // 5. Story Body & Word Limit (or Attached File)
    const storyVal = storyInput.value.trim();
    const storyWords = countWords(storyVal);
    const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

    if (!storyVal && !hasFile) {
      showError(storyInput, "story-content-error", "Please provide your story text or upload a document (.pdf, .docx, .txt).", errors);
    } else if (storyVal && storyWords > 1000) {
      showError(storyInput, "story-content-error", `Your story is ${storyWords.toLocaleString()} words. Shorten it to 1,000 or fewer.`, errors);
    }

    // 6. Bio Word Limit
    const bioVal = bioInput.value.trim();
    const bioWords = countWords(bioVal);
    if (bioWords > 60) {
      showError(bioInput, "author-bio-error", `Your bio is ${bioWords} words. Shorten it to 60 or fewer.`, errors);
    }

    // 7. Checkboxes
    const origCheck = document.getElementById("confirm-original");
    if (!origCheck.checked) {
      showError(origCheck, "confirm-original-error", "Confirm that this is your original work.", errors);
    }

    const permCheck = document.getElementById("confirm-permission");
    if (!permCheck.checked) {
      showError(permCheck, "confirm-permission-error", "Give permission to publish your story.", errors);
    }

    const ageCheck = document.getElementById("confirm-age");
    if (!ageCheck.checked) {
      showError(ageCheck, "confirm-age-error", "Confirm you are 18 or older.", errors);
    }

    // If errors exist, render summary and focus it
    if (errors.length > 0) {
      errors.forEach(err => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${err.inputId}`;
        a.textContent = err.message;
        a.addEventListener("click", (evt) => {
          evt.preventDefault();
          const targetEl = document.getElementById(err.inputId);
          if (targetEl) {
            targetEl.focus();
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
        li.appendChild(a);
        errorSummaryList.appendChild(li);
      });

      errorSummary.classList.add("is-active");
      errorSummary.focus();
      return;
    }

    const submitButton = document.getElementById("submit-btn");
    submitButton.disabled = true;
    try {
      const result = await fetch(`${API_BASE}/stories`, {
        method: "POST",
        body: new FormData(form)
      });
      if (!result.ok) {
        const details = await result.json().catch(() => ({}));
        throw new Error(details.error || "The story could not be submitted.");
      }
      formIsDirty = false;
      window.location.href = "./thank-you.html";
    } catch (err) {
      submitButton.disabled = false;
      console.error("Could not submit story", err);
      errorSummaryList.innerHTML = "";
      const li = document.createElement("li");
      li.textContent = err.message;
      errorSummaryList.appendChild(li);
      errorSummary.classList.add("is-active");
      errorSummary.focus();
    }
  });

  function showError(inputEl, errorId, message, errorsArray) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("is-active");
    }
    inputEl.classList.add("has-error");
    errorsArray.push({ inputId: inputEl.id, message: message });
  }
}
