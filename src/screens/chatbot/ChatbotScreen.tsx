import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: "CITYGUARD AI INTEL ONLINE. Awaiting query...", sender: 'bot' }
  ]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setTimeout(() => {
      const botMsg = { id: (Date.now() + 1).toString(), text: `Processing query: "${userMsg.text}". (Awaiting API Link for full analysis)`, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : "height"}>
      <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) }}>
        
        <View className="px-6 py-4 flex-row items-center border-b border-gray-800 bg-gray-900">
          <View className="bg-emerald-500/10 p-2 rounded-full mr-3 border border-emerald-500/20">
            <Ionicons name="hardware-chip" size={24} color="#10B981" />
          </View>
          <Text className="text-xl font-black text-white tracking-tight">AI Intel</Text>
        </View>

        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.map(msg => (
            <View key={msg.id} className={`mb-4 max-w-[80%] rounded-2xl p-4 border ${msg.sender === 'user' ? 'bg-emerald-600 border-emerald-500 self-end rounded-tr-none' : 'bg-gray-900 border-gray-800 self-start rounded-tl-none'}`}>
              <Text className={`text-base ${msg.sender === 'user' ? 'text-white' : 'text-gray-300 font-mono'}`}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View className="px-4 py-3 bg-gray-900 border-t border-gray-800 flex-row items-center" style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Enter query..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-5 py-3 text-base text-gray-200 mr-3 font-mono"
            placeholderTextColor="#6B7280"
          />
          <TouchableOpacity onPress={sendMessage} className="bg-emerald-600 h-12 w-12 rounded-full items-center justify-center shadow-lg shadow-emerald-600/30 border border-emerald-500">
            <Ionicons name="send" size={20} color="white" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}