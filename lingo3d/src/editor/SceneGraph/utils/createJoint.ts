import MeshManager from "../../../display/core/MeshManager"
import Joint from "../../../display/Joint"

export default (name: string, manager0: MeshManager, manager1: MeshManager) => {
    const joint = new Joint()
    if (name) joint.name = name
    joint.from = manager0
    joint.to = manager1
}
