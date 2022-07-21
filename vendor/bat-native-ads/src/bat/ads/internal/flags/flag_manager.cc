/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "bat/ads/internal/flags/flag_manager.h"

#include "base/check_op.h"
#include "bat/ads/internal/ads_client_helper.h"
#include "bat/ads/internal/flags/debug/debug_command_line_switch_parser_util.h"
#include "bat/ads/internal/flags/did_override_variations_command_line_switches/did_override_variations_command_line_switches_parser_util.h"
#include "bat/ads/internal/flags/environment/environment_command_line_switch_parser_util.h"
#include "bat/ads/internal/flags/flag_manager_constants.h"
#include "brave/components/brave_rewards/common/pref_names.h"

namespace ads {

namespace {

FlagManager* g_flag_manager_instance = nullptr;

bool ShouldForceStagingEnvironment() {
  return AdsClientHelper::GetInstance()->GetBooleanPref(
      brave_rewards::prefs::kUseRewardsStagingServer);
}

}  // namespace

FlagManager::FlagManager() {
  DCHECK(!g_flag_manager_instance);
  g_flag_manager_instance = this;

  Initialize();
}

FlagManager::~FlagManager() {
  DCHECK_EQ(this, g_flag_manager_instance);
  g_flag_manager_instance = nullptr;
}

// static
FlagManager* FlagManager::GetInstance() {
  DCHECK(g_flag_manager_instance);
  return g_flag_manager_instance;
}

// static
bool FlagManager::HasInstance() {
  return !!g_flag_manager_instance;
}

///////////////////////////////////////////////////////////////////////////////

void FlagManager::Initialize() {
  should_debug_ = ParseDebugCommandLineSwitch();

  did_override_variations_command_line_switches_ =
      ParseVariationsCommandLineSwitches();

  environment_type_ = ChooseEnvironmentType();
}

EnvironmentType FlagManager::ChooseEnvironmentType() const {
  if (ShouldForceStagingEnvironment()) {
    return EnvironmentType::kStaging;
  }

  absl::optional<EnvironmentType> environment_type =
      ParseEnvironmentCommandLineSwitch();
  return environment_type.value_or(kDefaultEnvironmentType);
}

}  // namespace ads
