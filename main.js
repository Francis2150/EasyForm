// main.js

document.addEventListener("DOMContentLoaded", () => {
  const subscriberSetting = document.getElementById("subscriberSetting");
  const subscriberSharesDiv = document.getElementById("subscriberShares");
  const directorsContainer = document.getElementById("directorsContainer");
  const subscribersContainer = document.getElementById("subscribersContainer");

  let savedShares = {};

  function refreshShareInputs() {
    const selected = Array.from(subscriberSetting.selectedOptions).map(o => o.value);
    subscribersContainer.style.display = selected.includes("separate") ? "" : "none";

    const prev = { ...savedShares };
    subscriberSharesDiv.innerHTML = "";

    selected.forEach(key => {
      if (key === "separate") return;
      if (key.startsWith("director") || key === "secretary") {
        const labelTxt = key.startsWith("director")
          ? `Director ${key.replace("director", "")}`
          : "Secretary";
        const wrapper = document.createElement("div");
        const inputVal = prev[key] || "";
        wrapper.innerHTML = `
          <label>${labelTxt} Share %</label>
          <input type="number" class="sharePercentAuto" data-key="${key}" min="0" max="100" step="0.01" value="${inputVal}">
        `;
        const inp = wrapper.querySelector("input");
        inp.addEventListener("input", () => {
          savedShares[inp.dataset.key] = inp.value;
          updatePreview();
        });
        subscriberSharesDiv.appendChild(wrapper);
      }
    });
  }

  // addDirector button
  const addDirectorBtn = document.getElementById("addDirectorBtn");
  if (addDirectorBtn) {
    addDirectorBtn.addEventListener("click", () => {
      const first = directorsContainer.querySelector(".director");
      if (!first) return;
      const clone = first.cloneNode(true);
      clone.querySelectorAll("input, select").forEach(el => el.value = "");
      const newIndex = directorsContainer.querySelectorAll(".director").length + 1;
      clone.querySelector("legend").textContent = `Director ${newIndex} Details`;
      directorsContainer.appendChild(clone);
      updatePreview();
    });
  }

  // addSubscriber button
  const addSubscriberBtn = document.getElementById("addSubscriberBtn");
  if (addSubscriberBtn) {
    addSubscriberBtn.addEventListener("click", () => {
      const first = subscribersContainer.querySelector(".subscriber");
      if (!first) return;
      const clone = first.cloneNode(true);
      clone.querySelectorAll("input, select").forEach(el => el.value = "");
      const newIndex = subscribersContainer.querySelectorAll(".subscriber").length + 1;
      clone.querySelector("legend").textContent = `Subscriber ${newIndex} Details`;
      subscribersContainer.appendChild(clone);
      updatePreview();
    });
  }

  // global listeners
  document.addEventListener("input", updatePreview);
  document.addEventListener("change", () => {
    refreshShareInputs();
    updatePreview();
  });

  refreshShareInputs();
  updatePreview();
});
