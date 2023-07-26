/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_ads/core/internal/account/tokens/redeem_confirmation/reward/redeem_reward_confirmation_util.h"

#include "brave/components/brave_ads/common/pref_names.h"
#include "brave/components/brave_ads/core/internal/ads_client_helper.h"
#include "brave/components/brave_ads/core/internal/common/logging_util.h"
#include "brave/components/brave_ads/core/internal/common/time/time_formatting_util.h"
#include "brave/components/brave_ads/core/internal/privacy/tokens/payment_tokens/payment_token_info.h"
#include "brave/components/brave_ads/core/internal/privacy/tokens/payment_tokens/payment_token_util.h"

namespace brave_ads {

namespace {

base::expected<void, std::string> ShouldAddPaymentToken(
    const privacy::PaymentTokenInfo& payment_token) {
  if (privacy::PaymentTokenExists(payment_token)) {
    return base::unexpected("Payment token is a duplicate");
  }

  return base::ok();
}

}  // namespace

base::expected<void, std::string> MaybeAddPaymentToken(
    const privacy::PaymentTokenInfo& payment_token) {
  auto result = ShouldAddPaymentToken(payment_token);
  if (!result.has_value()) {
    return result;
  }

  privacy::AddPaymentTokens({payment_token});

  return base::ok();
}

void LogPaymentTokenStatus() {
  const base::Time next_token_redemption_at =
      AdsClientHelper::GetInstance()->GetTimePref(
          prefs::kNextTokenRedemptionAt);

  BLOG(1, "You have " << privacy::PaymentTokenCount()
                      << " payment tokens which will be redeemed "
                      << FriendlyDateAndTime(next_token_redemption_at));
}

}  // namespace brave_ads
