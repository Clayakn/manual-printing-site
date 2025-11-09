const priceConfig = {
  colorMode: {
    bw: 0.06,
    mixed: 0.11,
    full: 0.16,
  },
  binding: {
    spiral: 2.1,
    wire: 2.6,
    perfect: 3.4,
    saddle: 1.8,
  },
  paper: {
    matte: 0,
    gloss: 0.8,
    recycled: -0.35,
  },
  extras: {
    laminate: { label: 'Laminated cover', type: 'perCopy', amount: 1.5 },
    tabs: { label: 'Index tabs', type: 'perCopy', amount: 0.9 },
    proof: { label: 'Hard-copy proof', type: 'flat', amount: 35 },
  },
  shipping: {
    standard: { label: 'Ground shipping', amount: 0, description: 'Included' },
    expedited: { label: 'Expedited shipping', amount: 45, description: '3-4 day delivery' },
    rush: { label: 'Rush shipping', amount: 90, description: '2 day delivery' },
  },
};

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const calculatePricing = (formData) => {
  const pages = Number(formData.get('pages')) || 0;
  const copies = Number(formData.get('copies')) || 0;
  const colorMode = formData.get('colorMode');
  const binding = formData.get('binding');
  const paper = formData.get('paper');
  const shipping = formData.get('shipping');
  const extras = formData.getAll('extras');

  const perPage = priceConfig.colorMode[colorMode] || 0;
  const bindingCost = priceConfig.binding[binding] || 0;
  const paperAdj = priceConfig.paper[paper] || 0;
  const shippingCost = priceConfig.shipping[shipping]?.amount || 0;

  const basePerCopy = pages * perPage + bindingCost + paperAdj;
  let perCopy = basePerCopy;
  let flatFees = shippingCost;
  const breakdown = [
    { label: 'Printing & binding', value: formatCurrency(basePerCopy), detail: `${pages} pages, ${binding} binding` },
  ];

  extras.forEach((extraKey) => {
    const extra = priceConfig.extras[extraKey];
    if (!extra) return;

    if (extra.type === 'perCopy') {
      perCopy += extra.amount;
      breakdown.push({ label: extra.label, value: `+${formatCurrency(extra.amount)}` });
    } else {
      flatFees += extra.amount;
      breakdown.push({ label: extra.label, value: `+${formatCurrency(extra.amount)}` });
    }
  });

  if (shippingCost) {
    breakdown.push({ label: priceConfig.shipping[shipping].label, value: `+${formatCurrency(shippingCost)}` });
  } else {
    breakdown.push({ label: priceConfig.shipping[shipping].label, value: 'Included' });
  }

  const perCopyRounded = Math.max(perCopy, 0);
  const subtotal = perCopyRounded * copies;
  const total = subtotal + flatFees;

  return {
    perCopy: perCopyRounded,
    total,
    breakdown,
    copies,
    flatFees,
  };
};

const updateSummary = (form) => {
  const data = new FormData(form);
  const { perCopy, total, breakdown, copies } = calculatePricing(data);

  const perCopyEl = document.getElementById('summary-per-copy');
  const totalEl = document.getElementById('summary-total');
  const breakdownEl = document.getElementById('summary-breakdown');

  perCopyEl.textContent = formatCurrency(perCopy);
  totalEl.textContent = `${formatCurrency(total)} for ${copies || 0} copies`;

  breakdownEl.innerHTML = '';
  breakdown.forEach((item) => {
    const dt = document.createElement('dt');
    dt.textContent = item.label;
    const dd = document.createElement('dd');
    dd.textContent = item.value + (item.detail ? ` • ${item.detail}` : '');
    breakdownEl.append(dt, dd);
  });
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  const form = event.target;
  const confirmation = document.createElement('div');
  confirmation.className = 'toast';
  confirmation.innerHTML = `
    <strong>Project received!</strong>
    <span>Our production specialists will reach out shortly to confirm timelines and collect files.</span>
  `;

  document.body.appendChild(confirmation);
  setTimeout(() => confirmation.classList.add('visible'), 50);
  setTimeout(() => {
    confirmation.classList.remove('visible');
    setTimeout(() => confirmation.remove(), 300);
  }, 5000);
  form.reset();
  updateSummary(form);
};

const initScrollTop = () => {
  const button = document.getElementById('scroll-top');
  if (!button) return;
  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  };
  window.addEventListener('scroll', toggleVisibility);
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

const initYear = () => {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }
};

const initForm = () => {
  const form = document.getElementById('order-form');
  if (!form) return;

  form.addEventListener('input', () => updateSummary(form));
  form.addEventListener('change', () => updateSummary(form));
  form.addEventListener('submit', handleFormSubmit);
  updateSummary(form);
};

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initForm();
  initScrollTop();
});
