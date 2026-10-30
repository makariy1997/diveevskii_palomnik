(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.btn').forEach(button => {
      button.addEventListener('pointermove', event => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width - .5) * 5}px`);
        button.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height - .5) * 4}px`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--mx', '0px');
        button.style.setProperty('--my', '0px');
      });
    });
  }
  const top = $('[data-top]');
  const hero = $('.hero');
  const floatBook = $('[data-float]');
  const burger = $('[data-burger]');
  const menu = $('[data-menu]');

  const setMenu = open => {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open;
    top?.classList.toggle('is-solid', open || scrollY > 40);
  };

  burger?.addEventListener('click', () => setMenu(menu.hidden));
  $$('a[href^="#"]', menu || document).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {
    if (menu && !menu.hidden && !event.target.closest('.top')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu && !menu.hidden) setMenu(false);
  });

  const updateHeader = () => top?.classList.toggle('is-solid', scrollY > 40 || Boolean(menu && !menu.hidden));
  addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const navLinks = $$('.nav a[href^="#"]');
  const navSections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && navSections.length) {
    const activeSections = new Map();
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => activeSections.set(entry.target, entry.isIntersecting));
      const visible = navSections.filter(section => activeSections.get(section));
      const active = visible.at(-1) || navSections.find(section => section.getBoundingClientRect().top > 0);
      navLinks.forEach(link => {
        if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-28% 0px -58% 0px', threshold: 0 });
    navSections.forEach(section => navObserver.observe(section));
  }

  if (floatBook && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => floatBook.classList.toggle('is-on', !entry.isIntersecting), { threshold: 0.08 }).observe(hero);
  }

  const revealNodes = $$('h2, .facts li, .steps__list li, .kitchen__list > div, .rules__grid > div, .place__cols > div, .room, .section-head p');
  revealNodes.forEach((node, index) => {
    node.dataset.reveal = '';
    node.style.setProperty('--delay', `${Math.min(index % 4, 3) * 65}ms`);
  });
  let revealObserver = null;
  if (!reduced && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealNodes.forEach(node => revealObserver.observe(node));
  } else revealNodes.forEach(node => node.classList.add('is-visible'));

  const lqipStems = new Set(['hero', 'hero-1600', 'room2-1', 'room1-1', 'room3-1', 'room4-1', 'tower', 'pond', 'place-1', 'place-3', 'place-4', 'place-5', 'place-6', 'evening']);
  const prepareImage = image => {
    const source = image.getAttribute('src') || '';
    const filename = source.split('/').pop() || '';
    const stem = filename.replace(/\.[^.]+$/, '');
    const frame = image.closest('picture') || image.parentElement;
    if (frame && lqipStems.has(stem)) {
      frame.classList.add('has-lqip');
      frame.style.setProperty('--lqip', `url("img/optimized/${stem}-lqip.webp")`);
    }
    const loaded = () => image.classList.add('is-loaded');
    if (image.complete && image.naturalWidth) loaded();
    else {
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', loaded, { once: true });
    }
  };
  $$('img').forEach(prepareImage);

  const parallaxItems = reduced ? [] : $$('[data-parallax]');
  let parallaxFrame = 0;
  const updateParallax = () => {
    parallaxFrame = 0;
    parallaxItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > innerHeight + 80) return;
      const speed = Number(item.dataset.parallax) || .08;
      const offset = (rect.top + rect.height / 2 - innerHeight / 2) * -speed;
      item.style.setProperty('--parallax-offset', `${offset.toFixed(1)}px`);
    });
  };
  const requestParallax = () => {
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateParallax);
  };
  if (parallaxItems.length) {
    addEventListener('scroll', requestParallax, { passive: true });
    addEventListener('resize', requestParallax, { passive: true });
    requestParallax();
  }

  const searchForm = $('[data-search]');
  if (searchForm) {
    const from = $('[data-from]', searchForm);
    const to = $('[data-to]', searchForm);
    const guestsOutput = $('[data-guests]', searchForm);
    const iso = date => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    from.min = iso(today);
    from.value = iso(today);
    to.min = iso(tomorrow);
    to.value = iso(tomorrow);
    from.addEventListener('change', () => {
      const next = new Date(from.value);
      next.setDate(next.getDate() + 1);
      to.min = iso(next);
      if (!to.value || to.value <= from.value) to.value = iso(next);
    });
    let guests = 2;
    $$('[data-step]', searchForm).forEach(button => button.addEventListener('click', () => {
      guests = Math.min(4, Math.max(1, guests + Number(button.dataset.step)));
      guestsOutput.textContent = guests;
    }));
    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      const ru = value => value.split('-').reverse().join('-');
      location.href = `../booking.html?dfrom=${ru(from.value)}&dto=${ru(to.value)}&adults=${guests}`;
    });
  }

  const list = $('[data-rooms]');
  const formatPrice = value => value.toLocaleString('ru-RU');
  const optimizedPicture = (stem, fallback, alt, loading = 'lazy') => {
    const variants = stem === 'hero'
      ? [800, 1600, 2560]
      : [800, 1600].filter(width => width === 800 || ['tower', 'pond', 'place-1', 'place-3', 'place-4', 'place-5', 'place-6', 'evening'].includes(stem));
    const srcset = format => variants.map(width => `img/optimized/${stem}-${width}.${format} ${width}w`).join(', ');
    return `<picture><source type="image/avif" srcset="${srcset('avif')}" sizes="(max-width: 700px) 100vw, 50vw"><source type="image/webp" srcset="${srcset('webp')}" sizes="(max-width: 700px) 100vw, 50vw"><img src="${fallback}" alt="${alt}" loading="${loading}" width="1050" height="600"></picture>`;
  };

  if (list && window.ROOMS) {
    list.innerHTML = ROOMS.map((room, roomIndex) => {
      const photos = Array.from({ length: room.photos }, (_, photoIndex) => `../img/${room.key}-${photoIndex + 1}.jpg`);
      return `<article class="room" data-reveal>
        <div class="room__gallery">
          <div class="room__track" data-track>
            ${photos.map((path, photoIndex) => {
              const stem = `${room.key}-${photoIndex + 1}`;
              const media = photoIndex === 0
                ? optimizedPicture(stem, path, `${room.name}, фото ${photoIndex + 1}`)
                : `<img src="${path}" alt="${room.name}, фото ${photoIndex + 1}" loading="lazy" width="1050" height="600">`;
              return `<button type="button" data-open="${roomIndex}:${photoIndex}" aria-label="Открыть фото ${photoIndex + 1} из ${photos.length}">${media}</button>`;
            }).join('')}
          </div>
          <div class="room__dots" aria-hidden="true">${photos.map((_, index) => `<i class="${index ? '' : 'on'}"></i>`).join('')}</div>
          <div class="room__arrows"><button type="button" data-slide="-1" aria-label="Предыдущее фото">‹</button><button type="button" data-slide="1" aria-label="Следующее фото">›</button></div>
        </div>
        <div class="room__body">
          <div class="room__meta"><span>до ${room.guests} гостей</span><span>${room.area} м²</span></div>
          <h3>${room.name}</h3><p>${room.text}</p>
          <ul class="room__perks">${room.perks.map(perk => `<li>${perk}</li>`).join('')}</ul>
          <div class="room__foot"><p class="room__price">от ${formatPrice(room.price)} ₽<small>за комнату за ночь</small></p><a class="btn btn--line" href="../booking.html?adults=${room.guests}">Выбрать даты</a></div>
        </div>
      </article>`;
    }).join('');

    $$('.room').forEach(room => {
      room.style.setProperty('--delay', `${Math.min($$('.room').indexOf(room), 3) * 80}ms`);
      if (revealObserver) revealObserver.observe(room);
      else room.classList.add('is-visible');
      const track = $('[data-track]', room);
      const dots = $$('.room__dots i', room);
      $$('[data-slide]', room).forEach(button => button.addEventListener('click', () => {
        const width = track.clientWidth;
        const count = dots.length;
        const current = Math.round(track.scrollLeft / width);
        const next = (current + Number(button.dataset.slide) + count) % count;
        track.scrollTo({ left: next * width, behavior: reduced ? 'auto' : 'smooth' });
      }));
      track.addEventListener('scroll', () => {
        const active = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach((dot, index) => dot.classList.toggle('on', index === active));
      }, { passive: true });
      $$('.room img', room).forEach(prepareImage);
    });
  }

  const dialog = $('[data-lightbox]');
  const dialogImage = $('[data-lightbox-img]');
  let currentPhoto = null;
  let touchStartX = 0;
  const showPhoto = () => {
    if (!currentPhoto || !dialogImage) return;
    const room = ROOMS[currentPhoto.room];
    dialog.classList.add('is-changing');
    window.setTimeout(() => {
      dialogImage.src = `../img/${room.key}-${currentPhoto.index + 1}.jpg`;
      dialogImage.alt = `${room.name}, фото ${currentPhoto.index + 1}`;
      dialogImage.onload = () => dialog.classList.remove('is-changing');
      if (dialogImage.complete) dialog.classList.remove('is-changing');
    }, reduced ? 0 : 90);
  };
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-open]');
    if (!trigger || !dialog) return;
    const [room, index] = trigger.dataset.open.split(':').map(Number);
    currentPhoto = { room, index };
    showPhoto();
    if (!dialog.open) dialog.showModal();
  });
  const stepPhoto = direction => {
    if (!currentPhoto) return;
    const count = ROOMS[currentPhoto.room].photos;
    currentPhoto.index = (currentPhoto.index + direction + count) % count;
    showPhoto();
  };
  $$('[data-lightbox-step]').forEach(button => button.addEventListener('click', () => stepPhoto(Number(button.dataset.lightboxStep))));
  $('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') stepPhoto(1);
    if (event.key === 'ArrowLeft') stepPhoto(-1);
  });
  dialog?.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  dialog?.addEventListener('touchend', event => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 48) stepPhoto(delta < 0 ? 1 : -1);
  }, { passive: true });

  const strip = $('[data-strip]');
  if (strip) {
    const previous = $('[data-strip-step="-1"]');
    const next = $('[data-strip-step="1"]');
    const sync = () => {
      previous.disabled = strip.scrollLeft < 4;
      next.disabled = strip.scrollLeft + strip.clientWidth > strip.scrollWidth - 4;
    };
    [previous, next].forEach(button => button?.addEventListener('click', () => {
      const direction = Number(button.dataset.stripStep);
      const figures = $$('figure', strip);
      const current = figures.findIndex(figure => figure.offsetLeft - strip.offsetLeft >= strip.scrollLeft + 8);
      const targetIndex = direction > 0 ? Math.min(figures.length - 1, Math.max(0, current + 1)) : Math.max(0, current - 1);
      strip.scrollTo({ left: figures[targetIndex].offsetLeft - strip.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
    }));
    strip.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync, { passive: true });
    sync();
  }

  $$('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
})();

