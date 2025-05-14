import { StyleSheet, Image, Platform, View, Button, Alert } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import CameraScreen from "@/components/CameraScreen";
import { router } from "expo-router";

import * as FileSystem from "expo-file-system";
import ShowSavedImage from "@/components/ShowImage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { removeFile, makeFileUri, confirmDelete } from "@/hooks/helperFns";
import { useIsFocused } from "@react-navigation/native";
import { ClothingItem } from "@/hooks/types";
import { loadAllFiles } from "@/hooks/loadAllFiles";

// const loadAllFiles = async () => {
//   const dirUri = FileSystem.documentDirectory + "clothes/"; // Adjust if you saved elsewhere

//   // Check if the directory exists
//   const dirInfo = await FileSystem.getInfoAsync(dirUri);
//   if (!dirInfo.exists) {
//     console.log("Directory does not exist yet.");
//     return [];
//   }

//   // Read all files in the directory
//   const fileNames = await FileSystem.readDirectoryAsync(dirUri);
//   console.log("fileNames", fileNames);
//   // Read and parse each file
//   const files = await Promise.all(
//     fileNames.map(async (fileName) => {
//       const fileUri = dirUri + fileName;

//       const content = await FileSystem.readAsStringAsync(fileUri);
//       try {
//         const parsedContent = JSON.parse(content);
//         console.log("Parsed content", parsedContent);
//         return parsedContent;
//         // return JSON.parse(content); // Assuming your files are JSON
//       } catch (e) {
//         console.warn("Failed to parse", fileName, e);
//         return null;
//       }
//     })
//   );

//   return files; // Remove any failed parses
// };

type ClosetItems = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export default function Closet() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const isFocused = useIsFocused();

  const handleDelete = async (uri: string) => {
    confirmDelete(async () => {
      await removeFile(uri);
      setItems((prev) => prev.filter((item) => makeFileUri(item.name) !== uri));
    });
  };

  useEffect(() => {
    const load = async () => {
      const data: ClothingItem[] = await loadAllFiles();
      setItems(data);
    };

    load();
  }, [isFocused]);

  // const closetItems: ClosetItems[] = [
  //   { id: "1", name: "Shirt", description: "A nice shirt", image: "shirt.png" },
  //   {
  //     id: "2",
  //     name: "Pants",
  //     description: "A nice pair of pants",
  //     image: "./assets/closetImages/pants.png",
  //   },
  //   {
  //     id: "3",
  //     name: "Shoes",
  //     description: "A nice pair of shoes",
  //     image: "./assets/closetImages/shoes.jpeg",
  //   },
  // ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          style={{ paddingTop: 80, paddingHorizontal: 80, paddingBottom: 20 }}
          type="title"
        >
          Closet 🧦
        </ThemedText>
      </ThemedView>

      {items.map((item) => (
        <Collapsible title={item.name} key={item.name}>
          <ThemedText>
            {item.category}
            {item.description?.length || 0 > 0 ? ", " + item.description : ""}
            {"\n"}
            {"good for " +
              item.temperatureRange[0] +
              " to " +
              item.temperatureRange[1] +
              "°F"}

            {"\n"}
            <ThemedView className="flex flex-col">
              {/* <ThemedText type="defaultSemiBold">Image:</ThemedText> */}
              <ShowSavedImage imageUri={item.imgFileUri} />
            </ThemedView>
          </ThemedText>
          <Button
            title="Delete"
            color={"#FE6F5E"}
            onPress={async () => {
              handleDelete(makeFileUri(item.name));
            }}
          />
        </Collapsible>
      ))}

      <View style={styles.buttonContainer}>
        <Button
          title="+ Clothing Item"
          onPress={() => router.navigate("/AddItem")} //
        />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
});
