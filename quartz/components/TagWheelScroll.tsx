import { QuartzComponentConstructor } from "./types"

export default (() => {
  function TagWheelScroll() {
    return null
  }

  TagWheelScroll.afterDOMLoaded = `
document.addEventListener("nav", () => {
  const wrappers = document.querySelectorAll(".tags-scroll")

  for (const wrapper of wrappers) {
    if (!(wrapper instanceof HTMLElement)) continue

    const scroller = wrapper.querySelector(".tags")
    if (!(scroller instanceof HTMLElement)) continue

    const onWheel = (event) => {
      if (event.ctrlKey) return

      const hasHorizontalOverflow = scroller.scrollWidth > scroller.clientWidth + 1
      if (!hasHorizontalOverflow) return

      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY

      if (dominantDelta === 0) return

      const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? scroller.clientWidth
            : 1

      const delta = dominantDelta * multiplier
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth
      const nextScrollLeft = Math.max(
        0,
        Math.min(maxScrollLeft, scroller.scrollLeft + delta),
      )

      if (nextScrollLeft === scroller.scrollLeft) return

      event.preventDefault()
      scroller.scrollLeft = nextScrollLeft
    }

    wrapper.addEventListener("wheel", onWheel, { passive: false })
    window.addCleanup(() => wrapper.removeEventListener("wheel", onWheel))
  }
})
`

  return TagWheelScroll
}) satisfies QuartzComponentConstructor
