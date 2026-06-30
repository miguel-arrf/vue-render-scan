import { afterEach, describe, expect, it } from 'vitest'
import {
  createApp,
  defineComponent,
  h,
  nextTick,
  shallowRef,
  type App as VueApp
} from 'vue'
import {
  getReport,
  getStats,
  scan,
  setOptions,
  type VueScanHandle,
  type VueScanOptions,
  type VueScanRenderEvent
} from '../src'

interface MountedFixture {
  app: VueApp<Element>
  container: HTMLDivElement
  handle: VueScanHandle
  increment: () => Promise<void>
}

const mountedFixtures: MountedFixture[] = []

afterEach(() => {
  for (const fixture of mountedFixtures.splice(0)) {
    fixture.app.unmount()
    fixture.handle.stop()
    fixture.container.remove()
  }

  document.body.innerHTML = ''
})

describe('scan', () => {
  it('detects Vue component update rerenders', async () => {
    const events: VueScanRenderEvent[] = []
    const fixture = mountFixture({
      includeMounts: false,
      only: ['TrackedChild'],
      showOverlay: false,
      showToolbar: false,
      onRender: (event) => events.push(event)
    })

    await nextTick()

    expect(events).toHaveLength(0)

    await fixture.increment()

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      componentName: 'TrackedChild',
      type: 'update'
    })
    expect(events[0]?.element).toBeInstanceOf(HTMLElement)

    expect(fixture.handle.getStats()).toMatchObject({
      enabled: true,
      eventCount: 1
    })
    expect(fixture.handle.getReport()).toEqual([
      expect.objectContaining({
        componentName: 'TrackedChild',
        count: 1,
        lastType: 'update'
      })
    ])
  })

  it('can include first mounts when requested', async () => {
    const events: VueScanRenderEvent[] = []

    mountFixture({
      includeMounts: true,
      only: ['TrackedChild'],
      showOverlay: false,
      showToolbar: false,
      onRender: (event) => events.push(event)
    })

    await nextTick()

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      componentName: 'TrackedChild',
      type: 'mount'
    })
  })

  it('does not emit rerenders while disabled', async () => {
    const events: VueScanRenderEvent[] = []
    const fixture = mountFixture({
      enabled: false,
      includeMounts: false,
      only: ['TrackedChild'],
      showOverlay: false,
      showToolbar: false,
      onRender: (event) => events.push(event)
    })

    await fixture.increment()

    expect(events).toHaveLength(0)
    expect(fixture.handle.getStats()).toMatchObject({
      enabled: false,
      eventCount: 0
    })

    fixture.handle.setOptions({ enabled: true })
    await fixture.increment()

    expect(events).toHaveLength(1)
    expect(events[0]?.type).toBe('update')
  })

  it('honors ignore filters and global report helpers', async () => {
    const events: VueScanRenderEvent[] = []
    const fixture = mountFixture({
      includeMounts: false,
      ignore: ['TrackedChild'],
      showOverlay: false,
      showToolbar: false,
      onRender: (event) => events.push(event)
    })

    await fixture.increment()

    expect(events.some((event) => event.componentName === 'TrackedChild')).toBe(false)
    expect(
      fixture.handle.getReport().some((entry) => entry.componentName === 'TrackedChild')
    ).toBe(false)

    setOptions({
      ignore: [],
      only: ['TrackedChild']
    })
    await fixture.increment()

    expect(getStats()).toMatchObject({
      enabled: true
    })
    expect(getReport()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          componentName: 'TrackedChild',
          count: 1,
          lastType: 'update'
        })
      ])
    )
  })

  it('notifies handle-level render listeners for matching updates', async () => {
    const fixture = mountFixture({
      includeMounts: false,
      showOverlay: false,
      showToolbar: false
    })
    const trackedEvents: VueScanRenderEvent[] = []
    const stopListening = fixture.handle.onRender('TrackedChild', (event) => {
      trackedEvents.push(event)
    })

    await fixture.increment()

    expect(trackedEvents).toHaveLength(1)
    expect(trackedEvents[0]?.componentName).toBe('TrackedChild')

    stopListening()
    await fixture.increment()

    expect(trackedEvents).toHaveLength(1)
  })
})

function mountFixture(options: VueScanOptions = {}): MountedFixture {
  const count = shallowRef(0)

  const TrackedChild = defineComponent({
    name: 'TrackedChild',
    props: {
      count: {
        type: Number,
        required: true
      }
    },
    setup(props) {
      return () => h('span', { 'data-testid': 'tracked-child' }, props.count)
    }
  })

  const IgnoredChild = defineComponent({
    name: 'IgnoredChild',
    setup() {
      return () => h('span', { 'data-testid': 'ignored-child' }, 'static')
    }
  })

  const RootFixture = defineComponent({
    name: 'RootFixture',
    setup(_, { expose }) {
      function increment() {
        count.value += 1
      }

      expose({ increment })

      return () => h('div', [
        h(TrackedChild, { count: count.value }),
        h(IgnoredChild)
      ])
    }
  })

  const container = document.createElement('div')
  document.body.appendChild(container)

  const app = createApp(RootFixture)
  const handle = scan(app, options)
  const root = app.mount(container) as unknown as { increment: () => void }

  const fixture: MountedFixture = {
    app,
    container,
    handle,
    increment: async () => {
      root.increment()
      await nextTick()
      await nextTick()
    }
  }

  mountedFixtures.push(fixture)

  return fixture
}
