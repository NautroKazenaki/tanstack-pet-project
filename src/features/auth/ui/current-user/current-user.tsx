import { Link } from '@tanstack/react-router'
import styles from '../account-bar.module.css'
import { useMeQuery } from '../../api/use-me'
import { LogoutButton } from '../logout-button'

export const CurrentUser = () => {
   const query = useMeQuery()



  if (!query.data) return <span>...</span>

  return (
    <div className={styles.meInfoContainer}>
      <Link to="/my-playlists" activeOptions={{ exact: true }}>
        {query.data!.login} 
        <LogoutButton />
      </Link>
    </div>
  )
}