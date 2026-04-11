import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { geminiModel } from '../../lib/gemini';

export default function AIScannerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null | undefined>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
      setResults(null);
    }
  };

  const analyzeImage = async () => {
    if (!image || !imageBase64) return;
    setIsScanning(true);
    
    try {
      const promptText = `Analyze this image for any security, safety, or civilian-threat context.
Return ONLY a raw JSON object (without markdown wrappers like \`\`\`json) with the following structure:
{
  "threatLevel": "string (e.g. SECURE, LOW, ELEVATED (74%), SEVERE)",
  "type": "string (brief description of what is seen)",
  "confidence": "string (e.g. 89.2%)",
  "recommendation": "string (action to take for a civilian or dispatcher)",
  "tags": ["tag1", "tag2", "tag3"]
}`;

      const apiResult = await geminiModel.generateContent([
        promptText,
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg"
          }
        }
      ]);

      const responseText = await apiResult.response.text();
      
      let parsed = null;
      try {
        parsed = JSON.parse(responseText.trim().replace(/```json/g, '').replace(/```/g, ''));
      } catch (e) {
        console.error("Failed to parse JSON", responseText);
        parsed = {
          threatLevel: "UNKNOWN",
          type: "AI Output Unstructured",
          confidence: "0%",
          recommendation: "Failed to parse AI response. " + responseText.substring(0, 100),
          tags: ["error"]
        };
      }
      setResults(parsed);
    } catch (error) {
      console.error("Vision AI Error:", error);
      setResults({
        threatLevel: "ERROR",
        type: "Connection Failure",
        confidence: "0%",
        recommendation: "Failed to connect to the AI model. Check your internet connection or API Key.",
        tags: ["System Error"]
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Header */}
      <View className="px-6 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm">
            <Ionicons name="menu" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <View className="bg-emerald-500/10 p-2 rounded-xl mr-3 border border-emerald-500/20">
            <Ionicons name="scan-outline" size={24} color="#10B981" />
          </View>
          <Text className="text-2xl font-black text-white tracking-tight">AI Vision</Text>
        </View>
      </View>

      <View className="px-6">
        <Text className="text-gray-400 text-sm mb-4 leading-relaxed">
          Upload CCTV stills or field intel for immediate neural network analysis.
        </Text>

        {/* Image Upload Area */}
        <TouchableOpacity 
          onPress={pickImage} 
          className="h-64 bg-gray-900 border-2 border-dashed border-gray-700 rounded-3xl items-center justify-center mb-6 overflow-hidden relative"
        >
          {image ? (
            <>
              <Image source={{ uri: image }} className="w-full h-full opacity-80" resizeMode="cover" />
              {isScanning && (
                <View className="absolute inset-0 bg-emerald-900/40 items-center justify-center backdrop-blur-sm border-2 border-emerald-500">
                   <ActivityIndicator size="large" color="#10B981" />
                   <Text className="text-emerald-400 font-mono font-bold mt-4 tracking-widest animate-pulse">ANALYZING PIXELS...</Text>
                </View>
              )}
            </>
          ) : (
            <View className="items-center">
              <Ionicons name="cloud-upload-outline" size={48} color="#4B5563" />
              <Text className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Select Target Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Analyze Button */}
        {image && !results && !isScanning && (
          <TouchableOpacity 
            onPress={analyzeImage} 
            className="bg-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-600/20 border border-emerald-500 items-center mb-6"
          >
            <Text className="text-white font-black tracking-widest uppercase text-lg">Run Diagnostics</Text>
          </TouchableOpacity>
        )}

        {/* AI Results Card */}
        {results && (
          <View className="bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-10 shadow-lg">
            <View className="flex-row items-center mb-4 border-b border-gray-800 pb-3">
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text className="text-amber-500 font-black tracking-widest uppercase ml-2 text-sm">Threat Assessment</Text>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Identified Threat</Text>
              <Text className="text-white text-lg font-bold">{results.type}</Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Threat Level</Text>
                <Text className="text-red-400 font-mono font-bold">{results.threatLevel}</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">AI Confidence</Text>
                <Text className="text-emerald-400 font-mono font-bold">{results.confidence}</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Action Protocol</Text>
              <Text className="text-gray-300 text-sm leading-relaxed">{results.recommendation}</Text>
            </View>

            <View className="flex-row flex-wrap gap-2 mt-2">
              {results.tags.map((tag: string, index: number) => (
                <View key={index} className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                  <Text className="text-gray-400 text-xs font-mono">{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}