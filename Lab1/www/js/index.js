/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

document.addEventListener('deviceready', onDeviceReady, false);

var mqttHost = "farmer.cloudmqtt.com";
var mqttPort = 34514;

// Klikken op de knop koppelen met een actie

function onDeviceReady() {
    // Cordova is now initialized. Have fun!  
    var clientId = Math.floor(Math.random() * 10001);
    client = new Paho.MQTT.Client(mqttHost, Number(mqttPort), String(clientId));

    // Event onMessageArrived, koppelen met functie onMessageArrived
    client.onMessageArrived = onMessageArrived;

    //Verbinding maken met de broker
    client.connect(
        {
            onSuccess: onConnected,
            userName: "userName",
            password: "password",
            useSSL: true
        }
    );
}

document.getElementById("btnTakePicture").addEventListener("click", takePicture);

function takePicture() {
    var options = setOptions();
    options.targetWidth = document.body.clientWidth;

    console.log(navigator.camera);
    document.getElementById('deviceready').classList.add('ready');

    navigator.camera.getPicture(onSuccess, onFail, options);

    function onSuccess(imageURI) {
        var image = document.getElementById('myImage');
        image.src = imageURI;
    }
    function onFail(message) {
        alert('Failed because: ' + message);
    }

    message = new Paho.MQTT.Message(document.getElementById("input").value);
    message.destinationName = "LabMobile" //Moet gelijk zijn aan 'topic'
    client.send(message);

    document.getElementById("input").value = '';
}

function setOptions() {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        //allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}

document.addEventListener("connected", function (e) {
    console.log(e.type)
}, false)

function onConnected() {
    console.log("onConnected");
    client.subscribe("LabMobile",
        {
            onSuccess: onSubscribed
        }
    );
}

function onSubscribed(invocationContext) {
    console.log("onSubscribed");
}

function onMessageArrived(message) {
        document.getElementById("divSubscription").innerHTML = message.payloadString;
        console.log("onMessageArrived: " + message.payloadString);
}