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
  initFormValidationAndSubmit();
  initAdminManager();
  initEditGalleryModalLogic();
  initIntegrationSettings();

  console.log('CARWASH PLAN Customer Landing Initialized Successfully.');
});

/* ==========================================================================
   1. Initial Sample Seed Data for Customer Admin Confirmation Review
   ========================================================================== */
const STORAGE_KEY = 'carwashplan_customer_submissions';

function initSeedData() {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    const sampleCustomers = [
      {
        id: 'CUST-2026-001',
        createdAt: '2026-08-29 14:30',
        name: '김지현',
        phone: '010-3847-1920',
        email: 'jihyun.kim@naver.com',
        region: '서울 강남구 테헤란로 123 아파트 지하 2층',
        car: '123가 4567 (제네시스 G80)',
        experience: '월 4회 정기세차 (추천)',
        days: '월요일, 목요일',
        paymentMethod: '카드',
        status: 'PENDING'
      },
      {
        id: 'CUST-2026-002',
        createdAt: '2026-08-28 11:15',
        name: '이동욱',
        phone: '010-8291-5531',
        email: 'dw.lee@gmail.com',
        region: '경기 성남시 분당구 수내동 레미안아파트 P-12',
        car: '56나 7890 (카니발 SUV)',
        experience: '월 2회 정기세차',
        days: '화요일',
        paymentMethod: '자동이체',
        status: 'APPROVED'
      },
      {
        id: 'CUST-2026-003',
        createdAt: '2026-08-27 16:45',
        name: '최수진',
        phone: '010-4491-8820',
        email: 'sujin.choi@daum.net',
        region: '서울 마포구 상암동 456 빌딩 주차장',
        car: '34다 1234 (아반떼)',
        experience: '1회성 단건 출장세차',
        days: '토요일',
        paymentMethod: '계좌이체',
        status: 'APPROVED'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCustomers));
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
const GALLERY_STORAGE_KEY = 'carwashplan_gallery_photos';

const DEFAULT_GALLERY_ITEMS = [
  { id: 'GAL-1', src: 'assets/car_wash_hero.jpg', title: '1. 프리미엄 워터리스 폼 세차', desc: '도장면 손상 없는 고성능 워터리스 폼 케미컬 세차 시공' },
  { id: 'GAL-2', src: 'assets/car_detailing_process.jpg', title: '2. 파란색 극세사 타월 닦기', desc: '특수 프리미엄 파란색 극세사 타월로 차량 표면을 부드럽게 버핑 정밀 닦기' },
  { id: 'GAL-3', src: 'assets/car_interior_clean.jpg', title: '3. 실내 항균 탈취 딥케어', desc: '가죽 시트, 플로어 매트 세균 및 냄새 99.9% 항균 소독 케어' },
  { id: 'GAL-4', src: 'assets/car_wheel_shine.jpg', title: '4. 휠 코팅 & 타이어 드레싱', desc: '신차급 휠 광택 보존 및 타이어 수명 연장 보호막 도포' },
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

    // 5. Car Details Check
    const carVal = document.getElementById('carOwnership').value.trim();
    if (!carVal) {
      setError('carOwnership');
      isValid = false;
    }

    // 5.1 Car Color Check
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

    if (!isValid) {
      showToast('입력 확인 필요', '필수 입력 항목 및 약관 동의를 다시 확인해 주세요.');
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

    // Build New Customer Registration Record
    const newRecord = {
      id: 'CUST-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900 + 100)),
      createdAt: formatNowDate(),
      name: nameVal,
      phone: phoneVal,
      email: emailVal,
      region: regionVal,
      car: carVal + (colorVal ? ` (${colorVal})` : ''),
      color: colorVal,
      experience: planVal + (extraOpts ? ` [옵션: ${extraOpts}]` : ''),
      days: selectedDaysStr,
      specialNotes: specialNotesList,
      paymentMethod: paymentMethodVal,
      status: 'PENDING'
    };

    // Save to LocalStorage
    const currentList = getSubmissions();
    currentList.unshift(newRecord);
    saveSubmissions(currentList);

    // Sync to Google Sheets & Telegram Notification in Real-time
    syncSubmissionToCloud(newRecord);

    // Form Reset & Feedback
    form.reset();
    if (checkAll) checkAll.checked = false;
    showToast('신청 완료!', `${nameVal} 고객님의 신청이 완료되었습니다. 담당 매니저가 곧 연락드리고 결제링크를 보내드립니다.`);

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

  const openModal = () => {
    if (isAdminAuthed()) {
      renderAdminTable(currentFilter);
      renderAdminGalleryList();
      adminModal.classList.remove('hidden');
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
        <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">
          제출된 고객 가입 신청 데이터가 없습니다.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredData.map(item => {
    let statusTag = '';
    if (item.status === 'PENDING') {
      statusTag = `<span class="status-tag pending"><i data-lucide="clock" style="width:12px;height:12px;"></i> 승인 대기</span>`;
    } else if (item.status === 'APPROVED') {
      statusTag = `<span class="status-tag approved"><i data-lucide="check" style="width:12px;height:12px;"></i> 승인 완료</span>`;
    } else {
      statusTag = `<span class="status-tag rejected"><i data-lucide="x" style="width:12px;height:12px;"></i> 반려</span>`;
    }

    return `
      <tr>
        <td>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">${item.createdAt}</span>
          <span style="font-size: 0.72rem; color: var(--accent);">${item.id}</span>
        </td>
        <td>
          <div class="member-name">${escapeHtml(item.name)}</div>
          <div class="member-phone">${escapeHtml(item.phone)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.email)}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(item.region)}</div>
          <div style="font-size: 0.75rem; color: var(--accent);">${escapeHtml(item.car)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(item.experience)}${item.days ? ` (${escapeHtml(item.days)})` : ''}</div>
        </td>
        <td>
          <div><span class="bank-badge" style="background:var(--primary-light); color:var(--accent); font-weight:800;">${escapeHtml(item.paymentMethod || item.bank || '카드')}</span></div>
        </td>
        <td>${statusTag}</td>
        <td>
          <div class="table-actions">
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

async function syncSubmissionToCloud(record) {
  const config = getIntegrationConfig();

  // 1. Google Spreadsheet Webhook Sync
  if (config.googleSheetUrl && config.googleSheetUrl.trim()) {
    try {
      await fetch(config.googleSheetUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      console.log('✅ [구글 시트] 고객 데이터 실시간 전송 완료:', record.id);
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

