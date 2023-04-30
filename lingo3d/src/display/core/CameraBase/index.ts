import { CameraHelper, PerspectiveCamera, Quaternion } from "three"
import ObjectManager from "../ObjectManager"
import { ray, euler, quaternion, quaternion_ } from "../../utils/reusables"
import ICameraBase, { MouseControl } from "../../../interface/ICameraBase"
import { deg2Rad } from "@lincode/math"
import { MIN_POLAR_ANGLE, MAX_POLAR_ANGLE, PI, PI_HALF } from "../../../globals"
import { Reactive } from "@lincode/reactivity"
import { Cancellable } from "@lincode/promiselikes"
import scene from "../../../engine/scene"
import { pushCameraList, pullCameraList } from "../../../states/useCameraList"
import {
    pullCameraStack,
    pushCameraStack
} from "../../../states/useCameraStack"
import getWorldPosition from "../../../utilsCached/getWorldPosition"
import getWorldQuaternion from "../../../utilsCached/getWorldQuaternion"
import getWorldDirection from "../../../utilsCached/getWorldDirection"
import HelperSprite from "../utils/HelperSprite"
import { setManager } from "../../../api/utils/getManager"
import MeshAppendable from "../../../api/core/MeshAppendable"
import { getEditorHelper } from "../../../states/useEditorHelper"
import { getCameraRendered } from "../../../states/useCameraRendered"
import { addGyrateResetSystem } from "../../../systems/configSystems/gyrateResetSystem"
import { cameraRenderedPtr } from "../../../pointers/cameraRenderedPtr"
import { Point3dType } from "../../../utils/isPoint"
import { ssrExcludeSet } from "../../../collections/ssrExcludeSet"
import {
    addGyrateInertiaSystem,
    deleteGyrateInertiaSystem
} from "../../../systems/gyrateInertiaSystem"
import { addConfigCameraSystem } from "../../../systems/configSystems/configCameraSystem"
import { cameraTransitionSet } from "../../../collections/cameraTransitionSet"

export default abstract class CameraBase<
        T extends PerspectiveCamera = PerspectiveCamera
    >
    extends ObjectManager
    implements ICameraBase
{
    public midObject3d = this.outerObject3d

    public constructor(public $camera: T) {
        super()
        this.object3d.add($camera)
        setManager($camera, this)

        pushCameraList($camera)
        this.then(() => {
            pullCameraStack($camera)
            pullCameraList($camera)
        })

        this.createEffect(() => {
            if (
                !getEditorHelper() ||
                cameraRenderedPtr[0] === $camera ||
                this.disableSceneGraph
            )
                return

            const helper = new CameraHelper($camera)
            ssrExcludeSet.add(helper)
            scene.add(helper)

            const sprite = new HelperSprite("camera", this)
            helper.add(sprite.outerObject3d)
            return () => {
                helper.dispose()
                ssrExcludeSet.delete(helper)
                scene.remove(helper)
                sprite.dispose()
            }
        }, [getEditorHelper, getCameraRendered])
    }

    //@ts-ignore
    public override lookAt(target: MeshAppendable | Point3dType): void
    public override lookAt(x: number, y: number | undefined, z: number): void
    public override lookAt(a0: any, a1?: any, a2?: any) {
        super.lookAt(a0, a1, a2)
        const angle = euler.setFromQuaternion(this.quaternion)
        angle.x += PI
        angle.z += PI
        this.outerObject3d.setRotationFromEuler(angle)
    }

    private _fov = 75
    public get fov() {
        return this._fov
    }
    public set fov(val) {
        this._fov = val
        addConfigCameraSystem(this)
    }

    private _zoom = 1
    public get zoom() {
        return this._zoom
    }
    public set zoom(val) {
        this._zoom = val
        addConfigCameraSystem(this)
    }

    private _active?: boolean
    public get active() {
        return !!this._active
    }
    public set active(val) {
        this._active = val
        pullCameraStack(this.$camera)
        val && pushCameraStack(this.$camera)
    }

    public get transition() {
        return cameraTransitionSet.has(this.$camera)
    }
    public set transition(val) {
        val
            ? cameraTransitionSet.add(this.$camera)
            : cameraTransitionSet.delete(this.$camera)
    }

    protected override getRay() {
        return ray.set(
            getWorldPosition(this.$camera),
            getWorldDirection(this.$camera)
        )
    }

    protected orbitMode?: boolean

    public $gyrate(movementX: number, movementY: number, inner?: boolean) {
        const manager = inner ? this.object3d : this.midObject3d
        euler.setFromQuaternion(manager.quaternion)

        euler.y -= movementX * 0.002
        euler.y = Math.max(
            PI_HALF - this._maxAzimuthAngle * deg2Rad,
            Math.min(PI_HALF - this._minAzimuthAngle * deg2Rad, euler.y)
        )
        euler.x -= movementY * 0.002
        euler.x = Math.max(
            PI_HALF - this._maxPolarAngle * deg2Rad,
            Math.min(PI_HALF - this._minPolarAngle * deg2Rad, euler.x)
        )
        manager.setRotationFromEuler(euler)
    }

    public gyrate(movementX: number, movementY: number, inertia = true) {
        const _inertia = this.inertia && inertia && (movementX || movementY)
        if (_inertia) {
            movementX *= 0.5
            movementY *= 0.5
        }
        if (this.orbitMode) this.$gyrate(movementX, movementY)
        else {
            this.$gyrate(movementX, 0)
            this.$gyrate(0, movementY, true)
        }
        _inertia
            ? addGyrateInertiaSystem(this, { factor: 1, movementX, movementY })
            : deleteGyrateInertiaSystem(this)
    }

    private _minPolarAngle = MIN_POLAR_ANGLE
    public get minPolarAngle() {
        return this._minPolarAngle
    }
    public set minPolarAngle(val) {
        this._minPolarAngle = val
        addGyrateResetSystem(this)
    }

    private _maxPolarAngle = MAX_POLAR_ANGLE
    public get maxPolarAngle() {
        return this._maxPolarAngle
    }
    public set maxPolarAngle(val) {
        this._maxPolarAngle = val
        addGyrateResetSystem(this)
    }

    private _minAzimuthAngle = -Infinity
    public get minAzimuthAngle() {
        return this._minAzimuthAngle
    }
    public set minAzimuthAngle(val) {
        this._minAzimuthAngle = val
        addGyrateResetSystem(this)
    }

    private _maxAzimuthAngle = Infinity
    public get maxAzimuthAngle() {
        return this._maxAzimuthAngle
    }
    public set maxAzimuthAngle(val) {
        this._maxAzimuthAngle = val
        addGyrateResetSystem(this)
    }

    public setPolarAngle(angle: number) {
        const { _minPolarAngle, _maxPolarAngle } = this
        this.minPolarAngle = this.maxPolarAngle = angle
        queueMicrotask(() => {
            if (this.done) return
            this.minPolarAngle = _minPolarAngle
            this.maxPolarAngle = _maxPolarAngle
        })
    }

    public setAzimuthAngle(angle: number) {
        const { _minAzimuthAngle, _maxAzimuthAngle } = this
        this.minAzimuthAngle = this.maxAzimuthAngle = angle
        queueMicrotask(() => {
            if (this.done) return
            this.minAzimuthAngle = _minAzimuthAngle
            this.maxAzimuthAngle = _maxAzimuthAngle
        })
    }

    private _polarAngle?: number
    public get polarAngle() {
        return this._polarAngle
    }
    public set polarAngle(val) {
        this._polarAngle = val
        val && this.setPolarAngle(val)
    }

    private _azimuthAngle?: number
    public get azimuthAngle() {
        return this._azimuthAngle
    }
    public set azimuthAngle(val) {
        this._azimuthAngle = val
        val && this.setAzimuthAngle(val)
    }

    public inertia = false

    protected mouseControlState = new Reactive<MouseControl>(false)
    private mouseControlInit?: boolean
    public get mouseControl() {
        return this.mouseControlState.get()
    }
    public set mouseControl(val) {
        this.mouseControlState.set(val)

        if (!val || this.mouseControlInit) return
        this.mouseControlInit = true

        import("./enableMouseControl").then((module) =>
            module.default.call(this)
        )
    }

    private _gyroControl?: boolean
    public get gyroControl() {
        return !!this._gyroControl
    }
    public set gyroControl(val) {
        this._gyroControl = val

        const deviceEuler = euler
        const deviceQuaternion = quaternion
        const screenTransform = quaternion_
        const worldTransform = new Quaternion(
            -Math.sqrt(0.5),
            0,
            0,
            Math.sqrt(0.5)
        )

        const quat = getWorldQuaternion(this.object3d)
        const orient = 0

        const cb = (e: DeviceOrientationEvent) => {
            this.object3d.quaternion.copy(quat)
            deviceEuler.set(
                (e.beta ?? 0) * deg2Rad,
                (e.alpha ?? 0) * deg2Rad,
                -(e.gamma ?? 0) * deg2Rad,
                "YXZ"
            )

            this.object3d.quaternion.multiply(
                deviceQuaternion.setFromEuler(deviceEuler)
            )

            const minusHalfAngle = -orient * 0.5
            screenTransform.set(
                0,
                Math.sin(minusHalfAngle),
                0,
                Math.cos(minusHalfAngle)
            )

            this.object3d.quaternion.multiply(screenTransform)
            this.object3d.quaternion.multiply(worldTransform)
        }
        val && window.addEventListener("deviceorientation", cb)
        this.cancelHandle(
            "gyroControl",
            val &&
                (() =>
                    new Cancellable(() =>
                        window.removeEventListener("deviceorientation", cb)
                    ))
        )
    }
}
