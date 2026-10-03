import {redirect} from 'next/navigation'

// The app is the Studio: Pages, Content audit and Answer drift live there.
export default function Home() {
  redirect('/studio/audit')
}
