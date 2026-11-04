/**
 * LETTERS.JS - CỨU MISA Landing Page
 * Block 3 (Bức tường ký ức) & Block 4 (Bưu cục thời gian - Gửi thư)
 * Realtime Cloud Firestore Integration + LocalStorage Cache + Empathy Likes + Modals
 */

const STORAGE_KEY = 'CUU_MISA_LETTERS_V1';
const LIKES_KEY = 'CUU_MISA_LIKED_IDS_V1';

// Firebase Cloud Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5B0HIDPUQD77jKUMwocP0HSZyVa4J92g",
  authDomain: "cuumisa-3d7d0.firebaseapp.com",
  projectId: "cuumisa-3d7d0",
  storageBucket: "cuumisa-3d7d0.firebasestorage.app",
  messagingSenderId: "954174061829",
  appId: "1:954174061829:web:5e7f31a3062ad8434d8b6c",
  measurementId: "G-87PQHN4B73"
};

// Initialize Firebase & Firestore safely
let db = null;
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
  }
} catch (err) {
  console.warn('Firebase init error, running in local fallback mode:', err);
}

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
    this.cloudLetters = [];
    this.localLetters = [];
    this.currentFilter = 'all';
    this.likedIds = new Set();
    this.init();
  }

  init() {
    // 1. Instant local load (zero blank screen delay)
    this.loadFromStorage();

    // 2. Setup interactive controls
    this.setupFilterTabs();
    this.setupForm();
    this.setupModal();

    // 3. Connect real-time Firestore synchronization
    this.listenToFirestore();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.localLetters = stored ? JSON.parse(stored) : [];
      this.combineAndRender();

      const likedStored = localStorage.getItem(LIKES_KEY);
      if (likedStored) {
        this.likedIds = new Set(JSON.parse(likedStored));
      }
    } catch (e) {
      console.error('Storage parse error, using defaults', e);
      this.localLetters = [];
      this.combineAndRender();
    }
  }

  listenToFirestore() {
    if (!db) return;
    try {
      db.collection('letters')
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          (snapshot) => {
            const fetched = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              fetched.push({
                id: doc.id,
                author: data.author || 'Người gửi ẩn danh',
                recipient: data.recipient || 'Gửi chính mình năm ấy',
                tag: data.tag || '#GửiTôi17Tuổi',
                content: data.content || '',
                stamp: data.stamp || '🕯️',
                stampName: data.stampName || 'Bình Yên',
                date: data.date || 'Gần đây',
                likes: typeof data.likes === 'number' ? data.likes : 0,
                isCustom: true,
              });
            });

            this.cloudLetters = fetched;

            // Remove any local letters that are already stored in Firestore
            const cloudContents = new Set(fetched.map((l) => `${l.author}__${l.content}`));
            this.localLetters = (this.localLetters || []).filter(
              (l) => !cloudContents.has(`${l.author}__${l.content}`) && !fetched.some((c) => c.id === l.id)
            );
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localLetters));
            } catch (err) {}

            // Auto-sync any remaining local letters to Firestore
            this.syncPendingLocalLetters();

            this.combineAndRender();
          },
          (error) => {
            console.warn('Firestore real-time sync note:', error.message);
            // Even if Firestore is disabled or offline, preserve all local letters!
            this.combineAndRender();
          }
        );
    } catch (e) {
      console.warn('Could not attach Firestore listener:', e);
      this.combineAndRender();
    }
  }

  async syncPendingLocalLetters() {
    if (!db || !this.localLetters || this.localLetters.length === 0) return;
    for (const letter of [...this.localLetters]) {
      try {
        const docRef = await db.collection('letters').add({
          author: letter.author,
          recipient: letter.recipient,
          tag: letter.tag,
          content: letter.content,
          stamp: letter.stamp,
          stampName: letter.stampName,
          date: letter.date,
          likes: letter.likes || 1,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        // Once synced, remove from local queue
        this.localLetters = this.localLetters.filter((l) => l.id !== letter.id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localLetters));
        } catch (err) {}
      } catch (err) {
        break; // Stop sync attempt if Firestore is still disabled/offline
      }
    }
  }

  combineAndRender(highlightId = null) {
    // Merge cloud letters + unique local letters + preset defaults
    const cloudIds = new Set((this.cloudLetters || []).map((l) => l.id));
    const uniqueLocal = (this.localLetters || []).filter((l) => !cloudIds.has(l.id));

    this.letters = [...this.cloudLetters, ...uniqueLocal, ...DEFAULT_LETTERS];
    this.renderWall(highlightId);
  }

  async saveCustomLetter(newLetter) {
    // 1. Immediately cache locally so letter is NEVER lost
    try {
      this.localLetters = this.localLetters || [];
      this.localLetters.unshift(newLetter);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localLetters));
      this.combineAndRender(newLetter.id);
    } catch (e) {
      console.error('Save error', e);
    }

    // 2. Persist to Firestore Cloud if available
    if (db) {
      try {
        const docRef = await db.collection('letters').add({
          author: newLetter.author,
          recipient: newLetter.recipient,
          tag: newLetter.tag,
          content: newLetter.content,
          stamp: newLetter.stamp,
          stampName: newLetter.stampName,
          date: newLetter.date,
          likes: newLetter.likes || 1,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        newLetter.id = docRef.id;

        // Remove from local queue since it's now safely in cloud
        this.localLetters = this.localLetters.filter((l) => l.id !== newLetter.id && l.id !== newLetter.tempId);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localLetters));
        } catch (err) {}

        return docRef.id;
      } catch (err) {
        console.warn('Cloud save fallback note (saved locally):', err);
      }
    }
    return newLetter.id;
  }

  toggleLike(letterId) {
    const isLiked = this.likedIds.has(letterId);

    if (isLiked) {
      this.likedIds.delete(letterId);
    } else {
      this.likedIds.add(letterId);
    }

    localStorage.setItem(LIKES_KEY, JSON.stringify(Array.from(this.likedIds)));

    const letter = this.letters.find((l) => l.id === letterId);
    if (letter) {
      letter.likes = Math.max(0, letter.likes + (isLiked ? -1 : 1));
    }

    // Update in Firestore if this is a cloud-persisted letter
    if (db && letter && !letterId.startsWith('letter-00')) {
      try {
        db.collection('letters')
          .doc(letterId)
          .update({
            likes: firebase.firestore.FieldValue.increment(isLiked ? -1 : 1),
          })
          .catch((e) => console.warn('Could not sync like to cloud:', e));
      } catch (e) {}
    }

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
    form.addEventListener('submit', async (e) => {
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
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;

      const tempId = 'letter-' + Date.now();
      const newLetter = {
        id: tempId,
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
        <span class="inline-block animate-spin mr-2">✦</span> Đang lưu vào Bức Tường Ký Ức...
      `;

      // Save to Cloud Firestore & LocalStorage
      const finalId = await this.saveCustomLetter(newLetter);

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
      this.renderWall(finalId || tempId);

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
      this.showToast('Lá thư của bạn đã được niêm phong và lưu vĩnh viễn trên Bức Tường Ký Ức!');

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
