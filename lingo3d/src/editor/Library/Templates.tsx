import { useMemo } from "preact/hooks"
import Template from "../../display/Template"
import useSceneGraphRefresh from "../hooks/useSceneGraphRefresh"
import TemplatesTreeItem from "./TemplatesTreeItem"
import { appendableRoot } from "../../collections/appendableRoot"
import { disableSceneGraph } from "../../collections/disableSceneGraph"
import { isTemplate } from "../../collections/typeGuards"

const Templates = () => {
    const refresh = useSceneGraphRefresh()
    const appendables = useMemo(
        () =>
            [...appendableRoot].filter(
                (item) => !disableSceneGraph.has(item) && isTemplate(item)
            ),
        [refresh]
    )

    return (
        <>
            {appendables.map((appendable) => (
                <TemplatesTreeItem
                    key={appendable.uuid}
                    template={appendable as Template}
                />
            ))}
        </>
    )
}

export default Templates
