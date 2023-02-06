import { Object3D, PropertyBinding, Quaternion, Vector3 } from "three"
import { emitName } from "../../events/onName"
import IMeshAppendable from "../../interface/IMeshAppendable"
import { setManager } from "../utils/getManager"
import Appendable from "./Appendable"

export default class MeshAppendable<T extends Object3D = Object3D>
    extends Appendable
    implements IMeshAppendable
{
    public object3d: T
    public position: Vector3
    public quaternion: Quaternion
    public userData: Record<string, any>

    public constructor(public outerObject3d: T = new Object3D() as T) {
        super()
        setManager(outerObject3d, this)
        this.object3d = outerObject3d
        this.position = outerObject3d.position
        this.quaternion = outerObject3d.quaternion
        this.userData = outerObject3d.userData
    }

    public declare parent?: MeshAppendable
    public declare children?: Set<Appendable | MeshAppendable>

    public declare traverse: (
        cb: (appendable: Appendable | MeshAppendable) => void
    ) => void

    public declare traverseSome: (
        cb: (appendable: Appendable | MeshAppendable) => unknown
    ) => boolean

    public override append(child: Appendable | MeshAppendable) {
        this._append(child)
        "outerObject3d" in child && this.outerObject3d.add(child.outerObject3d)
    }

    public attach(child: Appendable | MeshAppendable) {
        this._append(child)
        "outerObject3d" in child &&
            this.outerObject3d.attach(child.outerObject3d)
    }

    protected override _dispose() {
        super._dispose()
        this.outerObject3d.parent?.remove(this.outerObject3d)
    }

    public get name() {
        return this.outerObject3d.name
    }
    public set name(val) {
        this.outerObject3d.name = PropertyBinding.sanitizeNodeName(val)
        emitName(this)
    }
}
