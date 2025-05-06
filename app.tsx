import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, SafeAreaView, ScrollView } from 'react-native';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Simple encoding/decoding function (base64)
  const encodeText = () => {
    try {
      const encoded = Buffer.from(inputText).toString('base64');
      setOutputText(encoded);
    } catch (error) {
      setOutputText('Error encoding text');
    }
  };

  const decodeText = () => {
    try {
      const decoded = Buffer.from(inputText, 'base64').toString('utf-8');
      setOutputText(decoded);
    } catch (error) {
      setOutputText('Error decoding text. Make sure input is valid base64.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Deoderizer</Text>
          <Text style={styles.subHeaderText}>Encode and Decode Text</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter Text:</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={5}
            onChangeText={setInputText}
            value={inputText}
            placeholder="Enter text to encode or decode"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button title="Encode" onPress={encodeText} color="#4CAF50" />
          <Button title="Decode" onPress={decodeText} color="#2196F3" />
        </View>
        
        <View style={styles.outputContainer}>
          <Text style={styles.label}>Result:</Text>
          <Text style={styles.output}>{outputText}</Text>
        </View>
        
        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  outputContainer: {
    marginTop: 10,
  },
  output: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 100,
  },
});
