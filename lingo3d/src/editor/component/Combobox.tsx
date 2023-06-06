import { useState } from "preact/hooks"
import MenuButton from "./MenuButton"
import TextBox from "./TextBox"
import useComboBox from "../hooks/useComboBox"

interface ComboBoxProps {
    options: string[]
    onEnter?: (value: string) => void
    onEscape?: (value: string) => void
}

const ComboBox = ({ options, onEnter, onEscape }: ComboBoxProps) => {
    const [text, setText] = useState("")
    const [filteredOptions, selected, selectNext, selectPrev] = useComboBox(
        options,
        text
    )

    return (
        <div>
            <TextBox
                fullWidth
                debounce={0}
                onChange={(val) => setText(val.toLowerCase())}
                onEnter={(val) => {
                    setText("")
                    if (!options) {
                        onEnter?.(val)
                        return
                    }
                    selected && onEnter?.(selected)
                }}
                onEscape={(val) => {
                    setText("")
                    onEscape?.(val)
                }}
                onArrowDown={selectNext}
                onArrowUp={selectPrev}
            />
            {text && (
                <div
                    className="lingo3d-bg-dark"
                    style={{
                        position: "absolute",
                        width: "100%",
                        zIndex: 2,
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        marginTop: -4,
                        maxHeight: 130,
                        overflowY: "scroll"
                    }}
                >
                    {filteredOptions.map((option) => (
                        <MenuButton
                            key={option}
                            onClick={() => {
                                setText("")
                                onEnter?.(option)
                            }}
                            highlight={selected === option}
                        >
                            {option}
                        </MenuButton>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ComboBox
