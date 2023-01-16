import IJointBase, { jointBaseDefaults, jointBaseSchema } from "./IJointBase"
import Choices from "./utils/Choices"
import { extendDefaults } from "./utils/Defaults"
import { ExtractProps } from "./utils/extractProps"
import Nullable from "./utils/Nullable"
import NullableDefault from "./utils/NullableDefault"

export type D6Motion = "eLOCKED" | "eLIMITED" | "eFREE"

export default interface ID6Joint extends IJointBase {
    distanceLimit: Nullable<number>
    eX: Nullable<D6Motion>
    eY: Nullable<D6Motion>
    eZ: Nullable<D6Motion>
    eSWING1: Nullable<D6Motion>
    eSWING2: Nullable<D6Motion>
    eTWIST: Nullable<D6Motion>
}

export const d6JointSchema: Required<ExtractProps<ID6Joint>> = {
    ...jointBaseSchema,
    distanceLimit: Number,
    eX: String,
    eY: String,
    eZ: String,
    eSWING1: String,
    eSWING2: String,
    eTWIST: String
}

const motionChoices = new Choices({
    eLOCKED: "eLOCKED",
    eLIMITED: "eLIMITED",
    eFREE: "eFREE"
})
export const d6JointDefaults = extendDefaults<ID6Joint>(
    [jointBaseDefaults],
    {
        distanceLimit: new NullableDefault(0),
        eX: new NullableDefault("eLOCKED"),
        eY: new NullableDefault("eLOCKED"),
        eZ: new NullableDefault("eLOCKED"),
        eSWING1: new NullableDefault("eLOCKED"),
        eSWING2: new NullableDefault("eLOCKED"),
        eTWIST: new NullableDefault("eLOCKED")
    },
    {
        eX: motionChoices,
        eY: motionChoices,
        eZ: motionChoices,
        eSWING1: motionChoices,
        eSWING2: motionChoices,
        eTWIST: motionChoices
    }
)
