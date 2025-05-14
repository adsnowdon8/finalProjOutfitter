import {
  Image,
  StyleSheet,
  Platform,
  View,
  useColorScheme,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Button,
} from "react-native";
import * as Speech from "expo-speech";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useState, useEffect, act } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as FileSystem from "expo-file-system";
import {
  ClothingItem,
  EmbeddedItem,
  ForecastHour,
  FormattedHour,
} from "@/hooks/types";
import { getEventTime, ragClothing } from "@/hooks/indexHelperFns";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import { Picker } from "@react-native-picker/picker";
import { GeneratedResponse } from "@/components/GeneratedResponse";
import { loadAllFiles } from "@/hooks/loadAllFiles";
import { useAppContext } from "@/context/AppContext";

const googleapikey = "[ENTER API KEY FOR GEMINI]";

const locationThenWeather = async (setLocation: (location: string) => void) => {
  const res = await fetch("https://ipinfo.io/json?token=4baf14703426ff").then(
    (response) =>
      response
        .json()
        .then((data) => {
          const { loc } = data; // loc is a string in 'latitude,longitude' format
          const [latitude, longitude]: [string, string] = loc.split(",");
          setLocation(
            data["city"] + ", " + data["region"] + ", " + data["country"]
          );
          const weather = `https://api.weather.gov/points/${latitude},${longitude}`;
          return fetch(weather);
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network was not ok");
          }
          const res = response.json();
          return res;
        })
        .then((weatherData) => {
          return weatherData.properties;
        })
        .then((properties) => {
          const hourlyForecostUrl = properties.forecastHourly;
          return fetch(hourlyForecostUrl).then((response) => {
            return response.json();
          });
        })
        .then((hourlyForecast) => {
          return hourlyForecast.properties;
        })
        .then((properties) => {
          const periods = properties.periods;
          const tenPeriods = periods.slice(0, 10);
          // convert periods to srings
          const tenPeriodsStrings = tenPeriods.map((period: any) => {
            const time = new Date(period.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return `${period.isDaytime ? "Today" : "Tonight"} at ${time}: ${
              period.shortForecast
            }, ${period.temperature}°${period.temperatureUnit}. Winds ${
              period.windDirection
            } at ${period.windSpeed}. Chance of rain: ${
              period.probabilityOfPrecipitation.value
            }%. Relative Humidity: ${
              period.relativeHumidity.value
            }%. Dew point:${period.dewpoint.value.toFixed(1)}°C.`;
          });

          return tenPeriodsStrings.join(" ");
        })
        .catch((error) => {
          console.error("Error:", error);
        })
  );
  return res;
};

export default function HomeScreen() {
  const { farenheit, setFarenheit } = useAppContext();
  const colorScheme = useColorScheme() ?? "light";
  const bg_colors = { light: "#D0D0D0", dark: "#353636" };
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [pointInTime, setPointInTime] = useState<string>("now");
  const color = useThemeColor({ light: undefined, dark: undefined }, "text");
  const [items, setItems] = useState<EmbeddedItem[]>([]);
  const [weather, setWeather] = useState<string>("");
  const [output, setOutput] = useState<string>();
  const [location, setLocation] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const [inOutputScreen, setInOutputScreen] = useState(false);
  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: 1.0,
    });
  };
  const mute = () => Speech.stop();

  useEffect(() => {
    const load = async () => {
      const data: EmbeddedItem[] = await loadAllFiles();
      setItems(data);
      const curWeather = await locationThenWeather(setLocation);
      if (!curWeather) return;
      setWeather(curWeather);
    };
    load();

    setActivity("");
    setDuration("");
    setPointInTime("");
    setInOutputScreen(false);
    // setOutput("");
  }, [isFocused, inOutputScreen]);

  useEffect(() => {
    if (!isFocused) {
      // If this tab is no longer focused, stop any speech
      Speech.stop();
    }
  }, [isFocused]);

  return (
    // <ThemedView style={styles.titleContainer}>
    <ThemedView
      style={{
        paddingTop: 80,
        flex: 1,
        flexDirection: "column",
        flexBasis: 0,
        alignItems: "center",
      }}
    >
      <ThemedText type="title">Outfitter</ThemedText>
      {!output ? (
        <>
          <View style={styles.titleContainer}>
            <ThemedText type="subtitle">Welcome</ThemedText>
            <HelloWave />
          </View>
          <View style={styles.container}>
            <View>
              <ThemedText>Today I plan to </ThemedText>
              <TextInput
                style={{ ...styles.input, color }}
                placeholder="activity..."
                value={activity}
                onChangeText={setActivity}
              />
            </View>
            <View style={{ marginTop: 10 }}>
              <ThemedText> for </ThemedText>
              <TextInput
                style={{ ...styles.input, color }}
                placeholder="duration..."
                value={duration}
                onChangeText={setDuration}
              />
            </View>
            <Picker
              mode="dropdown"
              selectedValue={pointInTime || "now"} // Set default value to "now"
              onValueChange={(itemValue) => setPointInTime(itemValue)}
              itemStyle={{
                height: 150,
                fontSize: 16,
              }}
              style={{
                height: 64,
                width: 200, // Add width to contain dropdown
                animationDirection: "down", // Match text color
              }}
            >
              <Picker.Item label="now" value="now" />
              <Picker.Item label="In 15 Minutes" value="in 15 minutes" />
              <Picker.Item label="In 30 Minutes" value="in 30 minutes" />
              <Picker.Item label="In 45 Minutes" value="in 45 minutes" />
              <Picker.Item label="In 1 Hour" value="in 1 Hour" />
              <Picker.Item label="In 2 Hours" value="in 2 Hour" />
              <Picker.Item label="In 3 Hours" value="in 3 Hours" />
              <Picker.Item label="In 4 Hours" value="in 4 Hours" />
              <Picker.Item label="In 5 Hours" value="in 5 Hours" />
              <Picker.Item label="In 6 Hours" value="in 6 Hours" />
              <Picker.Item label="In 7 Hours" value="in 7 Hours" />
              <Picker.Item label="In 8 Hours" value="in 8 Hours" />
              <Picker.Item label="In 9 Hours" value="in 9 Hours" />
              <Picker.Item label="In 10 Hours" value="in 10 Hours" />
            </Picker>
            <View
              style={{
                paddingTop: 100,
                flex: 1,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  isLoading
                    ? styles.generateButtonLoading
                    : styles.generateButtonNotLoading,
                ]}
                disabled={!activity || !duration || isLoading}
                onPress={async () => {
                  setIsLoading(true);
                  console.log(weather);
                  if (!weather) return;
                  console.log("pointInTime", pointInTime);
                  const timeOfEvent = getEventTime(pointInTime);
                  console.log("timeOfEvent", timeOfEvent);
                  const prompt = `Today I plan to ${activity} for ${duration} around ${timeOfEvent}. Use degress ${
                    farenheit ? "Farenheit" : "Celsius"
                  }.`;
                  const out = await ragClothing({
                    query: prompt,
                    embeddedItems: items,
                    weather,
                  }).then((out) => {
                    setIsLoading(false);
                    setOutput(out);
                    setInOutputScreen(true);
                  });
                }}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Loading" : "Generate"}
                </Text>
              </TouchableOpacity>
              <ThemedView
                style={{
                  flexDirection: "row",
                  gap: 10,
                  position: "absolute",
                  bottom: 90,
                  alignSelf: "center",
                }}
              >
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: "#4B5563" }]}
                  onPress={() => {
                    const prompt = `Today I plan to ${activity} for ${duration} ${pointInTime}`;
                    const weather = "$$$$$$";
                    ragClothing({
                      query: prompt,
                      embeddedItems: items,
                      weather,
                      save: true,
                      saveName: "B1",
                    });
                  }}
                >
                  <Text style={styles.saveButtonText}>Save to B1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: "grey" }]}
                  onPress={async () => {
                    const prompt = `Today I plan to ${activity} for ${duration} ${pointInTime}`;
                    const weather = "$$$$$$";
                    await ragClothing({
                      query: prompt,
                      embeddedItems: items,
                      weather,
                      save: true,
                      saveName: "B2",
                    });
                  }}
                >
                  <Text style={styles.saveButtonText}>Save to B2</Text>
                </TouchableOpacity>
              </ThemedView>
            </View>
          </View>
        </>
      ) : (
        <GeneratedResponse
          location={location}
          output={output}
          setOutput={setOutput}
          mute={mute}
          items={items}
          activity={activity}
          duration={duration}
          pointInTime={pointInTime}
          farenheit={farenheit}
          weather={weather}
          setItems={setItems}
          setInOutputScreen={setInOutputScreen}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    width: 200,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: { color: "white", fontSize: 18 },
  saveButtonText: { color: "white", fontSize: 14 },
  resultText: { fontSize: 16, marginTop: 10 },
  titleContainer: {
    paddingTop: 16,
    // position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  audioContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 10,
  },
  generateButton: {
    padding: 15,
    borderRadius: 5,
    width: "60%",
    alignItems: "center",
    marginBottom: 20,
  },
  saveButton: {
    // padding: 15,
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  generateButtonNotLoading: {
    backgroundColor: "#4CAF50", // Green color for the button
  },
  generateButtonLoading: {
    backgroundColor: "grey", // Green color for the button
  },
});
