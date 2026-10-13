// ==========================================================
// 1. МОБИЛЬНОЕ МЕНЮ (бургер)
// ==========================================================
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

function setMenuOpen(isOpen) {
  nav.classList.toggle('nav--open', isOpen);
  burger.classList.toggle('burger--open', isOpen);
  // aria-expanded сообщает экранному диктору, открыто меню или нет
  burger.setAttribute('aria-expanded', String(isOpen));
  burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
}

burger.addEventListener('click', () => {
  setMenuOpen(!nav.classList.contains('nav--open'));
});

// Закрываем меню, когда пользователь нажал на ссылку
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

// ...или нажал Esc
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('nav--open')) {
    setMenuOpen(false);
    burger.focus();
  }
});

// ...или кликнул где-то мимо меню
document.addEventListener('click', (event) => {
  if (nav.classList.contains('nav--open') && !event.target.closest('.header')) {
    setMenuOpen(false);
  }
});

// ==========================================================
// 2. ШАПКА: тень при прокрутке + подсветка текущего раздела
// ==========================================================
const header = document.getElementById('header');

function onScroll() {
  header.classList.toggle('header--scrolled', window.scrollY > 8);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Подсвечиваем пункт меню того раздела, который сейчас посередине экрана
const navLinks = nav.querySelectorAll('a[href^="#"]:not(.btn)');
const sections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function updateActiveLink() {
  const middle = window.innerHeight / 2;
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  // Подвал невысокий и до середины экрана не доезжает,
  // поэтому в самом низу страницы считаем текущим последний раздел («Контакты»)
  const current = atBottom
    ? sections[sections.length - 1]
    : sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= middle && rect.bottom > middle;
      });

  // Если посередине раздел, которого нет в меню (например, бронь), — ничего не подсвечиваем
  navLinks.forEach((link) => {
    const isCurrent = Boolean(current) && link.getAttribute('href') === `#${current.id}`;
    link.classList.toggle('is-active', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
window.addEventListener('resize', updateActiveLink);
updateActiveLink();

// ==========================================================
// 3. ПОЯВЛЕНИЕ БЛОКОВ ПРИ ПРОКРУТКЕ
// ==========================================================
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // анимируем только один раз
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((el, i) => {
  // соседние карточки появляются чуть друг за другом
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  revealObserver.observe(el);
});

// ==========================================================
// 4. МЕНЮ КОФЕЙНИ — данные хранятся в массиве,
//    а позиции создаются автоматически.
//    Чтобы добавить позицию, просто допиши объект в список.
// ==========================================================
const menuData = {
  coffee: [
    { name: 'Эспрессо', desc: '30 мл, наша обжарка', price: 150 },
    { name: 'Американо', desc: '250 мл', price: 190 },
    { name: 'Капучино', desc: '300 мл, можно на растительном молоке', price: 250 },
    { name: 'Флэт уайт', desc: '200 мл, двойной эспрессо', price: 270 },
    { name: 'Раф ванильный', desc: '300 мл, сливки и ваниль', price: 310 },
    { name: 'Фильтр-кофе', desc: 'Воронка V60, зерно дня', price: 280 },
  ],
  tea: [
    { name: 'Чай листовой', desc: 'Чёрный, зелёный, улун — 500 мл', price: 220 },
    { name: 'Матча латте', desc: '300 мл', price: 320 },
    { name: 'Какао с маршмеллоу', desc: '300 мл', price: 260 },
    { name: 'Лимонад домашний', desc: 'Клубника-базилик или цитрус', price: 240 },
  ],
  food: [
    { name: 'Круассан', desc: 'Классический сливочный', price: 160 },
    { name: 'Синнабон', desc: 'С корицей и сливочным кремом', price: 210 },
    { name: 'Чизкейк Нью-Йорк', desc: 'Кусочек', price: 290 },
    { name: 'Сэндвич с курицей', desc: 'Чиабатта, песто, томаты', price: 340 },
  ],
};

const menuList = document.getElementById('menu-list');
const tabs = [...document.querySelectorAll('.tab')];

function renderMenu(category) {
  menuList.innerHTML = menuData[category]
    .map(
      (item, i) => `
        <div class="menu-item" style="animation-delay: ${i * 40}ms">
          <div class="menu-item__top">
            <span class="menu-item__name">${item.name}</span>
            <span class="menu-item__dots" aria-hidden="true"></span>
            <span class="menu-item__price">${item.price} ₽</span>
          </div>
          <p class="menu-item__desc">${item.desc}</p>
        </div>`
    )
    .join('');
}

function selectTab(tab) {
  tabs.forEach((t) => {
    const isActive = t === tab;
    t.classList.toggle('tab--active', isActive);
    t.setAttribute('aria-selected', String(isActive));
    t.tabIndex = isActive ? 0 : -1;
  });
  renderMenu(tab.dataset.category);
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));

  // Переключение вкладок стрелками ← → (так принято для вкладок)
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });
});

renderMenu('coffee'); // при загрузке показываем кофе

// ==========================================================
// 5. ФОРМА БРОНИРОВАНИЯ
// ==========================================================
const form = document.getElementById('booking-form');
const message = document.getElementById('form-message');
const phoneInput = form.elements.phone;
const dateInput = form.elements.date;

// Нельзя выбрать дату в прошлом: ставим минимум «сегодня»
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
dateInput.min = today.toISOString().slice(0, 10);

// Маска телефона: пока человек печатает, приводим номер к виду +7 (999) 123-45-67
phoneInput.addEventListener('input', () => {
  let digits = phoneInput.value.replace(/\D/g, '');
  // Поле стёрли полностью — оставляем пустым, а не «+7»
  if (digits === '') {
    phoneInput.value = '';
    return;
  }
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (!digits.startsWith('7')) digits = '7' + digits;
  digits = digits.slice(0, 11);

  const p = digits.slice(1); // цифры после +7
  let result = '+7';
  if (p.length > 0) result += ` (${p.slice(0, 3)}`;
  // Скобку ставим, только когда после кода есть цифры —
  // иначе Backspace не сможет стереть третью цифру
  if (p.length > 3) result += `) ${p.slice(3, 6)}`;
  if (p.length > 6) result += `-${p.slice(6, 8)}`;
  if (p.length > 8) result += `-${p.slice(8, 10)}`;
  phoneInput.value = result;
});

// Как только поле начали исправлять — убираем красную рамку
form.querySelectorAll('input').forEach((input) => {
  input.addEventListener('input', () => {
    input.classList.remove('input--error');
    input.removeAttribute('aria-invalid');
  });
});

function markError(input) {
  input.classList.add('input--error');
  input.setAttribute('aria-invalid', 'true');
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); // не даём странице перезагрузиться

  const errors = [];

  form.querySelectorAll('input').forEach((input) => {
    if (input.value.trim() === '') {
      markError(input);
      errors.push(input);
    }
  });

  // Телефон: оставляем только цифры и проверяем, что их 11
  if (phoneInput.value.replace(/\D/g, '').length !== 11) {
    markError(phoneInput);
    errors.push(phoneInput);
  }

  // Дата не в прошлом
  if (dateInput.value && dateInput.value < dateInput.min) {
    markError(dateInput);
    errors.push(dateInput);
  }

  // Время в часы работы (последняя бронь — в 21:00)
  const time = form.elements.time;
  if (time.value && (time.value < time.min || time.value > time.max)) {
    markError(time);
    errors.push(time);
  }

  if (errors.length > 0) {
    message.textContent = 'Проверьте поля, отмеченные красным. Бронь — с 8:00 до 21:00.';
    message.className = 'form__message form__message--error';
    errors[0].focus(); // ставим курсор в первое поле с ошибкой
    return;
  }

  // На реальном сайте здесь заявка отправлялась бы на сервер,
  // в Telegram-бот или на почту. Для портфолио просто показываем сообщение.
  message.textContent = `Спасибо, ${form.elements.name.value.trim()}! Мы скоро перезвоним.`;
  message.className = 'form__message form__message--success';
  form.reset();
});

// Год в подвале обновляется сам
document.getElementById('year').textContent = new Date().getFullYear();
