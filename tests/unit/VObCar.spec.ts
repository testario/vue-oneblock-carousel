import { nextTick } from "vue"
import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import VObCar from "@/components/VObCar.vue"

const slides = [
  {
    id: "slide-1",
    cover: "/slide-1.jpg",
    title: "First simple title for example",
    text: "First simple text for example too"
  },
  {
    id: "slide-2",
    cover: "/slide-2.jpg",
    title: "Second simple title for example",
    text: "Second simple text for example too"
  }
]

interface MountProps {
  animationType?: "" | "oneway"
  autoplay?: boolean
  autoplayInterval?: number
  slides?: typeof slides
}

function getElementStyle(selector: string, wrapper: Awaited<ReturnType<typeof mountComponent>>) {
  return (wrapper.get(selector).element as HTMLElement).style
}

async function mountComponent(props: MountProps = {}) {
  const wrapper = mount(VObCar, {
    props: {
      slides,
      ...props
    }
  })

  await nextTick()

  return wrapper
}

function createPointerLikeEvent(
  type: string,
  {
    clientX,
    clientY,
    pointerId = 1,
    pointerType = "touch"
  }: {
    clientX: number
    clientY: number
    pointerId?: number
    pointerType?: string
  }
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    button: 0
  })

  Object.defineProperty(event, "pointerId", {
    configurable: true,
    value: pointerId
  })
  Object.defineProperty(event, "pointerType", {
    configurable: true,
    value: pointerType
  })

  return event
}

async function dispatchPointerLikeEvent(
  wrapper: Awaited<ReturnType<typeof mountComponent>>,
  type: string,
  {
    clientX,
    clientY,
    pointerId = 1,
    pointerType = "touch"
  }: {
    clientX: number
    clientY: number
    pointerId?: number
    pointerType?: string
  }
) {
  wrapper.get(".v-ob-car").element.dispatchEvent(createPointerLikeEvent(type, {
    clientX,
    clientY,
    pointerId,
    pointerType
  }))

  await nextTick()
}

async function triggerSwipe(
  wrapper: Awaited<ReturnType<typeof mountComponent>>,
  {
    startX,
    endX,
    startY = 100,
    endY = startY,
    pointerType = "touch"
  }: {
    startX: number
    endX: number
    startY?: number
    endY?: number
    pointerType?: string
  }
) {
  await dispatchPointerLikeEvent(wrapper, "pointerdown", {
    pointerId: 1,
    pointerType,
    clientX: startX,
    clientY: startY
  })

  await dispatchPointerLikeEvent(wrapper, "pointermove", {
    pointerId: 1,
    pointerType,
    clientX: endX,
    clientY: endY
  })

  await dispatchPointerLikeEvent(wrapper, "pointerup", {
    pointerId: 1,
    pointerType,
    clientX: endX,
    clientY: endY
  })
}

describe("VObCar", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders the first slide by default", async () => {
    const wrapper = await mountComponent()
    const highlighter = getElementStyle(".v-ob-car-highlighter", wrapper)

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")
    expect(wrapper.find(".subtext-item").text()).toBe("First simple text for example too")
    expect(wrapper.findAll(".item")).toHaveLength(2)
    expect(wrapper.findAll(".item")[0].classes()).toContain("active")
    expect(highlighter.left).toBe("0px")
    expect(highlighter.width).toBe("32px")
  })

  it("switches to the next slide and completes the right animation", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent({
      animationType: "oneway"
    })

    await wrapper.findAll(".item")[1].trigger("click")

    expect(wrapper.find(".v-ob-car-slide").classes()).toContain("animated-right")
    expect(wrapper.findAll(".item")[1].classes()).toContain("active")
    expect(getElementStyle(".v-ob-car-highlighter", wrapper).width).toBe("32px")

    await vi.advanceTimersByTimeAsync(0)
    await nextTick()

    expect(getElementStyle(".v-ob-car-highlighter", wrapper).width).toBe("78px")

    await vi.advanceTimersByTimeAsync(150)
    await nextTick()

    expect(wrapper.find(".v-ob-car-slide").classes()).toContain("stop")
    expect(getElementStyle(".v-ob-car-highlighter", wrapper).left).toBe("39px")
    expect(getElementStyle(".v-ob-car-highlighter", wrapper).width).toBe("32px")

    await vi.advanceTimersByTimeAsync(150)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("Second simple title for example")
    expect(wrapper.find(".subtext-item").text()).toBe("Second simple text for example too")
    expect(wrapper.find(".v-ob-car-slide").classes()).not.toContain("animated-right")
    expect(wrapper.findAll(".item")[1].classes()).toContain("active")
    expect(getElementStyle(".v-ob-car-highlighter", wrapper).left).toBe("39px")
    expect(getElementStyle(".v-ob-car-highlighter", wrapper).width).toBe("32px")
  })

  it("animates back to the left when returning to the first slide", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent({
      animationType: "oneway"
    })

    await wrapper.findAll(".item")[1].trigger("click")
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    await wrapper.findAll(".item")[0].trigger("click")

    expect(wrapper.find(".v-ob-car-slide").classes()).toContain("animated-left")
    expect(getElementStyle(".v-ob-car-highlighter", wrapper).left).toBe("39px")
    expect(getElementStyle(".v-ob-car-highlighter", wrapper).width).toBe("32px")

    await vi.advanceTimersByTimeAsync(0)
    await nextTick()

    expect(getElementStyle(".v-ob-car-highlighter", wrapper).left).toBe("0px")
    expect(getElementStyle(".v-ob-car-highlighter", wrapper).width).toBe("78px")

    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")
    expect(wrapper.findAll(".item")[0].classes()).toContain("active")
  })

  it("ignores clicks on the active dot", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent()

    await wrapper.findAll(".item")[0].trigger("click")

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")
    expect(wrapper.find(".v-ob-car-slide").classes()).toEqual(["v-ob-car-slide"])
    expect(vi.getTimerCount()).toBe(0)
  })

  it("renders slides passed through props", async () => {
    const wrapper = await mountComponent({
      slides: [
        {
          id: "custom-slide",
          cover: "/custom.jpg",
          title: "Custom title",
          text: "Custom text"
        }
      ]
    })

    expect(wrapper.find(".ico-tit").text()).toBe("Custom title")
    expect(wrapper.find(".subtext-item").text()).toBe("Custom text")
    expect(wrapper.findAll(".item")).toHaveLength(1)
  })

  it("automatically switches slides using the configured interval", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent({
      autoplay: true,
      autoplayInterval: 1000
    })

    await vi.advanceTimersByTimeAsync(1300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("Second simple title for example")
    expect(wrapper.findAll(".item")[1].classes()).toContain("active")
  })

  it("loops autoplay from the last slide back to the first", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent({
      autoplay: true,
      autoplayInterval: 1000
    })

    await vi.advanceTimersByTimeAsync(1300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("Second simple title for example")

    await vi.advanceTimersByTimeAsync(1300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")
    expect(wrapper.findAll(".item")[0].classes()).toContain("active")
  })

  it("pauses autoplay on hover and resumes it after mouse leave", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent({
      autoplay: true,
      autoplayInterval: 1000
    })

    await wrapper.get(".v-ob-car").trigger("mouseenter")
    await vi.advanceTimersByTimeAsync(1500)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")

    await wrapper.get(".v-ob-car").trigger("mouseleave")
    await vi.advanceTimersByTimeAsync(1300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("Second simple title for example")
  })

  it("restarts autoplay after a manual slide switch", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent({
      autoplay: true,
      autoplayInterval: 1000
    })

    await vi.advanceTimersByTimeAsync(500)
    await wrapper.findAll(".item")[1].trigger("click")
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("Second simple title for example")

    await vi.advanceTimersByTimeAsync(700)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("Second simple title for example")

    await vi.advanceTimersByTimeAsync(600)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")
  })

  it("switches to the next slide on a left swipe", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent({
      animationType: "oneway"
    })

    await triggerSwipe(wrapper, {
      startX: 220,
      endX: 120
    })

    expect(wrapper.find(".v-ob-car-slide").classes()).toContain("animated-right")
    expect(wrapper.findAll(".item")[1].classes()).toContain("active")

    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("Second simple title for example")
    expect(wrapper.findAll(".item")[1].classes()).toContain("active")
  })

  it("switches back to the previous slide on a right swipe", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent({
      animationType: "oneway"
    })

    await triggerSwipe(wrapper, {
      startX: 220,
      endX: 120
    })
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    await triggerSwipe(wrapper, {
      startX: 120,
      endX: 220
    })

    expect(wrapper.find(".v-ob-car-slide").classes()).toContain("animated-left")
    expect(wrapper.findAll(".item")[0].classes()).toContain("active")

    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")
    expect(wrapper.findAll(".item")[0].classes()).toContain("active")
  })

  it("does not switch slides on a short drag", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent()

    await triggerSwipe(wrapper, {
      startX: 220,
      endX: 180
    })
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")
    expect(wrapper.find(".v-ob-car-slide").classes()).toEqual(["v-ob-car-slide"])
    expect(vi.getTimerCount()).toBe(0)
  })

  it("ignores mostly vertical drag gestures", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent()

    await triggerSwipe(wrapper, {
      startX: 120,
      endX: 132,
      startY: 100,
      endY: 220
    })
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")
    expect(wrapper.find(".v-ob-car").classes()).toEqual(["v-ob-car"])
    expect(vi.getTimerCount()).toBe(0)
  })

  it("pauses autoplay during drag and restarts it after a cancelled swipe", async () => {
    vi.useFakeTimers()

    const wrapper = await mountComponent({
      autoplay: true,
      autoplayInterval: 1000
    })

    await vi.advanceTimersByTimeAsync(500)

    await dispatchPointerLikeEvent(wrapper, "pointerdown", {
      clientX: 220,
      clientY: 100,
      pointerId: 1,
      pointerType: "touch"
    })

    await vi.advanceTimersByTimeAsync(800)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")

    await dispatchPointerLikeEvent(wrapper, "pointermove", {
      clientX: 190,
      clientY: 100,
      pointerId: 1,
      pointerType: "touch"
    })
    await dispatchPointerLikeEvent(wrapper, "pointerup", {
      clientX: 190,
      clientY: 100,
      pointerId: 1,
      pointerType: "touch"
    })

    await vi.advanceTimersByTimeAsync(900)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("First simple title for example")

    await vi.advanceTimersByTimeAsync(400)
    await nextTick()

    expect(wrapper.find(".ico-tit").text()).toBe("Second simple title for example")
  })

  it("does not start autoplay for empty or single-slide collections", async () => {
    vi.useFakeTimers()

    const emptyWrapper = await mountComponent({
      autoplay: true,
      slides: []
    })

    expect(emptyWrapper.find(".v-ob-car-slide").exists()).toBe(false)
    expect(vi.getTimerCount()).toBe(0)

    emptyWrapper.unmount()

    const singleSlideWrapper = await mountComponent({
      autoplay: true,
      slides: [
        {
          id: "custom-slide",
          cover: "/custom.jpg",
          title: "Custom title",
          text: "Custom text"
        }
      ]
    })

    await vi.advanceTimersByTimeAsync(6000)
    await nextTick()

    expect(singleSlideWrapper.find(".ico-tit").text()).toBe("Custom title")
    expect(vi.getTimerCount()).toBe(0)
  })

  it("allows replacing a separate slide part through scoped slots", async () => {
    const wrapper = mount(VObCar, {
      props: {
        slides
      },
      slots: {
        title: `
          <template #title="{ slide, index }">
            <h2 class="custom-title">{{ index + 1 }}. {{ slide.title.toUpperCase() }}</h2>
          </template>
        `
      }
    })

    await nextTick()

    expect(wrapper.find(".custom-title").text()).toBe("1. FIRST SIMPLE TITLE FOR EXAMPLE")
    expect(wrapper.find(".ico-tit").exists()).toBe(false)
  })

  it("allows fully reordering slide content through the slide slot", async () => {
    vi.useFakeTimers()

    const wrapper = mount(VObCar, {
      props: {
        slides
      },
      slots: {
        slide: `
          <template #slide="{ slide, goToSlide, slides, activeDotIndex }">
            <div class="custom-layout">
              <button class="custom-next" type="button" @click="goToSlide(1)">Next</button>
              <div class="custom-text">{{ slide.text }}</div>
              <div class="custom-title">{{ slide.title }}</div>
              <div class="custom-state">{{ activeDotIndex }}/{{ slides.length }}</div>
            </div>
          </template>
        `
      }
    })

    expect(wrapper.find(".custom-layout").exists()).toBe(true)
    expect(wrapper.find(".img").exists()).toBe(false)
    expect(wrapper.find(".text").exists()).toBe(false)
    expect(wrapper.find(".custom-text").text()).toBe("First simple text for example too")

    await wrapper.find(".custom-next").trigger("click")
    await vi.advanceTimersByTimeAsync(300)
    await nextTick()

    expect(wrapper.find(".custom-title").text()).toBe("Second simple title for example")
    expect(wrapper.find(".custom-state").text()).toBe("1/2")
  })

  it("renders the not-found slot when the slides array is empty", async () => {
    const wrapper = mount(VObCar, {
      props: {
        slides: []
      },
      slots: {
        "not-found": `
          <template #not-found="{ slides }">
            <div class="empty-state">Slides count: {{ slides.length }}</div>
          </template>
        `
      }
    })

    await nextTick()

    expect(wrapper.find(".v-ob-car-slide").exists()).toBe(false)
    expect(wrapper.find(".empty-state").text()).toBe("Slides count: 0")
  })
})
