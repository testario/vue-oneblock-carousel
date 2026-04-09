<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"

type AnimationType = "" | "oneway"
type SlideId = number | string
const defaultDotSize = 32
const defaultDotStep = 39
const defaultAutoplayInterval = 5000
const dragIntentThreshold = 12
const swipeTriggerThreshold = 56

type CarSlide = {
  id?: SlideId
  cover: string
  title: string
  text: string
} & Record<string, unknown>

interface HighlighterState {
  top: string
  left: string
  width: string
  height: string
  borderRadius: string
}

interface DotMetrics {
  top: number
  left: number
  width: number
  height: number
  isFallback: boolean
}

type DotElement = HTMLButtonElement | undefined

const props = withDefaults(defineProps<{
  animationType?: AnimationType
  autoplay?: boolean
  autoplayInterval?: number
  slides: CarSlide[]
}>(), {
  animationType: "",
  autoplay: false,
  autoplayInterval: defaultAutoplayInterval
})

defineSlots<{
  slide?: (props: {
    slide: CarSlide
    index: number
    slides: CarSlide[]
    activeIndex: number
    activeDotIndex: number
    goToSlide: (index: number) => void
    highlighterStyle: HighlighterState
    setDotElement: (element: Element | ComponentPublicInstance | null, index: number) => void
    getSlideKey: (slide: CarSlide, index: number) => SlideId
  }) => unknown
  image?: (props: {
    slide: CarSlide
    index: number
  }) => unknown
  content?: (props: {
    slide: CarSlide
    index: number
    slides: CarSlide[]
    activeIndex: number
    activeDotIndex: number
    goToSlide: (index: number) => void
    highlighterStyle: HighlighterState
    setDotElement: (element: Element | ComponentPublicInstance | null, index: number) => void
    getSlideKey: (slide: CarSlide, index: number) => SlideId
  }) => unknown
  title?: (props: {
    slide: CarSlide
    index: number
  }) => unknown
  text?: (props: {
    slide: CarSlide
    index: number
  }) => unknown
  dots?: (props: {
    slide: CarSlide
    index: number
    slides: CarSlide[]
    activeIndex: number
    activeDotIndex: number
    goToSlide: (index: number) => void
    highlighterStyle: HighlighterState
    setDotElement: (element: Element | ComponentPublicInstance | null, index: number) => void
    getSlideKey: (slide: CarSlide, index: number) => SlideId
  }) => unknown
  dot?: (props: {
    slide: CarSlide
    index: number
    isActive: boolean
    goToSlide: (index: number) => void
  }) => unknown
  "not-found"?: (props: {
    slides: CarSlide[]
  }) => unknown
}>()

const carSlides = computed<CarSlide[]>(() => props.slides)
const activeIndex = ref(0)
const targetIndex = ref<number | null>(null)
const animClass = ref("")
const dotElements = ref<DotElement[]>([])
const autoplayTimeoutId = ref<number | null>(null)
const isHovered = ref(false)
const isPointerDown = ref(false)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragCurrentX = ref(0)
const timeoutIds: number[] = []
const highlighter = reactive<HighlighterState>({
  top: "0px",
  left: "0px",
  width: "32px",
  height: "32px",
  borderRadius: "18px"
})

const carState = computed<CarSlide | null>(() => {
  return carSlides.value[activeIndex.value] ?? null
})
const activeDotIndex = computed<number>(() => {
  return targetIndex.value ?? activeIndex.value
})
const normalizedAutoplayInterval = computed<number>(() => {
  return props.autoplayInterval > 0 ? props.autoplayInterval : defaultAutoplayInterval
})
const dragDeltaX = computed<number>(() => {
  return dragCurrentX.value - dragStartX.value
})

function getSlideKey(slide: CarSlide, index: number): SlideId {
  return slide.id ?? index
}

function setDotElement(element: Element | ComponentPublicInstance | null, index: number) {
  if (!element) {
    dotElements.value[index] = undefined
    return
  }

  if (!(element instanceof HTMLButtonElement)) {
    return
  }

  dotElements.value[index] = element
}

function resetAnimationTimers() {
  timeoutIds.forEach((timeoutId) => {
    window.clearTimeout(timeoutId)
  })
  timeoutIds.length = 0
}

function resetDragState() {
  isPointerDown.value = false
  isDragging.value = false
  dragStartX.value = 0
  dragStartY.value = 0
  dragCurrentX.value = 0
}

function clearAutoplayTimer() {
  if (autoplayTimeoutId.value === null) {
    return
  }

  window.clearTimeout(autoplayTimeoutId.value)
  autoplayTimeoutId.value = null
}

function setHighlighterState(metrics: {
  top: number
  left: number
  width: number
  height: number
}) {
  highlighter.top = `${metrics.top}px`
  highlighter.left = `${metrics.left}px`
  highlighter.width = `${metrics.width}px`
  highlighter.height = `${metrics.height}px`
  highlighter.borderRadius = `${Math.round(metrics.height / 2)}px`
}

function getDotMetrics(index: number): DotMetrics | null {
  const activeDot = dotElements.value[index]

  if (!activeDot) {
    return null
  }

  const isFallback = activeDot.offsetWidth === 0 && activeDot.offsetHeight === 0

  return {
    top: activeDot.offsetTop,
    left: activeDot.offsetLeft || index * defaultDotStep,
    width: activeDot.offsetWidth || defaultDotSize,
    height: activeDot.offsetHeight || defaultDotSize,
    isFallback
  }
}

function getExpandedHighlighterMetrics(previousDot: DotMetrics, nextDot: DotMetrics, previousIndex: number, nextIndex: number): DotMetrics {
  const useFallbackHighlighter = previousDot.isFallback || nextDot.isFallback
  const left = useFallbackHighlighter
    ? previousIndex > nextIndex
      ? nextDot.left
      : previousDot.left
    : Math.min(previousDot.left, nextDot.left)
  const width = useFallbackHighlighter
    ? defaultDotStep * (Math.abs(nextIndex - previousIndex) + 1)
    : Math.max(previousDot.left + previousDot.width, nextDot.left + nextDot.width) - Math.min(previousDot.left, nextDot.left)

  return {
    top: nextDot.top,
    left,
    width,
    height: nextDot.height,
    isFallback: useFallbackHighlighter
  }
}

function syncHighlighter(index: number) {
  const metrics = getDotMetrics(index)

  if (!metrics) {
    return
  }

  setHighlighterState(metrics)
}

function scheduleAnimation(callback: () => void, delay: number) {
  const timeoutId = window.setTimeout(callback, delay)
  timeoutIds.push(timeoutId)
}

function shouldAutoplay() {
  return props.autoplay && !isHovered.value && carSlides.value.length > 1 && targetIndex.value === null
}

function getNextSlideIndex() {
  return activeIndex.value >= carSlides.value.length - 1 ? 0 : activeIndex.value + 1
}

function startAutoplay() {
  clearAutoplayTimer()

  if (!shouldAutoplay()) {
    return
  }

  autoplayTimeoutId.value = window.setTimeout(() => {
    autoplayTimeoutId.value = null
    goToSlide(getNextSlideIndex())
  }, normalizedAutoplayInterval.value)
}

function stopAutoplay() {
  clearAutoplayTimer()
}

function handleMouseEnter() {
  isHovered.value = true
  stopAutoplay()
}

function handleMouseLeave() {
  isHovered.value = false
  startAutoplay()
}

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return
  }

  if (carSlides.value.length <= 1 || targetIndex.value !== null) {
    return
  }

  isPointerDown.value = true
  isDragging.value = false
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragCurrentX.value = event.clientX
  stopAutoplay()
}

function handlePointerMove(event: PointerEvent) {
  if (!isPointerDown.value || targetIndex.value !== null) {
    return
  }

  dragCurrentX.value = event.clientX

  const deltaX = dragCurrentX.value - dragStartX.value
  const deltaY = event.clientY - dragStartY.value
  const absDeltaX = Math.abs(deltaX)
  const absDeltaY = Math.abs(deltaY)

  if (!isDragging.value) {
    if (absDeltaX < dragIntentThreshold && absDeltaY < dragIntentThreshold) {
      return
    }

    if (absDeltaX <= absDeltaY) {
      resetDragState()
      startAutoplay()
      return
    }

    isDragging.value = true
  }

  event.preventDefault()
}

function completePointerGesture(event?: PointerEvent) {
  if (!isPointerDown.value) {
    return
  }

  if (event) {
    dragCurrentX.value = event.clientX
  }

  const shouldSwitchSlide = isDragging.value && Math.abs(dragDeltaX.value) >= swipeTriggerThreshold
  const nextIndex = dragDeltaX.value < 0 ? activeIndex.value + 1 : activeIndex.value - 1

  resetDragState()

  if (!shouldSwitchSlide) {
    startAutoplay()
    return
  }

  if (nextIndex < 0 || nextIndex >= carSlides.value.length) {
    startAutoplay()
    return
  }

  goToSlide(nextIndex)
}

function handlePointerUp(event: PointerEvent) {
  completePointerGesture(event)
}

function handlePointerCancel() {
  if (!isPointerDown.value) {
    return
  }

  resetDragState()
  startAutoplay()
}

function goToSlide(index: number) {
  if (index === activeIndex.value || index < 0 || index >= carSlides.value.length) {
    return
  }

  stopAutoplay()
  resetAnimationTimers()

  const previousIndex = activeIndex.value
  const previousDot = getDotMetrics(previousIndex)
  const nextDot = getDotMetrics(index)
  const shouldAnimateOneway = props.animationType === "oneway"
  const animationDirection = shouldAnimateOneway
    ? previousIndex < index
      ? "animated-right"
      : "animated-left"
    : ""

  targetIndex.value = index
  animClass.value = animationDirection

  if (previousDot && nextDot) {
    const expandedHighlighter = getExpandedHighlighterMetrics(previousDot, nextDot, previousIndex, index)

    setHighlighterState(previousDot)

    scheduleAnimation(() => {
      setHighlighterState(expandedHighlighter)
    }, 0)
  }

  scheduleAnimation(() => {
    animClass.value = animationDirection ? `${animationDirection} stop` : ""
    syncHighlighter(index)
  }, 150)

  scheduleAnimation(() => {
    activeIndex.value = index
    animClass.value = ""
    targetIndex.value = null
    startAutoplay()
  }, 300)
}

watch(() => props.slides, async (slides) => {
  stopAutoplay()
  resetAnimationTimers()
  resetDragState()
  dotElements.value = new Array(slides.length)
  animClass.value = ""
  targetIndex.value = null

  if (!slides.length) {
    activeIndex.value = 0
    return
  }

  const lastSlideIndex = slides.length - 1

  if (activeIndex.value > lastSlideIndex) {
    activeIndex.value = lastSlideIndex
  }

  await nextTick()
  syncHighlighter(activeIndex.value)
  startAutoplay()
}, {
  deep: true
})

watch(() => [props.autoplay, props.autoplayInterval], () => {
  startAutoplay()
})

onMounted(async () => {
  await nextTick()

  if (!carSlides.value.length) {
    return
  }

  syncHighlighter(activeIndex.value)
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
  resetAnimationTimers()
  resetDragState()
})
</script>

<template>
  <div
    class="v-ob-car"
    :class="{ 'is-dragging': isDragging }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
  >
    <div class="container">
      <div
        v-if="carState"
        class="v-ob-car-slide"
        :class="animClass"
      >
        <slot
          name="slide"
          :slide="carState"
          :index="activeIndex"
          :slides="carSlides"
          :active-index="activeIndex"
          :active-dot-index="activeDotIndex"
          :go-to-slide="goToSlide"
          :highlighter-style="highlighter"
          :set-dot-element="setDotElement"
          :get-slide-key="getSlideKey"
        >
          <slot
            name="image"
            :slide="carState"
            :index="activeIndex"
          >
            <div
              class="img"
              :style="{ backgroundImage: `url(${carState.cover})` }"
            />
          </slot>
          <slot
            name="content"
            :slide="carState"
            :index="activeIndex"
            :slides="carSlides"
            :active-index="activeIndex"
            :active-dot-index="activeDotIndex"
            :go-to-slide="goToSlide"
            :highlighter-style="highlighter"
            :set-dot-element="setDotElement"
            :get-slide-key="getSlideKey"
          >
            <div class="text">
              <slot
                name="title"
                :slide="carState"
                :index="activeIndex"
              >
                <h1 class="ico-tit">
                  {{ carState.title }}
                </h1>
              </slot>
              <slot
                name="text"
                :slide="carState"
                :index="activeIndex"
              >
                <div class="subtext">
                  <div class="subtext-item">
                    {{ carState.text }}
                  </div>
                </div>
              </slot>
              <slot
                name="dots"
                :slide="carState"
                :index="activeIndex"
                :slides="carSlides"
                :active-index="activeIndex"
                :active-dot-index="activeDotIndex"
                :go-to-slide="goToSlide"
                :highlighter-style="highlighter"
                :set-dot-element="setDotElement"
                :get-slide-key="getSlideKey"
              >
                <div class="v-ob-car-dots">
                  <div
                    class="v-ob-car-highlighter"
                    :style="highlighter"
                  />
                  <button
                    v-for="(item, index) in carSlides"
                    :key="getSlideKey(item, index)"
                    :ref="(element) => setDotElement(element, index)"
                    class="item"
                    :class="{
                      active: index === activeDotIndex
                    }"
                    :data-slide-id="getSlideKey(item, index)"
                    type="button"
                    @click="goToSlide(index)"
                  >
                    <slot
                      name="dot"
                      :slide="item"
                      :index="index"
                      :is-active="index === activeDotIndex"
                      :go-to-slide="goToSlide"
                    >
                      {{ index + 1 }}
                    </slot>
                  </button>
                </div>
              </slot>
            </div>
          </slot>
        </slot>
      </div>
      <slot
        v-else
        name="not-found"
        :slides="carSlides"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.v-ob-car {
  width: 100%;
  display: block;
  background: #EEEEEE;
  position: relative;
  touch-action: pan-y;
  &.is-dragging {
    user-select: none;
    -webkit-user-select: none;
  }
  .container {
    padding: 0;
  }
}
.v-ob-car-slide {
  display: flex;
  min-height: 43.4rem;
  overflow: hidden;
  .img {
    width: 70.4rem;
    flex: 0 0 70.4rem;
    margin-right: 7.8rem;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    transition: all 0.3s ease;
    opacity: 1;
  }
  .text {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    padding: 5.8rem 0 7.1rem;
    h1, .subtext {
      transition: all 0.3s ease;
      opacity: 1;
    }
    .subtext {
      font-size: 2rem;
      .subtext-item {
        margin-bottom: 2.8rem;
      }
    }
    .v-ob-car-dots {
      display: flex;
      align-items: center;
      margin: auto -0.5rem 0;
      font-size: 1.6rem;
      line-height: 1.25;
      position: relative;
      .item {
        width: 3.2rem;
        height: 3.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 0.5rem;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        border-radius: 50%;
        cursor: pointer;
        z-index: 1;
        &.active {
          color: #fff;
        }
      }
      .v-ob-car-highlighter {
        position: absolute;
        min-width: 3.2rem;
        background-color: #043199;
        transition: all 0.15s ease;
        z-index: 0;
        pointer-events: none;
      }
    }
  }
  &.animated-right {
    .img {
      transform: translateX(-100px);
      opacity: 0;
    }
    .text {
      h1, .subtext {
        transform: translateX(-100px);
        opacity: 0;
      }
    }
    &.stop {
      .img {
        transform: translateX(100px);
        transition: none;
      }
      .text {
        h1, .subtext {
          transform: translateX(100px);
          transition: none;
        }
      }
    }
  }
  &.animated-left {
    .img {
      transform: translateX(100px);
      opacity: 0;
    }
    .text {
      h1, .subtext {
        transform: translateX(100px);
        opacity: 0;
      }
    }
    &.stop {
      .img {
        transform: translateX(-100px);
        transition: none;
      }
      .text {
        h1, .subtext {
          transform: translateX(-100px);
          transition: none;
        }
      }
    }
  }

}
@media (max-width: 991px) {
  .v-ob-car-slide {
    flex-direction: column;
    .img {
      margin-right: 0;
      width: 100%;
      height: calc(100vw - 1.8rem);
    }
    .text {
      padding-left: 2rem;
      padding-right: 2rem;
      .subtext {
        margin-bottom: 4rem;
      }
    }
  }
}
</style>
