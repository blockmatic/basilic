// NAJM · cart drawer + add-to-bag micro
const $ = (s, p = document) => p.querySelector(s)
const $$ = (s, p = document) => Array.from(p.querySelectorAll(s))

const drawer = $('#drawer')
const scrim = $('#scrim')
const cartBtn = $('#cartBtn')
const cartCount = $('#cartCount')
const cartTotal = $('#cartTotal')
const cartLines = $('#cartLines')
const cartFree = $('#cartFree')

const state = {
  items: [
    {
      id: 'atlas',
      name: 'Atlas Wide-Leg Trouser',
      variant: 'Bone · 32',
      price: 980,
      qty: 1,
      surface: 'bone',
    },
    {
      id: 'medina',
      name: 'Médina Cropped Jacket',
      variant: 'Terracotta · M',
      price: 1450,
      qty: 1,
      surface: 'terracotta',
    },
  ],
}

const fmt = n => `${n.toLocaleString('fr-MA')} MAD`
const FreeOver = 1500

function render() {
  cartLines.innerHTML = state.items
    .map(
      item => `
    <div class="drawer__line" data-id="${item.id}">
      <div class="drawer__thumb">
        <div class="surface surface--${item.surface}"></div>
        <div class="zellige${item.surface === 'bone' ? ' zellige--dark' : ''}"></div>
      </div>
      <div>
        <div class="drawer__name">${item.name}</div>
        <div class="drawer__sub">${item.variant}</div>
        <div class="drawer__qty" role="group" aria-label="Quantity for ${item.name}">
          <button data-act="dec" aria-label="Decrease">–</button>
          <span aria-live="polite">${item.qty}</span>
          <button data-act="inc" aria-label="Increase">+</button>
        </div>
      </div>
      <div class="drawer__price">${fmt(item.price * item.qty)}</div>
    </div>
  `,
    )
    .join('')

  const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = state.items.reduce((s, i) => s + i.qty, 0)

  cartCount.textContent = count
  cartTotal.textContent = fmt(subtotal)

  const remain = FreeOver - subtotal
  cartFree.textContent =
    remain > 0 ? `${fmt(remain)} away from free shipping` : 'Free shipping unlocked · ships in 24h'
}

function open() {
  drawer.classList.add('is-open')
  scrim.classList.add('is-open')
  drawer.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
  setTimeout(() => $('.drawer__close')?.focus(), 50)
}
function close() {
  drawer.classList.remove('is-open')
  scrim.classList.remove('is-open')
  drawer.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
  cartBtn.focus()
}

cartBtn.addEventListener('click', open)
$('#mobileCart')?.addEventListener('click', open)
scrim.addEventListener('click', close)
$('.drawer__close').addEventListener('click', close)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && drawer.classList.contains('is-open')) close()
})

cartLines.addEventListener('click', e => {
  const btn = e.target.closest('button[data-act]')
  if (!btn) return
  const line = btn.closest('.drawer__line')
  const item = state.items.find(i => i.id === line.dataset.id)
  if (!item) return
  if (btn.dataset.act === 'inc') item.qty += 1
  if (btn.dataset.act === 'dec') item.qty = Math.max(1, item.qty - 1)
  render()
})

// Add-to-bag from product cards
$$('[data-add]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault()
    const card = btn.closest('[data-product]')
    const id = card.dataset.product
    const found = state.items.find(i => i.id === id)
    if (found) {
      found.qty += 1
    } else {
      state.items.push({
        id,
        name: card.dataset.name,
        variant: card.dataset.variant,
        price: Number(card.dataset.price),
        surface: card.dataset.surface,
        qty: 1,
      })
    }
    render()
    cartCount.classList.remove('is-pulse')
    void cartCount.offsetWidth // restart animation
    cartCount.classList.add('is-pulse')
    btn.textContent = 'Added ✓'
    setTimeout(() => {
      btn.textContent = btn.dataset.label || 'Add to bag'
    }, 1400)
  })
})

// Newsletter — inline confirmation, no toast
$('#news')?.addEventListener('submit', e => {
  e.preventDefault()
  const input = e.target.querySelector('input')
  const note = $('#newsNote')
  if (!input.value.includes('@')) {
    note.textContent = 'Add a valid email to subscribe.'
    note.style.color = 'var(--color-accent-deep)'
    input.focus()
    return
  }
  note.textContent = `${input.value} is on the list — first drop ships Friday.`
  note.style.color = 'var(--color-ink)'
  input.value = ''
})

render()
