/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_ACCOUNT_CONFIRMATIONS_REWARD_REWARD_INFO_H_
#define BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_ACCOUNT_CONFIRMATIONS_REWARD_REWARD_INFO_H_

#include <string>

#include "brave/components/brave_ads/core/internal/privacy/challenge_bypass_ristretto/blinded_token.h"
#include "brave/components/brave_ads/core/internal/privacy/challenge_bypass_ristretto/public_key.h"
#include "brave/components/brave_ads/core/internal/privacy/challenge_bypass_ristretto/token.h"
#include "brave/components/brave_ads/core/internal/privacy/challenge_bypass_ristretto/unblinded_token.h"

namespace brave_ads {

struct RewardInfo final {
  RewardInfo();

  RewardInfo(const RewardInfo&);
  RewardInfo& operator=(const RewardInfo&);

  RewardInfo(RewardInfo&&) noexcept;
  RewardInfo& operator=(RewardInfo&&) noexcept;

  ~RewardInfo();

  [[nodiscard]] bool IsValid() const;

  privacy::cbr::Token token;
  privacy::cbr::BlindedToken blinded_token;
  privacy::cbr::UnblindedToken unblinded_token;
  privacy::cbr::PublicKey public_key;
  std::string signature;
  std::string credential_base64url;
};

bool operator==(const RewardInfo&, const RewardInfo&);
bool operator!=(const RewardInfo&, const RewardInfo&);

}  // namespace brave_ads

#endif  // BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_ACCOUNT_CONFIRMATIONS_REWARD_REWARD_INFO_H_
