import { memo } from "react"

function Tooltip({ text, position = "top", children }) {
    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    }

    return (
        <div className="relative inline-block group">
            {children}
            <div
                className={`absolute ${positionClasses[position]} 
                    bg-gray-600 text-white text-sm px-2 py-1 rounded 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 whitespace-nowrap z-10`}
            >
                {text}
            </div>
        </div>
    )
}

export default memo(Tooltip)
