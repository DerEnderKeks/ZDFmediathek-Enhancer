// ==UserScript==
// @name        ZDFmediathek Enhancer
// @author      DerEnderKeks
// @namespace   zdfmediathekenhancer
// @description Adds features to the ZDFmediathek
// @version     0.0.1
// @website     https://github.com/DerEnderKeks/ZDFmediathek-Enhancer
// @supportURL  https://github.com/DerEnderKeks/ZDFmediathek-Enhancer/issues
// @updateURL   https://github.com/DerEnderKeks/ZDFmediathek-Enhancer/raw/master/zdfmediathekenhancer.user.js
// @downloadURL https://github.com/DerEnderKeks/ZDFmediathek-Enhancer/raw/master/zdfmediathekenhancer.user.js
// @include     *://www.zdf.de/*
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

var speeds = [0.25, 0.5, 1, 1.25, 1.5, 2, 2.5, 3];

var videoOptions = {};
var playerID, backButton, speedButton, mainPanel, speedPanel, radiobuttonsSpeed;

var loadPlayerConfig = () => {
    videoOptions = JSON.parse(localStorage.getItem('video_options'));
};
var savePlayerConfig = () => {
    localStorage.setItem('video_options', JSON.stringify(videoOptions));
};
var updateConfigOption = (option, value) => {
    loadPlayerConfig();
    videoOptions[option] = value;
    savePlayerConfig();
};
var updateSpeed = (speed) => {
    updateConfigOption('speed', speed);
};
var updatePlayerSpeed = (speed) => {
    updateSpeed(speed);
    $.each($('video'), ((index) => {
        $('video')[index].playbackRate = speed;
    }));
    speedButton.next().text(speed);
};
var getPlayerID = (element) => {
    if (element.attr('id').startsWith('zdfplayer-configuration-form-')) {
        var split = element.attr('id').split('-');
        return split[split.length - 1];
    }
};

$(document).ready(() => {
    $(window).on('load', () => {
        zdfplayer.on('Player::INITIALIZED', () => {
            console.log("Loading ZDFmediathek Enhancer...");
            loadPlayerConfig();

            if (typeof videoOptions.speed === 'undefined') { updateSpeed(1); }

            $('.config-panel.main-panel').append(
               `<div class="zdfplayer-btn_wrapper m-focus-within" data-option-type="speed">
                <button class="zdfplayer-config-btn speed js-speed-btn m-focus-within" type="button" aria-label="Geschwindigkeit">
                    <span class="btn-text">Geschw.</span>
                </button>
                <span class="selected-option">` + videoOptions.speed + `</span>
                </div>`
            );

            playerID = getPlayerID($("[id^='zdfplayer-configuration-form']"));

            var speedsDOM = '';
            speeds.forEach((speed) => {
                speedIDText = speed.toString().replace('.', '_');
                speedsDOM += `
                <input type="radio" id="` + playerID + `-speed-` + speedIDText + `" name="speed" class="zdfplayer-config_radiobutton zdfplayer-video_speed" data-option-type="speed" value="` + speed + `">
                <label for="` + playerID + `-speed-` + speedIDText + `" class="zdfplayer-config_radiolabel">` + speed + `</label>`;
            });

            $("[id^='zdfplayer-configuration-form']").append(
               `<!-- Speed panel - added by ZDFmediathek Enhancer -->
                <div class="config-panel speed-panel js-speed-panel zdfplayer-hidden">
                    <fieldset id="config_speed-` + playerID + `" class="zdfplayer-speed_wrapper" aria-label="Tonspur"><legend class="zdfplayer-btn_wrapper m-back-to js-back-btn">
                        <button class="zdfplayer-config-btn zdfplayer-config-autofocus" type="button" aria-label="zurück zu den Einstellungen"><span class="btn-text">Geschwindigkeit</span></button>
                        </legend>` + speedsDOM + `
                    </fieldset>
                </div>`
            );

            backButton = $('.js-back-btn');
            speedButton = $('.js-speed-btn');

            mainPanel = $('.js-main-panel');
            speedPanel = $('.js-speed-panel');

            radiobuttonsSpeed = $('input[name="speed"]');

            $('input[name="speed"][value="' + videoOptions.speed + '"]').prop('checked', true);

            backButton.on("click", () => {
                speedPanel.addClass("zdfplayer-hidden");
            });
            speedButton.on("click", () => {
                mainPanel.addClass("zdfplayer-hidden");
                speedPanel.removeClass("zdfplayer-hidden");
            });

            $('body').on('change', 'input', (event) => {
                var element = event.currentTarget;
                if (radiobuttonsSpeed.is(element)) { updatePlayerSpeed(parseFloat($(element).val())); }
            });

            zdfplayer.on('Player::PLAYING', () => {
                updatePlayerSpeed(videoOptions.speed);
            });
        });
    });
});