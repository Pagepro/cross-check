// Stand-in for the web app's `@/ui/Icon` (SVG sprite). Previews show the icon name instead.
export default function Icon({icon}: {icon: string; className?: string}) {
  return <span style={{fontSize: 10}}>{icon.replace(/^utility-/, '')}</span>
}
