import { Point } from "@lincode/math"
import Defaults from "./utils/Defaults"
import { ExtractProps } from "./utils/extractProps"
import Nullable from "./utils/Nullable"

export default interface ITexturedStandard {
    color: string
    wireframe: boolean
    envMap: Nullable<string>
    envMapIntensity: number
    aoMap: Nullable<string>
    aoMapIntensity: number
    bumpMap: Nullable<string>
    bumpScale: number
    displacementMap: Nullable<string>
    displacementScale: number
    displacementBias: number
    emissive: boolean
    emissiveColor: string
    emissiveMap: Nullable<string>
    emissiveIntensity: number
    lightMap: Nullable<string>
    lightMapIntensity: number
    metalnessMap: Nullable<string>
    metalness: number
    roughnessMap: Nullable<string>
    roughness: number
    normalMap: Nullable<string>
    normalScale: number
}

export const texturedStandardSchema: Required<ExtractProps<ITexturedStandard>> =
    {
        color: String,
        wireframe: Boolean,
        envMap: String,
        envMapIntensity: Number,
        aoMap: String,
        aoMapIntensity: Number,
        bumpMap: String,
        bumpScale: Number,
        displacementMap: String,
        displacementScale: Number,
        displacementBias: Number,
        emissive: Boolean,
        emissiveColor: String,
        emissiveMap: String,
        emissiveIntensity: Number,
        lightMap: String,
        lightMapIntensity: Number,
        metalnessMap: String,
        metalness: Number,
        roughnessMap: String,
        roughness: Number,
        normalMap: String,
        normalScale: Number
    }

export const texturedStandardDefaults: Defaults<ITexturedStandard> = {
    color: "#ffffff",
    wireframe: false,
    envMap: undefined,
    envMapIntensity: 1,
    aoMap: undefined,
    aoMapIntensity: 1,
    bumpMap: undefined,
    bumpScale: 1,
    displacementMap: undefined,
    displacementScale: 1,
    displacementBias: 0,
    emissive: false,
    emissiveColor: "#000000",
    emissiveMap: undefined,
    emissiveIntensity: 1,
    lightMap: undefined,
    lightMapIntensity: 1,
    metalnessMap: undefined,
    metalness: 0,
    roughnessMap: undefined,
    roughness: 1,
    normalMap: undefined,
    normalScale: 1
}
