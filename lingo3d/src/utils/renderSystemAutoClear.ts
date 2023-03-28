import { onBeforeRender } from "../events/onBeforeRender"

export default <T>(cb: (target: T) => void, ticker = onBeforeRender) => {
    const queued = new Set<T>()
    ticker(() => {
        for (const target of queued) cb(target)
        queued.clear()
    })
    return <const>[
        (item: T) => queued.add(item),
        (item: T) => queued.delete(item)
    ]
}
