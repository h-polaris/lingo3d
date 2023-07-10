import { forceGetInstance } from "@lincode/utils"
import VisibleMixin from "../display/core/mixins/VisibleMixin"
import { HitEvent } from "../interface/IVisible"
import Appendable from "../display/core/Appendable"
import MeshAppendable from "../display/core/MeshAppendable"
import createInternalSystem from "./utils/createInternalSystem"
import { userIdMap } from "../collections/idCollections"

const getAppendables = (val: string | Array<string> | undefined) => {
    if (!val) return []
    if (typeof val === "string") return userIdMap.get(val) ?? []
    const result: Array<Appendable | MeshAppendable> = []
    for (const id of val)
        for (const appendable of userIdMap.get(id) ?? [])
            result.push(appendable)
    return result
}

const hitCache = new WeakMap<VisibleMixin, WeakSet<VisibleMixin>>()

export const hitTestSystem = createInternalSystem("hitTestSystem", {
    update: (self: VisibleMixin) => {
        for (const target of getAppendables(self.hitTarget)) {
            if (!("$object" in target)) return
            const cache = forceGetInstance(hitCache, self, WeakSet)
            if (self.hitTest(target)) {
                if (!cache.has(target)) {
                    cache.add(target)
                    self.onHitStart?.(new HitEvent(target))
                }
                self.onHit?.(new HitEvent(target))
                continue
            }
            if (!cache.has(target)) continue
            cache.delete(target)
            self.onHitEnd?.(new HitEvent(target))
        }
    }
})
