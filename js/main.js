/**
 * MAIN.JS - CỨU MISA Landing Page
 * Lenis Smooth Scroll, Web Audio Synthesizer, Cursor Spotlight, Navigation
 */

// Initialize Lenis Smooth Scroll
let lenis;
function initLenis() {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      infinite: false,
    });
    window.lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }
}

// Custom Cursor Spotlight
function initCursorSpotlight() {
  const spotlight = document.getElementById('cursor-spotlight');
  if (!spotlight) return;

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    gsap.to(spotlight, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.4,
      ease: 'power2.out',
    });
  });

  // Fade out when leaving window
  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    spotlight.style.opacity = '1';
  });
}

// Ambient Soundscape via Web Audio API (Tự động trầm nghẹt xuống 240Hz khi gấu úp mặt chạm nước)
class TheatreAudioExperience {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
    this.noiseNode = null;
    this.filter = null;
    this.baseFreq = 650;      // Tần số âm thanh trong trẻo, khoáng đạt khi gấu ngước nhìn (650Hz)
    this.submergedFreq = 240; // Tần số trầm nghẹt dưới nước khi gấu úp mặt chạm nước ở Block 2 (240Hz)
    this.currentCutoff = 650;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Low-pass BiquadFilter (sẽ biến thiên theo độ chìm của gấu xuống nước)
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(this.baseFreq, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.8, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Chord: D minor with mystical overtone (D2: 73.42Hz, A2: 110Hz, F3: 174.61Hz, C4: 261.63Hz, D4: 293.66Hz)
      const frequencies = [73.42, 110.0, 174.61, 261.63, 392.0];
      frequencies.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Subtle LFO vibrato
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.15 + idx * 0.08;
        lfoGain.gain.value = 0.8;
        lfo.connect(osc.frequency);
        lfo.start();

        // Gain staging
        oscGain.gain.setValueAtTime(0.08 / (idx + 1), this.ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(this.filter);
        osc.start();

        this.oscillators.push(osc);
      });
    }
  }

  // Tự động điều biến bộ lọc BiquadFilter low-pass: Trầm nghẹt xuống đúng 240Hz khi gấu chạm nước
  updateSubmergedFilter(progress) {
    if (!this.ctx || !this.filter || !this.isPlaying) return;

    const p = Math.max(0, Math.min(1, progress));

    // Đường cong tần số:
    // - Khi progress = 0.0: 650Hz (âm thanh mở)
    // - Khi progress tiến gần 0.75: hạ dần về 420Hz
    // - Khi progress >= 0.75 đến 1.0 (gấu úp mặt chạm nước ở Block 2): trầm sâu dứt khoát về đúng 240Hz
    let targetFreq;
    if (p < 0.75) {
      targetFreq = this.baseFreq - (p / 0.75) * (this.baseFreq - 420);
    } else {
      targetFreq = 420 - ((p - 0.75) / 0.25) * (420 - this.submergedFreq);
    }

    targetFreq = Math.max(this.submergedFreq, Math.min(this.baseFreq, targetFreq));
    this.currentCutoff = targetFreq;

    // Thay đổi tần số cắt mượt mà không gây tiếng click (nổ âm)
    this.filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);

    // Tăng nhẹ hệ số Q khi chìm dưới vũng nước để tạo hiệu ứng tiếng nước dội trong tai
    const targetQ = 1.6 + p * 2.2;
    this.filter.Q.setTargetAtTime(targetQ, this.ctx.currentTime, 0.08);

    // Cập nhật nhãn trạng thái âm thanh trực quan
    const audioLabel = document.getElementById('audio-status-text');
    if (audioLabel) {
      if (p >= 0.75) {
        audioLabel.textContent = `Âm thanh: Dưới nước (${Math.round(targetFreq)}Hz)`;
      } else {
        audioLabel.textContent = `Âm thanh: Bật (${Math.round(targetFreq)}Hz)`;
      }
    }
  }

  toggle() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      // Fade out
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.8);
      this.isPlaying = false;
      return false;
    } else {
      // Fade in slowly to warm ambient volume
      this.masterGain.gain.setTargetAtTime(0.28, this.ctx.currentTime, 1.2);
      this.isPlaying = true;
      // Cập nhật ngay tần số hiện tại
      const currentProg = window.heroScrollProgress ? window.heroScrollProgress.current : 0;
      this.updateSubmergedFilter(currentProg);
      return true;
    }
  }
}

const audioExp = new TheatreAudioExperience();
window.theatreAudio = audioExp;

function setupAudioToggle() {
  const audioBtn = document.getElementById('ambient-audio-btn');
  const soundWave = document.getElementById('sound-wave');
  const audioLabel = document.getElementById('audio-status-text');

  if (!audioBtn) return;

  audioBtn.addEventListener('click', () => {
    const isPlaying = audioExp.toggle();
    if (isPlaying) {
      soundWave.classList.remove('opacity-30');
      soundWave.classList.add('opacity-100');
      audioLabel.textContent = 'Âm thanh: Bật';
      audioBtn.classList.add('border-amber-400/50');
    } else {
      soundWave.classList.add('opacity-30');
      soundWave.classList.remove('opacity-100');
      audioLabel.textContent = 'Âm thanh: Tắt';
      audioBtn.classList.remove('border-amber-400/50');
    }
  });
}

// Scroll Progress Bar
function initProgressBar() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    bar.style.width = `${progress}%`;
  });
}

// Navigation smooth scrolling
function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -60, duration: 1.5 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  // Lucide Icons initialization
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initLenis();
  initCursorSpotlight();
  setupAudioToggle();
  initProgressBar();
  initNavigation();
  initMobileMenu();
});
