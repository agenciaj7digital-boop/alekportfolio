const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector(".site-header");

const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (!reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  window.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
  }, { passive: true });

  document.querySelectorAll("[data-tilt]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      const strength = element.classList.contains("hero-visual") ? 5 : 2.2;
      element.style.transform = `perspective(1000px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
}

document.querySelectorAll(".video-frame").forEach((frame) => {
  const video = frame.querySelector("video");
  const button = frame.querySelector(".play-button");

  const stopOtherVideos = () => {
    document.querySelectorAll(".video-frame video").forEach((otherVideo) => {
      if (otherVideo !== video) {
        otherVideo.pause();
        otherVideo.closest(".video-frame").classList.remove("playing");
      }
    });
  };

  const loadVideo = () => {
    if (video.dataset.loaded) return;
    const source = video.querySelector("source[data-src]");
    source.src = source.dataset.src;
    video.load();
    video.dataset.loaded = "true";
  };

  const toggleVideo = async () => {
    stopOtherVideos();
    loadVideo();

    if (video.paused) {
      try {
        await video.play();
        frame.classList.add("playing");
      } catch {
        frame.classList.remove("playing");
      }
    } else {
      video.pause();
      frame.classList.remove("playing");
    }
  };

  frame.addEventListener("click", toggleVideo);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleVideo();
  });
  video.addEventListener("pause", () => frame.classList.remove("playing"));
});

const dialog = document.querySelector("#brief-dialog");
const form = document.querySelector("#brief-form");
const openButtons = document.querySelectorAll("[data-open-brief]");
const closeButton = document.querySelector("[data-close-brief]");

const openDialog = () => {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    document.body.classList.add("modal-open");
  }
};

const closeDialog = () => {
  dialog.close();
  document.body.classList.remove("modal-open");
};

openButtons.forEach((button) => button.addEventListener("click", openDialog));
closeButton.addEventListener("click", closeDialog);

dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;
  if (outside) closeDialog();
});

dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const message = [
    "Olá! Quero solicitar uma proposta de produção 3D.",
    "",
    `Nome: ${data.get("nome")}`,
    `Empresa: ${data.get("empresa")}`,
    `E-mail: ${data.get("email")}`,
    `WhatsApp: ${data.get("whatsapp")}`,
    `Instagram da empresa: ${data.get("instagram")}`,
    `Detalhes do projeto: ${data.get("detalhes")}`
  ].join("\n");

  const whatsappUrl = `https://wa.me/5551990181065?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

// Experiência imersiva do hero
const immersiveStyles = document.createElement("link");
immersiveStyles.rel = "stylesheet";
immersiveStyles.href = "immersive.css?v=camera-20260728c";
document.head.appendChild(immersiveStyles);

const hero = document.querySelector(".hero");
const heroVisual = document.querySelector(".hero-visual");

if (hero && heroVisual) {
  const portalRing = document.createElement("div");
  portalRing.className = "portal-ring";

  const wave = document.createElement("div");
  wave.className = "scene-wave";
  const waveHeights = [18, 44, 28, 72, 38, 86, 54, 32, 76, 46, 92, 58, 34, 68, 40, 82, 48, 26, 64, 38, 74, 30, 52, 22];
  waveHeights.forEach((height, index) => {
    const bar = document.createElement("i");
    bar.style.setProperty("--wave-height", `${height}%`);
    bar.style.setProperty("--wave-delay", `${(index % 7) * -.13}s`);
    wave.appendChild(bar);
  });

  const particles = document.createElement("div");
  particles.className = "hero-particles";
  const particleData = [
    [10, 24, 5, 8, 20, -24, -1.2], [24, 12, 4, 6, -12, 18, -3.1],
    [38, 72, 7, 9, 22, -17, -2.2], [56, 18, 5, 8, -20, 22, -4.3],
    [72, 65, 6, 7, 18, -26, -1.8], [88, 35, 4, 6, -16, 15, -3.7],
    [64, 88, 5, 10, 14, -22, -5.1], [43, 44, 3, 5, -10, 18, -2.9],
    [80, 8, 4, 8, 21, 16, -4.8], [16, 82, 6, 9, -18, -20, -1.5]
  ];
  particleData.forEach(([left, top, size, time, x, y, delay]) => {
    const particle = document.createElement("i");
    particle.style.left = `${left}%`;
    particle.style.top = `${top}%`;
    particle.style.setProperty("--particle-size", `${size}px`);
    particle.style.setProperty("--particle-time", `${time}s`);
    particle.style.setProperty("--particle-x", `${x}px`);
    particle.style.setProperty("--particle-y", `${y}px`);
    particle.style.setProperty("--particle-delay", `${delay}s`);
    particles.appendChild(particle);
  });

  const previews = [
    ["hero-preview-one", "FRAME 01 / ELEV", "upload/portfolio-1.mp4"],
    ["hero-preview-two", "FRAME 02 / FLOW PRO", "upload/flow-pro.mp4"],
    ["hero-preview-three", "FRAME 03 / FLORESTAL", "upload/chocolate-ao-leite.mp4"]
  ];

  previews.forEach(([className, label, src]) => {
    const preview = document.createElement("div");
    preview.className = `hero-preview ${className}`;
    preview.dataset.label = label;
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    preview.appendChild(video);

    preview.addEventListener("pointerenter", async () => {
      if (reducedMotion) return;
      try { await video.play(); } catch { /* autoplay pode ser bloqueado */ }
    });
    preview.addEventListener("pointerleave", () => {
      video.pause();
      video.currentTime = 0;
    });
    heroVisual.appendChild(preview);
  });

  heroVisual.prepend(portalRing);
  heroVisual.append(wave, particles);

  if (!reducedMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let energy = 0;
    let targetEnergy = 0;

    const renderScene = () => {
      currentX += (targetX - currentX) * .075;
      currentY += (targetY - currentY) * .075;
      energy += (targetEnergy - energy) * .08;
      heroVisual.style.setProperty("--scene-x", currentX.toFixed(3));
      heroVisual.style.setProperty("--scene-y", currentY.toFixed(3));
      heroVisual.style.setProperty("--portal-energy", energy.toFixed(3));
      requestAnimationFrame(renderScene);
    };
    renderScene();

    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = hero.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
      targetEnergy = 1;
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      targetEnergy = 0;
    });

    const updateHeroScroll = () => {
      const bounds = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(bounds.height * .72, 1)));
      heroVisual.style.setProperty("--hero-scroll", progress.toFixed(3));
    };
    updateHeroScroll();
    window.addEventListener("scroll", updateHeroScroll, { passive: true });
  }
}
