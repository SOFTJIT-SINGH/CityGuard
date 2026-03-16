import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  
  // Initial bot greeting
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I am the CityGuard AI Assistant. How can I help you stay safe today?", sender: 'bot' }
  ]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    // 1. Add User Message to screen
    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // 2. Simulate AI thinking and replying
    setTimeout(() => {
      const botMsg = { 
        id: (Date.now() + 1).toString(), 
        text: `I am currently in demo mode! Once you add the Gemini API key, I will give you real-time AI advice about: "${userMsg.text}"`, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000); // 1 second delay
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 bg-[#F4F7F6]" style={{ paddingTop: Math.max(insets.top, 20) }}>
        
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-gray-200 bg-white shadow-sm">
          <View className="bg-emerald-100 p-2 rounded-full mr-3">
            <Ionicons name="hardware-chip" size={24} color="#30AF5B" />
          </View>
          <Text className="text-xl font-black text-gray-900">CityGuard AI</Text>
        </View>

        {/* Chat Bubbles Area */}
        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.map(msg => (
            <View 
              key={msg.id} 
              className={`mb-4 max-w-[80%] rounded-2xl p-4 ${
                msg.sender === 'user' 
                  ? 'bg-[#30AF5B] self-end rounded-tr-none' 
                  : 'bg-white border border-gray-100 shadow-sm self-start rounded-tl-none'
              }`}
            >
              <Text className={`text-base ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Field (Now safe from the keyboard!) */}
        <View 
          className="px-4 py-3 bg-white border-t border-gray-200 flex-row items-center" 
          style={{ paddingBottom: Math.max(insets.bottom, 10) }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask for safety advice..."
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-base text-gray-800 mr-3"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity 
            onPress={sendMessage}
            className="bg-[#30AF5B] h-12 w-12 rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="send" size={20} color="white" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}