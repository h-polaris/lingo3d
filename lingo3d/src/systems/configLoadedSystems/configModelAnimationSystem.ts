import Model from "../../display/Model"
import AnimationManager from "../../display/core/AnimatedObjectManager/AnimationManager"
import { createLoadedEffectSystem } from "../utils/createLoadedEffectSystem"

export const configModelAnimationSystem = createLoadedEffectSystem(
    "configModelAnimationSystem",
    {
        data: { animations: [] as Array<AnimationManager> },
        effect: (self: Model, data) => {
            if (self.$animationClips)
                for (const clip of self.$animationClips) {
                    const animation = (self.animations[clip.name] =
                        new AnimationManager(
                            clip.name,
                            self.$loadedObject,
                            self.$animationStates
                        ))
                    animation.$clip = clip
                    self.append(animation)
                    data.animations.push(animation)
                }
            if (self.$namedAnimationClips)
                for (const [name, clip] of Object.entries(
                    self.$namedAnimationClips
                )) {
                    const animation = (self.animations[name] =
                        new AnimationManager(
                            name,
                            self.$loadedObject,
                            self.$animationStates
                        ))
                    animation.$clip = clip
                    self.append(animation)
                    data.animations.push(animation)
                    if (name === self.animation) self.animation = name
                }
        },
        cleanup: (_, data) => {
            for (const animation of data.animations) animation.dispose()
            data.animations = []
        }
    }
)
