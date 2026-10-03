import type {FC, SVGProps} from 'react'

// Stand-in for the web app's SVG icon components; the Studio falls back to the icon name.
const utilityIconsMap: Record<string, FC<SVGProps<SVGSVGElement>>> = {}

export default utilityIconsMap
