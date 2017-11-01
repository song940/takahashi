'use strict'

function parseContent(text) {
  return text.split(/\n{2,}/).map(slideText => slideText.split(/\n/))
}

function createSlides(slides) {
  slides.map(slide => {
    const slideDiv = document.createElement('div')
    slideDiv.className = 'slide'
    slide.forEach(line => {
      const lineDiv = document.createElement('div')
      lineDiv.className = 'line'
      line = line.trim().replace(/^#+\s+/, '')
      if (line.slice(-1) === ',') {
        line = line.slice(0, -1)
        lineDiv.classList.add('comma')
      }
      const m = /^!\[(.*?)\]\((.*?)\)/.exec(line)
      if (m) {
        const img = document.createElement('img')
        img.alt = m[1]
        img.src = m[2]
        lineDiv.appendChild(img)
      } else {
        const tokens = line.split(/(`|\*\*|\*|~~)(?=\S)(.*\S)\1/g)
        for (let i = 0; i < tokens.length; ++i) {
          let node
          switch (tokens[i]) {
            case '`':   node = document.createElement('code');    break;
            case '*':   node = document.createElement('em');      break;
            case '**':  node = document.createElement('strong');  break;
            case '~~':  node = document.createElement('s');       break;
            default:    node = document.createTextNode(tokens[i])
          }
          if (node.nodeType === 1 /* Element */) {
            node.appendChild(document.createTextNode(tokens[++i]))
          }
          lineDiv.appendChild(node)
        }
      }
      slideDiv.appendChild(lineDiv)
      document.body.appendChild(slideDiv)
    })
  })
}

function startPresentation() {
  initSlide()
  window.onpopstate = e => {
    showSlide(parseInt(e.state))
  }
  window.onkeydown = kbEvent => {
    // console.log(kbEvent);
    switch (kbEvent.code) {
      case 'ArrowLeft':
        prevSlide();
        break
      case 'Space':
      case 'ArrowRight':
        nextSlide();
        break
    }
  }
}

function initSlide() {
  if (!showSlide(parseInt(location.hash.slice(1)))) 
    showSlide(0)
  pushState()
}

function showSlide(i) {
  const slide = document.querySelectorAll('.slide')[i]
  if (!slide) return 
  slideIndex = i
  const curr = current()
  if (curr) curr.classList.toggle('current')
  slide.classList.toggle('current')
  adjustSlide()
  return true
}

function current() {
  return  document.querySelector('.current.slide')
}

function nextSlide() {
  const curr = current()
  const c = curr.querySelector('.comma')
  if (c) {
    c.classList.remove('comma')
    return
  }
  const next = curr.nextElementSibling
  // console.log(next)
  if (next) {
    showSlide(++slideIndex)
    pushState()
  }
}

function prevSlide() {
  const curr = current()
  const prev = curr.previousElementSibling
  //console.log(prev)
  if (prev) {
    showSlide(--slideIndex)
    pushState()
  }
}

let slideIndex
function pushState() {
  history.pushState(slideIndex, '', `#${slideIndex}`)
}

function adjustSlide() {
  const curr = current()

  curr.style.visibility = 'hidden'
  curr.style.transform = null
  Array.from(curr.childNodes).forEach(e => e.style.fontSize = null)

  setTimeout(() => {
    const vw = window.innerWidth * 0.8, vh = window.innerHeight * 0.8
    // console.log(vw, vh)
    Array.from(curr.childNodes).forEach(e => {
      // console.log(e.clientWidth, vw)
      e.style.fontSize = vw / e.clientWidth + 'em'
      // console.log(e.clientWidth, vw)
    })
    const scale = Math.min(vh / curr.clientHeight, 1)
    const dy = (vh - curr.clientHeight) / 2 / scale
    curr.style.transform = `scale(${scale}) translate(0, ${dy}px)`
    curr.style.visibility = null
    //console.log(vh, curr.clientHeight, vh / curr.clientHeight, curr.style.transform)
  })
}


fetch('README.md')
.then(res => res.text())
.then(parseContent)
.then(createSlides)
.then(startPresentation)
