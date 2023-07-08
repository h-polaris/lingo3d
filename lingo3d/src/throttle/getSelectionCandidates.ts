import { Object3D } from "three"
import Appendable from "../display/core/Appendable"
import MeshAppendable from "../display/core/MeshAppendable"
import { appendableRoot } from "../collections/appendableRoot"
import { selectionCandidates } from "../collections/selectionCandidates"
import { StandardMesh } from "../display/core/mixins/TexturedStandardMixin"
import VisibleMixin from "../display/core/mixins/VisibleMixin"
import { emitSelectionTarget } from "../events/onSelectionTarget"
import { getSelectionFocus } from "../states/useSelectionFocus"
import { getSelectionFrozen } from "../states/useSelectionFrozen"
import throttleFrameTrailing from "./utils/throttleFrameTrailing"
import { selectionFrozenSet } from "../collections/selectionFrozenSet"
import { getFoundManager } from "../display/core/utils/getFoundManager"

const traverse = (
    targets: Array<Appendable | VisibleMixin> | Set<Appendable | VisibleMixin>
) => {
    for (const manager of targets) {
        if (selectionFrozenSet.has(manager) || manager.$disableSelection)
            continue
        "onClick" in manager && selectionCandidates.add(manager.$innerObject)
        manager.children && traverse(manager.children)
    }
}

const traverseFocusChildren = (selectionFocus: MeshAppendable) => {
    selectionFocus.$object.traverse((child: Object3D | StandardMesh) => {
        if (
            child === selectionFocus.$object ||
            child === selectionFocus.$innerObject ||
            child.type === "Line"
        )
            return
        const manager = getFoundManager(child, selectionFocus as any)
        if (selectionFrozenSet.has(manager) || manager.$disableSelection) return
        selectionCandidates.add(manager.$innerObject)
    })
}

export const getSelectionCandidates = throttleFrameTrailing(() => {
    selectionCandidates.clear()
    const selectionFocus = getSelectionFocus()
    if (selectionFocus)
        selectionFocus instanceof MeshAppendable &&
            traverseFocusChildren(selectionFocus)
    else traverse(appendableRoot)
})

getSelectionFrozen(() => {
    getSelectionCandidates()
    emitSelectionTarget(undefined)
})
