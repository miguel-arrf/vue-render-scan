import type { VueScanRenderEvent, VueScanResolvedOptions, VueScanStats } from './types'
import { isInspectableElement } from './dom'

const rootId = 'vue-render-scan-root'

export interface VueScanOverlay {
  clear: () => void
  destroy: () => void
  flash: (event: VueScanRenderEvent, options: VueScanResolvedOptions) => void
  updateToolbar: (stats: VueScanStats, options: VueScanResolvedOptions) => void
}

export function createOverlay(): VueScanOverlay {
  if (typeof document === 'undefined') {
    return {
      clear: () => {},
      destroy: () => {},
      flash: () => {},
      updateToolbar: () => {}
    }
  }

  const root = document.createElement('div')
  root.id = rootId
  root.style.pointerEvents = 'none'
  root.style.position = 'fixed'
  root.style.inset = '0'
  root.style.zIndex = '2147483647'

  const toolbar = document.createElement('div')
  toolbar.style.position = 'fixed'
  toolbar.style.right = '12px'
  toolbar.style.bottom = '12px'
  toolbar.style.display = 'none'
  toolbar.style.alignItems = 'center'
  toolbar.style.gap = '8px'
  toolbar.style.maxWidth = 'calc(100vw - 24px)'
  toolbar.style.border = '1px solid rgba(255, 255, 255, 0.14)'
  toolbar.style.borderRadius = '8px'
  toolbar.style.background = 'rgba(16, 20, 24, 0.92)'
  toolbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.22)'
  toolbar.style.color = '#f8fafc'
  toolbar.style.font = '12px/1.4 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  toolbar.style.padding = '8px 10px'

  root.appendChild(toolbar)
  document.documentElement.appendChild(root)

  const boxes = new Set<HTMLElement>()

  function clear() {
    for (const box of boxes) {
      box.remove()
    }

    boxes.clear()
  }

  function destroy() {
    clear()
    root.remove()
  }

  function flash(event: VueScanRenderEvent, options: VueScanResolvedOptions) {
    if (!options.showOverlay || !isInspectableElement(event.element)) return

    const rect = event.element.getBoundingClientRect()

    if (rect.width === 0 || rect.height === 0) return

    const box = document.createElement('div')
    box.style.position = 'fixed'
    box.style.left = `${rect.left}px`
    box.style.top = `${rect.top}px`
    box.style.width = `${rect.width}px`
    box.style.height = `${rect.height}px`
    box.style.border = '2px solid #25f4ee'
    box.style.borderRadius = '6px'
    box.style.background = 'rgba(37, 244, 238, 0.12)'
    box.style.boxShadow = '0 0 0 1px rgba(3, 7, 18, 0.2), 0 0 24px rgba(37, 244, 238, 0.42)'
    box.style.transition = 'opacity 600ms ease, transform 600ms ease'

    const label = document.createElement('div')
    label.textContent = `${event.componentName} ${event.type} ${event.duration.toFixed(1)}ms`
    label.style.position = 'absolute'
    label.style.left = '0'
    label.style.top = '-24px'
    label.style.maxWidth = 'min(280px, 90vw)'
    label.style.overflow = 'hidden'
    label.style.textOverflow = 'ellipsis'
    label.style.whiteSpace = 'nowrap'
    label.style.borderRadius = '6px'
    label.style.background = '#031014'
    label.style.color = '#ecfeff'
    label.style.font = '11px/1.3 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    label.style.padding = '4px 6px'

    box.appendChild(label)
    root.appendChild(box)
    boxes.add(box)

    window.requestAnimationFrame(() => {
      box.style.opacity = '0'
      box.style.transform = 'scale(1.015)'
    })

    window.setTimeout(() => {
      boxes.delete(box)
      box.remove()
    }, 650)
  }

  function updateToolbar(stats: VueScanStats, options: VueScanResolvedOptions) {
    toolbar.style.display = options.showToolbar ? 'flex' : 'none'

    if (!options.showToolbar) return

    const last = stats.lastEvent
    toolbar.textContent = last
      ? `Vue Render Scan ${options.enabled ? 'on' : 'off'} | ${stats.eventCount} redraws | ${last.componentName} ${last.duration.toFixed(1)}ms`
      : `Vue Render Scan ${options.enabled ? 'on' : 'off'} | waiting for redraws`
  }

  return {
    clear,
    destroy,
    flash,
    updateToolbar
  }
}
