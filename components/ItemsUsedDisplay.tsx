import { EmbeddedItem } from "@/hooks/types";
import { useMemo } from "react";
import {
  Alert,
  Button,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { getEventTime, ragClothing } from "@/hooks/indexHelperFns";

export const ItemsUsedDisplay = ({
  itemsUsedObjs,
  activity,
  duration,
  pointInTime,
  farenheit,
  weather,
  setOutput,
  setItems,
  items,
}: {
  itemsUsedObjs: (EmbeddedItem | null)[];
  activity: string;
  duration: string;
  pointInTime: string;
  farenheit: boolean;
  weather: string;
  setOutput: (output: string) => void;
  setItems: (items: EmbeddedItem[]) => void;
  items: EmbeddedItem[];
}) => {
  // order based on tops, bottoms, shoes
  const itemsUsedImgsOrdered = useMemo(
    () =>
      itemsUsedObjs
        .filter((item) => item !== null)
        .sort((a, b) => {
          if (a.category === "tops") return -1;
          if (b.category === "tops") return 1;
          if (a.category === "bottoms") return -1;
          if (b.category === "bottoms") return 1;
          if (a.category === "shoes") return -1;
          if (b.category === "shoes") return 1;
          return 0;
        }),
    [itemsUsedObjs]
  );
  const groupedByCategory = useMemo(() => {
    return itemsUsedImgsOrdered.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || []).concat(item);
      return acc;
    }, {} as Record<string, EmbeddedItem[]>);
  }, [itemsUsedImgsOrdered]);

  return (
    <ThemedView>
      {Object.entries(groupedByCategory).map(([category, catItems]) => (
        <ThemedView
          key={category}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
            width: "100%",
            flexWrap: "nowrap",
            overflow: "hidden",
          }}
        >
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            // style={{
            //   flexGrow: 0,
            // }}
          >
            <ThemedText style={{ fontWeight: "bold", width: 70 }}>
              {category}
            </ThemedText>

            <ThemedView style={{ flexDirection: "row" }}>
              {catItems.map((item) => (
                <TouchableOpacity
                  key={item.imgFileUri}
                  onPress={() => {
                    Alert.alert(
                      "Confirm",
                      `Are you sure you want to change ${item.name}?`,
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "OK",
                          onPress: async () => {
                            // this is where I have to remove the item from the itemsUsedObjs array
                            console.log("OK Pressed", item.name);
                            const timeOfEvent = getEventTime(pointInTime);
                            const prompt = `Today I plan to ${activity} for ${duration} around ${timeOfEvent}. Use degress ${
                              farenheit ? "Farenheit" : "Celsius"
                            }.`;
                            console.log("items", items.length);
                            const itemsWithoutItem = items.filter(
                              (i) => i.imgFileUri !== item.imgFileUri
                            );
                            const out = await ragClothing({
                              query: prompt,
                              embeddedItems: itemsWithoutItem,
                              weather,
                            }).then((out) => {
                              setItems(itemsWithoutItem);
                              setOutput(out);
                            });
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Image
                    key={item.imgFileUri}
                    style={{ width: 100, height: 100 }}
                    source={{ uri: item.imgFileUri }}
                  />
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ScrollView>
        </ThemedView>
      ))}
    </ThemedView>
  );

  return (
    <View>
      {itemsUsedImgsOrdered.map((item) => (
        <ThemedView>
          <ThemedText>{item.category}</ThemedText>
          <Image
            key={item.imgFileUri}
            style={{ width: 100, height: 100 }}
            source={{ uri: item.imgFileUri }}
          />
        </ThemedView>
      ))}
    </View>
  );
};
