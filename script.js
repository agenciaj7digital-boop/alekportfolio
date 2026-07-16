const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('.video-frame').forEach((frame) => {
  const video = frame.querySelector('video');
  const button = frame.querySelector('.play-button');

  const toggleVideo = () => {
    document.querySelectorAll('.video-frame video').forEach((otherVideo) => {
      if (otherVideo !== video) {
        otherVideo.pause();
        otherVideo.closest('.video-frame').classList.remove('playing');
      }
    });

    if (video.paused) {
      video.play();
      frame.classList.add('playing');
    } else {
      video.pause();
      frame.classList.remove('playing');
    }
  };

  frame.addEventListener('click', toggleVideo);
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleVideo();
  });
  video.addEventListener('ended', () => frame.classList.remove('playing'));
});
