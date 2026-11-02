/**
 * LETTERS.JS - CỨU MISA Landing Page
 * Block 3 (Bức tường ký ức) & Block 4 (Bưu cục thời gian - Gửi thư)
 * LocalStorage management, Live Real-time Submission, Empathy Reaction & Modals
 */

const STORAGE_KEY = 'CUU_MISA_LETTERS_V1';
const LIKES_KEY = 'CUU_MISA_LIKED_IDS_V1';

// Preset High-End Emotional Letters
const DEFAULT_LETTERS = [
  {
    id: 'letter-001',
    author: 'Cựu học sinh chuyên Toán 2017',
    recipient: 'Gửi tôi năm 17 tuổi',
    tag: '#ÁpLựcĐiểmSố',
    content:
      'Gửi cậu, người từng khóc thầm trong nhà vệ sinh trường chỉ vì một bài kiểm tra 7.5 điểm. Cậu từng nghĩ thế giới sẽ sụp đổ nếu không lọt top đầu. Nhưng 8 năm sau nhìn lại, tớ chỉ ước có thể quay về ôm lấy bờ vai gầy guộc ấy và nói: Điểm số không định nghĩa giá trị linh hồn của cậu. Cậu đã làm rất tốt rồi, Misa bé bỏng.',
    stamp: '🕯️',
    stampName: 'Bình Yên',
    date: '17:40 - 28/10',
    likes: 142,
    isCustom: false,
  },
  {
    id: 'letter-002',
    author: 'Cô gái ngồi bàn cuối',
    recipient: 'Gửi người bạn cùng bàn năm ấy',
    tag: '#LờiChưaNói',
    content:
      'Cảm ơn bạn vì đã luôn chia đôi chiếc bánh mì và giả vờ không nhìn thấy đôi mắt sưng húp của tớ sau những trận cãi vã của bố mẹ ở nhà. Sự hiện diện im lặng của bạn chính là sợi dây neo giữ tớ không nhảy xuống vực sâu tuyệt vọng năm lớp 11.',
    stamp: '🕊️',
    stampName: 'Thứ Tha',
    date: '21:15 - 29/10',
    likes: 89,
    isCustom: false,
  },
  {
    id: 'letter-003',
    author: 'Một kẻ từng lạc lối',
    recipient: 'Gửi cha mẹ',
    tag: '#TìmLạiChínhMình',
    content:
      'Con biết chiếc áo blouse trắng hay tấm bằng bác sĩ là ước mơ của ba mẹ. Nhưng con xin lỗi vì đã không thể khoác vừa nó.',
    stamp: '⚡',
    stampName: 'Dũng Khí',
    date: '23:04 - 30/10',
    likes: 215,
    isCustom: false,
  },
  {
    id: 'letter-004',
    author: 'Vũ công kịch chuyển động',
    recipient: 'Gửi Misa trong lòng mỗi chúng ta',
    tag: '#GửiTôi17Tuổi',
    content:
      'Khi chúng tôi đổ mồ hôi trên sàn tập, mỗi vết bầm tím trên đầu gối là một lần chúng tôi thay mặt các bạn gào thét. Đừng giấu nỗi đau vào trong góc tối nữa. Khi cơ thể chuyển động, những vết thương sẽ bắt đầu biết thở và liền sẹo.',
    stamp: '🦋',
    stampName: 'Tự Do',
    date: '08:12 - 31/10',
    likes: 178,
    isCustom: false,
  },
  {
    id: 'letter-005',
    author: 'Chàng trai hướng nội 12D',
    recipient: 'Gửi tôi năm 16 tuổi',
    tag: '#GửiTôi17Tuổi',
    content:
      'Cậu không kỳ quặc chỉ vì thích ngồi đọc sách một mình dưới gốc bàng thay vì tham gia những nhóm ồn ào. Sự nhạy cảm của cậu là một món quà của vũ trụ, không phải là một khiếm khuyết. Hãy thở sâu nhé.',
    stamp: '🕯️',
    stampName: 'Bình Yên',
    date: '14:20 - Hôm qua',
    likes: 96,
    isCustom: false,
  },
  {
    id: 'letter-006',
    author: 'Một khán giả Nhà hát Thành phố',
    recipient: 'Gửi các bạn học sinh đang thi chuyển cấp',
    tag: '#ÁpLựcĐiểmSố',
    content:
      'Đêm nay thành phố mưa, nhìn các bạn học thêm về lúc 10h đêm trên những chiếc xe đạp điện, lòng mình thắt lại. Hãy ngủ đủ giấc, uống nhiều nước. Cuộc đời là một vở kịch dài, đừng vắt kiệt mình ở ngay màn dạo đầu.',
    stamp: '🕊️',
    stampName: 'Thứ Tha',
    date: '01:50 - Rạng sáng nay',
    likes: 304,
    isCustom: false,
  },
];

// State Manager
class LettersManager {
  constructor() {
    this.letters = [];
    this.currentFilter = 'all';
    this.likedIds = new Set();
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.renderWall();
    this.setupFilterTabs();
    this.setupForm();
    this.setupModal();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const customLetters = stored ? JSON.parse(stored) : [];
      // Custom letters go first, then defaults
      this.letters = [...customLetters, ...DEFAULT_LETTERS];

      const likedStored = localStorage.getItem(LIKES_KEY);
      if (likedStored) {
        this.likedIds = new Set(JSON.parse(likedStored));
      }
    } catch (e) {
      console.error('Storage parse error, using defaults', e);
      this.letters = [...DEFAULT_LETTERS];
    }
  }

  saveCustomLetter(newLetter) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const customLetters = stored ? JSON.parse(stored) : [];
      customLetters.unshift(newLetter);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customLetters));
      this.letters.unshift(newLetter);
    } catch (e) {
      console.error('Save error', e);
    }
  }

  toggleLike(letterId) {
    const letter = this.letters.find((l) => l.id === letterId);
    if (!letter) return;

    if (this.likedIds.has(letterId)) {
      this.likedIds.delete(letterId);
      letter.likes = Math.max(0, letter.likes - 1);
    } else {
      this.likedIds.add(letterId);
      letter.likes += 1;
    }

    localStorage.setItem(LIKES_KEY, JSON.stringify(Array.from(this.likedIds)));
    this.renderWall();
  }

  getFilteredLetters() {
    if (this.currentFilter === 'all') return this.letters;
    return this.letters.filter((l) => l.tag === this.currentFilter);
  }

  renderWall(highlightId = null) {
    const container = document.getElementById('letters-wall-grid');
    const counterBadge = document.getElementById('letters-count-badge');
    if (!container) return;

    const filtered = this.getFilteredLetters();
    if (counterBadge) {
      counterBadge.textContent = `${this.letters.length} Bức thư`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-purple-300/60">
          <i data-lucide="mail-open" class="w-12 h-12 mx-auto mb-3 opacity-40"></i>
          <p class="font-vietnam text-base">Chưa có bức thư nào thuộc chủ đề này. Hãy là người đầu tiên gửi gắm tâm tư!</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    container.innerHTML = filtered
      .map((letter) => {
        const isLiked = this.likedIds.has(letter.id);
        const isHighlight = letter.id === highlightId;
        const isCustom = letter.isCustom;

        return `
        <div class="parchment-card rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-400/40 relative group ${
          isHighlight ? 'letter-just-added ring-2 ring-amber-400/80' : ''
        }" id="${letter.id}">
          
          ${
            isHighlight
              ? `<div class="absolute -top-3 right-6 bg-gradient-to-r from-amber-400 to-purple-600 text-slate-950 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                  <span>✨ Thư Vừa Gửi</span>
                </div>`
              : ''
          }

          <div>
            <!-- Header: Stamp + Recipient -->
            <div class="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-purple-900/30">
              <div class="flex items-center gap-3">
                <div class="wax-seal wax-seal-amber text-lg">
                  ${letter.stamp || '🕯️'}
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-amber-200 font-playfair line-clamp-1">${letter.recipient}</h4>
                  <span class="text-xs text-purple-300/70 font-vietnam">${letter.author}</span>
                </div>
              </div>

              <span class="text-[11px] font-mono px-2.5 py-1 rounded-full bg-purple-900/30 border border-purple-500/20 text-purple-300">
                ${letter.tag}
              </span>
            </div>

            <!-- Letter Body -->
            <p class="font-handwriting text-xl text-gray-200/90 leading-relaxed mb-6 tracking-wide selection:bg-purple-900 line-clamp-5">
              "${letter.content}"
            </p>
          </div>

          <!-- Footer: Date, Like & Read Full -->
          <div class="pt-4 border-t border-purple-900/30 flex items-center justify-between text-xs text-purple-300/60 font-vietnam">
            <span>${letter.date}</span>

            <div class="flex items-center gap-2">
              <button 
                type="button"
                onclick="window.lettersManager.openLetterModal('${letter.id}')"
                class="px-2.5 py-1 rounded-lg hover:bg-purple-900/40 text-purple-200 transition-colors flex items-center gap-1"
                title="Đọc toàn bộ thư"
              >
                <span>Xem kỹ</span>
              </button>

              <button 
                type="button"
                onclick="window.lettersManager.toggleLike('${letter.id}')"
                class="flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-300 ${
                  isLiked
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'bg-white/[0.04] text-purple-300 hover:text-rose-400 hover:bg-white/[0.08]'
                }"
              >
                <i data-lucide="heart" class="w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-400' : ''}"></i>
                <span class="font-semibold text-xs">${letter.likes}</span>
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  setupFilterTabs() {
    const tabs = document.querySelectorAll('.letter-filter-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const filterVal = target.getAttribute('data-filter');

        tabs.forEach((t) => {
          t.classList.remove('bg-amber-400', 'text-slate-950', 'font-semibold', 'shadow-md');
          t.classList.add('bg-purple-950/40', 'text-purple-300');
        });

        target.classList.remove('bg-purple-950/40', 'text-purple-300');
        target.classList.add('bg-amber-400', 'text-slate-950', 'font-semibold', 'shadow-md');

        this.currentFilter = filterVal;
        this.renderWall();
      });
    });
  }

  setupForm() {
    const form = document.getElementById('letter-submission-form');
    if (!form) return;

    // Stamp selection buttons
    const stampBtns = form.querySelectorAll('.stamp-select-btn');
    let selectedStamp = '🕯️';
    let selectedStampName = 'Bình Yên';

    stampBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        stampBtns.forEach((b) => {
          b.classList.remove('ring-2', 'ring-amber-400', 'scale-110');
        });
        btn.classList.add('ring-2', 'ring-amber-400', 'scale-110');
        selectedStamp = btn.getAttribute('data-stamp');
        selectedStampName = btn.getAttribute('data-stamp-name');
      });
    });

    // Content character counter
    const textarea = document.getElementById('letter-content-input');
    const charCounter = document.getElementById('letter-char-counter');
    if (textarea && charCounter) {
      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCounter.textContent = `${len} / 600`;
        if (len > 550) {
          charCounter.classList.add('text-amber-400');
        } else {
          charCounter.classList.remove('text-amber-400');
        }
      });
    }

    // Submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const authorInput = document.getElementById('letter-author-input');
      const recipientInput = document.getElementById('letter-recipient-input');
      const tagInput = document.getElementById('letter-tag-input');
      const submitBtn = document.getElementById('letter-submit-btn');

      const author = authorInput?.value.trim() || 'Người gửi ẩn danh';
      const recipient = recipientInput?.value.trim() || 'Gửi chính mình năm ấy';
      const content = textarea?.value.trim() || '';
      const tag = tagInput?.value || '#GửiTôi17Tuổi';

      if (!content) {
        alert('Xin bạn hãy viết vài dòng tâm sự trước khi gửi!');
        textarea?.focus();
        return;
      }

      // Format Date
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - Vừa xong`;

      const newId = 'letter-' + Date.now();
      const newLetter = {
        id: newId,
        author: author,
        recipient: recipient,
        tag: tag,
        content: content,
        stamp: selectedStamp,
        stampName: selectedStampName,
        date: timeStr,
        likes: 1,
        isCustom: true,
      };

      // Button flying animation state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="inline-block animate-spin mr-2">✦</span> Đang đóng dấu sáp & gửi thư...
      `;

      setTimeout(() => {
        // Save to state & storage
        this.saveCustomLetter(newLetter);

        // Reset filter to 'all' so new letter is guaranteed visible
        this.currentFilter = 'all';
        const allTab = document.querySelector('.letter-filter-tab[data-filter="all"]');
        if (allTab) {
          document.querySelectorAll('.letter-filter-tab').forEach((t) => {
            t.classList.remove('bg-amber-400', 'text-slate-950', 'font-semibold');
            t.classList.add('bg-purple-950/40', 'text-purple-300');
          });
          allTab.classList.add('bg-amber-400', 'text-slate-950', 'font-semibold');
        }

        // Re-render wall with highlight
        this.renderWall(newId);

        // Reset form
        form.reset();
        if (charCounter) charCounter.textContent = '0 / 600';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <i data-lucide="send" class="w-5 h-5"></i>
          <span>Gửi Lên Bức Tường Ký Ức</span>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Show Toast Feedback
        this.showToast('Lá thư của bạn đã được niêm phong và gửi lên Bức Tường Ký Ức thành công!');

        // Smooth scroll to Block 3 to view the new letter
        setTimeout(() => {
          const block3 = document.getElementById('block-letters-wall');
          if (block3) {
            if (window.lenis) {
              window.lenis.scrollTo(block3, { offset: -70, duration: 1.8 });
            } else {
              block3.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }, 500);
      }, 900);
    });
  }

  showToast(message) {
    const toast = document.getElementById('letter-toast');
    const toastMsg = document.getElementById('letter-toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 4500);
  }

  setupModal() {
    const modal = document.getElementById('letter-reading-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    if (!modal || !closeBtn) return;

    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  openLetterModal(letterId) {
    const letter = this.letters.find((l) => l.id === letterId);
    const modal = document.getElementById('letter-reading-modal');
    if (!letter || !modal) return;

    document.getElementById('modal-recipient').textContent = letter.recipient;
    document.getElementById('modal-author').textContent = letter.author;
    document.getElementById('modal-date').textContent = letter.date;
    document.getElementById('modal-stamp').textContent = letter.stamp || '🕯️';
    document.getElementById('modal-tag').textContent = letter.tag;
    document.getElementById('modal-content').textContent = `"${letter.content}"`;

    modal.classList.remove('hidden');
  }
}

// Instantiate manager on window
document.addEventListener('DOMContentLoaded', () => {
  window.lettersManager = new LettersManager();
});
