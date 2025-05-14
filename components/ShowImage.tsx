import { Image, View } from "react-native";

export default function ShowSavedImage({ imageUri }: { imageUri: string }) {
  console.log("imageUri", imageUri);
  console.log("in show image");
  return (
    <View>
      <Image
        source={{ uri: imageUri }}
        style={{ width: 200, height: 200, borderRadius: 10 }}
      />
    </View>
  );
}
