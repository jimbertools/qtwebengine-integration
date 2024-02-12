from spawner_api import app
import moduleloader

# To do: This place will change later
config = {
    "development": "config.Development"
}

moduleloader.load_modules()

if __name__ == "__main__":
    app.config.from_object(config["development"])
    app.run()
