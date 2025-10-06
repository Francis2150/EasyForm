// helpers.js

// Safe value getter
function val(el) {
  return el ? (el.value == null ? "" : String(el.value).trim()) : "";
}

// Collect data from a .director or .subscriber section
function collectPersonData(el) {
  if (!el) return {};
  const q = (sel) => {
    const f = el.querySelector(sel);
    return f ? (f.value == null ? "" : String(f.value).trim()) : "";
  };

  return {
    title: q(".title"),
    fname: q(".fname"),
    mname: q(".mname"),
    sname: q(".sname"),
    gender: q(".gender"),
    dob: q(".dob"),
    nation: q(".nation"),
    contact1: q(".pContact1"),
    contact2: q(".pContact2"),
    email: q(".pEmail"),
    resGps: q(".resGps"),
    resHse: q(".resHse"),
    resLandmark: q(".resLandmark"),
    resStreet: q(".resStreet"),
    resCity: q(".resCity"),
    resTown: q(".resTown"),
    resDistrict: q(".resDistrict"),
    resRegion: q(".resRegion"),
    sharePercent: q(".sharePercent") || ""
  };
}

