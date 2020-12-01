// Copyright 2016 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Controller for the supplemental card.
 */

import { Subscription } from 'rxjs';

require('directives/angular-html-bind.directive.ts');

require('domain/utilities/url-interpolation.service.ts');
require(
  'pages/exploration-player-page/services/' +
  'audio-translation-manager.service.ts');
require(
  'pages/exploration-player-page/services/current-interaction.service.ts');
require('pages/exploration-player-page/services/player-position.service.ts');
require('services/audio-player.service.ts');
require('services/autogenerated-audio-player.service.ts');
require('services/contextual/window-dimensions.service.ts');

require(
  'pages/exploration-player-page/exploration-player-page.constants.ajs.ts');
require(
  'pages/exploration-player-page/learner-experience/' +
  'continue-button.component.ts');

angular.module('oppia').directive('supplementalCard', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {
        onClickContinueButton: '&',
        isLearnAgainButton: '&',
        getDisplayedCard: '&displayedCard',
      },
      template: require('./supplemental-card.directive.html'),
      controller: [
        '$scope', 'AudioPlayerService', 'AudioTranslationManagerService',
        'AutogeneratedAudioPlayerService', 'CurrentInteractionService',
        'PlayerPositionService', 'WindowDimensionsService',
        'AUDIO_HIGHLIGHT_CSS_CLASS', 'COMPONENT_NAME_FEEDBACK',
        'CONTINUE_BUTTON_FOCUS_LABEL', 'OPPIA_AVATAR_LINK_URL',
        function(
            $scope, AudioPlayerService, AudioTranslationManagerService,
            AutogeneratedAudioPlayerService, CurrentInteractionService,
            PlayerPositionService, WindowDimensionsService,
            AUDIO_HIGHLIGHT_CSS_CLASS, COMPONENT_NAME_FEEDBACK,
            CONTINUE_BUTTON_FOCUS_LABEL, OPPIA_AVATAR_LINK_URL) {
          var ctrl = this;
          ctrl.directiveSubscriptions = new Subscription();
          var updateDisplayedCard = function() {
            $scope.displayedCard = $scope.getDisplayedCard();
            $scope.clearHelpCard();
            $scope.lastAnswer = null;
            if ($scope.displayedCard.isCompleted()) {
              $scope.lastAnswer = $scope.displayedCard.getLastAnswer();
            }
          };

          // We use the max because the height property of the help card is
          // unstable while animating, causing infinite digest errors.
          var maxHelpCardHeightSeen = 0;
          $scope.clearHelpCard = function() {
            $scope.helpCardHtml = null;
            $scope.helpCardHasContinueButton = false;
            maxHelpCardHeightSeen = 0;
          };

          $scope.isHelpCardTall = function() {
            var helpCard = $('.conversation-skin-help-card');
            if (helpCard.height() > maxHelpCardHeightSeen) {
              maxHelpCardHeightSeen = helpCard.height();
            }
            return maxHelpCardHeightSeen > $(window).height() - 100;
          };

          $scope.getHelpCardBottomPosition = function() {
            var helpCard = $('.conversation-skin-help-card');
            var container = $('.conversation-skin-supplemental-card-container');
            return Math.max(container.height() - helpCard.height() / 2, 0);
          };

          $scope.getFeedbackAudioHighlightClass = function() {
            if (AudioTranslationManagerService
              .getCurrentComponentName() ===
              COMPONENT_NAME_FEEDBACK &&
              (AudioPlayerService.isPlaying() ||
              AutogeneratedAudioPlayerService.isPlaying())) {
              return AUDIO_HIGHLIGHT_CSS_CLASS;
            }
          };

          ctrl.$onInit = function() {
            $scope.OPPIA_AVATAR_IMAGE_URL = (
              UrlInterpolationService.getStaticImageUrl(
                '/avatar/oppia_avatar_100px.svg'));
            $scope.OPPIA_AVATAR_LINK_URL = OPPIA_AVATAR_LINK_URL;

            $scope.CONTINUE_BUTTON_FOCUS_LABEL = CONTINUE_BUTTON_FOCUS_LABEL;

            $scope.helpCardHtml = null;
            $scope.helpCardHasContinueButton = false;

            $scope.windowDimensionsService = WindowDimensionsService;
            CurrentInteractionService.registerPresubmitHook(function() {
              // Do not clear the help card or submit an answer if there is an
              // upcoming card.
              if ($scope.displayedCard.isCompleted()) {
                return;
              }

              $scope.clearHelpCard();
            });

            ctrl.directiveSubscriptions.add(
              PlayerPositionService.onActiveCardChanged.subscribe(
                () => {
                  updateDisplayedCard();
                }
              )
            );

            ctrl.directiveSubscriptions.add(
              PlayerPositionService.onHelpCardAvailable.subscribe(
                (helpCard) => {
                  $scope.helpCardHtml = helpCard.helpCardHtml;
                  $scope.helpCardHasContinueButton = helpCard.hasContinueButton;
                }
              )
            );
            updateDisplayedCard();
          };
          ctrl.$onDestroy = function() {
            ctrl.directiveSubscriptions.unsubscribe();
          };
        }
      ]
    };
  }
]);
