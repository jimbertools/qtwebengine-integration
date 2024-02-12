import { Command } from '../models/Command.js';
import { socketHandler } from '../state/SocketHandler.js';
import { ServerToClientCommand, ClientToServerCommand } from '../Proto.js';
import { cameraHandler } from '../state/CameraHandler.js';

// import { microphoneHandler } from '../state/MicrophoneHandler.js'
import { virtualBrowser } from '../state/VirtualBrowser.js';

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

export class PermissionHandler {
    constructor() {
        this.permissions = [];
        this.showPermissionRequest = false;
        socketHandler.addSocketClosedHandler(this.clearPermissions.bind(this));
    }

    onPermissionRequested(url, permission) {
        let oldPermission = this.permissions.find(perm => perm.url == url && perm.permission == permission);

        if (!oldPermission) {
            this.permissions.push({ url, permission, state: 'requested' });
        } else if (oldPermission && oldPermission.state == 'denied') {
            oldPermission.state = 'requested';
        } else {
            return;
        }

        if (permission == 0) {
            //notification
            Notification.requestPermission().then(answer => {
                if (answer == 'granted') {
                    // virtualBrowser.isProxy
                    //     ? this.grantPermission(url, permission)
                    //     : this.requestFakePermission(url, permission);
                    this.grantPermission(url, permission);
                } else {
                    this.denyPermission(url, permission);
                }
            });
        }

        if (permission == 1) {
            //location
            //alert("Sharing your location is currently not supported")
            this.denyPermission(url, permission);
            return;
            navigator.geolocation.getCurrentPosition(
                () => {
                    virtualBrowser.isProxy
                        ? this.grantPermission(url, permission)
                        : this.requestFakePermission(url, permission);
                },
                () => {
                    this.denyPermission(url, permission);
                }
            );
        }

        if (permission == 2) {
            //mic
            alert('Using your microphone is currently not supported');
            this.denyPermission(url, permission);
            return;
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(stream => {
                    microphoneHandler.startStreaming(stream)(virtualBrowser.isProxy)
                        ? this.grantPermission(url, permission)
                        : this.requestFakePermission(url, permission);
                })
                .catch(err => {
                    this.denyPermission(url, permission);
                });
        }

        if (permission == 3) {
            // webcam
            alert('Using your webcam is currently not supported');
            this.denyPermission(url, permission);
            return;
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then(function (stream) {
                    cameraHandler.startStreaming(stream)(virtualBrowser.isProxy)
                        ? this.grantPermission(url, permission)
                        : this.requestFakePermission(url, permission);
                })
                .catch(function (err) {
                    this.denyPermission(url, permission);
                });
        }

        if (permission == 4) {
            // webcam and mic
            alert('Using your webcam and/or microphone is currently not supported');
            this.denyPermission(url, permission);
            return;

            // Temporary because we already send webcam
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(stream => {
                    microphoneHandler.startStreaming(stream)(virtualBrowser.isProxy)
                        ? this.grantPermission(url, permission)
                        : this.requestFakePermission(url, permission);
                })
                .catch(err => {
                    this.denyPermission(url, permission);
                });
            return;
            //
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then(function (stream) {
                    cameraHandler.startStreaming(stream)(virtualBrowser.isProxy)
                        ? this.grantPermission(url, permission)
                        : this.requestFakePermission(url, permission);
                })
                .catch(function (err) {
                    this.denyPermission(url, permission);
                });
        }

        if (permission == 5) {
            //mouselocked
            this.grantPermission(url, permission);
        }
    }
    requestFakePermission(url, permission) {
        console.log('request fake permission');
        this.showPermissionRequest = true;
    }

    grantPermission(url, permission) {
        this.showPermissionRequest = false;
        let perm = this.permissions.find(perm => {
            return perm.url == url && perm.permission == permission;
        });
        perm.state = 'granted';

        let c = new Command();
        c.setContent(ClientToServerCommand.GRANTPERMISSION, [url, permission]);
        c.send();
    }

    denyPermission(url, permission) {
        if (permission == 3) cameraHandler.stopStreaming();
        this.showPermissionRequest = false;
        let perm = this.permissions.find(perm => {
            return perm.url == url && perm.permission == permission;
        });
        perm.state = 'denied';

        let c = new Command();
        c.setContent(ClientToServerCommand.DENYPERMISSION, [url, permission]);
        c.send();
    }

    clearPermissions() {
        this.permissions.length = 0;
    }
}

export default PermissionHandler;
