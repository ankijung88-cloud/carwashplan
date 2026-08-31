/**
 * CARWASH PLAN - Premium Mobile Car Wash Customer Sign-up & Logic
 * Features: Video Player Box, Before/After Slider, Customer Bank Payment Registration, Admin Manager
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Initial Seed Data for Customer Admin Panel if empty
  initSeedData();

  // Initialize UI Subsystems
  initVideoPlayerBox();
  initGalleryCarousel();
  initSignaturePad();
  initFormValidationAndSubmit();
  initAdminManager();
  initCustomerDetailModal();
  initEditGalleryModalLogic();
  initIntegrationSettings();

  console.log('CARWASH PLAN Customer Landing Initialized Successfully.');
});

/* ==========================================================================
   1. Live Customer Submissions Storage Management (실시간 고객 신청 데이터)
   ========================================================================== */
const STORAGE_KEY = 'carwashplan_customer_submissions_live';

function initSeedData() {
  // Clear legacy mock seed data so table is pristine and only reflects live customer data
  if (localStorage.getItem('carwashplan_customer_submissions')) {
    localStorage.removeItem('carwashplan_customer_submissions');
  }
}

function getSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveSubmissions(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ==========================================================================
   2. Video Player Box Subsystem (동영상 박스 제어)
   ========================================================================== */
function initVideoPlayerBox() {
  const mainVideoPlayer = document.getElementById('mainVideoPlayer');
  const videoSource = document.getElementById('videoSource');
  const videoPlayOverlay = document.getElementById('videoPlayOverlay');
  const overlayPlayBtn = document.getElementById('overlayPlayBtn');
  const currentVideoTitle = document.getElementById('currentVideoTitle');
  const videoTabs = document.querySelectorAll('.video-tab');

  if (!mainVideoPlayer) return;

  const togglePlay = () => {
    if (mainVideoPlayer.paused) {
      mainVideoPlayer.play();
      videoPlayOverlay.classList.add('playing');
    } else {
      mainVideoPlayer.pause();
      videoPlayOverlay.classList.remove('playing');
    }
  };

  if (overlayPlayBtn) {
    overlayPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }

  if (videoPlayOverlay) {
    videoPlayOverlay.addEventListener('click', togglePlay);
  }

  mainVideoPlayer.addEventListener('play', () => {
    if (videoPlayOverlay) videoPlayOverlay.classList.add('playing');
  });

  mainVideoPlayer.addEventListener('pause', () => {
    if (videoPlayOverlay) videoPlayOverlay.classList.remove('playing');
  });

  // Switch Video Tabs
  videoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      videoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const videoUrl = tab.dataset.video;
      const title = tab.dataset.title;
      const poster = tab.dataset.poster;

      if (videoUrl) {
        videoSource.src = videoUrl;
        mainVideoPlayer.poster = poster || 'assets/car_wash_hero.jpg';
        if (currentVideoTitle) currentVideoTitle.textContent = title;
        mainVideoPlayer.load();
        mainVideoPlayer.play().then(() => {
          if (videoPlayOverlay) videoPlayOverlay.classList.add('playing');
        }).catch(() => {
          if (videoPlayOverlay) videoPlayOverlay.classList.remove('playing');
        });
      }
    });
  });
}

/* ==========================================================================
   3. Interactive Horizontal Loop Photo Gallery & Admin Lightbox Modal
   ========================================================================== */
const GALLERY_STORAGE_KEY = 'carwashplan_gallery_photos_v2';

const DEFAULT_GALLERY_ITEMS = [
  { id: 'GAL-1', src: 'assets/car_wash_hero.jpg', title: '1. 프리미엄 워터리스 세차', desc: '도장면 손상 없는 고성능 워터리스 케미컬 세차 시공' },
  { id: 'GAL-2', src: 'assets/car_detailing_process.jpg', title: '2. 초극세사 타월 버핑', desc: '특수 프리미엄 초극세사 타월로 차량 표면을 부드럽게 버핑 정밀 닦기' },
  { id: 'GAL-3', src: 'assets/car_interior_clean.jpg', title: '3. 실내 크리닝 옵션', desc: '가죽 시트, 플로어 매트, 대쉬보드 부터 콘솔 오염제거' },
  { id: 'GAL-4', src: 'assets/car_wheel_shine.jpg', title: '4. 휠 세척 & 타이어 드레싱', desc: '주행중 발생한 휠의 외부 노출부에 쌓인 분진과 먼지를 제거하여 보존 및 타이어 수명 연장 보호막 도포' },
  { id: 'GAL-5', src: 'assets/car_glass_coating.jpg', title: '5. 전면 유리 유막제거 & 발수', desc: '빗길 시야 확보를 위한 찌든 유막제거 및 초발수 비딩 시공' }
];

function getGalleryItems() {
  const data = localStorage.getItem(GALLERY_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(DEFAULT_GALLERY_ITEMS));
    return DEFAULT_GALLERY_ITEMS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_GALLERY_ITEMS;
  }
}

function saveGalleryItems(items) {
  localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
  initGalleryCarousel();
  renderAdminGalleryList();
}

function initGalleryCarousel() {
  const track = document.getElementById('galleryTrack');
  const prevBtn = document.getElementById('galleryPrevBtn');
  const nextBtn = document.getElementById('galleryNextBtn');
  const counterIndexEl = document.getElementById('currentCardIndex');
  const totalCardCountEl = document.getElementById('totalCardCount');

  if (!track) return;

  const activeItems = getGalleryItems();

  if (totalCardCountEl) {
    totalCardCountEl.textContent = activeItems.length;
  }

  if (activeItems.length === 0) {
    track.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted); width: 100%;">등록된 갤러리 시공 사진이 없습니다. 관리자 확인 센터에서 시공 사진을 등록해 주세요.</div>`;
    return;
  }

  // Dynamically render valid items from LocalStorage
  track.innerHTML = activeItems.map((item, idx) => `
    <div class="gallery-card" data-index="${idx}">
      <div class="gallery-img-box">
        <img src="${item.src}" alt="${escapeHtml(item.title || '세차 시공 사진')}" loading="lazy">
        <div class="gallery-overlay">
          <i data-lucide="zoom-in"></i>
          <span>클릭하여 확대보기</span>
        </div>
      </div>
      <div class="gallery-card-info">
        <h4>${escapeHtml(item.title || `시공 사진 ${idx + 1}`)}</h4>
        <p>${escapeHtml(item.desc || '')}</p>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();

  let currentIndex = 0;
  const cardWidth = 280 + 16; // card width (280px) + gap (16px)
  const maxIndex = activeItems.length - 1;

  const updateSlidePosition = () => {
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    if (counterIndexEl) counterIndexEl.textContent = currentIndex + 1;
  };

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      currentIndex++;
    } else {
      currentIndex = 0; // infinite loop back to start
    }
    updateSlidePosition();
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = maxIndex; // loop back to end
    }
    updateSlidePosition();
  };

  if (nextBtn) nextBtn.onclick = nextSlide;
  if (prevBtn) prevBtn.onclick = prevSlide;

  // Auto Scroll Horizontal Loop Timer (3.5s interval)
  if (window.galleryLoopTimer) clearInterval(window.galleryLoopTimer);
  window.galleryLoopTimer = setInterval(nextSlide, 3500);

  const trackContainer = document.getElementById('galleryTrackContainer');
  if (trackContainer) {
    trackContainer.onmouseenter = () => clearInterval(window.galleryLoopTimer);
    trackContainer.onmouseleave = () => {
      clearInterval(window.galleryLoopTimer);
      window.galleryLoopTimer = setInterval(nextSlide, 3500);
    };
  }

  // Lightbox Modal State
  let activeModalIndex = 0;
  const photoModal = document.getElementById('photoModal');
  const modalImg = document.getElementById('photoModalImg');
  const modalTitle = document.getElementById('photoModalTitle');
  const modalDesc = document.getElementById('photoModalDesc');
  const modalCounterTag = document.getElementById('modalPhotoCounter');

  const showModalPhoto = (index) => {
    if (index < 0) index = activeItems.length - 1;
    if (index >= activeItems.length) index = 0;

    activeModalIndex = index;
    const item = activeItems[activeModalIndex];

    if (modalImg) modalImg.src = item.src;
    if (modalTitle) modalTitle.textContent = item.title;
    if (modalDesc) modalDesc.textContent = item.desc;
    if (modalCounterTag) modalCounterTag.textContent = `${activeModalIndex + 1} / ${activeItems.length}`;
  };

  // Click Photo Card -> Open Lightbox Modal View
  track.querySelectorAll('.gallery-card').forEach(card => {
    card.onclick = () => {
      const idx = parseInt(card.dataset.index, 10);
      showModalPhoto(idx);
      if (photoModal) {
        photoModal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      }
    };
  });

  // Lightbox Modal Navigation Buttons ([<] and [>])
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');

  if (modalPrevBtn) {
    modalPrevBtn.onclick = (e) => {
      e.stopPropagation();
      showModalPhoto(activeModalIndex - 1);
    };
  }

  if (modalNextBtn) {
    modalNextBtn.onclick = (e) => {
      e.stopPropagation();
      showModalPhoto(activeModalIndex + 1);
    };
  }

  // Photo Lightbox Modal Close Controls
  const closePhotoBtn = document.getElementById('closePhotoBtn');

  if (closePhotoBtn && photoModal) {
    closePhotoBtn.onclick = () => {
      photoModal.classList.add('hidden');
    };

    photoModal.onclick = (e) => {
      if (e.target === photoModal) {
        photoModal.classList.add('hidden');
      }
    };
  }
}

/* ==========================================================================
   4. Customer Registration Form Validation & Submission
   ========================================================================== */
/* ==========================================================================
   4. Customer Digital Signature Pad & Sign-Up Registration Logic
   ========================================================================== */
let isSignatureDrawn = false;

function initSignaturePad() {
  const canvas = document.getElementById('signatureCanvas');
  const clearBtn = document.getElementById('clearSignatureBtn');
  const placeholder = document.getElementById('signaturePlaceholder');
  const container = document.querySelector('.signature-pad-container');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
  }

  resizeCanvas();
  window.addEventListener('resize', () => {
    if (!isSignatureDrawn) resizeCanvas();
  });

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function startDrawing(e) {
    if (e.cancelable) e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    if (placeholder) placeholder.style.display = 'none';
    if (container) {
      container.classList.add('active');
      container.classList.remove('invalid');
    }
    const sigErr = document.getElementById('signatureError');
    if (sigErr) sigErr.style.display = 'none';
  }

  function draw(e) {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
    isSignatureDrawn = true;
  }

  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
    }
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      isSignatureDrawn = false;
      if (placeholder) placeholder.style.display = 'block';
      if (container) {
        container.classList.remove('active');
        container.classList.remove('invalid');
      }
    });
  }
}

function initFormValidationAndSubmit() {
  const form = document.getElementById('signupForm');
  const phoneInput = document.getElementById('memberPhone');
  const checkAll = document.getElementById('checkAll');
  const reqTerms = document.querySelectorAll('.req-term');

  if (!form) return;

  // Phone Number Auto-Hyphenation
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/[^0-9]/g, '');
      if (val.length > 3 && val.length <= 7) {
        val = val.slice(0, 3) + '-' + val.slice(3);
      } else if (val.length > 7) {
        val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
      }
      e.target.value = val;
    });
  }

  // Check All Terms Handler
  if (checkAll) {
    checkAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll('.terms-list input[type="checkbox"]').forEach(cb => {
        cb.checked = isChecked;
      });
    });
  }

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset error states
    document.querySelectorAll('.input-group').forEach(grp => grp.classList.remove('invalid'));
    const termErr = document.getElementById('termError');
    if (termErr) termErr.style.display = 'none';
    const sigErr = document.getElementById('signatureError');
    if (sigErr) sigErr.style.display = 'none';

    // 1. Name Check
    const nameVal = document.getElementById('memberName').value.trim();
    if (!nameVal) {
      setError('memberName');
      isValid = false;
    }

    // 2. Phone Check
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    if (!phoneVal || phoneVal.replace(/[^0-9]/g, '').length < 10) {
      setError('memberPhone');
      isValid = false;
    }

    // 3. Email Check
    const emailVal = document.getElementById('memberEmail').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      setError('memberEmail');
      isValid = false;
    }

    // 4. Region Check
    const regionVal = document.getElementById('serviceRegion').value.trim();
    if (!regionVal) {
      setError('serviceRegion');
      isValid = false;
    }

    // 5. Car Plate Check (차량번호)
    const plateInput = document.getElementById('carPlate');
    const plateVal = plateInput ? plateInput.value.trim() : '';
    if (!plateVal) {
      setError('carPlate');
      isValid = false;
    }

    // 5.1 Car Model Check (보유 차종)
    const modelInput = document.getElementById('carModel');
    const modelVal = modelInput ? modelInput.value.trim() : '';
    if (!modelVal) {
      setError('carModel');
      isValid = false;
    }

    // 5.2 Car Color Check (차량 색상)
    const colorInput = document.getElementById('carColor');
    const colorVal = colorInput ? colorInput.value.trim() : '';
    if (!colorVal) {
      setError('carColor');
      isValid = false;
    }

    // 6. Preferred Days Check
    const checkedDayEls = document.querySelectorAll('input[name="preferredDays"]:checked');
    const dayErr = document.getElementById('dayError');
    if (checkedDayEls.length === 0) {
      if (dayErr) dayErr.style.display = 'block';
      isValid = false;
    } else {
      if (dayErr) dayErr.style.display = 'none';
    }

    // 7. Required Terms Check
    let allTermsChecked = true;
    reqTerms.forEach(term => {
      if (!term.checked) allTermsChecked = false;
    });

    if (!allTermsChecked) {
      if (termErr) termErr.style.display = 'block';
      isValid = false;
    }

    // 8. Digital Signature Validation
    const sigContainer = document.querySelector('.signature-pad-container');
    if (!isSignatureDrawn) {
      if (sigErr) sigErr.style.display = 'block';
      if (sigContainer) sigContainer.classList.add('invalid');
      isValid = false;
    }

    if (!isValid) {
      showToast('입력 확인 필요', '필수 입력 항목, 약관 동의 및 자필 전자서명을 확인해 주세요.');
      return;
    }

    // Service Plan & Payment Method & Special Notes & Extra Options Selected
    const planVal = document.querySelector('input[name="experience"]:checked')?.value || '퍼펙트 (월 4회 할인 특가)';
    const paymentMethodVal = document.querySelector('input[name="paymentMethod"]:checked')?.value || '카드';
    const selectedDaysStr = Array.from(checkedDayEls).map(cb => cb.value).join(', ');
    const extraOpts = Array.from(document.querySelectorAll('input[name="extraOption"]:checked')).map(cb => cb.value).join(', ');

    const exteriorList = Array.from(document.querySelectorAll('input[name="exteriorState"]:checked')).map(cb => cb.value);
    const interiorList = Array.from(document.querySelectorAll('input[name="interiorEnv"]:checked')).map(cb => cb.value);
    const usageList = Array.from(document.querySelectorAll('input[name="usagePattern"]:checked')).map(cb => cb.value);
    const featureList = Array.from(document.querySelectorAll('input[name="carFeatures"]:checked')).map(cb => cb.value);
    const proofList = Array.from(document.querySelectorAll('input[name="proofRequest"]:checked')).map(cb => cb.value);

    const specialNotesList = [
      exteriorList.length ? `외관: ${exteriorList.join(',')}` : '',
      interiorList.length ? `실내: ${interiorList.join(',')}` : '',
      usageList.length ? `패턴: ${usageList.join(',')}` : '',
      featureList.length ? `특징: ${featureList.join(',')}` : '',
      proofList.length ? `증빙: ${proofList.join(',')}` : ''
    ].filter(Boolean).join(' | ');

    // Extract Signature Canvas Image
    const signatureCanvas = document.getElementById('signatureCanvas');
    const signatureDataUrl = isSignatureDrawn && signatureCanvas ? signatureCanvas.toDataURL('image/png') : '';

    // Build New Customer Registration Record with Terms & Signature
    const formattedNow = formatNowDate();
    const newRecord = {
      id: 'CUST-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900 + 100)),
      createdAt: formattedNow,
      name: nameVal,
      phone: phoneVal,
      email: emailVal,
      region: regionVal,
      plate: plateVal,
      model: modelVal,
      color: colorVal,
      car: `${modelVal} (${plateVal}) / 색상: ${colorVal}`,
      plan: planVal,
      extraOptions: extraOpts || '없음',
      experience: planVal + (extraOpts ? ` [추가옵션: ${extraOpts}]` : ''),
      days: selectedDaysStr,
      exteriorState: exteriorList.join(', ') || '없음',
      interiorEnv: interiorList.join(', ') || '없음',
      usagePattern: usageList.join(', ') || '없음',
      carFeatures: featureList.join(', ') || '없음',
      proofRequest: proofList.join(', ') || '없음',
      specialNotes: specialNotesList || '없음',
      paymentMethod: paymentMethodVal,
      termsAgreed: {
        service: document.getElementById('termService')?.checked || true,
        privacy: document.getElementById('termPrivacy')?.checked || true,
        financial: document.getElementById('termFinancial')?.checked || true,
        marketing: document.getElementById('termMarketing')?.checked || false,
        allAgreed: true,
        agreedAt: formattedNow
      },
      signature: signatureDataUrl,
      status: 'PENDING'
    };

    // Save to LocalStorage
    const currentList = getSubmissions();
    currentList.unshift(newRecord);
    saveSubmissions(currentList);

    // Sync to Google Sheets & Telegram Notification in Real-time
    syncSubmissionToCloud(newRecord);

    // Form & Signature Reset
    form.reset();
    if (checkAll) checkAll.checked = false;
    if (signatureCanvas) {
      const ctx = signatureCanvas.getContext('2d');
      ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      isSignatureDrawn = false;
      const placeholder = document.getElementById('signaturePlaceholder');
      if (placeholder) placeholder.style.display = 'block';
      if (sigContainer) sigContainer.classList.remove('active');
    }

    showToast('신청 완료!', `${nameVal} 고객님의 신청 및 약관 서명이 완료되었습니다. 담당 매니저가 곧 연락드립니다.`);

    // Refresh Admin Table View if open
    renderAdminTable();
  });
}

function setError(inputId) {
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    const grp = inputEl.closest('.input-group');
    if (grp) grp.classList.add('invalid');
  }
}

function formatNowDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

/* ==========================================================================
   5. Admin Confirmation Management Panel Subsystem (관리자 모달)
   ========================================================================== */
function initAdminManager() {
  const adminModal = document.getElementById('adminModal');
  const openAdminBtn = document.getElementById('openAdminBtn');
  const footerAdminTrigger = document.getElementById('footerAdminTrigger');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  const closeAdminFooterBtn = document.getElementById('closeAdminFooterBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let currentFilter = 'ALL';

  // Admin Top Navigation Tab Switching
  const tabBtnCustomers = document.getElementById('tabBtnCustomers');
  const tabBtnGallery = document.getElementById('tabBtnGallery');
  const tabBtnIntegration = document.getElementById('tabBtnIntegration');
  const adminCustomerTabContent = document.getElementById('adminCustomerTabContent');
  const adminGalleryTabContent = document.getElementById('adminGalleryTabContent');
  const adminIntegrationTabContent = document.getElementById('adminIntegrationTabContent');

  const switchAdminTab = (activeTab) => {
    [tabBtnCustomers, tabBtnGallery, tabBtnIntegration].forEach(btn => {
      if (btn) btn.classList.toggle('active', btn.dataset.tab === activeTab);
    });
    if (adminCustomerTabContent) adminCustomerTabContent.classList.toggle('hidden', activeTab !== 'customers');
    if (adminGalleryTabContent) {
      adminGalleryTabContent.classList.toggle('hidden', activeTab !== 'gallery');
      if (activeTab === 'gallery') renderAdminGalleryList();
    }
    if (adminIntegrationTabContent) adminIntegrationTabContent.classList.toggle('hidden', activeTab !== 'integration');
  };

  if (tabBtnCustomers) tabBtnCustomers.addEventListener('click', () => switchAdminTab('customers'));
  if (tabBtnGallery) tabBtnGallery.addEventListener('click', () => switchAdminTab('gallery'));
  if (tabBtnIntegration) tabBtnIntegration.addEventListener('click', () => switchAdminTab('integration'));

  // Admin Security Auth State
  const ADMIN_PW_KEY = 'carwashplan_admin_password';
  const DEFAULT_ADMIN_PW = 'admin1234';
  const ADMIN_AUTH_SESSION_KEY = 'carwashplan_admin_authenticated';

  const getAdminPassword = () => {
    return localStorage.getItem(ADMIN_PW_KEY) || DEFAULT_ADMIN_PW;
  };

  const isAdminAuthed = () => {
    return sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === 'true';
  };

  const adminAuthModal = document.getElementById('adminAuthModal');
  const adminAuthForm = document.getElementById('adminAuthForm');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const adminAuthError = document.getElementById('adminAuthError');
  const closeAdminAuthBtn = document.getElementById('closeAdminAuthBtn');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  const syncCloudBtn = document.getElementById('syncCloudBtn');

  const openModal = () => {
    if (isAdminAuthed()) {
      renderAdminTable(currentFilter);
      renderAdminGalleryList();
      adminModal.classList.remove('hidden');
      // Auto-fetch latest customer submissions from Google Sheets cloud
      fetchSubmissionsFromCloud(false);
    } else {
      if (adminPasswordInput) adminPasswordInput.value = '';
      if (adminAuthError) adminAuthError.style.display = 'none';
      if (adminAuthModal) {
        adminAuthModal.classList.remove('hidden');
        if (adminPasswordInput) setTimeout(() => adminPasswordInput.focus(), 100);
      }
    }
  };

  const closeAuthModal = () => {
    if (adminAuthModal) adminAuthModal.classList.add('hidden');
  };

  const closeModal = () => {
    adminModal.classList.add('hidden');
  };

  if (closeAdminAuthBtn) closeAdminAuthBtn.addEventListener('click', closeAuthModal);
  if (adminAuthModal) {
    adminAuthModal.addEventListener('click', (e) => {
      if (e.target === adminAuthModal) closeAuthModal();
    });
  }

  if (adminAuthForm) {
    adminAuthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = adminPasswordInput ? adminPasswordInput.value.trim() : '';
      const correctPw = getAdminPassword();

      if (entered === correctPw) {
        sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'true');
        closeAuthModal();
        renderAdminTable(currentFilter);
        renderAdminGalleryList();
        adminModal.classList.remove('hidden');
        showToast('관리자 인증 성공', '관리자 확인 센터에 로그인되었습니다.');
        fetchSubmissionsFromCloud(false);
      } else {
        if (adminAuthError) adminAuthError.style.display = 'block';
        if (adminPasswordInput) {
          adminPasswordInput.select();
          adminPasswordInput.focus();
        }
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
      closeModal();
      showToast('로그아웃 완료', '관리자 세션이 안전하게 종료되었습니다.');
    });
  }

  if (openAdminBtn) openAdminBtn.addEventListener('click', openModal);
  if (footerAdminTrigger) footerAdminTrigger.addEventListener('click', openModal);
  if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeModal);
  if (closeAdminFooterBtn) closeAdminFooterBtn.addEventListener('click', closeModal);

  if (syncCloudBtn) {
    syncCloudBtn.addEventListener('click', () => {
      fetchSubmissionsFromCloud(true);
    });
  }

  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) closeModal();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'ALL';
      renderAdminTable(currentFilter);
    });
  });

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      exportToCsv();
    });
  }

  // Admin Gallery Photo Registration Form Submission
  const adminGalleryForm = document.getElementById('adminGalleryForm');
  if (adminGalleryForm) {
    adminGalleryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('adminPhotoFile');
      const urlInput = document.getElementById('adminPhotoUrl');
      const titleInput = document.getElementById('adminPhotoTitle');
      const descInput = document.getElementById('adminPhotoDesc');

      const title = titleInput.value.trim();
      const desc = descInput.value.trim();
      let photoUrl = urlInput ? urlInput.value.trim() : '';

      const addPhotoRecord = (src) => {
        const items = getGalleryItems();
        const newId = 'GAL-' + Date.now();
        items.push({
          id: newId,
          src: src,
          title: title,
          desc: desc
        });
        saveGalleryItems(items);
        adminGalleryForm.reset();
        showToast('사진 등록 완료!', `'${title}' 시공 사진이 갤러리에 등록되었습니다.`);
      };

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          addPhotoRecord(evt.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else if (photoUrl) {
        addPhotoRecord(photoUrl);
      } else {
        alert('사진 파일을 업로드하시거나 이미지 URL 주소를 입력해 주세요.');
      }
    });
  }

  const resetGalleryBtn = document.getElementById('resetGalleryBtn');
  if (resetGalleryBtn) {
    resetGalleryBtn.addEventListener('click', () => {
      if (confirm('시공 갤러리를 기본 샘플 데이터로 복원하시겠습니까?')) {
        saveGalleryItems(DEFAULT_GALLERY_ITEMS);
        showToast('복원 완료', '갤러리 데이터가 기본 샘플로 복원되었습니다.');
      }
    });
  }
}

/* ==========================================================================
   Admin Gallery Photo List Rendering & Operations
   ========================================================================== */
function renderAdminGalleryList() {
  const container = document.getElementById('adminGalleryList');
  const countEl = document.getElementById('adminGalleryCount');
  if (!container) return;

  const items = getGalleryItems();
  if (countEl) countEl.textContent = items.length;

  if (items.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">등록된 시공 갤러리 사진이 없습니다. 상단 양식에서 사진을 등록해 주세요.</div>`;
    return;
  }

  container.innerHTML = items.map((item, index) => `
    <div class="admin-gallery-item-card" data-id="${item.id}">
      <div class="admin-gallery-thumb">
        <img src="${item.src}" alt="${escapeHtml(item.title)}">
      </div>
      <div class="admin-gallery-item-body">
        <h5>${escapeHtml(item.title)}</h5>
        <p>${escapeHtml(item.desc)}</p>
        <div class="admin-gallery-actions">
          <button onclick="moveAdminGallery('${item.id}', -1)" class="btn btn-outline btn-xs" ${index === 0 ? 'disabled' : ''} title="위로 이동">▲ 위로</button>
          <button onclick="moveAdminGallery('${item.id}', 1)" class="btn btn-outline btn-xs" ${index === items.length - 1 ? 'disabled' : ''} title="아래로 이동">▼ 아래로</button>
          <button onclick="openEditGalleryModal('${item.id}')" class="btn btn-outline btn-xs" style="color:var(--accent);border-color:var(--border-glow);" title="정보 수정">수정</button>
          <button onclick="deleteAdminGallery('${item.id}')" class="btn btn-danger btn-xs" style="margin-left: auto;">삭제</button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

window.openEditGalleryModal = function(id) {
  const items = getGalleryItems();
  const item = items.find(i => i.id === id);
  if (!item) return;

  const modal = document.getElementById('editGalleryModal');
  const idInput = document.getElementById('editGalleryId');
  const previewImg = document.getElementById('editGalleryPreview');
  const urlInput = document.getElementById('editPhotoUrl');
  const titleInput = document.getElementById('editPhotoTitle');
  const descInput = document.getElementById('editPhotoDesc');
  const fileInput = document.getElementById('editPhotoFile');

  if (idInput) idInput.value = item.id;
  if (previewImg) previewImg.src = item.src;
  if (urlInput) urlInput.value = item.src;
  if (titleInput) titleInput.value = item.title;
  if (descInput) descInput.value = item.desc;
  if (fileInput) fileInput.value = '';

  if (modal) {
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }
};

window.closeEditGalleryModal = function() {
  const modal = document.getElementById('editGalleryModal');
  if (modal) modal.classList.add('hidden');
};

function initEditGalleryModalLogic() {
  const modal = document.getElementById('editGalleryModal');
  const closeBtn = document.getElementById('closeEditGalleryBtn');
  const cancelBtn = document.getElementById('cancelEditGalleryBtn');
  const editForm = document.getElementById('editGalleryForm');

  if (closeBtn) closeBtn.onclick = window.closeEditGalleryModal;
  if (cancelBtn) cancelBtn.onclick = window.closeEditGalleryModal;

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) window.closeEditGalleryModal();
    };
  }

  if (editForm) {
    editForm.onsubmit = function(e) {
      e.preventDefault();
      const id = document.getElementById('editGalleryId').value;
      const fileInput = document.getElementById('editPhotoFile');
      const urlInput = document.getElementById('editPhotoUrl');
      const titleInput = document.getElementById('editPhotoTitle');
      const descInput = document.getElementById('editPhotoDesc');

      const items = getGalleryItems();
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) return;

      const title = titleInput.value.trim();
      const desc = descInput.value.trim();
      let photoUrl = urlInput ? urlInput.value.trim() : items[idx].src;

      const applyUpdate = (src) => {
        items[idx].title = title;
        items[idx].desc = desc;
        items[idx].src = src || items[idx].src;
        saveGalleryItems(items);
        window.closeEditGalleryModal();
        showToast('수정 완료!', `'${title}' 시공 정보가 정상적으로 수정되었습니다.`);
      };

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          applyUpdate(evt.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        applyUpdate(photoUrl);
      }
    };
  }
}

window.moveAdminGallery = function(id, direction) {
  const items = getGalleryItems();
  const idx = items.findIndex(item => item.id === id);
  if (idx === -1) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= items.length) return;

  const temp = items[idx];
  items[idx] = items[targetIdx];
  items[targetIdx] = temp;

  saveGalleryItems(items);
};

window.deleteAdminGallery = function(id) {
  if (!confirm('이 시공 사진을 갤러리에서 삭제하시겠습니까?')) return;
  let items = getGalleryItems();
  items = items.filter(item => item.id !== id);
  saveGalleryItems(items);
  showToast('삭제 완료', '선택하신 시공 사진이 삭제되었습니다.');
};

function renderAdminTable(filter = 'ALL') {
  const tableBody = document.getElementById('adminTableBody');
  const statTotal = document.getElementById('statTotalCount');
  const statPending = document.getElementById('statPendingCount');
  const statApproved = document.getElementById('statApprovedCount');
  const statRejected = document.getElementById('statRejectedCount');

  if (!tableBody) return;

  const data = getSubmissions();

  const totalCount = data.length;
  const pendingCount = data.filter(d => d.status === 'PENDING').length;
  const approvedCount = data.filter(d => d.status === 'APPROVED').length;
  const rejectedCount = data.filter(d => d.status === 'REJECTED').length;

  if (statTotal) statTotal.textContent = totalCount;
  if (statPending) statPending.textContent = pendingCount;
  if (statApproved) statApproved.textContent = approvedCount;
  if (statRejected) statRejected.textContent = rejectedCount;

  let filteredData = data;
  if (filter !== 'ALL') {
    filteredData = data.filter(d => d.status === filter);
  }

  if (filteredData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(14, 165, 233, 0.1); border: 1px solid var(--border-glow); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; color: var(--accent);">
            <i data-lucide="inbox" style="width: 24px; height: 24px;"></i>
          </div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">접수된 신청 내역이 없습니다.</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">고객이 홈페이지에서 가입 신청서를 제출하면 실시간으로 이곳에 등록됩니다.</div>
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  tableBody.innerHTML = filteredData.map(item => {
    let statusTag = '';
    if (item.status === 'APPROVED') {
      statusTag = `<span class="status-tag approved"><i data-lucide="check" style="width:12px;height:12px;"></i> 승인 완료</span>`;
    } else if (item.status === 'REJECTED') {
      statusTag = `<span class="status-tag rejected"><i data-lucide="x" style="width:12px;height:12px;"></i> 반려</span>`;
    } else {
      statusTag = `<span class="status-tag pending"><i data-lucide="clock" style="width:12px;height:12px;"></i> 승인 대기</span>`;
    }

    // 1. 정제된 결제 방식 (특이사항 텍스트 오염 방지)
    let displayPay = item.paymentMethod || '카드';
    if (displayPay.includes('외관:') || displayPay.includes('실내:') || displayPay.includes('패턴:') || displayPay.includes('특징:')) {
      displayPay = '카드';
    }

    // 2. 정제된 차종/번호/색상
    let plateM = (item.plate || '').match(/\d{2,3}[가-힣]\s*\d{4}/) || (item.car || '').match(/\d{2,3}[가-힣]\s*\d{4}/);
    let carPlate = plateM ? plateM[0] : '';
    let carModel = (item.model || item.car || '')
      .replace(/\d{2,3}[가-힣]\s*\d{4}/g, '')
      .replace(/퍼펙트.*|스마트.*|라이트.*/g, '')
      .replace(/\(카드\)/g, '')
      .replace(/월요일|화요일|수요일|목요일|금요일|토요일|일요일/g, '')
      .replace(/(?:색상|컬러|Color)\s*[:：]\s*[^\/\[\],]+/gi, '')
      .replace(/\[색상:[^\]]+\]/g, '')
      .replace(/[()\/[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    let carColor = (item.color || '').replace(/색상\s*[:：]/, '').trim();
    if (!carColor) {
      let cMatch = (item.car || '').match(/(?:색상|컬러|Color)\s*[:：]\s*([^\/\[\],]+)/i) || (item.car || '').match(/\[색상:\s*([^\]]+)\]/);
      if (cMatch) carColor = cMatch[1].trim();
    }

    let displayCar = carModel || '차종 미입력';
    if (carPlate) displayCar += ` (${carPlate})`;
    if (carColor) displayCar += ` - ${carColor}`;

    // 3. 정제된 플랜 및 요일
    let displayPlan = item.plan || item.experience || '퍼펙트 (월 4회 할인 특가)';
    if (displayPlan.includes('카드') || displayPlan.includes('외관:')) {
      displayPlan = '퍼펙트 (월 4회 할인 특가)';
    }

    let displayDays = item.days || '';
    if (displayDays.includes('외관:') || displayDays.includes('실내:')) {
      let dMatches = `${item.days || ''} ${item.car || ''}`.match(/(월|화|수|목|금|토|일)요일/g);
      displayDays = dMatches ? Array.from(new Set(dMatches)).join(', ') : '월요일';
    }

    return `
      <tr>
        <td>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); display: block;">${item.createdAt}</span>
          <span style="font-size: 0.72rem; color: var(--accent); font-weight: 700;">${item.id}</span>
        </td>
        <td>
          <div class="member-name">${escapeHtml(item.name)}</div>
          <div class="member-phone">${escapeHtml(item.phone)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.email)}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(item.region)}</div>
          <div style="font-size: 0.75rem; color: var(--accent); font-weight:600;">${escapeHtml(displayCar)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(displayPlan)}${displayDays ? ` (${escapeHtml(displayDays)})` : ''}</div>
        </td>
        <td>
          <div><span class="bank-badge" style="background:var(--primary-light); color:var(--accent); font-weight:800;">${escapeHtml(displayPay)}</span></div>
        </td>
        <td>${statusTag}</td>
        <td>
          <div class="table-actions">
            <button onclick="openCustomerDetailModal('${item.id}')" class="action-btn-detail" title="약관동의 및 서명확인">
              <i data-lucide="file-check" style="width:13px;height:13px;"></i> 상세/서명
            </button>
            ${item.status !== 'APPROVED' ? `<button onclick="updateStatus('${item.id}', 'APPROVED')" class="action-btn-approve">승인</button>` : ''}
            ${item.status !== 'REJECTED' ? `<button onclick="updateStatus('${item.id}', 'REJECTED')" class="action-btn-reject">반려</button>` : ''}
            <button onclick="deleteSubmission('${item.id}')" class="action-btn-delete" title="삭제"><i data-lucide="trash-2" style="width:15px;height:15px;"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

/* ==========================================================================
   Customer Detail & Agreement / Signature Verification Modal
   ========================================================================== */
function initCustomerDetailModal() {
  const modal = document.getElementById('customerDetailModal');
  const closeBtn = document.getElementById('closeCustomerDetailBtn');
  const footerCloseBtn = document.getElementById('closeCustomerDetailFooterBtn');
  const printBtn = document.getElementById('printCustomerDetailBtn');

  if (closeBtn) closeBtn.onclick = () => window.closeCustomerDetailModal();
  if (footerCloseBtn) footerCloseBtn.onclick = () => window.closeCustomerDetailModal();
  if (printBtn) {
    printBtn.onclick = () => {
      window.printCustomerConfirmation();
    };
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeCustomerDetailModal();
    });
  }
}

/* ==========================================================================
   Official Paper Registration Form Builder (정기세차 회원가입서 양식 생성기)
   ========================================================================== */
function generateRegistrationFormHTML(item) {
  // 날짜 파싱 (예: 2026-08-31 03:00 -> 2026, 08, 31)
  let year = '2026', month = '08', day = '31';
  if (item.createdAt) {
    const dMatch = item.createdAt.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
    if (dMatch) {
      year = dMatch[1];
      month = dMatch[2].padStart(2, '0');
      day = dMatch[3].padStart(2, '0');
    }
  }

  // 1. 차종, 차량번호, 색상 정밀 분리 복원
  let carPlate = '';
  if (item.plate && item.plate.match(/\d{2,3}[가-힣]\s*\d{4}/)) {
    carPlate = item.plate.match(/\d{2,3}[가-힣]\s*\d{4}/)[0];
  } else {
    const allText = `${item.plate || ''} ${item.car || ''} ${item.model || ''} ${item.specialNotes || ''}`;
    const pMatch = allText.match(/\d{2,3}[가-힣]\s*\d{4}/);
    if (pMatch) carPlate = pMatch[0];
  }

  let carColor = (item.color || '').replace(/색상\s*[:：]/, '').trim();
  if (!carColor) {
    const allText = `${item.car || ''} ${item.model || ''}`;
    const cMatch = allText.match(/(?:색상|컬러|Color)\s*[:：]\s*([^\/\[\],]+)/i) || allText.match(/\[색상:\s*([^\]]+)\]/);
    if (cMatch) {
      carColor = cMatch[1].trim();
    }
  }

  let carModel = item.model || item.car || '';
  if (carModel) {
    carModel = carModel
      .replace(/\d{2,3}[가-힣]\s*\d{4}/g, '')
      .replace(/(?:색상|컬러|Color)\s*[:：]\s*[^\/\[\],]+/gi, '')
      .replace(/\[색상:[^\]]+\]/g, '')
      .replace(/[()\/[\]]/g, ' ')
      .replace(/(?:월|화|수|목|금|토|일)요일/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 2. 요일(daysStr) 정밀 추출 (특이사항 텍스트 오염 방지)
  let daysStr = '월';
  const rawDays = item.days || '';
  if (rawDays && !rawDays.includes('외관:') && !rawDays.includes('실내:') && !rawDays.includes('패턴:')) {
    daysStr = rawDays.replace(/요일/g, '').trim();
  } else {
    const dayMatches = `${item.days || ''} ${item.experience || ''}`.match(/(월|화|수|목|금|토|일)(?:요일)?/g);
    if (dayMatches && dayMatches.length > 0) {
      daysStr = Array.from(new Set(dayMatches.map(d => d.replace('요일', '')))).join(', ');
    }
  }

  // 3. 횟수 파싱 (월 4회, 월 2회, 월 1회)
  let countStr = '4';
  const planCandidate = `${item.experience || ''} ${item.plan || ''} ${item.plate || ''}`;
  if (planCandidate.includes('스마트') || planCandidate.includes('격주') || planCandidate.includes('2회')) {
    countStr = '2';
  } else if (planCandidate.includes('라이트') || planCandidate.includes('1회')) {
    countStr = '1';
  } else {
    countStr = '4';
  }

  // 4. 결제 수단 체크
  const payment = item.paymentMethod || '';
  const isBank = payment.includes('계좌이체');
  const isAuto = payment.includes('자동이체');
  const isCard = payment.includes('카드') || (!isBank && !isAuto);

  const specialNotes = item.specialNotes || '';
  const hasOpt = (kw) => specialNotes.includes(kw);

  return `
    <div class="registration-form-doc">
      <!-- Top Brand Logo & Title -->
      <div class="reg-doc-header">
        <div class="reg-brand-logo">
          <svg width="40" height="32" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 1px auto;">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
          <span class="reg-brand-name">세차플랜</span>
        </div>
        <h1 class="reg-doc-title">정기세차 회원가입서</h1>
        <div class="reg-striped-divider"></div>
      </div>

      <!-- Main Customer Info Table -->
      <table class="reg-info-table">
        <tbody>
          <tr>
            <th style="width: 14%;">이름</th>
            <td style="width: 31%; font-weight: 700;">${escapeHtml(item.name)}</td>
            <th style="width: 18%;">횟수 / 요일</th>
            <td style="width: 37%; white-space: nowrap;">월 ( <strong>${countStr}</strong> )회, ( <strong>${escapeHtml(daysStr)}</strong> )요일</td>
          </tr>
          <tr>
            <th>주소</th>
            <td colspan="3">${escapeHtml(item.region)}</td>
          </tr>
          <tr>
            <th>출입 동의</th>
            <td colspan="3" style="white-space: nowrap;">
              <span class="check-box checked">☑</span> 예 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
              <span class="check-box">☐</span> 아니요 &nbsp;&nbsp;&nbsp;&nbsp; 
              <span class="sub-hint">(아파트 출입 허용여부)</span>
            </td>
          </tr>
          <tr>
            <th>연락처</th>
            <td>${escapeHtml(item.phone)}</td>
            <th style="width: 13%;">결제</th>
            <td style="white-space: nowrap;">
              <span class="payment-opts">
                <span class="payment-opt-item"><span class="check-box ${isBank ? 'checked' : ''}">${isBank ? '☑' : '☐'}</span> 계좌이체</span>
                <span class="payment-opt-item"><span class="check-box ${isAuto ? 'checked' : ''}">${isAuto ? '☑' : '☐'}</span> 자동이체</span>
                <span class="payment-opt-item"><span class="check-box ${isCard ? 'checked' : ''}">${isCard ? '☑' : '☐'}</span> 카드</span>
              </span>
            </td>
          </tr>
          <tr>
            <th>차종 / 색상</th>
            <td>${escapeHtml(carModel || item.car)} ${carColor ? `/ ${escapeHtml(carColor)}` : ''}</td>
            <th>차량번호</th>
            <td><strong>${escapeHtml(carPlate || '-')}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Special Remarks Box -->
      <div class="reg-notes-box">
        <div class="reg-notes-header">특이사항</div>
        <div class="reg-notes-body">
          <div class="note-row">
            <span class="note-lbl">외관상태:</span>
            <span class="note-opts">
              <span>${hasOpt('유광') ? '☑' : '☐'} 유광</span>
              <span>${hasOpt('무광') ? '☑' : '☐'} 무광</span>
              <span>${hasOpt('랩핑') ? '☑' : '☐'} 랩핑 (ppf)</span>
            </span>
          </div>
          <div class="note-row">
            <span class="note-lbl">실내환경:</span>
            <span class="note-opts">
              <span>${hasOpt('반려동물') ? '☑' : '☐'} 반려동물</span>
              <span>${hasOpt('어린이') ? '☑' : '☐'} 어린이</span>
              <span>${hasOpt('먼지') ? '☑' : '☐'} 먼지</span>
              <span>${hasOpt('냄새') ? '☑' : '☐'} 냄새</span>
            </span>
          </div>
          <div class="note-row">
            <span class="note-lbl">사용패턴:</span>
            <span class="note-opts">
              <span>${hasOpt('출퇴근') ? '☑' : '☐'} 출퇴근</span>
              <span>${hasOpt('장거리') ? '☑' : '☐'} 장거리</span>
              <span>${hasOpt('주말') ? '☑' : '☐'} 주말</span>
              <span>${hasOpt('패밀리') ? '☑' : '☐'} 패밀리</span>
            </span>
          </div>
          <div class="note-row">
            <span class="note-lbl">차량특징:</span>
            <span class="note-opts">
              <span>${hasOpt('전기차') ? '☑' : '☐'} 전기차</span>
              <span>${hasOpt('사제장착물') ? '☑' : '☐'} 사제장착물</span>
              <span>${hasOpt('루프박스') ? '☑' : '☐'} 루프박스</span>
            </span>
          </div>
          <div class="note-row">
            <span class="note-lbl">증빙요청:</span>
            <span class="note-opts">
              <span>${hasOpt('현금영수증') ? '☑' : '☐'} 현금영수증</span>
              <span>${hasOpt('세금계산서') ? '☑' : '☐'} 세금계산서</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Service Guide & Notices -->
      <div class="reg-policy-section">
        <h3 class="reg-section-title">● 서비스안내 <span class="sub">[월 구독형 방문세차]</span></h3>
        <ul class="reg-policy-list">
          <li>- 정기세차는 차량을 주기적으로 관리해 외부 컨디션을 꾸준히 유지하는 <strong>**유지관리형 서비스**</strong> 입니다.<br>&nbsp;&nbsp;정해진 주기에 따라, 안정적인 차량 상태를 유지해드립니다.</li>
          <li>- 차량 색상, 재질에 맞춰 전용 케미컬을 사용하여 표면을 안전하게 관리하며, 방문마다 코팅 효과를 유지 보강해드립니다.</li>
          <li>- 세차 방문 시간은 작업 동선에 따라 변동되며, 정확한 시간 안내가 어려울 수 있습니다.<br>&nbsp;&nbsp;작업은 차량이 주차된 상태에서 진행되며, 주차공간이 좁거나 위험한 경우 일정이 조정될 수 있습니다.</li>
        </ul>

        <h3 class="reg-section-title" style="margin-top: 8px;">● 유의사항</h3>
        <ul class="reg-policy-list notice-list">
          <li>※ 지정된 세차 요일 변경 및 연기는 <strong>**부득이한 사유(출장,여행 등)**</strong>에 한해 가능합니다.</li>
          <li>※ 우천, 폭염, 한파 등 작업 불가 시 일정이 조정될 수 있습니다.</li>
          <li>※ 자동이체는 매월 지정 결제일에 청구되며, 취소 및 변경은 결제일 전일까지 요청해 주셔야 정상 처리됩니다.</li>
          <li>※ 미사용 횟수는 결제일 기준 50일 이내 사용 가능하며, 기한 이후에는 자동 소멸됩니다.</li>
          <li>※ 차량에 원래 있던 손상(기스, 스크래치, 도장, 랩핑 등)은 세차 후 더 도드라질 수 있으며,<br>&nbsp;&nbsp;&nbsp;이러한 기존 외관 하자는 보상 대상이 아닙니다.</li>
        </ul>
      </div>

      <!-- Bottom Consent Statement & Customer Signature -->
      <div class="reg-footer-consent">
        <p class="consent-statement">상기 내용을 모두 확인하였으며 이에 동의합니다.</p>
        <div class="consent-date">${year} &nbsp;&nbsp;년 &nbsp;&nbsp;&nbsp;&nbsp; ${month} &nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;&nbsp; ${day} &nbsp;&nbsp;일</div>
        <div class="signature-line-wrap">
          <span class="applicant-label">신청인 : &nbsp;&nbsp;<strong>${escapeHtml(item.name)}</strong></span>
          <div class="signature-stamp-box">
            ${item.signature ? `<img src="${item.signature}" alt="${escapeHtml(item.name)} 고객 전자서명">` : '<span class="stamp-text">(서명/인)</span>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

window.openCustomerDetailModal = function(id) {
  const modal = document.getElementById('customerDetailModal');
  const content = document.getElementById('customerDetailContent');
  if (!modal || !content) return;

  const data = getSubmissions();
  const item = data.find(d => d.id === id);
  if (!item) return;

  // Render official registration form document HTML
  content.innerHTML = generateRegistrationFormHTML(item);

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
};

window.closeCustomerDetailModal = function() {
  const modal = document.getElementById('customerDetailModal');
  if (modal) modal.classList.add('hidden');
};

/* Print Confirmation via dedicated popup window (Matches image format 100% on Single A4 page) */
window.printCustomerConfirmation = function() {
  const content = document.getElementById('customerDetailContent');
  if (!content) return;

  const innerHtml = content.innerHTML;

  const printWin = window.open('', '_blank', 'width=840,height=1180,scrollbars=yes');
  if (!printWin) {
    alert('팝업이 차단되었습니다. 브라우저 팝업 차단을 해제해 주세요.');
    return;
  }

  printWin.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>정기세차 회원가입서 – 세차플랜</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 12mm 14mm 10mm 14mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%; font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
    font-size: 8.5pt; color: #0F172A; background: #FFF; line-height: 1.35;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .registration-form-doc {
    width: 100%; max-width: 100%; margin: 0; padding: 0;
    background: #FFF; border: none; box-shadow: none;
  }
  .reg-doc-header { text-align: center; margin-bottom: 8px; }
  .reg-brand-logo { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
  .reg-brand-name { font-size: 11pt; font-weight: 900; color: #0284C7; letter-spacing: -0.5px; }
  .reg-doc-title { font-size: 19pt; font-weight: 900; color: #0F172A; letter-spacing: 2px; margin: 4px 0 6px 0; }
  .reg-striped-divider {
    background: repeating-linear-gradient(45deg, #0284C7, #0284C7 5px, #BAE6FD 5px, #BAE6FD 10px);
    height: 6px; width: 100%; border-radius: 2px; margin-bottom: 8px;
  }

  .reg-info-table {
    width: 100%; border-collapse: collapse; border: 1.5px solid #0284C7; margin-bottom: 6px;
  }
  .reg-info-table th, .reg-info-table td {
    border: 1px solid #7DD3FC; padding: 4.5px 7px; font-size: 8.2pt; line-height: 1.3; vertical-align: middle;
  }
  .reg-info-table th {
    background-color: #E0F2FE !important; color: #0369A1; font-weight: 800; text-align: center; white-space: nowrap;
  }
  .reg-info-table td { background-color: #FFFFFF !important; color: #0F172A; font-weight: 600; }
  .reg-info-table .check-box { font-weight: 800; font-size: 9pt; color: #0284C7; }
  .reg-info-table .payment-opts { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
  .reg-info-table .payment-opt-item { display: inline-flex; align-items: center; gap: 2px; white-space: nowrap; }
  .reg-info-table .sub-hint { font-size: 7.2pt; color: #64748B; font-weight: normal; }

  .reg-notes-box {
    border: 1.5px solid #0284C7; border-radius: 2px; margin-bottom: 8px; overflow: hidden; page-break-inside: avoid;
  }
  .reg-notes-header {
    background-color: #E0F2FE !important; color: #0369A1; font-weight: 800; font-size: 8.2pt; text-align: center; padding: 3px; border-bottom: 1px solid #7DD3FC;
  }
  .reg-notes-body { padding: 5px 8px; background: #FFFFFF; font-size: 7.6pt; line-height: 1.45; }
  .note-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 1.5px; }
  .note-row:last-child { margin-bottom: 0; }
  .note-lbl { font-weight: 700; color: #0F172A; min-width: 52px; }
  .note-opts { display: flex; gap: 10px; flex-wrap: wrap; color: #334155; }
  .note-opts span { display: inline-flex; align-items: center; gap: 2px; }

  .reg-policy-section { margin-bottom: 10px; page-break-inside: avoid; }
  .reg-section-title { font-size: 8.8pt; font-weight: 800; color: #0284C7; display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
  .reg-section-title .sub { color: #0284C7; font-size: 7.8pt; font-weight: 700; }
  .reg-policy-list { list-style: none; padding-left: 0; margin: 0; font-size: 7.4pt; line-height: 1.35; color: #334155; }
  .reg-policy-list li { margin-bottom: 2px; }
  .reg-policy-list strong { font-weight: 800; color: #0F172A; }
  .reg-policy-list.notice-list li { color: #1E293B; }

  .reg-footer-consent { text-align: center; margin-top: 10px; padding-top: 6px; page-break-inside: avoid; }
  .consent-statement { font-size: 9.2pt; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
  .consent-date { font-size: 8.5pt; font-weight: 700; color: #0F172A; letter-spacing: 2px; margin-bottom: 8px; }
  .signature-line-wrap { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding-right: 14px; }
  .applicant-label { font-size: 9pt; font-weight: 700; color: #0F172A; }
  .signature-stamp-box { min-width: 90px; height: 38px; display: flex; align-items: center; justify-content: center; }
  .signature-stamp-box img { max-height: 36px; max-width: 100px; object-fit: contain; }
  .signature-stamp-box .stamp-text { font-size: 8pt; color: #94A3B8; }
</style>
</head>
<body>
  ${innerHtml}
</body>
</html>`);

  printWin.document.close();
  printWin.onload = function() {
    setTimeout(() => {
      printWin.focus();
      printWin.print();
    }, 400);
  };
  setTimeout(() => {
    try { printWin.focus(); printWin.print(); } catch(e) {}
  }, 800);
};

// Global Admin Action Functions
window.updateStatus = function(id, newStatus) {
  const data = getSubmissions();
  const target = data.find(d => d.id === id);
  if (target) {
    target.status = newStatus;
    saveSubmissions(data);
    renderAdminTable(document.querySelector('.filter-btn.active')?.dataset.filter || 'ALL');
    showToast('상태 변경 완료', `${target.name} 고객님의 신청이 ${newStatus === 'APPROVED' ? '승인 완료' : '반려'} 처리되었습니다.`);
  }
};

window.deleteSubmission = function(id) {
  if (!confirm('해당 고객 신청 정보를 정말 삭제하시겠습니까?')) return;
  let data = getSubmissions();
  data = data.filter(d => d.id !== id);
  saveSubmissions(data);
  renderAdminTable(document.querySelector('.filter-btn.active')?.dataset.filter || 'ALL');
  showToast('삭제 완료', '고객 신청 정보가 삭제되었습니다.');
};

// Export to CSV
function exportToCsv() {
  const data = getSubmissions();
  if (data.length === 0) {
    alert('다운로드할 고객 가입 신청 데이터가 없습니다.');
    return;
  }

  let csvContent = "\uFEFF";
  csvContent += "신청ID,신청일시,고객성명,연락처,이메일,세차희망주소,차종및차량번호,이용플랜,희망요일,결제방식,승인상태\n";

  data.forEach(item => {
    const row = [
      item.id,
      item.createdAt,
      `"${item.name}"`,
      `"${item.phone}"`,
      `"${item.email}"`,
      `"${item.region}"`,
      `"${item.car}"`,
      `"${item.experience}"`,
      `"${item.days || ''}"`,
      `"${item.paymentMethod || item.bank || '카드'}"`,
      item.status
    ].join(",");
    csvContent += row + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `carwashplan_customers_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   6. Helper Toast Utilities
   ========================================================================== */
function showToast(title, message) {
  const toast = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMsg');

  if (!toast) return;

  toastTitle.textContent = title;
  toastMsg.textContent = message;

  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&right;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   7. Cloud Integration & Real-time Notification Subsystem
   ========================================================================== */
const INTEGRATION_CONFIG_KEY = 'carwashplan_integration_config';

function getIntegrationConfig() {
  const defaults = {
    googleSheetUrl: 'https://script.google.com/macros/s/AKfycbznhZPBaaYzpe_lcbct6-lThNhyGjrtkqQzv0yeqPtxqoTUpt8ae4bm-EHMtt7Wbyo/exec',
    telegramToken: '',
    telegramChatId: ''
  };
  try {
    const data = localStorage.getItem(INTEGRATION_CONFIG_KEY);
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  } catch (e) {
    return defaults;
  }
}

function saveIntegrationConfig(cfg) {
  localStorage.setItem(INTEGRATION_CONFIG_KEY, JSON.stringify(cfg));
}

/* Real-time Bidirectional Cloud Data Sync with Dual Loader (Fetch + JSONP Fallback) */
function loadCloudDataViaJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'carwash_cloud_cb_' + Math.floor(Math.random() * 1000000);
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP Request Timeout'));
    }, 10000);

    function cleanup() {
      if (timeout) clearTimeout(timeout);
      delete window[callbackName];
      const script = document.getElementById(callbackName);
      if (script && script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = function(data) {
      cleanup();
      resolve(data);
    };

    const script = document.createElement('script');
    script.id = callbackName;
    const delimiter = url.includes('?') ? '&' : '?';
    script.src = `${url}${delimiter}callback=${callbackName}&_t=${Date.now()}`;
    script.onerror = function(e) {
      cleanup();
      reject(new Error('JSONP Script Load Error'));
    };

    document.body.appendChild(script);
  });
}

async function fetchSubmissionsFromCloud(isManual = false) {
  const config = getIntegrationConfig();
  const syncIcon = document.getElementById('syncCloudIcon');
  const statusText = document.getElementById('cloudSyncStatusText');
  const timeText = document.getElementById('lastSyncTimeText');

  if (!config.googleSheetUrl || !config.googleSheetUrl.trim()) {
    if (statusText) statusText.textContent = '구글 시트 연동 URL 미설정 (연동설정 탭 확인)';
    if (isManual) {
      alert('구글 시트 연동 URL이 설정되어 있지 않습니다. 관리자 [연동 설정] 탭에서 구글 시트 웹 앱 URL을 먼저 등록해 주세요.');
    }
    return;
  }

  if (syncIcon) syncIcon.classList.add('rotating');
  if (statusText) statusText.textContent = '구글 시트와 실시간 데이터 동기화 중...';
  if (navigator.vibrate && isManual) navigator.vibrate(40);

  let json = null;
  const targetUrl = config.googleSheetUrl.trim();

  // 1. Try standard Fetch with no-store cache first
  try {
    const res = await fetch(`${targetUrl}${targetUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`, {
      cache: 'no-store'
    });
    json = await res.json();
  } catch (fetchErr) {
    console.warn('⚠️ 표준 fetch 실패, JSONP 폴백으로 재시도합니다:', fetchErr);
    // 2. Fallback to JSONP (100% Cross-Origin Compatibility across all Mobile/Desktop browsers)
    try {
      json = await loadCloudDataViaJsonp(targetUrl);
    } catch (jsonpErr) {
      console.error('❌ JSONP 폴백도 실패했습니다:', jsonpErr);
    }
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  if (json && json.result === 'success' && Array.isArray(json.data)) {
    const cloudList = json.data;
    const localList = getSubmissions();

    // Merge Cloud List with Local List by Unique ID
    const map = new Map();

    // 1. Add local records first
    localList.forEach(item => {
      if (item.id) map.set(item.id, item);
    });

    // 2. Overwrite or Add cloud records (Cloud is ground truth across all devices)
    cloudList.forEach(item => {
      if (item.id) {
        const existing = map.get(item.id);
        if (existing) {
          map.set(item.id, {
            ...item,
            signature: item.signature || existing.signature || '',
            status: existing.status || item.status || 'PENDING'
          });
        } else {
          map.set(item.id, item);
        }
      }
    });

    const mergedList = Array.from(map.values());
    // Sort by creation date desc
    mergedList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    saveSubmissions(mergedList);
    renderAdminTable(document.querySelector('.filter-btn.active')?.dataset.filter || 'ALL');

    if (statusText) statusText.textContent = `구글 시트 연동 정상 (${cloudList.length}건 동기화됨)`;
    if (timeText) timeText.textContent = `최근 동기화: ${timeStr}`;

    if (isManual) {
      showToast('클라우드 동기화 완료', `구글 시트로부터 총 ${cloudList.length}건의 전체 고객 신청 데이터를 성공적으로 불러왔습니다.`);
    }
  } else {
    if (statusText) statusText.textContent = '구글 시트 연동 활성화 (최신 상태)';
    if (timeText) timeText.textContent = `동기화 확인: ${timeStr}`;
    if (isManual) {
      showToast('동기화 완료', '구글 시트와 정상 연결되었으며 최신 데이터 상태입니다.');
    }
  }

  if (syncIcon) syncIcon.classList.remove('rotating');
}
window.fetchSubmissionsFromCloud = fetchSubmissionsFromCloud;

async function syncSubmissionToCloud(record) {
  const config = getIntegrationConfig();

  // Ensure full car info including color is included in transmission
  const payload = {
    ...record,
    model: record.model || '',
    plate: record.plate || '',
    color: record.color || '',
    car: record.car || `${record.model || ''} (${record.plate || ''}) [색상: ${record.color || ''}]`
  };

  // 1. Google Spreadsheet Webhook Sync
  if (config.googleSheetUrl && config.googleSheetUrl.trim()) {
    try {
      await fetch(config.googleSheetUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('✅ [구글 시트] 고객 데이터(색상 포함) 실시간 전송 완료:', record.id);
    } catch (err) {
      console.error('❌ [구글 시트] 전송 오류:', err);
    }
  }

  // 2. Telegram Smartphone Push Notification
  if (config.telegramToken && config.telegramChatId && config.telegramToken.trim() && config.telegramChatId.trim()) {
    try {
      const msg = `🔔 [세차 플랜] 신규 고객 가입 신청 접수!\n\n` +
        `👤 고객명: ${record.name}\n` +
        `📞 연락처: ${record.phone}\n` +
        `📧 이메일: ${record.email}\n` +
        `📍 세차장소: ${record.region}\n` +
        `🚗 차종(색상): ${record.car}\n` +
        `💎 신청플랜: ${record.experience}\n` +
        `📅 희망요일: ${record.days || '미선택'}\n` +
        `💳 결제방식: ${record.paymentMethod}\n` +
        `📝 차량특이사항: ${record.specialNotes || '없음'}\n` +
        `⏰ 신청일시: ${record.createdAt}`;

      await fetch(`https://api.telegram.org/bot${config.telegramToken.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId.trim(),
          text: msg
        })
      });
      console.log('✅ [텔레그램] 스마트폰 알림 발송 완료');
    } catch (err) {
      console.error('❌ [텔레그램] 알림 발송 오류:', err);
    }
  }
}

function initIntegrationSettings() {
  const cfgGoogleSheetUrl = document.getElementById('cfgGoogleSheetUrl');
  const cfgTelegramToken = document.getElementById('cfgTelegramToken');
  const cfgTelegramChatId = document.getElementById('cfgTelegramChatId');
  const saveBtn = document.getElementById('saveIntegrationConfigBtn');
  const testSheetBtn = document.getElementById('testGoogleSheetBtn');
  const testTgBtn = document.getElementById('testTelegramBtn');
  const sheetStatus = document.getElementById('googleSheetTestStatus');
  const tgStatus = document.getElementById('telegramTestStatus');

  const config = getIntegrationConfig();
  if (cfgGoogleSheetUrl) cfgGoogleSheetUrl.value = config.googleSheetUrl || '';
  if (cfgTelegramToken) cfgTelegramToken.value = config.telegramToken || '';
  if (cfgTelegramChatId) cfgTelegramChatId.value = config.telegramChatId || '';

  const cfgNewAdminPw = document.getElementById('cfgNewAdminPw');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const newCfg = {
        googleSheetUrl: cfgGoogleSheetUrl ? cfgGoogleSheetUrl.value.trim() : '',
        telegramToken: cfgTelegramToken ? cfgTelegramToken.value.trim() : '',
        telegramChatId: cfgTelegramChatId ? cfgTelegramChatId.value.trim() : ''
      };
      saveIntegrationConfig(newCfg);

      let pwChanged = false;
      if (cfgNewAdminPw && cfgNewAdminPw.value.trim().length >= 4) {
        localStorage.setItem('carwashplan_admin_password', cfgNewAdminPw.value.trim());
        cfgNewAdminPw.value = '';
        pwChanged = true;
      }

      showToast('설정 저장 완료', pwChanged ? '연동 정보 및 관리자 비밀번호가 안전하게 변경되었습니다.' : '구글 시트 및 텔레그램 연동 정보가 안전하게 저장되었습니다.');
    });
  }

  if (testSheetBtn) {
    testSheetBtn.addEventListener('click', async () => {
      const url = cfgGoogleSheetUrl ? cfgGoogleSheetUrl.value.trim() : '';
      if (!url) {
        alert('구글 Apps Script 웹 앱 URL을 먼저 입력해 주세요.');
        return;
      }
      if (sheetStatus) sheetStatus.textContent = '테스트 전송 중...';
      try {
        const testSample = {
          id: 'TEST-' + Math.floor(Math.random() * 9000 + 1000),
          createdAt: formatNowDate(),
          name: '홍길동(연동테스트)',
          phone: '010-1234-5678',
          email: 'test@carwashplan.com',
          region: '서울시 강남구 테헤란로 100 지하 2층',
          car: '테스트차량 (제네시스 G80)',
          experience: '퍼펙트 (월 4회)',
          days: '월요일',
          paymentMethod: '카드',
          specialNotes: '구글 시트 연동 테스트 샘플 데이터입니다.',
          status: 'PENDING'
        };
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testSample)
        });
        if (sheetStatus) sheetStatus.textContent = '✅ 테스트 데이터 전송 완료! (구글 시트를 확인하세요)';
      } catch (e) {
        if (sheetStatus) sheetStatus.textContent = '❌ 전송 실패: ' + e.message;
      }
    });
  }

  if (testTgBtn) {
    testTgBtn.addEventListener('click', async () => {
      const token = cfgTelegramToken ? cfgTelegramToken.value.trim() : '';
      const chatId = cfgTelegramChatId ? cfgTelegramChatId.value.trim() : '';
      if (!token || !chatId) {
        alert('텔레그램 봇 토큰과 채팅 ID를 모두 입력해 주세요.');
        return;
      }
      if (tgStatus) tgStatus.textContent = '테스트 알림 발송 중...';
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🔔 [세차 플랜 연동 테스트]\n축하합니다! 스마트폰 실시간 알림 연동이 성공적으로 설정되었습니다.`
          })
        });
        const json = await res.json();
        if (json.ok) {
          if (tgStatus) tgStatus.textContent = '✅ 텔레그램 메시지 발송 성공!';
        } else {
          if (tgStatus) tgStatus.textContent = '❌ 발송 실패: ' + (json.description || '토큰/ID 확인 필요');
        }
      } catch (e) {
        if (tgStatus) tgStatus.textContent = '❌ 오류 발생: ' + e.message;
      }
    });
  }
}

