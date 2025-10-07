// nav.js
// ==========================================
// This file controls form navigation between
// sections so that only ONE set of inputs
// is visible at a time.
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  // ---- List of section IDs (in order) ----
  const sectionOrder = [
    "companyInfoSection",
    "directorsSectionContainer",
    "secretariesSectionContainer",
    "shareholdersSectionContainer",
    "beneficialOwnersSectionContainer"
  ];

  let currentSectionIndex = 0; // Start at first section

  // ---- Helper: show only current section ----
  function showSection(index) {
    sectionOrder.forEach((id, i) => {
      const section = document.getElementById(id);
      if (!section) return;
      section.style.display = i === index ? "block" : "none";
    });

    // Update button visibility
    updateButtons();
  }

  // ---- Create navigation buttons dynamically ----
  function createNavButtons() {
    sectionOrder.forEach((id, i) => {
      const section = document.getElementById(id);
      if (!section) return;

      // Container for navigation buttons
      const navDiv = document.createElement("div");
      navDiv.classList.add("nav-buttons");
      navDiv.style.marginTop = "20px";
      navDiv.style.textAlign = "center";

      // BACK button (not visible on first section)
      const backBtn = document.createElement("button");
      backBtn.type = "button";
      backBtn.textContent = "⬅️ Back";
      backBtn.classList.add("nav-back");
      backBtn.style.marginRight = "10px";
      backBtn.addEventListener("click", () => {
        if (currentSectionIndex > 0) {
          currentSectionIndex--;
          showSection(currentSectionIndex);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });

      // NEXT button (not visible on last section)
      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.textContent = "Next ➡️";
      nextBtn.classList.add("nav-next");
      nextBtn.addEventListener("click", () => {
        if (currentSectionIndex < sectionOrder.length - 1) {
          currentSectionIndex++;
          showSection(currentSectionIndex);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });

      // Append both
      navDiv.appendChild(backBtn);
      navDiv.appendChild(nextBtn);
      section.appendChild(navDiv);
    });
  }

  // ---- Update button visibility ----
  function updateButtons() {
    const allBacks = document.querySelectorAll(".nav-back");
    const allNexts = document.querySelectorAll(".nav-next");

    allBacks.forEach((btn, i) => {
      btn.style.display = currentSectionIndex === 0 ? "none" : "inline-block";
    });

    allNexts.forEach((btn, i) => {
      btn.style.display =
        currentSectionIndex === sectionOrder.length - 1
          ? "none"
          : "inline-block";
    });
  }

  // ---- Initialize navigation ----
  createNavButtons();
  showSection(currentSectionIndex); // Only first section visible initially
});
