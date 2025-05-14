import React, { useState } from "react";
import { Button, Image, View, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function CameraScreen({ image, setImage }: any) {
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Camera access is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {!image && <Button title="Take Photo" onPress={openCamera} />}
      {/* {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 300, height: 300, marginTop: 20, paddingBottom: 10 }}
        />
      )} */}
    </View>
  );
}
