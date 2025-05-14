import * as FileSystem from "expo-file-system";

export const loadAllFiles = async () => {
  const dirUri = FileSystem.documentDirectory + "clothes/"; // Adjust if you saved elsewhere
  // Check if the directory exists
  const dirInfo = await FileSystem.getInfoAsync(dirUri);
  if (!dirInfo.exists) {
    console.log("Directory does not exist yet.");
    return [];
  }

  // Read all files in the directory
  const fileNames = await FileSystem.readDirectoryAsync(dirUri);
  console.log("fileNames", fileNames);
  // Read and parse each file
  const files = await Promise.all(
    fileNames.map(async (fileName) => {
      const fileUri = dirUri + fileName;

      const content = await FileSystem.readAsStringAsync(fileUri);
      try {
        const parsedContent = JSON.parse(content);
        return parsedContent;
      } catch (e) {
        console.warn("Failed to parse", fileName, e);
        return null;
      }
    })
  );
  return files; // Remove any failed parses
};

//   const loadAllFiles = async () => {
//     const dirUri = FileSystem.documentDirectory + "clothes/"; // Adjust if you saved elsewhere
//     // Check if the directory exists
//     const dirInfo = await FileSystem.getInfoAsync(dirUri);
//     if (!dirInfo.exists) {
//       console.log("Directory does not exist yet.");
//       return [];
//     }
//     // Read all files in the directory
//     const fileNames = await FileSystem.readDirectoryAsync(dirUri);
//     // Read and parse each file
//     const files = await Promise.all(
//       fileNames.map(async (fileName) => {
//         const fileUri = dirUri + fileName;

//         const content = await FileSystem.readAsStringAsync(fileUri);
//         try {
//           const parsedContent = JSON.parse(content);
//           // console.log("Parsed content", parsedContent);
//           return parsedContent;
//           // return JSON.parse(content); // Assuming your files are JSON
//         } catch (e) {
//           console.warn("Failed to parse", fileName, e);
//           return null;
//         }
//       })
//     );

//     return files; // Remove any failed parses
//   };
