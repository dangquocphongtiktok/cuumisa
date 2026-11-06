/**
 * SCROLLYTELLING.JS - CỨU MISA Landing Page
 * GSAP ScrollTrigger Animations for Block 1 & Block 2, Interactive Act Selector, Canvas VFX
 */

// ==========================================================================
// BLOCK 1: MISA HERO CANVAS SCROLLYTELLING (cuumisa1.png -> cuumisa57.png)
// Chuỗi 57 khung hình chuyển động siêu mượt bằng Canvas 2D + Lerp nội suy
// ==========================================================================

class MisaHeroCanvasController {
  constructor() {
    this.canvas = document.getElementById('misaHeroCanvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.block1 = document.getElementById('hero-section');
    this.block2 = document.getElementById('block-3acts');

    this.phase1 = document.getElementById('hero-phase-1');
    this.phase2 = document.getElementById('hero-phase-2');
    this.phase3 = document.getElementById('hero-phase-3');
    this.progressLabel = document.getElementById('hero-progress-label');
    this.progressBar = document.getElementById('hero-progress-bar');

    this.totalFrames = 57;
    this.frames = [];
    this.loadedFramesCount = 0;

    this.targetProgress = 0.0;
    this.currentProgress = 0.0;
    this.lerpFactor = 0.085; // Tốc độ nội suy mượt mà 60fps

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Lưu kích thước hiển thị của hình ảnh trên canvas
    this.imgMetrics = { dx: 0, dy: 0, dw: 0, dh: 0 };

    // HỆ THỐNG 45 HẠT VẬT LÝ (MƯA RƠI / ĐỐM SÁNG KÝ ỨC ANTIGRAVITY)
    this.particleCount = 45;
    this.particles = [];
    this.antigravityMode = false;
    this.lastScrollY = window.scrollY || 0;
    this.isScrollingUp = false;
    this.scrollTimeout = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.initParticles();
    this.preloadFrames();
    this.bindScroll();
    this.setupAntigravityMode();
    this.startRenderLoop();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    this.ctx.scale(this.dpr, this.dpr);

    // Re-draw current frame after resize
    this.renderBlended(this.currentProgress);
  }

  preloadFrames() {
    for (let i = 1; i <= this.totalFrames; i++) {
      const img = new Image();
      // Đường dẫn chính thức từ thư mục 'Ảnh block 1' (PNG 57 khung hình mới)
      img.src = `A%CC%89nh%20block%201/cuumisa${i}.png`;

      img.onload = () => {
        this.loadedFramesCount++;
        // Ngay khi tải xong ảnh đầu tiên, vẽ ngay lên màn hình
        if (i === 1 && this.currentProgress === 0) {
          this.renderBlended(0);
        }
      };

      // Fallback 1: Thử thư mục assets/block1 an toàn
      // Fallback 2: Thử định dạng URI không encode
      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          this.frames[i - 1] = fallbackImg;
          this.loadedFramesCount++;
          if (i === 1) this.renderBlended(0);
        };
        fallbackImg.onerror = () => {
          const finalFallback = new Image();
          finalFallback.onload = () => {
            this.frames[i - 1] = finalFallback;
            this.loadedFramesCount++;
            if (i === 1) this.renderBlended(0);
          };
          finalFallback.src = `Ảnh block 1/cuumisa${i}.png`;
        };
        fallbackImg.src = `assets/block1/cuumisa${i}.png`;
      };

      this.frames.push(img);
    }
  }

  // Tính toán chính xác tiến trình cuộn của Block 1:
  // Tiến trình hoàn tất 100% khi người dùng kéo vừa khoảng 1/7 chiều cao hình ở Block 1
  calculateProgress() {
    if (!this.block1) return 0;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const block1Top = this.block1.offsetTop;

    // Chiều cao của hình ở Block 1 (chiều cao màn hình viewport):
    const heroHeight = this.block1.offsetHeight || window.innerHeight;

    // Tiến trình hoàn tất 100% khi người dùng kéo vừa khoảng 1/7 chiều cao hình ở Block 1:
    const targetScrollDistance = Math.max(1, (1 / 7) * heroHeight);

    const scrolledDistance = scrollY - block1Top;
    const rawProgress = scrolledDistance / targetScrollDistance;

    // Đạt đúng 100% khi kéo vừa khoảng 1/7 chiều cao hình, gấu úp mặt hoàn toàn
    return Math.max(0.0, Math.min(1.0, rawProgress));
  }

  bindScroll() {
    const updateTarget = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const delta = scrollY - this.lastScrollY;

      if (Math.abs(delta) > 1) {
        this.isScrollingUp = delta < 0;
      }
      this.lastScrollY = scrollY;

      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrollingUp = false;
      }, 500);

      this.targetProgress = this.calculateProgress();
      // Expose to window for external checking
      window.heroScrollProgress = {
        target: this.targetProgress,
        current: this.currentProgress,
      };
    };

    window.addEventListener('scroll', updateTarget, { passive: true });
    updateTarget();
  }

  setupAntigravityMode() {
    window.toggleAntigravity = () => {
      this.antigravityMode = !this.antigravityMode;
      const dot = document.getElementById('antigravity-dot');
      const label = document.getElementById('antigravity-status');
      const btn = document.getElementById('antigravity-toggle-btn');

      if (this.antigravityMode) {
        if (dot) dot.className = 'w-2 h-2 rounded-full bg-theatre-amber animate-ping';
        if (label) label.textContent = 'Antigravity: BẬT';
        if (btn) btn.classList.add('border-theatre-amber', 'shadow-amber-500/30');
      } else {
        if (dot) dot.className = 'w-2 h-2 rounded-full bg-purple-400 group-hover:bg-theatre-amber transition-colors';
        if (label) label.textContent = 'Antigravity: Cuộn';
        if (btn) btn.classList.remove('border-theatre-amber', 'shadow-amber-500/30');
      }
      return this.antigravityMode;
    };

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'a' || e.key === 'A') {
        window.toggleAntigravity();
      }
    });

    const btn = document.getElementById('antigravity-toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => window.toggleAntigravity());
    }
  }

  initParticles() {
    this.particles = [];
    const w = this.width || window.innerWidth;
    const h = this.height || window.innerHeight;
    for (let i = 0; i < this.particleCount; i++) {
      const isAmber = i % 2 === 0;
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 4 + 4,
        size: Math.random() * 1.8 + 1.2,
        isAmber: isAmber,
        colorRgb: isAmber ? '255, 207, 135' : '157, 101, 255',
        baseAlpha: Math.random() * 0.45 + 0.35,
        phase: Math.random() * Math.PI * 2,
        speedMultiplier: Math.random() * 0.5 + 0.8,
      });
    }
  }

  // Thuật toán scale ảnh hoàn hảo: Bảo toàn trọn vẹn 100% cả đỉnh ảnh (chữ "Cứu") VÀ đáy ảnh (chân gấu, vũng nước, bóng phản chiếu)
  drawCover(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const cw = this.width;
    const ch = this.height;

    // Toàn bộ khung hình dành trọn 100% cho ảnh nghệ thuật (thanh menu giấu trực tiếp bên trong ảnh)
    let dw, dh, dx, dy;

    if (cw < 640) {
      // Màn hình dọc mobile: giữ kích thước gấu rõ nét, căn giữa hoàn hảo
      const scale = Math.max(cw / iw, (ch / ih) * 0.75);
      dw = iw * scale;
      dh = ih * scale;
      dx = (cw - dw) / 2;
      dy = (ch - dh) / 2;
    } else {
      // Desktop, MacBook (16:10), Laptop (16:9), Tablet:
      // Tính scale tối ưu vừa vặn trong toàn bộ chiều cao màn hình:
      // - Đỉnh: chữ "Cứu" và khoảng mưa phía trên nằm trang nhã ngay dưới các nhãn menu
      // - Đáy: chân gấu, vũng nước & phản chiếu hiển thị 100% trên đáy màn hình
      const scale = Math.min(cw / iw, ch / ih);
      dw = iw * scale;
      dh = ih * scale;
      dx = (cw - dw) / 2;
      dy = (ch - dh) / 2;
    }

    // Lưu lại vị trí ảnh để định vị vũng nước chính xác
    this.imgMetrics = { dx, dy, dw, dh };

    // Vẽ hình ảnh nguyên bản
    this.ctx.drawImage(img, dx, dy, dw, dh);

    // Hòa trộn mềm mại 2 cạnh trái/phải nếu màn hình rộng hơn ảnh để tiệp vào nền kịch đen vô tận
    if (dx > 0) {
      const edgeFadeWidth = Math.min(80, dx);
      
      const gradLeft = this.ctx.createLinearGradient(dx, 0, dx + edgeFadeWidth, 0);
      gradLeft.addColorStop(0, '#05030a');
      gradLeft.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradLeft;
      this.ctx.fillRect(dx, dy, edgeFadeWidth, dh);

      const gradRight = this.ctx.createLinearGradient(dx + dw - edgeFadeWidth, 0, dx + dw, 0);
      gradRight.addColorStop(0, 'transparent');
      gradRight.addColorStop(1, '#05030a');
      this.ctx.fillStyle = gradRight;
      this.ctx.fillRect(dx + dw - edgeFadeWidth, dy, edgeFadeWidth, dh);
    }
  }

  // Cập nhật & Vẽ Hệ thống 45 Hạt vật lý (Mưa rơi / Đốm sáng ký ức Antigravity)
  updateAndDrawParticles(progress) {
    const isAntigravity = this.antigravityMode || this.isScrollingUp;

    this.ctx.save();

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (!isAntigravity) {
        // CHẾ ĐỘ 1: RƠI XUỐNG NHƯ SỢI MƯA (khi cuộn xuống gần Block 2)
        const rainTargetVy = (7.5 + progress * 5.5) * p.speedMultiplier;
        p.vy += (rainTargetVy - p.vy) * 0.12;
        p.x += p.vx;
        p.y += p.vy;

        if (p.y > this.height + 25) {
          p.y = -25;
          p.x = Math.random() * this.width;
        }

        // Vẽ vệt mưa sợi chỉ phát sáng
        const streakLength = Math.max(12, p.vy * 2.2);
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + p.vx * 2, p.y + streakLength);
        this.ctx.strokeStyle = `rgba(${p.colorRgb}, ${p.baseAlpha.toFixed(3)})`;
        this.ctx.lineWidth = p.size * 0.75;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

      } else {
        // CHẾ ĐỘ 2: BAY NGƯỢC LÊN NHƯ ĐỐM SÁNG KÝ ỨC (khi cuộn ngược lên hoặc bật Antigravity)
        const floatTargetVy = -((3.0 + (1 - progress) * 2.0) * p.speedMultiplier);
        p.vy += (floatTargetVy - p.vy) * 0.08;

        p.phase += 0.04;
        p.x += Math.sin(p.phase) * 1.0 + p.vx * 0.4;
        p.y += p.vy;

        if (p.y < -25) {
          p.y = this.height + 25;
          p.x = Math.random() * this.width;
        }

        // Vẽ đốm sáng ký ức phát quang (Glowing Stardust Orb)
        const alpha = p.baseAlpha * (0.8 + 0.2 * Math.sin(p.phase));

        // Hào quang mềm bên ngoài
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${p.colorRgb}, ${(alpha * 0.2).toFixed(3)})`;
        this.ctx.fill();

        // Tâm sáng lấp lánh bên trong
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${p.colorRgb}, ${alpha.toFixed(3)})`;
        this.ctx.shadowColor = `rgba(${p.colorRgb}, 0.8)`;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  // Hiển thị khung hình mượt mà, sắc nét tuyệt đối, kết hợp 45 Hạt vật lý
  renderBlended(progress) {
    if (!this.frames.length) return;

    const rawIndex = progress * (this.totalFrames - 1);
    const frameIndex = Math.min(this.totalFrames - 1, Math.max(0, Math.round(rawIndex)));

    this.ctx.clearRect(0, 0, this.width, this.height);

    const img = this.frames[frameIndex];
    if (img && img.complete && img.naturalWidth > 0) {
      this.drawCover(img);
    }

    // Vẽ Hệ thống 45 Hạt vật lý (Rơi xuống như mưa hoặc bay ngược lên như đốm sáng)
    this.updateAndDrawParticles(progress);
  }

  // Cập nhật chuyển động chữ & nhãn tiến trình đồng bộ theo progress
  updateTextOverlays(progress) {
    // Phase 1: 0.0 -> 0.45 (Gấu ngước nhìn & Đoạn giới thiệu Cứu Misa)
    if (this.phase1) {
      let p1Opacity = 1;
      if (progress > 0.12) {
        p1Opacity = Math.max(0, 1 - (progress - 0.12) / 0.33);
      }
      this.phase1.style.opacity = p1Opacity.toFixed(3);
      this.phase1.style.pointerEvents = p1Opacity > 0.2 ? 'auto' : 'none';
      this.phase1.style.transform = `translateY(${(-progress * 25).toFixed(1)}px)`;
    }

    // Phase 2: 0.30 -> 0.70 (Gấu bắt đầu cúi đầu)
    if (this.phase2) {
      let p2Opacity = 0;
      if (progress >= 0.28 && progress <= 0.72) {
        if (progress < 0.48) {
          p2Opacity = (progress - 0.28) / 0.16;
        } else {
          p2Opacity = (0.72 - progress) / 0.16;
        }
      }
      p2Opacity = Math.max(0, Math.min(1, p2Opacity));
      this.phase2.style.opacity = p2Opacity.toFixed(3);
      this.phase2.style.pointerEvents = p2Opacity > 0.3 ? 'auto' : 'none';
      this.phase2.style.transform = `translateY(${((0.5 - progress) * 20).toFixed(1)}px)`;
    }

    // Phase 3: 0.75 -> 1.0 (Gấu úp mặt xuống hoàn toàn / Chạm đỉnh Block 2)
    if (this.phase3) {
      const p3Opacity = Math.max(0, Math.min(1, (progress - 0.75) / 0.2));
      this.phase3.style.opacity = p3Opacity.toFixed(3);
      this.phase3.style.pointerEvents = p3Opacity > 0.3 ? 'auto' : 'none';
      this.phase3.style.transform = `translateY(${((1 - progress) * 20).toFixed(1)}px)`;
    }

    // Tiến trình hiển thị góc phải
    if (this.progressLabel) {
      const percent = Math.round(progress * 100);
      this.progressLabel.textContent = `Tiến trình: ${percent}%`;
    }
    if (this.progressBar) {
      this.progressBar.style.width = `${(progress * 100).toFixed(1)}%`;
    }
  }

  // Vòng lặp render RequestAnimationFrame kết hợp nội suy LERP
  startRenderLoop() {
    const loop = () => {
      // Tính target progress liên tục (hỗ trợ cả Lenis và scroll thông thường)
      this.targetProgress = this.calculateProgress();

      // Nội suy LERP mượt mà: current = current + (target - current) * factor
      const diff = this.targetProgress - this.currentProgress;
      if (Math.abs(diff) > 0.0001) {
        this.currentProgress += diff * this.lerpFactor;
      } else {
        this.currentProgress = this.targetProgress;
      }

      // Render hình ảnh pha trộn + Vòng sóng nước + 45 Hạt vật lý
      this.renderBlended(this.currentProgress);

      // Cập nhật text & UI
      this.updateTextOverlays(this.currentProgress);

      // (3) Tự động điều biến bộ lọc BiquadFilter low-pass: Trầm nghẹt xuống 240Hz khi gấu chạm nước
      if (window.theatreAudio) {
        window.theatreAudio.updateSubmergedFilter(this.currentProgress);
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Block 2: Hiệu ứng chuyển động sân khấu điện ảnh (A24 Frameless Stage) - Đảm bảo độ sáng 100% rõ ràng
function initAboutPillars() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const leftCol = document.querySelector('#block-about .stage-col-left');
  const rightCol = document.querySelector('#block-about .stage-col-right');

  // Tuyệt đối không can thiệp opacity, giữ chữ sáng 100% rõ ràng
  if (leftCol && rightCol) {
    gsap.from([leftCol, rightCol], {
      scrollTrigger: {
        trigger: '#block-about',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
      clearProps: 'transform',
    });
  }
}

// Hàm hỗ trợ tự động cuộn từ đỉnh Block 1 xuống mốc 100% của Block 1 và chạm Block 2
window.runAutoScrollTest = function (durationMs = 2800) {
  const block1 = document.getElementById('hero-section');
  const block2 = document.getElementById('block-3acts') || document.getElementById('block-about');
  if (!block1 || !block2) {
    console.error('Không tìm thấy element Block 1 hoặc Block 2');
    return;
  }

  const startY = block1.offsetTop;
  const heroHeight = block1.offsetHeight || window.innerHeight;
  const targetDistance = (1 / 7) * heroHeight;
  const targetY = startY + targetDistance;

  const startTime = performance.now();
  console.log(`🎬 Bắt đầu auto-scroll từ ${startY}px tới mốc 100% của Block 1 (${targetY}px) trong ${durationMs}ms...`);

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / durationMs);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const currentY = startY + (targetY - startY) * ease;

    window.scrollTo(0, currentY);

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      window.scrollTo(0, targetY);
      console.log('✅ Auto-scroll hoàn tất! Tiến trình hiện tại:', window.heroScrollProgress);
    }
  }

  requestAnimationFrame(step);
};

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  window.misaHeroCanvasController = new MisaHeroCanvasController();
  initAboutPillars();
});
