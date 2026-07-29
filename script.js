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
const formSubmit = form.querySelector(".form-submit");
const formStatus = document.querySelector("#form-status");
const openButtons = document.querySelectorAll("[data-open-brief]");
const closeButton = document.querySelector("[data-close-brief]");
const sheetsEndpoint = "https://script.google.com/macros/s/AKfycbyAK3DvuuQhBo1d31DY98jAbcZ3u2l-NyQc1b0AtuMpm83QUy3EclKpT9fzGSMNsgOw/exec";
const submitLabel = formSubmit.innerHTML;

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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  formSubmit.disabled = true;
  formSubmit.textContent = "Enviando...";
  formStatus.textContent = "";
  formStatus.className = "form-status";

  try {
    const payload = new URLSearchParams(new FormData(form));

    await fetch(sheetsEndpoint, {
      method: "POST",
      mode: "no-cors",
      credentials: "omit",
      body: payload
    });

    form.reset();
    formStatus.textContent = "Briefing enviado com sucesso. Nossa equipe entrará em contato.";
    formStatus.classList.add("success");
  } catch {
    formStatus.textContent = "Não foi possível enviar agora. Tente novamente em alguns instantes.";
    formStatus.classList.add("error");
  } finally {
    formSubmit.disabled = false;
    formSubmit.innerHTML = submitLabel;
  }
});

// Microinterações da arte aprovada
const approvedScene = document.querySelector(".approved-scene");
const immersiveHero = document.querySelector(".hero");

if (approvedScene && immersiveHero && !reducedMotion) {
  const updateApprovedPointer = (event) => {
    if (event.pointerType === "touch") return;
    const bounds = immersiveHero.getBoundingClientRect();
    const x = Math.min(1, Math.max(-1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
    const y = Math.min(1, Math.max(-1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
    approvedScene.style.setProperty("--scene-x", x.toFixed(3));
    approvedScene.style.setProperty("--scene-y", y.toFixed(3));
  };

  immersiveHero.addEventListener("pointermove", updateApprovedPointer, { passive: true });
  immersiveHero.addEventListener("pointerleave", () => {
    approvedScene.style.setProperty("--scene-x", "0");
    approvedScene.style.setProperty("--scene-y", "0");
  });

  const updateApprovedScroll = () => {
    const bounds = immersiveHero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(bounds.height * .75, 1)));
    approvedScene.style.setProperty("--scene-scroll", progress.toFixed(3));
  };

  updateApprovedScroll();
  window.addEventListener("scroll", updateApprovedScroll, { passive: true });
}
