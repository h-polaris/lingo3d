import { Cancellable } from "@lincode/promiselikes"
import { createEffect } from "@lincode/reactivity"
import { HemisphereLight, DirectionalLight, EquirectangularReflectionMapping } from "three"
import loadTexture from "../../display/utils/loaders/loadTexture"
import { getDefaultLight } from "../../states/useDefaultLight"
import { getDefaultLightScale } from "../../states/useDefaultLightScale"
import scene from "./scene"

export default {}

createEffect(() => {
    const defaultLight = getDefaultLight()
    if (!defaultLight) return

    const scale = getDefaultLightScale()

    if (typeof defaultLight === "string" && defaultLight !== "default") {
        if (defaultLight === "studio") {
            const handle = new Cancellable()
            import("../../display/lights/BoxLight").then(({ default: BoxLight }) => {
                if (handle.done) return

                const light = new BoxLight()
                light.then(() => light.dispose())
            })
            return () => {
                handle.cancel()
            }
        }
        let proceed = true
        const texture = loadTexture(defaultLight, () => proceed && (scene.environment = texture))
        texture.mapping = EquirectangularReflectionMapping
        return () => {
            proceed = false
            scene.environment = null
        }
    }

    const skylight = new HemisphereLight(0xffffff, 0x666666, 1 * scale)
    scene.add(skylight)

    const light = new DirectionalLight(0xffffff, 0.5 * scale)
    light.position.set(0, 1, 1)
    scene.add(light)
    // light.castShadow = true
    // light.shadow.camera.near = camNear
    // light.shadow.camera.far = camFar

    return () => {
        skylight.dispose()
        scene.remove(skylight)

        light.dispose()
        scene.remove(light)
    }
}, [getDefaultLight, getDefaultLightScale])