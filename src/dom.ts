import type { ComponentInternalInstance } from 'vue'

export function getComponentName(instance: ComponentInternalInstance): string {
  const component = instance.type

  if (typeof component === 'object') {
    return component.name ?? component.__name ?? 'AnonymousComponent'
  }

  if (typeof component === 'function') {
    return component.name || 'AnonymousComponent'
  }

  return 'AnonymousComponent'
}

export function getComponentElement(instance: ComponentInternalInstance): Element | null {
  const exposedElement = instance.proxy?.$el

  if (exposedElement instanceof Element) {
    return exposedElement
  }

  const subTreeElement = instance.subTree?.el

  if (subTreeElement instanceof Element) {
    return subTreeElement
  }

  return null
}

export function isInspectableElement(element: Element | null): element is HTMLElement | SVGElement {
  if (!element) return false

  return element instanceof HTMLElement || element instanceof SVGElement
}
