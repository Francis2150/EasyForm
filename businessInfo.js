// businessInfo.js

document.addEventListener("DOMContentLoaded", () => {
  const businessContainer = document.getElementById("businessInfoContainer");

  // --- Define business fields here (you can add more anytime) ---
  const businessFields = [
    { label: "Business Name", name: "business_name", type: "text" },
    { label: "Registration Number", name: "registration_no", type: "text" },
    { label: "Tax Identification Number (TIN)", name: "tax_id", type: "text" },
    { label: "Business Address", name: "business_address", type: "text" },
    { label: "Business Type", name: "business_type", type: "text" },
    { label: "Email", name: "business_email", type: "email" },
    { label: "Phone", name: "business_phone", type: "text" },
  ];

  // --- Create dynamic form fields ---
  const section = document.createElement("div");
  section.classList.add("business-section");

  const header = document.createElement("h3");
  header.textContent = "Business Information";
  section.appendChild(header);

  businessFields.forEach((field) => {
    const group = document.createElement("div");
    group.classList.add("form-group");

    const label = document.createElement("label");
    label.textContent = field.label + ":";
    const input = document.createElement("input");
    input.type = field.type;
    input.name = field.name;
    input.placeholder = `Enter ${field.label}`;
    input.required = true;

    group.appendChild(label);
    group.appendChild(input);
    section.appendChild(group);
  });

  businessContainer.appendChild(section);

  // --- Make the function globally accessible for table render ---
  window.collectBusinessInfo = function () {
    const data = {};
    businessFields.forEach((field) => {
      const value = document.querySelector(`[name="${field.name}"]`)?.value || "";
      data[field.name] = value;
    });
    return data;
  };
});
