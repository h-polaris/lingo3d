import cubeShape from "./cannon/shapes/cubeShape"
import { Quaternion, Vector3 } from "three"
import IPhysics, {
    PhysicsGroupIndex,
    PhysicsOptions,
    PhysicsShape
} from "../../../../interface/IPhysics"
import type { Body } from "cannon-es"
import { Cancellable } from "@lincode/promiselikes"
import { assertExhaustive } from "@lincode/utils"
import PositionedItem from "../../../../api/core/PositionedItem"
import { Point3d } from "@lincode/math"

export default abstract class PhysicsMixin
    extends PositionedItem
    implements IPhysics
{
    protected _mAV?: Point3d
    private getMAV() {
        return (this._mAV ??= new Point3d(Infinity, Infinity, Infinity))
    }
    public get maxAngularVelocityX() {
        return this._mAV?.x ?? Infinity
    }
    public set maxAngularVelocityX(val) {
        this.getMAV().x = val
    }
    public get maxAngularVelocityY() {
        return this._mAV?.y ?? Infinity
    }
    public set maxAngularVelocityY(val) {
        this.getMAV().y = val
    }
    public get maxAngularVelocityZ() {
        return this._mAV?.z ?? Infinity
    }
    public set maxAngularVelocityZ(val) {
        this.getMAV().z = val
    }

    protected _mV?: Point3d
    private getMV() {
        return (this._mV ??= new Point3d(Infinity, Infinity, Infinity))
    }
    public get maxVelocityX() {
        return this._mV?.x ?? Infinity
    }
    public set maxVelocityX(val) {
        this.getMV().x = val
    }
    public get maxVelocityY() {
        return this._mV?.y ?? Infinity
    }
    public set maxVelocityY(val) {
        this.getMV().y = val
    }
    public get maxVelocityZ() {
        return this._mV?.z ?? Infinity
    }
    public set maxVelocityZ(val) {
        this.getMV().z = val
    }

    protected physicsUpdate?: {
        position?: { x?: boolean; y?: boolean; z?: boolean }
        rotation?: { x?: boolean; y?: boolean; z?: boolean }
    }
    protected physicsRotate() {
        if (!this.physicsUpdate) return
        const rotation = (this.physicsUpdate.rotation ??= {})
        rotation.x = true
        rotation.y = true
        rotation.z = true
    }
    protected physicsMove() {
        if (!this.physicsUpdate) return
        const position = (this.physicsUpdate.position ??= {})
        position.x = true
        position.y = true
        position.z = true
    }
    protected physicsMoveXZ() {
        if (!this.physicsUpdate) return
        const position = (this.physicsUpdate.position ??= {})
        position.x = true
        position.z = true
    }

    protected cannonBody?: Body

    public applyForce(x: number, y: number, z: number) {
        setTimeout(() => this.cannonBody?.applyForce({ x, y, z } as any))
    }

    public applyImpulse(x: number, y: number, z: number) {
        setTimeout(() => this.cannonBody?.applyImpulse({ x, y, z } as any))
    }

    public applyLocalForce(x: number, y: number, z: number) {
        setTimeout(() => this.cannonBody?.applyLocalForce({ x, y, z } as any))
    }

    public applyLocalImpulse(x: number, y: number, z: number) {
        setTimeout(() => this.cannonBody?.applyLocalImpulse({ x, y, z } as any))
    }

    public applyTorque(x: number, y: number, z: number) {
        setTimeout(() => this.cannonBody?.applyTorque({ x, y, z } as any))
    }

    public get velocity(): Point3d {
        if (this.bvhVelocity) return this.bvhVelocity

        if (this.cannonBody) return this.cannonBody.velocity

        return new Point3d(0, 0, 0)
    }
    public set velocity(val) {
        if (this.bvhVelocity) Object.assign(this.bvhVelocity, val)
        else if (this.cannonBody) Object.assign(this.cannonBody.velocity, val)
    }

    private refreshCannon() {
        this.physicsUpdate && (this.physics = this._physics ?? false)
    }

    protected _noTumble?: boolean
    public get noTumble() {
        return this._noTumble
    }
    public set noTumble(val) {
        this._noTumble = val
        this.refreshCannon()
    }

    protected _slippery?: boolean
    public get slippery() {
        return this._slippery
    }
    public set slippery(val) {
        this._slippery = val
        this.refreshCannon()
    }

    protected _mass?: number
    public get mass() {
        return this._mass
    }
    public set mass(val) {
        this._mass = val
        this.refreshCannon()
    }

    protected _physicsGroup?: PhysicsGroupIndex
    public get physicsGroup() {
        return this._physicsGroup
    }
    public set physicsGroup(val) {
        this._physicsGroup = val
        this.refreshCannon()
    }

    protected _ignorePhysicsGroups?: Array<PhysicsGroupIndex>
    public get ignorePhysicsGroups() {
        return this._ignorePhysicsGroups
    }
    public set ignorePhysicsGroups(val) {
        this._ignorePhysicsGroups = val
        this.refreshCannon()
    }

    protected _physicsShape?: PhysicsShape
    public get physicsShape() {
        return (this._physicsShape ??= cubeShape)
    }
    public set physicsShape(val) {
        this._physicsShape = val
        this.refreshCannon()
    }

    protected bvhVelocity?: Vector3
    protected bvhOnGround?: boolean
    protected bvhRadius?: number
    protected bvhHalfHeight?: number
    protected bvhMap?: boolean
    protected bvhCharacter?: boolean
    protected bvhQuaternion?: Quaternion

    protected initPhysics(val: PhysicsOptions, handle: Cancellable) {
        if (!val || handle.done) return

        switch (val) {
            case true:
            case "2d":
                import("./enableCannon").then((module) =>
                    module.default.call(this, handle)
                )
                break

            case "map":
                this.bvhMap = true
                import("./enableBVHMap").then((module) =>
                    module.default.call(this, handle, false)
                )
                break

            case "map-debug":
                this.bvhMap = true
                import("./enableBVHMap").then((module) =>
                    module.default.call(this, handle, true)
                )
                break

            case "character":
                this.bvhCharacter = true
                import("./enableBVHCharacter").then((module) =>
                    module.default.call(this, handle)
                )
                break

            default:
                assertExhaustive(val)
        }
    }
    protected _physics?: PhysicsOptions
    public get physics() {
        return this._physics ?? false
    }
    public set physics(val) {
        if (this._physics === val) return
        this._physics = val

        this.initPhysics(
            val,
            this.cancelHandle("physics", () => new Cancellable())!
        )
    }

    protected _gravity?: boolean
    public get gravity() {
        return this._gravity ?? true
    }
    public set gravity(val) {
        this._gravity = val
    }
}
