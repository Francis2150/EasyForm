// preview.js

let savedShares = {};

function updatePreview() {
  const companyNameInput = document.getElementById("companyName");
  const endWithInput = document.getElementById("endWith");
  const presentedBySelect = document.getElementById("presentedBy");
  const activitiesInput = document.getElementById("activities");
  const capitalInput = document.getElementById("capital");

  const officeFields = [
    "officeHse","officeLandmark","officeStreet","officeCity","officeTown",
    "officeDistrict","officeRegion","officeGps","officePostalType",
    "officeBoxNumber","officeBoxRegion","officeBoxTown",
    "officeContact1","officeContact2","officeEmail"
  ].map(id => document.getElementById(id)).filter(Boolean);

  const directorsContainer = document.getElementById("directorsContainer");
  const secretarySetting = document.getElementById("secretarySetting");
  const secretaryFormFields = document.getElementById("secretaryFormFields");
  const secQualification = document.getElementById("secQualification");
  const subscriberSetting = document.getElementById("subscriberSetting");
  const subscriberSharesDiv = document.getElementById("subscriberShares");
  const subscribersContainer = document.getElementById("subscribersContainer");

  // Collect secretary input fields
  const secInputs = {
    title: document.getElementById("secTitle"),
    fname: document.getElementById("secFname"),
    mname: document.getElementById("secMname"),
    sname: document.getElementById("secSname"),
    gender: document.getElementById("secGender"),
    dob: document.getElementById("secDob"),
    nation: document.getElementById("secNation"),
    contact1: document.getElementById("secContact1"),
    contact2: document.getElementById("secContact2"),
    email: document.getElementById("secEmail"),
    resGps: document.getElementById("secResGps"),
    resHse: document.getElementById("secResHse"),
    resLandmark: document.getElementById("secResLandmark"),
    resStreet: document.getElementById("secResStreet"),
    resCity: document.getElementById("secResCity"),
    resTown: document.getElementById("secResTown"),
    resDistrict: document.getElementById("secResDistrict"),
    resRegion: document.getElementById("secResRegion")
  };

  // sync savedShares
  savedShares = {};
  document.querySelectorAll(".sharePercentAuto").forEach(inp => {
    savedShares[inp.dataset.key] = inp.value;
  });

  // --- Company ---
  document.getElementById("outCompany").innerHTML =
    `<b>Company:</b> ${val(companyNameInput)} ${val(endWithInput) ? `(End With: ${val(endWithInput)})` : ""} — Presented By: ${val(presentedBySelect)}, Activities: ${val(activitiesInput)}, Capital: ${val(capitalInput)}`;

  // --- Office ---
  document.getElementById("outOffice").innerHTML =
    `<b>Office:</b> ${officeFields.map(el => val(el)).filter(Boolean).join(", ")}`;

  // --- Directors ---
  const directorEls = Array.from(directorsContainer.querySelectorAll(".director"));
  const directorData = directorEls.map(el => collectPersonData(el));
  let dirHTML = "";
  directorData.forEach((d, idx) => {
    dirHTML += `<p><b>Director ${idx + 1}:</b> ${d.title} ${d.fname} ${d.mname} ${d.sname} — Gender: ${d.gender}, DOB: ${d.dob}, Nation: ${d.nation}, Contact: ${d.contact1}, ${d.contact2}, Email: ${d.email}<br>
    Residence: ${[d.resHse,d.resLandmark,d.resStreet,d.resCity,d.resTown,d.resDistrict,d.resRegion].filter(Boolean).join(", ")} ${d.resGps ? `(GPS: ${d.resGps})` : ""}</p>`;
  });
  document.getElementById("outDirectors").innerHTML = dirHTML;

  // --- Secretary ---
  let sec = {};
  const secSettingVal = secretarySetting ? secretarySetting.value : "";
  if (secSettingVal.startsWith("director")) {
    const idx = parseInt(secSettingVal.replace("director", ""), 10) - 1;
    sec = directorData[idx] || {};
    if (secretaryFormFields) secretaryFormFields.style.display = "none";
  } else {
    for (let k in secInputs) sec[k] = val(secInputs[k]);
  }
  sec.qualification = val(secQualification);

  document.getElementById("outSecretary").innerHTML =
    `<p><b>Secretary:</b> ${sec.title} ${sec.fname} ${sec.mname} ${sec.sname} — Gender: ${sec.gender}, DOB: ${sec.dob}, Nation: ${sec.nation}, Contact: ${sec.contact1} ${sec.contact2}, Email: ${sec.email}<br>
    Residence: ${[sec.resHse,sec.resLandmark,sec.resStreet,sec.resCity,sec.resTown,sec.resDistrict,sec.resRegion].filter(Boolean).join(", ")} ${sec.resGps ? `(GPS: ${sec.resGps})` : ""}<br>
    Qualification: ${sec.qualification}</p>`;

  // --- Subscribers ---
  const selectedSubs = subscriberSetting ? Array.from(subscriberSetting.selectedOptions).map(o => o.value) : [];
  let subsHTML = "";

  selectedSubs.forEach(key => {
    if (key.startsWith("director")) {
      const idx = parseInt(key.replace("director", ""), 10) - 1;
      const d = directorData[idx] || {};
      subsHTML += `<p><b>Director ${idx + 1} as Subscriber:</b> ${d.title} ${d.fname} ${d.sname} — Share: ${savedShares[key] || ""}%</p>`;
    } else if (key === "secretary") {
      subsHTML += `<p><b>Secretary as Subscriber:</b> ${sec.title} ${sec.fname} ${sec.sname} — Share: ${savedShares[key] || ""}%</p>`;
    }
  });

  Array.from(subscribersContainer.querySelectorAll(".subscriber")).forEach((el, i) => {
    const s = collectPersonData(el);
    subsHTML += `<p><b>Subscriber ${i + 1}:</b> ${s.title} ${s.fname} ${s.sname} — Share: ${s.sharePercent || ""}%</p>`;
  });

  document.getElementById("outSubscribers").innerHTML = subsHTML;
}

