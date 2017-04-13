(function ($) {

    console.log('Loading Voice');

    window.onload = ready;
    window.microm = null;
    var status, currentTime, duration;


    function ready () {

        console.log('Loading Microm');

        window.microm = new Microm();

        status = $('#status span');
        currentTime = $('#current-time span');
        duration = $('#duration span');

        // Microm events
        microm.on('timeupdate', updateCurrentTime);
        microm.on('loadedmetadata', onLoaded);
        microm.on('play', onPlayEvent);
        microm.on('pause', onPauseEvent);
        microm.on('ended', onEndEvent);

        // DOM element events
        click('#record', onRecord);
        click('#play', onPlay);
        click('#pause', onPause);
        click('#stop', onStop);
        click('#get-mp3', onGetMp3);
        click('#get-wav', onGetWav);
        click('#get-base64', onGetBase64);
        click('#download', onDownload);

    }

    function onLoaded (time) {
        duration.innerHTML = time;
    }

    function updateCurrentTime (time) {
        currentTime.innerHTML = time;
    }

    function onPlayEvent () {
        status.innerHTML = 'Playing';
    }

    function onPauseEvent (currentTime) {
        status.innerHTML = 'Paused';
    }

    function onEndEvent () {
        status.innerHTML = 'Ended';
    }

    function onRecord () {
        microm.record().then(function () {
            status.innerHTML = 'Recording';
        }).catch(function (error) {
            console.log('error recording', error);
        })
    }

    function onPlay () {
        console.log('onPlay');
        microm.play();
    }

    function onPause () {
        console.log('onPause');
        microm.pause();
    }

    function onStop () {
        microm.stop().then(function (mp3) {
            status.innerHTML = 'Paused';
        });
    }

    function onGetMp3 () {
        microm.getMp3().then(function (mp3) {
            console.log('onGetMp3', mp3);
        });
    }

    function onGetWav () {
        console.log('onGetWav');
        microm.getWav();
    }

    function onGetBase64 () {
        microm.getBase64().then(function (base64string) {
            console.log(base64string);
        });
    }

    function onDownload () {
        // microm.download('microm');
        getProfileID ();
    }

    function $X (selector) {
        return document.querySelector(selector);
    }

    function click (selector, callback) {
        $X(selector).addEventListener('click', callback);
    }

    //TODO: mcirosfot api logic

    function getProfileID () {
        var params = {
            // Request parameters
        };
        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles?",
            beforeSend: function (xhrObj) {
                // Request headers
                xhrObj.setRequestHeader("Content-Type", "application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "02b07347eb7244cbb6d65a37548505ce");
            },
            type: "POST",
            // Request body
            data: JSON.stringify({
                "locale": "en-us",
            }),
        })
            .done(function (data) {
                alert("success IDENTIFICATION PROFILE");
                console.log(data);
            })
            .fail(function () {
                alert("error");
            });
    }

})(window.jQuery);
// (function() {
//
// })();