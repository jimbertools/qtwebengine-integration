from flask import jsonify, request
from spawner_api import app, docker_client
import string
import secrets
import docker

webcam_ctr = 2  # We start at /dev/video2
max_webcams = 7  # The max amount of installed webcams on the server
# devices=["/dev/video"+webcam_id+":/dev/video0"],


# Moved from GET to POST because of secrets in url
@app.route('/container', methods=['POST', 'OPTIONS'])
def get_container():
    user_id = request.form.get("userId", default=None)
    if user_id is None:
        return jsonify({"error", "no userId given"})

    if is_container_running(user_id) is not True:
        docker_client.containers.run(
            name=user_id,
            image=app.config["DOCKER_IMAGE"],
            network=app.config["DOCKER_NETWORK"],
            detach=True,
            auto_remove=app.config["AUTO_REMOVE"],
            volumes=generate_volumes(user_id),
            devices=generate_devices(),
            environment=generate_environment(user_id),
            labels={"jimber":"browser"}
        )
    response = {
        'downloadsEnabled': app.config["DOWNLOAD_FEATURE_ENABLED"],
        'userId': user_id
    }
    return jsonify(response)


def generate_volumes(user_id) -> dict:
    volumes = {}
    if user_id is None:
        return {}

    if app.config["DOWNLOAD_FEATURE_ENABLED"]:
        # docker_client.volumes.create(name='browser_downloads_'+user_id)
        volumes["/opt/jimber/downloads/" +
                user_id] = {'bind': '/jimber_downloads', 'mode': 'rw'}

    if app.config["PERSISTENT_CLIENT_STORAGE"]:
        volume_name = 'browser_storage_'+user_id
        docker_client.volumes.create(
            name=volume_name,
            labels={'jimber': 'volume'})
        volumes[volume_name] = {
            'bind': '/root/.local/share/browser/QtWebEngine/Default', 'mode': 'rw'}

    return volumes


def generate_environment(user_id) -> dict:
    environment = {}
    environment["WEBCAM_ENABLED"] = app.config["WEBCAM_ENABLED"]
    environment["USER_ID"] = user_id
    return environment


def generate_devices() -> dict:
    devices = {}
    if app.config["WEBCAM_ENABLED"]:
        webcam_id = create_webcam()
        devices["/dev/video"+webcam_id+":/dev/video0"]
    # return devices


def create_webcam():
    # webcam_id = secrets.choice(string.digits)
    global webcam_ctr
    webcam_id = webcam_ctr
    webcam_ctr += 1
    if (webcam_ctr > max_webcams):
        webcam_ctr = 2
    return str(webcam_id)


def is_container_running(user_id) -> bool:
    try:
        docker_client.containers.get(user_id)
        return True
    except docker.errors.NotFound:
        pass
    return False
