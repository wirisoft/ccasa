// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import AccountSettings from '@views/account-settings'

const AccountTab = dynamic(() => import('@views/account-settings/account'))

const AccountSettingsPage = () => {
  return (
    <AccountSettings>
      <AccountTab />
    </AccountSettings>
  )
}

export default AccountSettingsPage
