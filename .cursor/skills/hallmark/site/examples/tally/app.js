/* Hallmark · motion primitives: counter · marquee (CSS) · hover-tilt
 * respects prefers-reduced-motion
 */

;(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ── counter · live ticker for hero status + invoice + bench stats ── */
  const liveEvents = document.getElementById('live-events')
  const benchEps = document.getElementById('bench-eps')
  const invCalls = document.getElementById('inv-calls')
  const invTotal = document.getElementById('inv-total')
  const benchMrr = document.getElementById('bench-mrr')

  let eps = 12847
  let calls = 1284512
  let total = 5142.86
  let mrr = 412.6

  const fmt = n => n.toLocaleString('en-US')

  function tick() {
    // small jitter, bounded
    eps += Math.round((Math.random() - 0.4) * 80)
    if (eps < 11000) eps = 11200
    if (eps > 14500) eps = 14200

    calls += Math.round(Math.random() * 24 + 4)
    total += Math.random() * 0.18
    mrr += (Math.random() - 0.5) * 0.4
    if (mrr < 410) mrr = 410.3
    if (mrr > 416) mrr = 415.8

    if (liveEvents) liveEvents.textContent = fmt(eps)
    if (benchEps) benchEps.textContent = fmt(eps)
    if (invCalls) invCalls.textContent = fmt(calls)
    if (invTotal) invTotal.textContent = total.toFixed(2)
    if (benchMrr) benchMrr.textContent = mrr.toFixed(1)
  }

  if (!reduceMotion) {
    tick()
    setInterval(tick, 1100)
  }

  /* ── pricing toggle ── */
  const pricingButtons = document.querySelectorAll('.pricing__toggle button')
  const pricedSpans = document.querySelectorAll('[data-price-monthly]')

  pricingButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period
      pricingButtons.forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'))
      pricedSpans.forEach(span => {
        span.textContent =
          period === 'annual' ? span.dataset.priceAnnual : span.dataset.priceMonthly
      })
    })
  })

  /* ── hover-tilt on feature cards ── */
  const tiltCards = document.querySelectorAll('[data-tilt]')

  if (!reduceMotion) {
    tiltCards.forEach(card => {
      let raf = null

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        if (raf) cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-2px)`
        })
      })

      card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf)
        card.style.transform = ''
      })
    })
  }
})()
