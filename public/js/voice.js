(function ($) {

    console.log('Loading Voice');

    window.onload = ready;
    window.microm = null;
    var status, currentTime, duration;

    var base64DATA;
    var wavDATA;

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

        //this works for playing audio
        // var audio = new Audio('/hero.wav');
        // console.log(audio.src);
        // console.log(audio);
        // audio.play();
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
        wavDATA = microm.getWav();
        console.log(wavDATA);
    }

    function onGetBase64 () {
        microm.getBase64().then(function (base64string) {
            console.log(base64string);
            base64DATA = base64string;
        });
    }

    function onDownload () {
        // microm.download('microm');
        getProfileID();
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
                console.log("success IDENTIFICATION PROFILE");
                console.log(data);

                var verID = data.identificationProfileId;

                //TODO: now get wave file
                verifyPhrase(verID);

            })
            .fail(function () {
                alert("error");
            });
    }

    function verifyPhrase (id) {

        console.log('MAKING VERIFY PHRASE CALL');
        //SEPERATE THIS
        // onGetBase64();
        // console.log('BASE64DATA');
        onGetWav();
        console.log('WAVA DATA');
        console.log(wavDATA);

        var audio = new Audio('/hero.wav');

        wavDATA = audio.src;
        // wavDATA = '/hero.wav';
        // console.log(base
        // 64DATA);
        console.log('ID');
        console.log(id);

        var params = {
            "verificationProfileId": "" + id
        };

        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/spid/v1.0/verify?" + $.param(params),
            beforeSend: function (xhrObj) {
                // Request headers
                xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "02b07347eb7244cbb6d65a37548505ce");
            },
            type: "POST",
            // processData: false,
            contentType: 'application/octet-stream',
            // data: makeblob(base64DATA) //this doesn towrk
            data: wavDATA
        })
            .done(function (data) {
                console.log('success VERIFICATION');
                console.log('success VERIFICATION');
                console.log('success VERIFICATION');
                console.log('success VERIFICATION');
                console.log('success VERIFICATION');
                console.log(data);
            })
            .fail(function () {
                alert("error VERIFICATION");
            });
    }

    var makeblob = function (dataURL) {
        var BASE64_MARKER = ';base64,';
        if(dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = decodeURIComponent(parts[1]);
            return new Blob([raw], {type: contentType});
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for(var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }

})(window.jQuery);
// (function() {
//
// })();