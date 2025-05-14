import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

export const removeFile = async (uri: string) => {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    console.log("Deleted:", uri);
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};

export const makeFileUri = (name: string) => {
  const filename = name.trim().replace(/\s+/g, "_");
  console.log("filename", filename);
  return FileSystem.documentDirectory + `clothes/${filename}`;
};

export const confirmDelete = (onConfirm: () => void | Promise<void>) => {
  Alert.alert(
    "Delete Item",
    "Are you sure you want to delete this?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm },
    ],
    { cancelable: true }
  );
};
