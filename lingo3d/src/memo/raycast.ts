import { Raycaster, Object3D, Vector3, Vector2 } from "three"
import { getManager } from "../display/core/utils/getManager"
import { actorPtrManagerMap } from "../collections/pxCollections"
import { assignPxVec, assignPxVec_ } from "../engine/physx/pxMath"
import { FAR, M2CM } from "../globals"
import { cameraRenderedPtr } from "../pointers/cameraRenderedPtr"
import { physxPtr } from "../pointers/physxPtr"
import computePerFrameWithData from "./utils/computePerFrameWithData"
import { pt3d0 } from "../display/utils/reusables"
import { point2Vec, vec2Point } from "../display/utils/vec2Point"
import type VisibleMixin from "../display/core/mixins/VisibleMixin"
import { Point3dType } from "../utils/isPoint"
import Point3d from "../math/Point3d"
import MeshAppendable from "../display/core/MeshAppendable"

const raycaster = new Raycaster()

type RaycastResult = {
    point: Point3dType
    distance: number
    normal: Point3dType
    manager: VisibleMixin
}
type RaycastData = {
    pointer?: {
        x: number
        y: number
    }
    origin?: Point3dType
    direction?: Point3dType
    include?: Object3D
    exclude?: MeshAppendable
}
export const raycast = computePerFrameWithData(
    (
        candidates: Set<Object3D>,
        { include, pointer, origin, direction }: RaycastData
    ): RaycastResult | undefined => {
        if (pointer)
            raycaster.setFromCamera(pointer as Vector2, cameraRenderedPtr[0])
        else if (origin && direction)
            raycaster.set(point2Vec(origin), direction as Vector3)

        const candidateArray = [...candidates]
        include && candidateArray.push(include)
        const [intersection] = raycaster.intersectObjects(candidateArray, false)
        const manager = intersection && getManager(intersection.object)

        const pxHit = physxPtr[0].pxRaycast?.(
            assignPxVec(raycaster.ray.origin),
            assignPxVec_(raycaster.ray.direction),
            FAR
        )
        if (pxHit) {
            const pxHitManager = actorPtrManagerMap.get(pxHit.actor.ptr)!
            if (
                candidates.has(pxHitManager.object3d) &&
                (!intersection ||
                    pxHit.distance < intersection.distance ||
                    (manager &&
                        "$loadedObject3d" in manager &&
                        manager.$loadedObject3d))
            ) {
                const { x, y, z } = pxHit.normal
                return {
                    point: vec2Point(pxHit.position),
                    distance: pxHit.distance * M2CM,
                    normal: new Point3d(x, y, z),
                    manager: pxHitManager
                }
            }
        }
        if (intersection)
            return {
                point: vec2Point(intersection.point),
                distance: intersection.distance * M2CM,
                normal: intersection.face?.normal ?? pt3d0,
                manager: manager as VisibleMixin
            }
    }
)
