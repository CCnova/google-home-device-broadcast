import * as dotenv from "dotenv";
dotenv.config();

/**
 * "castv2-client"
 * A Chromecast client based on the new (CASTV2) protocol. This is how
 * we communicate to our Google Home/Google Home Mini.
 */
import { Client, DefaultMediaReceiver } from "castv2-client";

/**
 * "google-tts-api"
 * An API from google that converts our plaintext string into a mp3
 * file that gets played on our Google Home/Google Home Mini
 */
import * as googleTTS from "google-tts-api";

const OFFICE_NEST_MINI_IP = process.env.DEVICE_LOCAL_IP;

const App = {
  playin: false,
  DeviceIp: "",
  Player: null,
  GoogleHome: function (host, url) {
    const client = new Client();
    client.connect(host, function () {
      client.launch(DefaultMediaReceiver, function (err, player) {
        // Set volume to 40%
        client.setVolume({ level: 0.4 });

        const media = {
          contentId: url,
          contentType: "audio/mp3",
          streamType: "BUFFERED",
        };

        App.Player = player;

        App.Player.on("status", function (status) {
          if (status.playerState === "IDLE" && App.playin === false) {
            client.close();
          }
        });

        App.Player.load(media, { autoplay: true }, function (err, status) {
          console.log(`media loaded playerState=${status.playerState}`);
        });
      });
    });
    client.on("error", function (err) {
      // console.log("Error: %s", err.message);
      client.close();
    });
  },
  run: function (ip, text) {
    App.DeviceIp = ip;
    const url = googleTTS.getAudioUrl(text, {
      lang: "en-US",
      slow: false,
      host: "https://translate.google.com",
    });
    App.GoogleHome(App.DeviceIp, url, function (res) {
      console.log(res);
    });
  },
  broadcast: function (text) {
    //From config, 192.168.68.105,192.168.68.107,192.168.68.124
    const ips = process.env.GOOGLEHOME_IPS.split(",");
    for (let s of ips) {
      App.run(s, text);
    }
  },
};

App.run(OFFICE_NEST_MINI_IP, "Test message");
