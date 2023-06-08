import { Point } from "@lincode/math"
import { Signal, signal } from "@preact/signals"
import ContextMenu from "../component/ContextMenu"
import MenuButton from "../component/MenuButton"
import openJSON from "../../api/files/openJSON"
import openFolder from "../../api/files/openFolder"
import saveJSON from "../../api/files/saveJSON"
import exportJSON from "../../api/files/exportJSON"
import { setScript } from "../../states/useScript"
import Script from "../../display/Script"
import { newScriptDialogSignal } from "../ScriptEditor/NewScriptDialog"

export const menuBarFileContextMenuSignal: Signal<Point | undefined> =
    signal(undefined)

const systemScript = `import { frameSync } from "lingo3d"

// executes once every frame
export const update = (target: any) => {
}

// executes when target is added to system
export const effect = (target: any) => {
}

// executes when target is deleted from system, or if target id disposed
export const cleanup = (target: any) => {
}`

const MenuBarFileContextMenu = () => {
    return (
        <ContextMenu positionSignal={menuBarFileContextMenuSignal}>
            <MenuButton>New File</MenuButton>
            <MenuButton
                onClick={() => {
                    newScriptDialogSignal.value = {
                        onConfirm: (name, language, type) => {
                            const script = new Script()
                            script.name = name
                            script.language = language
                            script.type = type
                            script.code =
                                type === "script"
                                    ? `import { frameSync } from "lingo3d"\n\n`
                                    : systemScript
                            setScript(script)
                        }
                    }
                    menuBarFileContextMenuSignal.value = undefined
                }}
            >
                New Script
            </MenuButton>
            <MenuButton
                onClick={() => {
                    openJSON()
                    menuBarFileContextMenuSignal.value = undefined
                }}
            >
                Open
            </MenuButton>
            <MenuButton
                onClick={() => {
                    openFolder()
                    menuBarFileContextMenuSignal.value = undefined
                }}
            >
                Open Folder
            </MenuButton>
            <MenuButton
                onClick={() => {
                    saveJSON()
                    menuBarFileContextMenuSignal.value = undefined
                }}
            >
                Save
            </MenuButton>
            <MenuButton
                onClick={() => {
                    exportJSON()
                    menuBarFileContextMenuSignal.value = undefined
                }}
            >
                Save As
            </MenuButton>
            <MenuButton>Export for React</MenuButton>
            <MenuButton>Export for Vue 3</MenuButton>
        </ContextMenu>
    )
}

export default MenuBarFileContextMenu
