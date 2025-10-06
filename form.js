document.addEventListener("DOMContentLoaded", () => {
  // ---------- elements ----------
  const infoForm = document.getElementById('infoForm');
  const subscriberSetting = document.getElementById('subscriberSetting');
  const subscriberSharesDiv = document.getElementById('subscriberShares');
  const subscribersContainer = document.getElementById('subscribersContainer');
  const directorsContainer = document.getElementById('directorsContainer');

  const companyNameInput = document.getElementById('companyName');
  const endWithInput = document.getElementById('endWith');
  const presentedBySelect = document.getElementById('presentedBy');
  const activitiesInput = document.getElementById('activities');
  const capitalInput = document.getElementById('capital');

  const officeFields = [
    "officeHse","officeLandmark","officeStreet","officeCity","officeTown",
    "officeDistrict","officeRegion","officeGps","officePostalType",
    "officeBoxNumber","officeBoxRegion","officeBoxTown",
    "officeContact1","officeContact2","officeEmail"
  ].map(id => document.getElementById(id)).filter(Boolean);

  const secretarySetting = document.getElementById('secretarySetting');
  const secretaryFormFields = document.getElementById('secretaryFormFields');
  const secQualification = document.getElementById('secQualification');

  const secInputs = {
    title: document.getElementById('secTitle'),
    fname: document.getElementById('secFname'),
    mname: document.getElementById('secMname'),
    sname: document.getElementById('secSname'),
    gender: document.getElementById('secGender'),
    dob: document.getElementById('secDob'),
    nation: document.getElementById('secNation'),
    contact1: document.getElementById('secContact1'),
    contact2: document.getElementById('secContact2'),
    email: document.getElementById('secEmail'),
    resGps: document.getElementById('secResGps'),
    resHse: document.getElementById('secResHse'),
    resLandmark: document.getElementById('secResLandmark'),
    resStreet: document.getElementById('secResStreet'),
    resCity: document.getElementById('secResCity'),
    resTown: document.getElementById('secResTown'),
    resDistrict: document.getElementById('secResDistrict'),
    resRegion: document.getElementById('secResRegion')
  };

  // small helper
  const val = el => el ? (el.value == null ? "" : String(el.value).trim()) : "";

  // ---------- collect person data from a .director or .subscriber element ----------
  function collectPersonData(el) {
    if (!el) return {};
    const q = sel => {
      const f = el.querySelector(sel);
      return f ? (f.value == null ? "" : String(f.value).trim()) : "";
    };

    return {
      title: q('.title'),
      fname: q('.fname'),
      mname: q('.mname'),
      sname: q('.sname'),
      gender: q('.gender'),
      dob: q('.dob'),
      nation: q('.nation'),
      contact1: q('.pContact1'),
      contact2: q('.pContact2'),
      email: q('.pEmail'),
      resGps: q('.resGps'),
      resHse: q('.resHse'),
      resLandmark: q('.resLandmark'),
      resStreet: q('.resStreet'),
      resCity: q('.resCity'),
      resTown: q('.resTown'),
      resDistrict: q('.resDistrict'),
      resRegion: q('.resRegion'),
      sharePercent: q('.sharePercent') || ""
    };
  }

  // ---------- subscriber share inputs ----------
  let savedShares = {}; // store shares across rebuilds

  function refreshShareInputs() {
    if (!subscriberSetting) return;

    const selected = Array.from(subscriberSetting.selectedOptions).map(o => o.value);

    // show/hide the manual subscribers panel if 'separate' chosen
    subscribersContainer.style.display = selected.includes("separate") ? '' : 'none';

    // preserve previous values
    const prev = { ...savedShares };
    subscriberSharesDiv.innerHTML = "";

    selected.forEach(key => {
      if (key === "separate") return; // don't create a share input for the manual group marker
      if (key.startsWith("director") || key === "secretary") {
        const labelTxt = key.startsWith("director")
          ? `Director ${key.replace("director","")}`
          : "Secretary";

        const wrapper = document.createElement("div");
        wrapper.className = "share-input";
        const inputVal = prev[key] || "";
        wrapper.innerHTML = `
          <label>${labelTxt} Share %</label>
          <input type="number" class="sharePercentAuto" data-key="${key}" min="0" max="100" step="0.01" value="${inputVal}">
        `;
        // update preview when user types
        const inp = wrapper.querySelector('input');
        inp.addEventListener('input', () => {
          savedShares[inp.dataset.key] = inp.value;
          updatePreview();
        });

        subscriberSharesDiv.appendChild(wrapper);
      }
    });
  }

  // when subscriberSetting changes, remember previous share inputs and rebuild
  if (subscriberSetting) {
    subscriberSetting.addEventListener('change', () => {
      // capture current auto-share values
      savedShares = {};
      subscriberSharesDiv.querySelectorAll(".sharePercentAuto").forEach(i => {
        savedShares[i.dataset.key] = i.value;
      });
      refreshShareInputs();
      updatePreview();
    });
  }

  // ---------- secretary toggle ----------
  if (secretarySetting) {
    secretarySetting.addEventListener('change', () => {
      const v = secretarySetting.value || "";
      // if a director is selected as secretary hide the separate secretary fields
      if (v.startsWith("director")) {
        if (secretaryFormFields) secretaryFormFields.style.display = "none";
      } else {
        if (secretaryFormFields) secretaryFormFields.style.display = "block";
      }
      updatePreview();
    });
  }

  // ---------- preview builder ----------
  function updatePreview() {
    // refresh savedShares from current inputs
    savedShares = {};
    subscriberSharesDiv.querySelectorAll(".sharePercentAuto").forEach(inp => {
      savedShares[inp.dataset.key] = inp.value;
    });

    // Company
    document.getElementById("outCompany").innerHTML =
      `<b>Company:</b> ${val(companyNameInput)} ${val(endWithInput) ? `(End With: ${val(endWithInput)})` : ""} — Presented By: ${val(presentedBySelect)}, Activities: ${val(activitiesInput)}, Capital: ${val(capitalInput)}`;

    // Office (concat any non-empty fields)
    document.getElementById("outOffice").innerHTML =
      `<b>Office:</b> ${officeFields.map(el => val(el)).filter(Boolean).join(", ")}`;

    // Directors
    const directorEls = Array.from(directorsContainer.querySelectorAll('.director'));
    const directorData = directorEls.map(el => collectPersonData(el));
    let dirHTML = "";
    directorData.forEach((d, idx) => {
      dirHTML += `<p><b>Director ${idx+1}:</b> ${d.title} ${d.fname} ${d.mname} ${d.sname} — Gender: ${d.gender}, DOB: ${d.dob}, Nation: ${d.nation}, Contact: ${d.contact1 || ""} ${d.contact2 || ""}, Email: ${d.email || ""}<br>
        Residence: ${[d.resHse, d.resLandmark, d.resStreet, d.resCity, d.resTown, d.resDistrict, d.resRegion].filter(Boolean).join(", ")} ${d.resGps ? `(GPS: ${d.resGps})` : ""}</p>`;
    });
    document.getElementById("outDirectors").innerHTML = dirHTML;

    // Secretary
    let sec = {};
    const secSettingVal = secretarySetting ? (secretarySetting.value || "") : "";
    if (secSettingVal.startsWith("director")) {
      const idx = parseInt(secSettingVal.replace("director", ""), 10) - 1;
      sec = directorData[idx] || {};
      if (secretaryFormFields) secretaryFormFields.style.display = "none";
    } else {
      // use the separate secretary inputs
      if (secretaryFormFields) secretaryFormFields.style.display = "block";
      for (let k in secInputs) {
        sec[k] = secInputs[k] ? val(secInputs[k]) : "";
      }
    }
    sec.qualification = val(secQualification);

    document.getElementById("outSecretary").innerHTML =
      `<p><b>Secretary:</b> ${sec.title || ""} ${sec.fname || ""} ${sec.mname || ""} ${sec.sname || ""} — Gender: ${sec.gender || ""}, DOB: ${sec.dob || ""}, Nation: ${sec.nation || ""}, Contact: ${sec.contact1 || ""} ${sec.contact2 || ""}, Email: ${sec.email || ""}<br>
       Residence: ${[sec.resHse, sec.resLandmark, sec.resStreet, sec.resCity, sec.resTown, sec.resDistrict, sec.resRegion].filter(Boolean).join(", ")} ${sec.resGps ? `(GPS: ${sec.resGps})` : ""}<br>
       Qualification: ${sec.qualification || ""}</p>`;

    // Subscribers
    const selectedSubs = subscriberSetting ? Array.from(subscriberSetting.selectedOptions).map(o => o.value) : [];
    let subsHTML = "";

    // auto subscribers (directors / secretary)
    selectedSubs.forEach(key => {
      if (key.startsWith("director")) {
        const idx = parseInt(key.replace("director", ""), 10) - 1;
        const d = directorData[idx] || {};
        subsHTML += `<p><b>Director ${idx+1} as Subscriber:</b> ${d.title || ""} ${d.fname || ""} ${d.sname || ""} — Share: ${savedShares[key] || ""}%</p>`;
      } else if (key === "secretary") {
        subsHTML += `<p><b>Secretary as Subscriber:</b> ${sec.title || ""} ${sec.fname || ""} ${sec.sname || ""} — Share: ${savedShares[key] || ""}%</p>`;
      }
    });

    // manual (separate) subscribers
    Array.from(subscribersContainer.querySelectorAll('.subscriber')).forEach((el, i) => {
      const s = collectPersonData(el);
      subsHTML += `<p><b>Subscriber ${i+1}:</b> ${s.title || ""} ${s.fname || ""} ${s.sname || ""} — Share: ${s.sharePercent || ""}%</p>`;
    });

    document.getElementById("outSubscribers").innerHTML = subsHTML;
  }

  // ---------- add directors / subscribers ----------
  const addDirectorBtn = document.getElementById("addDirectorBtn");
  const addSubscriberBtn = document.getElementById("addSubscriberBtn");

  function sanitizeCloneFields(clone) {
    // clear values and remove ids to avoid duplicate ids in <document>
    clone.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = "";
      }
      // remove id attributes (so we don't get duplicate IDs in the document)
      if (el.id) el.removeAttribute('id');
    });
    // Also remove id on internal containers (rare) to avoid duplicates
    clone.querySelectorAll('[id]').forEach(node => {
      if (node.id) node.removeAttribute('id');
    });
  }

  if (addDirectorBtn) {
    addDirectorBtn.addEventListener('click', () => {
      const first = directorsContainer.querySelector('.director');
      if (!first) return;
      const clone = first.cloneNode(true); // copy deeply, including nested fieldsets
      sanitizeCloneFields(clone);
      // update legend text
      const newIndex = directorsContainer.querySelectorAll('.director').length + 1;
      const legend = clone.querySelector('legend');
      if (legend) legend.textContent = `Director ${newIndex} Details`;
      directorsContainer.appendChild(clone);
      updatePreview();
    });
  }

  if (addSubscriberBtn) {
    addSubscriberBtn.addEventListener('click', () => {
      const first = subscribersContainer.querySelector('.subscriber');
      if (!first) return;
      const clone = first.cloneNode(true);
      sanitizeCloneFields(clone);
      const newIndex = subscribersContainer.querySelectorAll('.subscriber').length + 1;
      const legend = clone.querySelector('legend');
      if (legend) legend.textContent = `Subscriber ${newIndex} Details`;
      subscribersContainer.appendChild(clone);
      updatePreview();
    });
  }

  // ---------- global auto update ----------
  document.addEventListener('input', updatePreview);
  document.addEventListener('change', updatePreview);

  // ---------- form submit (prevent full page reload) ----------
  if (infoForm) {
    infoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      updatePreview();

      // Build a JSON-like object with key pieces of data (useful for sending to server)
      const directors = Array.from(directorsContainer.querySelectorAll('.director')).map((el, i) => collectPersonData(el));
      const subscribersManual = Array.from(subscribersContainer.querySelectorAll('.subscriber')).map((el) => collectPersonData(el));
      const autoShares = {};
      subscriberSharesDiv.querySelectorAll('.sharePercentAuto').forEach(inp => {
        autoShares[inp.dataset.key] = inp.value;
      });

      const payload = {
        company: {
          name: val(companyNameInput),
          endWith: val(endWithInput),
          presentedBy: val(presentedBySelect),
          activities: val(activitiesInput),
          capital: val(capitalInput)
        },
        office: officeFields.map(el => ({id: el.id || null, value: val(el)})).filter(x => x.value),
        directors,
        secretarySetting: secretarySetting ? secretarySetting.value : null,
        secretary: (secretarySetting && secretarySetting.value && secretarySetting.value.startsWith('director') )
          ? directors[parseInt(secretarySetting.value.replace('director',''),10)-1] || {}
          : Object.fromEntries(Object.keys(secInputs).map(k => [k, secInputs[k] ? val(secInputs[k]) : ""])),
        subscribers: {
          selected: subscriberSetting ? Array.from(subscriberSetting.selectedOptions).map(o=> o.value) : [],
          autoShares,
          manual: subscribersManual
        }
      };

      // developer convenience: print data to console (replace with XHR/fetch to submit)
      console.log("Collected form payload:", payload);
      alert("Form captured. Check console for the payload (or implement sending to server).");
    });
  }

  // ---------- init ----------
  refreshShareInputs();
  updatePreview();
});
