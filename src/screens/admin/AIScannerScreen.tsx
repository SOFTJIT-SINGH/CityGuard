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
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
      });
      const currentTime = new Date().toLocaleTimeString();

      const promptText = `Verify the authenticity of this document. 
CONTEXT:
- Current Reality Date: ${currentDate}
- Current Reality Time: ${currentTime}
- Location: Field Operation

CRITICAL: Use the Current Reality Date specified above to evaluate document validity. If a document has a date in 2025 or 2026, it is NOT necessarily fabricated; check it against the Current Reality Date.

Check for:
1. Consistency in fonts and alignments.
2. Evidence of digital manipulation or physical tampering.
3. Presence of standard security features (holograms, seals, micro-printing) if distinguishable.
4. Logical consistency of the data (dates, ID formats).

Return ONLY a raw JSON object (without markdown wrappers like \`\`\`json) with the following structure:
{
  "authenticityStatus": "string (GENUINE, LIKELY GENUINE, SUSPECT, FRAUDULENT)",
  "accuracyScore": "string (e.g. 98.5%)",
  "documentType": "string (e.g. Passport, National ID, Driver's License)",
  "detailedAnalysis": "string (Professional technical breakdown of the findings)",
  "securityFeatures": ["feature1", "feature2"],
  "tamperEvidence": "string (None detected, or description of issues)",
  "recommendation": "string (Protocol for the officer/admin)"
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
          authenticityStatus: "ERROR",
          accuracyScore: "0%",
          documentType: "Unknown",
          detailedAnalysis: "Failed to parse forensic data.",
          securityFeatures: [],
          tamperEvidence: "Analysis interrupted.",
          recommendation: "Manual inspection required. " + responseText.substring(0, 100)
        };
      }
      setResults(parsed);
    } catch (error: any) {
      console.error("Vision AI Error:", error);
      
      const isHighDemand = error?.message?.includes('503') || error?.toString()?.includes('503');
      
      setResults({
        authenticityStatus: isHighDemand ? "SYSTEM_OVERLOADED" : "SERVICE_ERROR",
        accuracyScore: "0%",
        documentType: "N/A",
        detailedAnalysis: isHighDemand 
          ? "The Google Gemini AI is currently experiencing extremely high demand globally. This is a temporary spike at the model provider level." 
          : "The neural network is currently unavailable or experiencing connectivity issues.",
        securityFeatures: [],
        tamperEvidence: "System Busy",
        recommendation: isHighDemand 
          ? "Professional Recommendation: Please wait 30-60 seconds and attempt the verification again. Spikes are usually very brief." 
          : "Please check your internet connection or API configuration and try again.",
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
          <View className="bg-blue-500/10 p-2 rounded-xl mr-3 border border-blue-500/20">
            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-2xl font-black text-white tracking-tight">DocVerify AI</Text>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Neural Link Active</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6">
        <Text className="text-gray-400 text-sm mb-6 leading-relaxed">
          Upload ID cards, passports, or legal documents for forensic analysis. Our AI cross-references visual patterns for authenticity detection.
        </Text>

        {/* Image Upload Area */}
        <TouchableOpacity 
          onPress={pickImage} 
          className="h-72 bg-gray-900 border-2 border-dashed border-gray-700 rounded-3xl items-center justify-center mb-6 overflow-hidden relative shadow-2xl shadow-blue-500/10"
        >
          {image ? (
            <>
              <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
              {isScanning && (
                <View className="absolute inset-0 bg-blue-900/60 items-center justify-center backdrop-blur-md">
                   <ActivityIndicator size="large" color="#3B82F6" />
                   <View className="mt-6 items-center">
                    <Text className="text-blue-400 font-mono font-bold tracking-[4px] animate-pulse">RUNNING FORENSICS...</Text>
                    <Text className="text-blue-500/60 text-[10px] mt-2 font-mono italic">Scanning for pixel manipulation</Text>
                   </View>
                </View>
              )}
            </>
          ) : (
            <View className="items-center px-10 text-center">
              <View className="w-16 h-16 bg-gray-800 rounded-2xl items-center justify-center mb-4 border border-gray-700">
                <Ionicons name="document-text-outline" size={32} color="#3B82F6" />
              </View>
              <Text className="text-white font-bold text-base">Select Document</Text>
              <Text className="text-gray-500 text-xs mt-1">High resolution images provide better accuracy</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Analyze Button */}
        {image && !results && !isScanning && (
          <TouchableOpacity 
            onPress={analyzeImage} 
            className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/30 border border-blue-500 items-center mb-6 flex-row justify-center"
          >
            <Ionicons name="finger-print" size={20} color="white" className="mr-2" />
            <Text className="text-white font-black tracking-widest uppercase text-lg ml-2">Verify Authenticity</Text>
          </TouchableOpacity>
        )}

        {/* AI Results Card */}
        {results && (
          <View className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-black/50">
            <View className={`p-4 flex-row items-center justify-between ${
              results.authenticityStatus === 'GENUINE' || results.authenticityStatus === 'LIKELY GENUINE' 
                ? 'bg-emerald-500/10 border-b border-emerald-500/20' 
                : 'bg-red-500/10 border-b border-red-500/20'
            }`}>
              <View className="flex-row items-center">
                <Ionicons 
                  name={results.authenticityStatus === 'GENUINE' || results.authenticityStatus === 'LIKELY GENUINE' ? "checkmark-circle" : "alert-circle"} 
                  size={24} 
                  color={results.authenticityStatus === 'GENUINE' || results.authenticityStatus === 'LIKELY GENUINE' ? "#10B981" : "#EF4444"} 
                />
                <Text className={`font-black tracking-widest uppercase ml-2 text-sm ${
                  results.authenticityStatus === 'GENUINE' || results.authenticityStatus === 'LIKELY GENUINE' ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {results.authenticityStatus}
                </Text>
              </View>
              <View className="bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
                <Text className="text-blue-400 font-mono text-[10px] font-bold">{results.accuracyScore} Confidence</Text>
              </View>
            </View>
            
            <View className="p-6">
              <View className="mb-6">
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1.5">Document Type Identified</Text>
                <Text className="text-white text-xl font-black">{results.documentType}</Text>
              </View>

              <View className="mb-6 bg-gray-950/50 p-4 rounded-2xl border border-gray-800">
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 flex-row items-center">
                  <Ionicons name="reader-outline" size={10} color="#6B7280" /> Forensic Analysis
                </Text>
                <Text className="text-gray-300 text-sm leading-relaxed italic">"{results.detailedAnalysis}"</Text>
              </View>

              <View className="flex-row gap-4 mb-6">
                <View className="flex-1">
                  <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1.5">Tamper Status</Text>
                  <Text className={`text-xs font-bold ${results.tamperEvidence === 'None detected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {results.tamperEvidence}
                  </Text>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 text-center underline">Security Features Detected</Text>
                <View className="flex-row flex-wrap gap-2">
                  {results.securityFeatures?.length > 0 ? (
                    results.securityFeatures.map((tag: string, index: number) => (
                      <View key={index} className="bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/20">
                        <Text className="text-blue-400 text-[10px] font-mono font-bold uppercase">{tag}</Text>
                      </View>
                    ))
                  ) : (
                      <Text className="text-gray-600 text-[10px] italic">No distinctive security features isolated</Text>
                  )}
                </View>
              </View>

              <View className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl">
                <Text className="text-blue-400 text-[10px] uppercase font-bold tracking-widest mb-1">Standard Operating Procedure</Text>
                <Text className="text-white text-xs leading-relaxed font-medium">{results.recommendation}</Text>
              </View>

              <TouchableOpacity 
                onPress={() => { setResults(null); setImage(null); }}
                className="mt-8 py-3 items-center border border-gray-800 rounded-xl"
              >
                <Text className="text-gray-500 font-bold uppercase tracking-tighter text-xs">Clear and Reset Analysis</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>

  );
}