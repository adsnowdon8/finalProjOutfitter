import {
  Image,
  StyleSheet,
  Platform,
  View,
  useColorScheme,
  TouchableOpacity,
  Text,
  TextInput,
  Button,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useEffect } from "react";
import CameraScreen from "@/components/CameraScreen";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as FileSystem from "expo-file-system";
import { makeFileUri } from "@/hooks/helperFns";
import { router } from "expo-router";
import { Category, ClothingItem } from "@/hooks/types";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { itemToText } from "@/hooks/indexHelperFns";

const saveImgToServer = async (
  name: string,
  imageUri: string,
  category: Category
) => {
  console.log("saveImgToServer", name, imageUri, category);
  const nameForFile = category + "*" + name.trim().replace(/\s+/g, "_");
  console.log("nameForFile", nameForFile);
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: nameForFile,
    type: "image/jpeg",
  } as any); // in React Native
  const response = await fetch("https://adsnowdon8.pythonanywhere.com/upload", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("response", response);
  const result = await response.json();
  console.log(result);
};

const saveObject = async (clothingItem: ClothingItem) => {
  const json = JSON.stringify(clothingItem);
  const dirInfo = await FileSystem.getInfoAsync(
    FileSystem.documentDirectory + "clothes/"
  );
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "clothes/",
      { intermediates: true }
    );
  }
  // check if file exists
  const fileUri = makeFileUri(clothingItem.name);
  if (await (await FileSystem.getInfoAsync(fileUri)).exists) {
    console.log("File already exists");
    return;
  }
  console.log("saving", clothingItem.name);
  await FileSystem.writeAsStringAsync(fileUri, json);
};

const saveImageLocally = async (imageUri: string) => {
  const fileName = imageUri.split("/").pop(); // extract original filename
  const newPath = FileSystem.documentDirectory + "images/" + fileName;

  // Make sure the images folder exists
  const dirInfo = await FileSystem.getInfoAsync(
    FileSystem.documentDirectory + "images/"
  );
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "images/",
      { intermediates: true }
    );
  }

  await FileSystem.copyAsync({
    from: imageUri,
    to: newPath,
  });

  console.log("Saved image to:", newPath);
  return newPath;
};

const onSave = async (
  name: string,
  description: string,
  image: string,
  category: Category,
  temperatureRange: [string, string]
) => {
  console.log("onSave", name, description, image);
  // const imgFileUri = await downloadImage(image);
  const imgFileUri = await saveImageLocally(image);

  await saveImgToServer(name, imgFileUri, category);
  // console.log("imgFileUri2", imgFileUri2);
  if (!imgFileUri) {
    console.error("Failed to download image");
    return;
  }
  await saveObject({
    name,
    description,
    imgFileUri,
    category,
    temperatureRange,
  })
    .then(() => {
      console.log("Saved object to file");
      router.navigate("/closet");
    })
    .catch((err) => {
      console.error("Error saving object to file", err);
    });
};
const categoryOptions = [
  { label: "Tops", value: Category.Tops },
  { label: "Bottoms", value: Category.Bottoms },
  { label: "Shoes", value: Category.Shoes },
];
const handleChange = (text: string, func: (inp: string) => void) => {
  // Allow only numbers, optional negative sign
  const numeric = text.replace(/[^0-9\-]/g, "");
  func(numeric);
};

export default function AddItem() {
  const [image, setImage] = useState<null | string>(null);
  const colorScheme = useColorScheme() ?? "light";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>(categoryOptions[0].value);
  const [lowTemp, setLowTemp] = useState<string>("");
  const [highTemp, setHighTemp] = useState<string>("");

  const color = useThemeColor({ light: undefined, dark: undefined }, "text");
  return (
    // <ThemedView style={styles.titleContainer}>

    <ThemedView
      style={{
        paddingTop: 50,
        paddingBottom: 50,
        flex: 1,
        flexDirection: "column",
        flexBasis: 0,
        alignItems: "center",
      }}
    >
      <ScrollView>
        <ThemedText type="title">Add Item</ThemedText>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.stepContainer}>
            <ThemedView
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ThemedText type="subtitle">Name</ThemedText>
              <TextInput
                style={{ ...styles.input, color }}
                placeholder="Type something..."
                value={name}
                onChangeText={setName}
              />
            </ThemedView>

            <ThemedView
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ThemedText type="subtitle">Category</ThemedText>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                itemStyle={{ height: 44, fontSize: 16 }}
                style={{
                  width: 150,
                  height: 44,
                  // backgroundColor: "#FFF0E0",
                  // borderColor: "black",
                  // borderWidth: 1,
                }} // shrink height and width
              >
                {categoryOptions.map((opt) => (
                  <Picker.Item
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                  />
                ))}
              </Picker>
            </ThemedView>

            <ThemedView>
              <ThemedText type="subtitle">Suitable temperature </ThemedText>
              <ThemedView
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  paddingTop: 10,
                  gap: 5,
                  alignItems: "center",
                }}
              >
                <TextInput
                  style={{ ...styles.tempInput, color }}
                  placeholder="low"
                  value={lowTemp}
                  onChangeText={setLowTemp}
                />
                <ThemedText>°F</ThemedText>
                <TextInput
                  style={{ ...styles.tempInput, color }}
                  placeholder="high"
                  value={highTemp}
                  onChangeText={setHighTemp}
                />
                <ThemedText>°F</ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ThemedText type="subtitle">Description</ThemedText>
              <TextInput
                style={{ ...styles.input, color }}
                placeholder="Optional..."
                value={description}
                onChangeText={setDescription}
              />
            </ThemedView>
          </ThemedView>

          <CameraScreen image={image} setImage={setImage} />
          <Button
            title="Add Item"
            disabled={!(name && lowTemp && highTemp && image)}
            onPress={async () => {
              if (!image || !category || !lowTemp || !highTemp) return;
              console.log("Add Item", { name, description, image });
              await onSave(name.trim(), description, image, category, [
                lowTemp,
                highTemp,
              ]).then(() => {
                setName("");
                setDescription("");
                setImage(null);
                setCategory(categoryOptions[0].value);
                setLowTemp("");
                setHighTemp("");
              });
            }}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 8,
    justifyContent: "space-between", // centers vertically
    // alignItems: "center", // centers horizontally
  },
  tempInput: {
    width: 100,
    alignItems: "center",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    width: 200,
    // color: Platform.OS === "ios" ? "#000" : "#fff", // Change text color based on platform
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: { color: "white", fontSize: 18 },
  resultText: { fontSize: 16, marginTop: 10 },
  titleContainer: {
    paddingTop: 16,
    // position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 20,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
