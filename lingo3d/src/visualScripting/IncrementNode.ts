import Appendable from "../api/core/Appendable"
import { onBeforeRender } from "../events/onBeforeRender"
import IIncrementNode, {
    incrementNodeDefaults,
    incrementNodeSchema
} from "../interface/IIncrementNode"

export default class IncrementNode
    extends Appendable
    implements IIncrementNode
{
    public static componentName = "incrementNode"
    public static defaults = incrementNodeDefaults
    public static schema = incrementNodeSchema
    public static includeKeys = ["initial", "step", "output", "min", "max"]

    public initial = 0
    public step = 0
    public output = 0
    public min = -Infinity
    public max = Infinity

    public constructor() {
        super()
        this.watch(onBeforeRender(() => (this.output += this.step)))
    }
}
