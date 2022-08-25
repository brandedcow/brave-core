// Copyright (c) 2022 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

import * as React from 'react'

// utils
import { reduceAddress } from '../../../../utils/reduce-address'
import { getLocale, getLocaleWithTag } from '../../../../../common/locale'
import { generateQRCode } from '../../../../utils/qr-code-utils'

// constants
import { FILECOIN_FORMAT_DESCRIPTION_URL } from '../../../../common/constants/urls'

// options
import {
  AccountSettingsNavOptions,
  HardwareAccountSettingsNavOptions
} from '../../../../options/account-settings-nav-options'

// types
import {
  AccountSettingsNavTypes,
  BraveWallet,
  WalletAccountType,
  UpdateAccountNamePayloadType,
  TopTabNavObjectType
} from '../../../../constants/types'

// components
import { NavButton } from '../../../extension'
import { CopyTooltip } from '../../../shared/copy-tooltip/copy-tooltip'
import TopTabNav from '../../top-tab-nav/index'
import PopupModal from '../index'
import PasswordInput from '../../../shared/password-input/index'

// hooks
import { useIsMounted } from '../../../../common/hooks/useIsMounted'
import { usePasswordAttempts } from '../../../../common/hooks/use-password-attempts'

// style
import {
  Input,
  StyledWrapper,
  QRCodeWrapper,
  AddressButton,
  ButtonRow,
  CopyIcon,
  PrivateKeyWrapper,
  WarningText,
  WarningWrapper,
  PrivateKeyBubble,
  ButtonWrapper,
  ErrorText
} from './account-settings-modal.style'
import { useApiProxy } from '../../../../common/hooks/use-api-proxy'

interface Props {
  onClose: () => void
  onUpdateAccountName: (payload: UpdateAccountNamePayloadType) => { success: boolean }
  onChangeTab: (id: AccountSettingsNavTypes) => void
  onRemoveAccount: (
    address: string,
    hardware: boolean,
    coin: BraveWallet.CoinType,
    password: string
  ) => void
  onToggleNav: () => void
  hideNav: boolean
  tab: AccountSettingsNavTypes
  title: string
  account: WalletAccountType
}

export const AccountSettingsModal = ({
  title,
  account,
  tab,
  hideNav,
  onClose,
  onToggleNav,
  onUpdateAccountName,
  onChangeTab,
  onRemoveAccount
}: Props) => {
  // custom hooks
  const isMounted = useIsMounted()
  const { keyringService } = useApiProxy()

  // state
  const [accountName, setAccountName] = React.useState<string>(account.name)
  const [updateError, setUpdateError] = React.useState<boolean>(false)
  const [password, setPassword] = React.useState<string>('')
  const [privateKey, setPrivateKey] = React.useState<string>('')
  const [isCorrectPassword, setIsCorrectPassword] = React.useState<boolean>(true)
  const [qrCode, setQRCode] = React.useState<string>('')

  // custom hooks
  const { attemptPasswordEntry } = usePasswordAttempts()

  // methods
  const onViewPrivateKey = React.useCallback(async (
    address: string,
    coin: BraveWallet.CoinType
  ) => {
    const { privateKey, success } = await keyringService.getPrivateKeyForKeyringAccount(
      address,
      password,
      coin
    )
    if (isMounted) {
      if (success) {
        return setPrivateKey(privateKey)
      }
      return setPrivateKey('')
    }
  }, [password, keyringService, isMounted])

  const onDoneViewingPrivateKey = React.useCallback(() => {
    setPrivateKey('')
  }, [])

  const handleAccountNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountName(event.target.value)
    setUpdateError(false)
  }

  const onSubmitUpdateName = () => {
    const isDerived = account?.accountType === 'Primary'
    const payload = {
      address: account.address,
      name: accountName,
      isDerived: isDerived
    }
    onUpdateAccountName(payload).success ? onClose() : setUpdateError(true)
  }

  const generateQRData = React.useCallback(() => {
    generateQRCode(account.address).then(qr => {
      if (isMounted) {
        setQRCode(qr)
      }
    })
  }, [account.address, isMounted])

  const onSelectTab = (id: AccountSettingsNavTypes) => {
    setPrivateKey('')
    onChangeTab(id)
  }

  const removeAccount = () => {
    onRemoveAccount(account.address, false, account.coin, password)
    onToggleNav()
    onClose()
  }

  const onShowPrivateKey = async () => {
    if (!password) { // require password to view key
      return
    }

    // entered password must be correct
    const isPasswordValid = await attemptPasswordEntry(password)

    if (!isPasswordValid) {
      setIsCorrectPassword(isPasswordValid) // set or clear error
      return // need valid password to continue
    }

    // clear entered password & error
    setPassword('')
    setIsCorrectPassword(true)

    onViewPrivateKey(
      account?.address ?? '',
      account?.coin
    )
  }

  const onHidePrivateKey = () => {
    onDoneViewingPrivateKey()
    setPrivateKey('')
  }

  const onClickClose = () => {
    onHidePrivateKey()
    setUpdateError(false)
    onClose()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && accountName) {
      onSubmitUpdateName()
    }
  }

  const onPasswordChange = (value: string): void => {
    setIsCorrectPassword(true) // clear error
    setPassword(value)
  }

  const handlePasswordKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onShowPrivateKey()
    }
  }

  // memos / computed
  const tabList = React.useMemo((): TopTabNavObjectType[] => {
    return account.accountType === 'Trezor' ||
      account.accountType === 'Ledger'
      ? HardwareAccountSettingsNavOptions()
      : AccountSettingsNavOptions()
  }, [account])

  const filPrivateKeyFormatDescriptionTextParts = getLocaleWithTag(
    'braveWalletFilExportPrivateKeyFormatDescription'
  )

  // effects
  React.useEffect(() => {
    generateQRData()
  }, [])

  // render
  return (
    <PopupModal title={title} onClose={onClickClose}>
      {!hideNav &&
        <TopTabNav
          tabList={tabList}
          onSelectTab={onSelectTab}
          selectedTab={tab}
        />
      }
      <StyledWrapper>
        {tab === 'details' &&
          <>
            <Input
              value={accountName}
              placeholder={getLocale('braveWalletAddAccountPlaceholder')}
              onChange={handleAccountNameChanged}
              onKeyDown={handleKeyDown}
            />
            {updateError &&
              <ErrorText>{getLocale('braveWalletAccountSettingsUpdateError')}</ErrorText>
            }
            <QRCodeWrapper src={qrCode} />
            <CopyTooltip text={account.address}>
              <AddressButton>{reduceAddress(account.address)}<CopyIcon /></AddressButton>
            </CopyTooltip>
            <ButtonRow>
              <NavButton
                onSubmit={onSubmitUpdateName}
                disabled={!accountName}
                text={getLocale('braveWalletAccountSettingsSave')}
                buttonType='secondary'
              />
              {account?.accountType === 'Secondary' &&
                <NavButton
                  onSubmit={removeAccount}
                  text={getLocale('braveWalletAccountSettingsRemove')}
                  buttonType='danger'
                />
              }
            </ButtonRow>
          </>
        }
        {tab === 'privateKey' &&
          <PrivateKeyWrapper>
            <WarningWrapper>
              <WarningText>{getLocale('braveWalletAccountSettingsDisclaimer')}</WarningText>
            </WarningWrapper>
            {privateKey
              ? <>
                {account.coin === BraveWallet.CoinType.FIL &&
                  <WarningWrapper>
                    <WarningText>
                      {filPrivateKeyFormatDescriptionTextParts.beforeTag}
                        <a target='_blank' href={FILECOIN_FORMAT_DESCRIPTION_URL} rel='noopener noreferrer'>
                          {filPrivateKeyFormatDescriptionTextParts.duringTag}
                        </a>
                        {filPrivateKeyFormatDescriptionTextParts.afterTag}
                      </WarningText>
                  </WarningWrapper>
                }
                <CopyTooltip text={privateKey}>
                  <PrivateKeyBubble>{privateKey}</PrivateKeyBubble>
                </CopyTooltip>
              </>
              : <PasswordInput
                  placeholder={getLocale('braveWalletEnterYourPassword')}
                  onChange={onPasswordChange}
                  hasError={!!password && !isCorrectPassword}
                  error={getLocale('braveWalletLockScreenError')}
                  autoFocus={false}
                  value={password}
                  onKeyDown={handlePasswordKeyDown}
                />
            }
            <ButtonWrapper>
              <NavButton
                onSubmit={!privateKey ? onShowPrivateKey : onHidePrivateKey}
                text={getLocale(!privateKey
                  ? 'braveWalletAccountSettingsShowKey'
                  : 'braveWalletAccountSettingsHideKey'
                )}
                buttonType='primary'
                disabled={
                  privateKey
                    ? false
                    : password ? !isCorrectPassword : true
                }
              />
            </ButtonWrapper>
          </PrivateKeyWrapper>
        }
      </StyledWrapper>
    </PopupModal>
  )
}

export default AccountSettingsModal
