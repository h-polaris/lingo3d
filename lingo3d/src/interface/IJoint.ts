import MeshManager from "../display/core/MeshManager"
import IDirectioned, {
    directionedDefaults,
    directionedSchema
} from "./IDirectioned"
import { extendDefaults } from "./utils/Defaults"
import { ExtractProps } from "./utils/extractProps"
import Nullable from "./utils/Nullable"
import Range from "./utils/Range"

export default interface IJoint extends IDirectioned {
    from: Nullable<string | MeshManager>
    to: Nullable<string | MeshManager>
    yLimitAngle: number
    zLimitAngle: number
}

export const jointSchema: Required<ExtractProps<IJoint>> = {
    ...directionedSchema,
    from: [String, Object],
    to: [String, Object],
    yLimitAngle: Number,
    zLimitAngle: Number
}

export const jointDefaults = extendDefaults<IJoint>(
    [directionedDefaults],
    {
        from: undefined,
        to: undefined,
        yLimitAngle: 360,
        zLimitAngle: 360
    },
    {
        yLimitAngle: new Range(0, 360),
        zLimitAngle: new Range(0, 360)
    }
)
