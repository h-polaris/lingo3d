import PooledSpotLight from "../../display/lights/PooledSpotLight"
import SpotLight from "../../display/lights/SpotLight"
import scene from "../../engine/scene"
import createObjectPool from "../utils/createObjectPool"

export const spotLightPool = createObjectPool<
    SpotLight,
    [],
    PooledSpotLight | undefined
>(
    () => {
        const light = new SpotLight()
        light.intensity = 0
        light.$ghost()
        return light
    },
    (light) => {
        light.dispose()
    },
    (light, self) => {
        if (!self) return
        light.distance = self.distance
        light.intensity = self.intensity
        light.color = self.color
        light.shadows = self.shadows
        light.fade = self.fade
        light.angle = self.angle
        light.penumbra = self.penumbra
        light.volumetric = self.volumetric
        light.volumetricDistance = self.volumetricDistance
        self.$innerObject.add(light.$object)
    },
    (light) => {
        light.fade = false
        light.intensity = 0
        scene.add(light.$object)
    }
)
