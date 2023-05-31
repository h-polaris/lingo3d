import Reflector from "../display/Reflector"
import MeshReflectorMaterial from "../display/Reflector/MeshReflectorMaterial"
import { cameraRenderedPtr } from "../pointers/cameraRenderedPtr"
import createSystem from "./utils/createInternalSystem"

export const reflectorSystem = createSystem("reflectorSystem", {
    data: {} as { material: MeshReflectorMaterial },
    update: (_: Reflector, data) => {
        cameraRenderedPtr[0].updateWorldMatrix(true, false)
        data.material.update()
    },
    ticker: "render"
})
