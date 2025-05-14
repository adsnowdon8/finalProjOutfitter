import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import { Button, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { ClothingItem, EmbeddedItem } from "@/hooks/types";
import { fileExists } from "@/hooks/indexHelperFns";
import { ItemsUsedDisplay } from "./ItemsUsedDisplay";
import { speak } from "expo-speech";

export const GeneratedResponse = ({
  location,
  output,
  setOutput,
  mute,
  items,
  activity,
  duration,
  pointInTime,
  farenheit,
  weather,
  setItems,
  setInOutputScreen,
}: {
  location: string | undefined;
  output: string;
  setOutput: (output: string) => void;
  mute: () => void;
  items: EmbeddedItem[];
  activity: string;
  duration: string;
  pointInTime: string;
  farenheit: boolean;
  weather: string;
  setItems: (arg0: EmbeddedItem[]) => void;
  setInOutputScreen: (arg0: boolean) => void;
}) => {
  const generatedResponse = useMemo(() => output.split("***")[0], [output]);
  const itemsUsed = useMemo(() => output.split("***")[1], [output]);
  const itemsUsedArray = useMemo(() => itemsUsed.split(","), [itemsUsed]);
  const itemsUsedObjs: (EmbeddedItem | null)[] = useMemo(
    () =>
      itemsUsedArray.map((itemUsed) => {
        //strip leading and trailing spaces
        const itemUsedTrimmed = itemUsed.trim();
        const itemObj = items.find((item) => {
          return item.name.trim() === itemUsedTrimmed;
        });
        if (itemObj) {
          return itemObj;
        }
        return null;
      }),
    [itemsUsedArray, items]
  );
  useEffect(() => {
    if (generatedResponse) {
      speak(generatedResponse);
    }
  }, [generatedResponse]);

  return (
    <ThemedView>
      <ScrollView style={{ height: "50%" }}>
        <ThemedText style={{ padding: 20 }}>
          <ThemedText style={{ fontWeight: "bold" }}>Location: </ThemedText>
          {location}
        </ThemedText>
        <ThemedText
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            textAlign: "left",
          }}
        >
          {generatedResponse}
        </ThemedText>
        <ThemedText style={{ padding: 20, marginTop: 10, textAlign: "left" }}>
          <ItemsUsedDisplay
            itemsUsedObjs={itemsUsedObjs}
            activity={activity}
            duration={duration}
            pointInTime={pointInTime}
            farenheit={farenheit}
            weather={weather}
            setOutput={setOutput}
            setItems={setItems}
            items={items}
          />
        </ThemedText>
      </ScrollView>
      <View
        style={{
          padding: 10,
          flex: 1,
          flexDirection: "row",
          height: "10%",
          alignContent: "center",
          justifyContent: "center",
          backgroundColor: "007AFF",
          gap: "10",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setOutput("");
            mute();
            setInOutputScreen(false);
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Button
          title="Mute"
          onPress={() => {
            mute();
            console.log("should talk");
          }}
        />
      </View>
    </ThemedView>
  );
};
