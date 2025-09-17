import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView, Text, ActivityIndicator } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { db } from "../firebaseConfig";

export default function EditarProductoScreen({ route, navigation }) {
  const { producto } = route.params;
  const [nombre, setNombre] = useState(producto.nombre);
  const [codigo, setCodigo] = useState(producto.codigo);
  const [cantidad, setCantidad] = useState(producto.cantidad.toString());
  const [foto, setFoto] = useState(producto.foto || null);
  const [cargando, setCargando] = useState(false);

  const handleSelectPicture = async (useCamera) => {
    const permissionResult = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permiso Denegado", "Necesitas conceder permiso para acceder a la galería o la cámara.");
      return;
    }
    
    const pickerOptions = {
      base64: true,
      quality: 0.3,
      allowsEditing: true,
    };
    
    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync(pickerOptions);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    }

    if (!result.canceled && result.assets.length > 0) {
      setFoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };


  const guardarCambios = async () => {
    if (!nombre || !codigo || !cantidad) {
      return Alert.alert("Error", "Todos los campos (Nombre, Código, Cantidad) son obligatorios.");
    }
    
    // 🚨 PASO 1: NAVEGACIÓN INSTANTÁNEA
    navigation.goBack(); 

    setCargando(true);
    
    try {
      const docRef = doc(db, "productos", producto.id);
      
      // PASO 2: Ejecutar la operación de Firebase en segundo plano (sin await)
      updateDoc(docRef, {
        nombre,
        codigo,
        cantidad: parseInt(cantidad, 10),
        foto
      })
      .catch((error) => console.error("Error al actualizar producto en background:", error));

    } catch (error) {
      // El error solo se mostraría si la operación falla antes de la navegación.
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput placeholder="Nombre" style={styles.input} value={nombre} onChangeText={setNombre} />
      <TextInput placeholder="Código" style={styles.input} value={codigo} onChangeText={setCodigo} />
      <TextInput placeholder="Cantidad" style={styles.input} value={cantidad} onChangeText={setCantidad} keyboardType="numeric" />

      <Text style={styles.label}>Foto del Producto:</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={[styles.photoButton, { marginRight: 10 }]} onPress={() => handleSelectPicture(false)}>
          <Text style={styles.buttonText}>Galería</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={() => handleSelectPicture(true)}>
          <Text style={styles.buttonText}>Tomar Foto</Text>
        </TouchableOpacity>
      </View>

      {foto && <Image source={{ uri: foto }} style={styles.imagen} />}

      <Button 
        title={cargando ? "Guardando..." : "Guardar Cambios"} 
        onPress={guardarCambios} 
        color="#007AFF" 
        disabled={cargando}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F2F2F7', flexGrow: 1 },
  label: { fontSize: 16, marginBottom: 8, color: '#333', fontWeight: '500' },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: "#D1D1D6", 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    fontSize: 16 
  },
  buttonGroup: { flexDirection: 'row', marginBottom: 20 },
  photoButton: { flex: 1, backgroundColor: "#007AFF", padding: 12, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  imagen: { 
    width: 150, 
    height: 150, 
    marginBottom: 25, 
    alignSelf: "center", 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#D1D1D6' 
  },
});