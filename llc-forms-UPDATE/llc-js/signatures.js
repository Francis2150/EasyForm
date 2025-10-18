document.addEventListener("DOMContentLoaded", () => {
  let currentFocus = null;
  let autoIdCounter = 1;

  // Helper: assign unique IDs if missing
  function ensureId(el, prefix) {
    if (!el.id) {
      el.id = prefix + "-" + autoIdCounter++;
    }
    return el.id;
  }

  // --- Editable text setup ---
  document.querySelectorAll(".page p:not(.signature-box)").forEach(p => {
    ensureId(p, "text"); // auto ID if missing
    p.setAttribute("contenteditable", "true");

    // Restore saved text
    const savedText = localStorage.getItem("text:" + p.id);
    if (savedText !== null) p.textContent = savedText;

    // Save on blur
    p.addEventListener("blur", () => {
      localStorage.setItem("text:" + p.id, p.textContent);
      currentFocus = null;
    });

    // Track focus
    p.addEventListener("focus", () => currentFocus = p);
  });

  // --- Signature boxes setup ---
  const toDataURL = (file, cb) => {
    const r = new FileReader();
    r.onload = e => cb(e.target.result);
    r.readAsDataURL(file);
  };

  document.querySelectorAll(".signature-box").forEach(box => {
    ensureId(box, "signature"); // auto ID if missing
   box.setAttribute("contenteditable", "true");
   box.addEventListener("beforeinput", e => {
  // Block text insertion
  if (e.inputType === "insertText") e.preventDefault();
});


    // Restore saved signature image
    const saved = localStorage.getItem("signature:" + box.id);
    if (saved) {
      box.style.backgroundImage = `url('${saved}')`;
      box.classList.add("has-image");
      Array.from(box.childNodes).forEach(n => {
     if (!n.classList || !n.classList.contains("resize-handle")) n.remove();
});

    }

    // Restore saved position & size
    const savedBox = localStorage.getItem("signature-box:" + box.id);
    if (savedBox) {
      const { left, top, width, height } = JSON.parse(savedBox);
      box.style.position = "absolute";
      box.style.left = left;
      box.style.top = top;
      box.style.width = width;
      box.style.height = height;
    }

    // Track "focus"
    box.addEventListener("click", () => {
      currentFocus = box;
      document.querySelectorAll(".signature-box").forEach(b => b.classList.remove("focused"));
      box.classList.add("focused");
    });

    // Paste image
box.addEventListener("paste", e => {
  const items = e.clipboardData?.items;
  if (!items) return;

  let handled = false;

  for (const it of items) {
    if (it.type.startsWith("image/")) {
      const f = it.getAsFile();
      const r = new FileReader();
      r.onload = ev => {
        box.style.backgroundImage = `url('${ev.target.result}')`;
        box.classList.add("has-image");
        box.textContent = "";
        localStorage.setItem("signature:" + box.id, ev.target.result);
      };
      r.readAsDataURL(f);
      handled = true;
      e.preventDefault();
      break;
    }
  }

  // Fallback: handle pasted base64 image inside HTML
  if (!handled) {
    const html = e.clipboardData.getData("text/html");
    const match = html.match(/<img[^>]+src="([^">]+)"/i);
    if (match) {
      const src = match[1];
      box.style.backgroundImage = `url('${src}')`;
      box.classList.add("has-image");
      box.textContent = "";
      localStorage.setItem("signature:" + box.id, src);
      e.preventDefault();
    }
  }
});


    // Drag & drop image
    box.addEventListener("dragover", e => e.preventDefault());
    box.addEventListener("drop", e => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        toDataURL(file, data => {
          box.style.backgroundImage = `url('${data}')`;
          box.classList.add("has-image");
          box.textContent = "";
          localStorage.setItem("signature:" + box.id, data);
        });
      }
    });

    // --- Draggable + Resizable ---
    if (!box.querySelector(".resize-handle")) {
      const handle = document.createElement("div");
      handle.classList.add("resize-handle");
      box.appendChild(handle);
    }

    let isDragging = false, isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    function saveBoxState() {
      localStorage.setItem("signature-box:" + box.id, JSON.stringify({
        left: box.style.left,
        top: box.style.top,
        width: box.style.width,
        height: box.style.height
      }));
    }

    // Dragging
    box.addEventListener("mousedown", e => {
      if (e.target.classList.contains("resize-handle")) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = box.offsetLeft;
      startTop = box.offsetTop;
      document.body.style.userSelect = "none";
    });

    // Resizing
    box.querySelector(".resize-handle").addEventListener("mousedown", e => {
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = box.offsetWidth;
      startHeight = box.offsetHeight;
      document.body.style.userSelect = "none";
    });

    // Move/Resize
    document.addEventListener("mousemove", e => {
      if (isDragging) {
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        box.style.left = startLeft + dx + "px";
        box.style.top = startTop + dy + "px";
      } else if (isResizing) {
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        box.style.width = startWidth + dx + "px";
        box.style.height = startHeight + dy + "px";
      }
    });

    // Stop + Save
    document.addEventListener("mouseup", () => {
      if (isDragging || isResizing) {
        saveBoxState();
      }
      isDragging = false;
      isResizing = false;
      document.body.style.userSelect = "";
    });
  });

  // --- Clear Focus Button ---
  document.getElementById("clear-focus").addEventListener("click", () => {
    if (!currentFocus) return;

    if (currentFocus.classList.contains("signature-box")) {
      // Clear signature
      currentFocus.style.backgroundImage = "";
      currentFocus.classList.remove("has-image", "focused");
      currentFocus.textContent = "Signature";
      localStorage.removeItem("signature:" + currentFocus.id);
    } else {
      // Clear text
      currentFocus.textContent = "";
      localStorage.removeItem("text:" + currentFocus.id);
    }

    currentFocus = null;
  });

  // --- Reset All Button ---
  document.getElementById("reset-all").addEventListener("click", () => {
    // Clear all text fields
    document.querySelectorAll(".page p:not(.signature-box)").forEach(p => {
      p.textContent = "";
      localStorage.removeItem("text:" + p.id);
    });

    // Clear all signature boxes
    document.querySelectorAll(".signature-box").forEach(box => {
      box.style.backgroundImage = "";
      box.classList.remove("has-image", "focused");
      box.textContent = "Signature";
      localStorage.removeItem("signature:" + box.id);

      // Reset position & size
      localStorage.removeItem("signature-box:" + box.id);
      box.style.left = "";
      box.style.top = "";
      box.style.width = "";
      box.style.height = "";
    });

    currentFocus = null;
  });
});
