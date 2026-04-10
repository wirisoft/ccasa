import dynamic from 'next/dynamic'

import type { Metadata } from 'next'

import AccountSettings from '@views/account-settings'

export const metadata: Metadata = {
  title: 'Mi cuenta — BSA Lab'
}

const AccountTab = dynamic(() => import('@views/account-settings/account'))

const AccountSettingsPage = () => {
  return (
    <AccountSettings>
      <AccountTab />
    </AccountSettings>
  )
}

export default AccountSettingsPage
