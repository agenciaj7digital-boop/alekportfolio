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
    `E-mail: ${data.get("email")}`,
    `WhatsApp: ${data.get("whatsapp")}`,
    `Tipo de vídeo: ${data.get("tipo")}`,
    `Detalhes do projeto: ${data.get("detalhes")}`
  ].join("\n");

  const whatsappUrl = `https://wa.me/5551990181065?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});
