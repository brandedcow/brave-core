/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_ACCOUNT_TOKENS_REFILL_CONFIRMATION_TOKENS_URL_REQUESTS_REQUEST_SIGNED_TOKENS_REQUEST_SIGNED_TOKENS_URL_REQUEST_BUILDER_UTIL_H_
#define BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_ACCOUNT_TOKENS_REFILL_CONFIRMATION_TOKENS_URL_REQUESTS_REQUEST_SIGNED_TOKENS_REQUEST_SIGNED_TOKENS_URL_REQUEST_BUILDER_UTIL_H_

#include <string>

namespace brave_ads {

std::string BuildRequestSignedTokensUrlPath(const std::string& payment_id);

}  // namespace brave_ads

#endif  // BRAVE_COMPONENTS_BRAVE_ADS_CORE_INTERNAL_ACCOUNT_TOKENS_REFILL_CONFIRMATION_TOKENS_URL_REQUESTS_REQUEST_SIGNED_TOKENS_REQUEST_SIGNED_TOKENS_URL_REQUEST_BUILDER_UTIL_H_
