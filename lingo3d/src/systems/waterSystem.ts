import { dtPtr } from "../pointers/dtPtr"
import renderSystem from "./utils/renderSystem"
import Water from "../display/Water"

export const [addWaterSystem, deleteWaterSystem] = renderSystem(
    (self: Water) => {
        const water = self.$water
        if (!water) return
        water.material.uniforms["time"].value += dtPtr[0] * self.speed
    }
)
