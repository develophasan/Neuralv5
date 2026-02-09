import { View, Text, StyleSheet } from "react-native"
import { StatusBar } from "expo-status-bar"

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Harmoni Anaokulu</Text>
      <Text style={styles.subtitle}>Nörobilim Temelli Eğitim Platformu</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
})

