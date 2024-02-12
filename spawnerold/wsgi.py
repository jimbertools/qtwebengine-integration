from spawner_api import app
import os
import config 

if __name__ == "__main__":
    # app.config.from_object(config[os.getenv('ENVIRONMENT')])

    app.run()
