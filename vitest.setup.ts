class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

function resolveSlideIndex(element?: HTMLElement | null): number {
  return Number(element?.dataset?.slideId ?? 0)
}

Object.defineProperty(window, "ResizeObserver", {
  configurable: true,
  writable: true,
  value: ResizeObserverMock
})

Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
  configurable: true,
  get() {
    return resolveSlideIndex(this) * 39
  }
})

Object.defineProperty(HTMLElement.prototype, "offsetTop", {
  configurable: true,
  get() {
    return 0
  }
})
