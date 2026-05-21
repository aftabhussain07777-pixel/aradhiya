/* ============================================================
   JAVASCRIPT
   ============================================================ */

// ----------------------------------------------------------
// 1. NAVIGATION SCROLL EFFECT
// ----------------------------------------------------------
const nav = document.getElementById("nav");

function updateNavOnScroll() {
  if (window.scrollY > 50) {
    nav.classList.add("nav--scrolled");
  } else {
    nav.classList.remove("nav--scrolled");
  }
}

window.addEventListener("scroll", updateNavOnScroll, {
  passive: true,
});
updateNavOnScroll(); // initial check

// ----------------------------------------------------------
// 2. FADE-UP ON SCROLL (INTERSECTION OBSERVER)
// ----------------------------------------------------------
const fadeUpElements = document.querySelectorAll(".fade-up");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -30px 0px",
  },
);

fadeUpElements.forEach((el) => observer.observe(el));

// Trigger fade-up animations immediately after load
window.addEventListener("load", () => {
  document.querySelectorAll(".hero-content .fade-up").forEach((el) => {
    el.classList.add("is-visible");
  });
});

// ----------------------------------------------------------
// 3. STATS BAR CHART ANIMATION (ON SCROLL)
// ----------------------------------------------------------
const statsBars = document.querySelectorAll(".stats__bar-fill");
const statsSection = document.querySelector(".stats");

const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        statsBars.forEach((bar) => {
          const width = bar.getAttribute("data-width");
          bar.style.width = width + "%";
        });
        barObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 },
);

if (statsSection) barObserver.observe(statsSection);

// ----------------------------------------------------------
// 4. ROI CALCULATOR — Now loaded from roi-calculator.js
// ----------------------------------------------------------
// The ROI calculator logic has been moved to assets/js/roi-calculator.js
// which is shared between index.html and realestate.html.
// It auto-detects which page it's on and uses the correct metrics.

// ----------------------------------------------------------
// 5. CONTACT FORM SUBMISSION (Web3Forms)
// ----------------------------------------------------------
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector(".contact__form-submit");
  const originalText = btn.textContent;

  // Show loading state
  btn.textContent = "Sending...";
  btn.disabled = true;

  try {
    const formData = new FormData(contactForm);
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      btn.textContent = "Message Sent! \u2713";
      btn.style.background = "var(--color-green)";
      contactForm.reset();
    } else {
      btn.textContent = "Failed to Send \u2717";
      btn.style.background = "#e74c3c";
    }
  } catch (error) {
    btn.textContent = "Failed to Send \u2717";
    btn.style.background = "#e74c3c";
  }

  // Reset button after 3 seconds
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = "";
    btn.disabled = false;
  }, 3000);
});

// ----------------------------------------------------------
// 6. FORM MICRO-INTERACTIONS (Real-time validation)
// ----------------------------------------------------------
const formInputs = document.querySelectorAll(
  ".contact__form-input[data-validate]",
);

function validateField(input) {
  const type = input.dataset.validate;
  const value = input.value.trim();

  // Remove existing states
  input.classList.remove("is-valid", "is-invalid");

  if (value.length === 0) return; // leave neutral when empty

  let isValid = false;

  switch (type) {
    case "email":
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      break;
    case "text":
    default:
      isValid = value.length >= 2;
      break;
  }

  // Add a tiny delay so the state change feels intentional
  requestAnimationFrame(() => {
    if (isValid) {
      input.classList.add("is-valid");
    } else if (value.length > 0) {
      input.classList.add("is-invalid");
    }
  });
}

formInputs.forEach((input) => {
  // Validate on blur (when user leaves the field)
  input.addEventListener("blur", () => validateField(input));

  // Live validate after the first blur (on subsequent keystrokes)
  input.addEventListener("focus", () => {
    // Re-validate on each keystroke while focused
    const handler = () => validateField(input);
    input.addEventListener("input", handler, { once: false });

    // Remove the handler when focus is lost
    input.addEventListener(
      "blur",
      () => {
        input.removeEventListener("input", handler);
      },
      { once: true },
    );
  });

  // Reset validation state when field is cleared
  input.addEventListener("input", () => {
    if (input.value.trim().length === 0) {
      input.classList.remove("is-valid", "is-invalid");
    }
  });
});

// Ripple effect on submit button
const submitBtn = document.querySelector(".contact__form-submit");
if (submitBtn) {
  submitBtn.addEventListener("click", function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    this.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => ripple.remove(), 600);
  });
}

// ----------------------------------------------------------
// 7. FOOTER YEAR
// ----------------------------------------------------------
document.getElementById("currentYear").textContent = new Date().getFullYear();

// ----------------------------------------------------------
// 8. MOBILE NAV TOGGLE (basic - nav links hidden via CSS)
// ----------------------------------------------------------
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.style.display === "flex";
  navLinks.style.display = isOpen ? "none" : "flex";
  navLinks.style.position = isOpen ? "" : "absolute";
  navLinks.style.top = isOpen ? "" : "100%";
  navLinks.style.left = isOpen ? "" : "0";
  navLinks.style.right = isOpen ? "" : "0";
  navLinks.style.background = isOpen ? "" : "rgba(10, 1, 71, 0.98)";
  navLinks.style.flexDirection = isOpen ? "" : "column";
  navLinks.style.padding = isOpen ? "" : "24px 40px";
  navLinks.style.gap = isOpen ? "" : "16px";
  navLinks.style.backdropFilter = isOpen ? "" : "blur(20px)";
});

// ----------------------------------------------------------
// 9. SMOOTH SCROLL FOR ALL ANCHOR LINKS
// ----------------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const navHeight = nav.offsetHeight;
      const targetPosition =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight -
        16;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      // Close mobile nav if open
      if (navLinks.style.display === "flex" && window.innerWidth <= 900) {
        navLinks.style.display = "none";
      }
    }
  });
});
