(function($) {


    console.log('Loading Camera 4551');
    // The width and height of the captured photo. We will set the
    // width to the value defined here, but the height will be
    // calculated based on the aspect ratio of the input stream.

    var width = 320;    // We will scale the photo width to this
    var height = 0;     // This will be computed based on the input stream

    // |streaming| indicates whether or not we're currently streaming
    // video from the camera. Obviously, we start at false.
    var streaming = false;

    // The various HTML elements we need to configure or control. These
    // will be set by the startup() function.

    var video = null;
    var canvas = null;
    var photo = null;
    var photo2 = null;
    var startbutton = null;
    var validFirstPhoto = false;
    var faceId1 = '';
    var faceId2 = '';

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        photo2 = document.getElementById('photo2');
        startbutton = document.getElementById('startbutton');

        navigator.getMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

        navigator.getMedia(
            {
                video: true,
                audio: false
            },
            function(stream) {
                if (navigator.mozGetUserMedia) {
                    video.mozSrcObject = stream;
                } else {
                    var vendorURL = window.URL || window.webkitURL;
                    video.src = vendorURL.createObjectURL(stream);
                }
                video.play();
            },
            function(err) {
                console.log("An error occured! " + err);
            }
        );

        video.addEventListener('canplay', function(ev){
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth/width);

                // Firefox currently has a bug where the height can't be read from
                // the video, so we will make assumptions if this happens.

                if (isNaN(height)) {
                    height = width / (4/3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        startbutton.addEventListener('click', function(ev){
            takepicture();
            ev.preventDefault();
        }, false);

        clearphoto();


        //turn off alerts
        $('.alert-step-1').show();
        $('.alert-step-2').hide();
        $('.alert-success-match').hide();
        $('.alert-photo-success').hide();
        $('.alert-error-photo').hide();

        //microsoft face API

    }

    // Fill the photo with an indication that none has been
    // captured.

    function clearphoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
        photo2.setAttribute('src', data);
    }

    // Capture a photo by fetching the current contents of the video
    // and drawing it into a canvas, then converting that to a PNG
    // format data URL. By drawing it on an offscreen canvas and then
    // drawing that to the screen, we can change its size and/or apply
    // other changes before drawing it.

    function takepicture() {
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');


            if(!validFirstPhoto){
                photo.setAttribute('src', data);
            } else {
                photo2.setAttribute('src', data);
            }
            // photo.setAttribute('src', data);
            // photo2.setAttribute('src', data);

            //TODO: send to microsoft face detect
            //todo: if valid show popup and next step
            //todo: else shoow

            console.log('TAKE PICTURE ACTION');
            // console.log(canvas);
            // console.log(photo.src); //this works and shows base64 data well. do I need to put a url on it?
            // console.log(photo.id);

            var params = {
                // Request parameters
                "returnFaceId": "true",
                "returnFaceLandmarks": "false",
                "returnFaceAttributes": "",
            };

            var photoURL = "https://avatars3.githubusercontent.com/u/3712704?v=3&s=460";
            // var dataURL = canvas.toDataURL();
            // console.log(dataURL);

            if(!validFirstPhoto) {
                $.ajax({
                    url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?" + $.param(params),
                    beforeSend: function (xhrObj) {
                        // Request headers
                        // xhrObj.setRequestHeader("Content-Type","application/json");
                        xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "4db197d7bd384caf9334d174a5e012fb");
                    },
                    type: "POST",
                    // Request body
                    // data:  "{" + "\"url\":\"" + photo.src + "\"}",
                    // data:  "{" + "\"url\":\"" + photoURL + "\"}", //this works
                    processData: false,
                    contentType: 'application/octet-stream',
                    // "Ocp-Apim-Subscription-Key": "4db197d7bd384caf9334d174a5e012fb",
                    data: makeblob(canvas.toDataURL())
                })
                    .done(function (data) {
                        console.log('SUCCESS 11 DATA');
                        console.log(data);


                        if(data.length > 0 ){
                            console.log(data[0].faceId);
                            faceId1 = data[0].faceId;

                            $('.alert-step-1').hide();
                            $('.alert-step-2').show();
                            $('.alert-success-match').hide();
                            $('.alert-photo-success').show();
                            $('.alert-error-photo').hide();
                            validFirstPhoto= true;
                            // startbutton.text("Take 2nd Photo");
                            $("#startbutton").text("Take 2nd Photo");

                        } else {
                            console.log('ERROR');
                            $('.alert-step-1').hide();
                            $('.alert-step-2').hide();
                            $('.alert-success-match').hide();
                            $('.alert-photo-success').hide();
                            $('.alert-error-photo').show();
                            $("#startbutton").hide();

                            $("#video").hide();
                        }

                    })
                    .fail(function () {
                        console.log('ERROR');
                        $('.alert-step-1').hide();
                        $('.alert-step-2').hide();
                        $('.alert-success-match').hide();
                        $('.alert-photo-success').hide();
                        $('.alert-error-photo').show();
                        $("#startbutton").hide();

                        $("#video").hide();
                    });
            } else {
                $.ajax({
                    url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?" + $.param(params),
                    beforeSend: function (xhrObj) {
                        // Request headers
                        // xhrObj.setRequestHeader("Content-Type","application/json");
                        xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "4db197d7bd384caf9334d174a5e012fb");
                    },
                    type: "POST",
                    // Request body
                    // data:  "{" + "\"url\":\"" + photo.src + "\"}",
                    // data:  "{" + "\"url\":\"" + photoURL + "\"}", //this works
                    processData: false,
                    contentType: 'application/octet-stream',
                    // "Ocp-Apim-Subscription-Key": "4db197d7bd384caf9334d174a5e012fb",
                    data: makeblob(canvas.toDataURL())
                })
                    .done(function (data) {
                        console.log('SUCCESS 2 DATA');
                        console.log(data);

                        if(data.length > 0 ){


                        faceId2 = data[0].faceId;
                        // console.log(data[0]);
                        // console.log(data.faceId);

                        // $('.alert-step-1').hide();
                        $('.alert-step-2').hide();
                        // $('.alert-success-match').hide();
                        $('.alert-photo-success').hide();
                        // $('.alert-error-photo').hide();
                        // validFirstPhoto= true;
                        // startbutton.text("Take 2nd Photo")




                        //make call for matching
                        //make call for matching
                        //make call for matching
                        //make call for matching
                        //make call for matching
                        console.log('VERIFY CALL');
                        console.log(faceId1);
                        console.log(faceId2);
                        $.ajax({
                            url: "https://westus.api.cognitive.microsoft.com/face/v1.0/verify",
                            beforeSend: function (xhrObj) {
                                // Request headers
                                xhrObj.setRequestHeader("Content-Type","application/json");
                                // xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "4db197d7bd384caf9334d174a5e012fb");
                            },
                            type: "POST",
                            // Request body
                            // data:  "{" + "\"url\":\"" + photo.src + "\"}",
                            // data:  "{" + "\"url\":\"" + photoURL + "\"}", //this works
                            // processData: false,
                            // contentType: 'application/octet-stream',
                            // "Ocp-Apim-Subscription-Key": "4db197d7bd384caf9334d174a5e012fb",
                            data: JSON.stringify({
                                faceId1: faceId1,
                                faceId2: faceId2
                            })

                        })
                            .done(function (data) {
                                console.log('SUCCESS VERIFY DATA');
                                console.log(data);
                                console.log(data.confidence);
                                console.log(data.isIdentical);

                                // faceId2 = data[0].faceId;
                                // console.log(data[0]);
                                // console.log(data.faceId);

                                $('.alert-step-1').hide();
                                $('.alert-step-2').hide();
                                $('.alert-success-match').show();
                                $('.alert-photo-success').hide();
                                $('.alert-error-photo').hide();

                                // validFirstPhoto= true;
                                $("#startbutton").hide();
                                $("#video").hide();

                                if(data.isIdentical){
                                    $('.alert-success-match').text("These photos are the same person. Confidence score: " + data.confidence );
                                } else {
                                    $('.alert-success-match').text("These photos are not the same person. Confidence score: " + data.confidence );
                                }



                            })
                            .fail(function () {
                                console.log('ERROR');
                                $('.alert-step-1').hide();
                                $('.alert-step-2').show();
                                $('.alert-success-match').hide();
                                $('.alert-photo-success').hide();
                                $('.alert-error-photo').show();
                                $("#startbutton").hide();

                                $("#video").hide();
                            });
                        } else {
                            console.log('ERROR');
                            $('.alert-step-1').hide();
                            $('.alert-step-2').hide();
                            $('.alert-success-match').hide();
                            $('.alert-photo-success').hide();
                            $('.alert-error-photo').show();
                            $("#startbutton").hide();

                            $("#video").hide();
                        }




                    })
                    .fail(function () {
                        console.log('ERROR');
                        $('.alert-step-1').hide();
                        $('.alert-step-2').show();
                        $('.alert-success-match').hide();
                        $('.alert-photo-success').hide();
                        $('.alert-error-photo').show();
                    });


            }



        } else {
            clearphoto();
        }
    }

    // Set up our event listener to run the startup process
    // once loading is complete.
    window.addEventListener('load', startup, false);

    var makeblob = function (dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = decodeURIComponent(parts[1]);
            return new Blob([raw], { type: contentType });
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }

})(window.jQuery);