/**
 * ДИВЕЕВСКИЙ ПАЛОМНИК — INTERACTIVE FRONTEND ENGINE (2026)
 * Features:
 * - Dynamic Room Rendering + Capacity Filtering
 * - Interactive Lightbox (<dialog>) with Keyboard & Touch Swipe Support
 * - Scroll-spy Navigation & Glass Header Controller
 * - IntersectionObserver Staggered Reveal Animations
 * - Smooth Scroll Parallax on Architectural Photography
 */

const ROOMS_DATA = [
  {
    id: "room-1",
    title: "Двухместная комната «Утренняя»",
    capacity: 2,
    capacityLabel: "До 2 гостей · 1 этаж",
    pricePerNight: 3200,
    description: "Светлая тихая комната с окнами во внутренний двор. Двуспальная кровать с ортопедическим матрасом и собственный санузел с душевой кабиной.",
    amenities: ["Свой санузел с душем", "Двуспальная кровать 160×200", "Свежее бельё и полотенца", "Плотные шторы блэкаут", "Wi-Fi", "Фен и тапочки"],
    images: [
      { src: "../img/room1-1.jpg", fallback: "../img/room2-1.jpg", caption: "Двухместная комната «Утренняя» — вид на спальное место" },
      { src: "../img/room2-1.jpg", fallback: "../img/room2-1.jpg", caption: "Интерьер и отделка натуральным деревом" }
    ]
  },
  {
    id: "room-2",
    title: "Двухместная комната «Заречная»",
    capacity: 2,
    capacityLabel: "До 2 гостей · 1 этаж",
    pricePerNight: 3200,
    description: "Уютная комната для двоих паломников или супружеской пары. Теплый пол в ванной комнате, рабочее место и продуманное мягкое освещение.",
    amenities: ["Свой санузел с душем", "Две кровати или одна двуспальная", "Москитные сетки", "Обогреватель", "Wi-Fi", "Чайная станция на этаже"],
    images: [
      { src: "../img/room2-1.jpg", fallback: "../img/room2-1.jpg", caption: "Комната «Заречная» — тёплый деревянный интерьер" },
      { src: "../img/tower.jpg", fallback: "../img/tower.jpg", caption: "Вид на колокольню по дороге от дома" }
    ]
  },
  {
    id: "room-3",
    title: "Семейная комната «Под сводом»",
    capacity: 4,
    capacityLabel: "До 4 гостей · 2 этаж (мансарда)",
    pricePerNight: 4800,
    description: "Просторная четырёхместная комната под уютным скатом крыши: широкая двуспальная кровать и удобный раскладной диван для детей или друзей.",
    amenities: ["Свой санузел с душем", "Кровать + раскладной диван", "Идеально для семьи с детьми", "Плотные шторы", "Wi-Fi", "Свежее бельё и тапочки"],
    images: [
      { src: "../img/room2-1.jpg", fallback: "../img/room2-1.jpg", caption: "Четырёхместная комната под скатом крыши: кровать и диван" },
      { src: "../img/pond.jpg", fallback: "../img/pond.jpg", caption: "Набережная пруда в 5 минутах от дома" }
    ]
  },
  {
    id: "room-4",
    title: "Большая семейная комната «Серафимовская»",
    capacity: 4,
    capacityLabel: "До 4 гостей · 2 этаж",
    pricePerNight: 5000,
    description: "Самая просторная комната дома для семейной поездки на несколько дней. Много света, тишина после вечерней службы и собственная ванная комната.",
    amenities: ["Свой санузел с душем", "До 4 спальных мест", "Шкаф для одежды", "Гладильная доска на этаже", "Wi-Fi", "Бесплатная парковка"],
    images: [
      { src: "../img/room2-1.jpg", fallback: "../img/room2-1.jpg", caption: "Просторная семейная комната на 4 гостей" },
      { src: "../img/evening.jpg", fallback: "../img/evening.jpg", caption: "Вечерняя тишина в Дивеево" }
    ]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  initHeaderAndScrollProgress();
  initMobileDrawer();
  initScrollReveal();
  initRoomsSection();
  initLightbox();
  initQuickBookingForm();
  initSubtleParallax();
  initCopyAddress();
});

/* 1. Header Scroll State, Scroll Progress & Floating CTA */
function initHeaderAndScrollProgress() {
  const header = document.querySelector(".site-header");
  const progressBar = document.querySelector(".scroll-progress");
  const floatingCta = document.querySelector(".floating-book-cta");
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".main-nav a");

  const onScroll = () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 48);
    }

    if (floatingCta) {
      floatingCta.classList.toggle("is-visible", scrollY > 620);
    }

    // Active section highlight
    let currentSectionId = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 160;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = sec.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === `#${currentSectionId}`);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* 2. Mobile Navigation Drawer */
function initMobileDrawer() {
  const toggleBtn = document.querySelector(".menu-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  const links = document.querySelectorAll(".mobile-drawer a");

  if (!toggleBtn || !drawer) return;

  const toggleMenu = (forceState) => {
    const isOpen = typeof forceState === "boolean" ? forceState : !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", isOpen);
    drawer.hidden = !isOpen;
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
  };

  toggleBtn.addEventListener("click", () => toggleMenu());
  links.forEach((link) => link.addEventListener("click", () => toggleMenu(false)));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      toggleMenu(false);
    }
  });
}

/* 3. IntersectionObserver Staggered Reveal */
function initScrollReveal() {
  const revealElements = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* 4. Dynamic Rooms Grid & Filter Tabs */
function initRoomsSection() {
  const grid = document.getElementById("rooms-grid-container");
  const filterBtns = document.querySelectorAll(".filter-btn");
  if (!grid) return;

  const formatPrice = (num) => num.toLocaleString("ru-RU") + " ₽";

  const renderRooms = (filterValue = "all") => {
    const filtered = ROOMS_DATA.filter((r) =>
      filterValue === "all" ? true : String(r.capacity) === String(filterValue)
    );

    grid.innerHTML = filtered
      .map(
        (room, idx) => `
      <article class="room-card is-revealed" style="--reveal-delay: ${idx * 90}ms" data-room-id="${room.id}">
        <div class="room-card-media" data-open-room-gallery="${room.id}">
          <span class="room-capacity-pill">${room.capacityLabel}</span>
          <img
            src="${room.images[0].src}"
            onerror="this.onerror=null;this.src='${room.images[0].fallback}';"
            alt="${room.title}"
            width="1200"
            height="900"
            loading="lazy"
            class="photo-enhanced"
          >
          <button type="button" class="room-gallery-btn" aria-label="Смотреть фото комнаты ${room.title}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            Фото (${room.images.length})
          </button>
        </div>
        <div class="room-card-body">
          <h3 class="room-card-title">${room.title}</h3>
          <p class="room-card-desc">${room.description}</p>
          <ul class="room-amenities">
            ${room.amenities.map((item) => `<li>${item}</li>`).join("")}
          </ul>
          <div class="room-card-footer">
            <div class="room-price">
              <strong>${formatPrice(room.pricePerNight)}</strong>
              <span>за всю комнату / ночь</span>
            </div>
            <a href="booking.html?room=${encodeURIComponent(room.id)}&guests=${room.capacity}" class="btn btn-primary">
              Выбрать даты
            </a>
          </div>
        </div>
      </article>
    `
      )
      .join("");
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderRooms(btn.dataset.filter);
    });
  });

  renderRooms("all");
}

/* 5. Interactive Lightbox (<dialog>) for Room & Diveevo Galleries */
function initLightbox() {
  const dialog = document.getElementById("photo-lightbox");
  if (!dialog) return;

  const imgEl = dialog.querySelector("#lightbox-img");
  const captionEl = dialog.querySelector("#lightbox-caption");
  const prevBtn = dialog.querySelector("#lightbox-prev");
  const nextBtn = dialog.querySelector("#lightbox-next");
  const closeBtn = dialog.querySelector("#lightbox-close");

  let currentGallery = [];
  let currentIndex = 0;

  const updateSlide = () => {
    if (!currentGallery.length) return;
    const item = currentGallery[currentIndex];
    imgEl.src = item.src;
    imgEl.onerror = () => {
      if (item.fallback) imgEl.src = item.fallback;
    };
    imgEl.alt = item.caption || "Фотография";
    captionEl.textContent = `${item.caption || ""} (${currentIndex + 1} / ${currentGallery.length})`;
  };

  const openLightbox = (items, startIndex = 0) => {
    currentGallery = items;
    currentIndex = startIndex;
    updateSlide();
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "true");
    }
  };

  // Delegate clicks on Room cards
  document.addEventListener("click", (e) => {
    const roomTrigger = e.target.closest("[data-open-room-gallery]");
    if (roomTrigger) {
      const roomId = roomTrigger.getAttribute("data-open-room-gallery");
      const room = ROOMS_DATA.find((r) => r.id === roomId);
      if (room) openLightbox(room.images, 0);
      return;
    }

    const mosaicItem = e.target.closest(".mosaic-item");
    if (mosaicItem) {
      const allMosaic = Array.from(document.querySelectorAll(".mosaic-item"));
      const items = allMosaic.map((fig) => {
        const image = fig.querySelector("img");
        const cap = fig.querySelector("figcaption");
        return {
          src: image ? image.getAttribute("src") : "",
          caption: cap ? cap.textContent.trim() : image?.getAttribute("alt") || ""
        };
      });
      const idx = allMosaic.indexOf(mosaicItem);
      openLightbox(items, Math.max(0, idx));
    }
  });

  prevBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updateSlide();
  });

  nextBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updateSlide();
  });

  closeBtn?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  document.addEventListener("keydown", (e) => {
    if (!dialog.open) return;
    if (e.key === "ArrowLeft") prevBtn?.click();
    if (e.key === "ArrowRight") nextBtn?.click();
  });
}

/* 6. Hero Quick Booking Bar -> Redirects to booking.html with URL params */
function initQuickBookingForm() {
  const form = document.getElementById("hero-quick-book-form");
  if (!form) return;

  const checkinInput = form.querySelector("#qb-checkin");
  const checkoutInput = form.querySelector("#qb-checkout");

  // Set default dates (tomorrow + 2 nights)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(today.getDate() + 3);

  const toISO = (d) => d.toISOString().split("T")[0];
  if (checkinInput && !checkinInput.value) checkinInput.value = toISO(tomorrow);
  if (checkoutInput && !checkoutInput.value) checkoutInput.value = toISO(afterTomorrow);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const checkin = checkinInput?.value || "";
    const checkout = checkoutInput?.value || "";
    const guests = form.querySelector("#qb-guests")?.value || "2";
    const params = new URLSearchParams({ checkin, checkout, guests });
    window.location.href = `booking.html?${params.toString()}`;
  });
}

/* 7. Gentle Parallax on Architectural Collage */
function initSubtleParallax() {
  const parallaxItems = document.querySelectorAll("[data-parallax]");
  if (!parallaxItems.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.addEventListener(
    "scroll",
    () => {
      const winH = window.innerHeight;
      parallaxItems.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          const speed = parseFloat(el.dataset.parallax || "0.08");
          const offset = (winH / 2 - (rect.top + rect.height / 2)) * speed;
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        }
      });
    },
    { passive: true }
  );
}

/* 8. One-Click Copy Address Button */
function initCopyAddress() {
  const copyBtn = document.getElementById("copy-address-btn");
  if (!copyBtn) return;

  copyBtn.addEventListener("click", async () => {
    const address = "Нижегородская область, село Дивеево, ул. Заречная, 399";
    try {
      await navigator.clipboard.writeText(address);
      const original = copyBtn.textContent;
      copyBtn.textContent = "Адрес скопирован ✓";
      setTimeout(() => {
        copyBtn.textContent = original;
      }, 2200);
    } catch {
      // Fallback
    }
  });
}

