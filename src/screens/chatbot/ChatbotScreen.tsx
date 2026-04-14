import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { geminiModel } from '../../lib/gemini';

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0.4)).current;
  const dot2 = useRef(new Animated.Value(0.4)).current;
  const dot3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true, delay }),
          Animated.timing(dot, { toValue: 0.4, duration: 400, useNativeDriver: true })
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, [dot1, dot2, dot3]);

  return (
    <View className="mb-4 max-w-[80%] rounded-2xl p-4 py-5 border bg-gray-900 border-gray-800 self-start rounded-tl-none flex-row items-center justify-center">
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Animated.View style={{ opacity: dot1, width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' }} />
        <Animated.View style={{ opacity: dot2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' }} />
        <Animated.View style={{ opacity: dot3, width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' }} />
      </View>
    </View>
  );
};

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState([
    { id: '1', text: "CityGuard AI Online. How can I assist you?", sender: 'bot' }
  ]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now().toString(), text: inputText.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const result = await geminiModel.generateContent(currentInput);
      const text = await result.response.text();
      const botMsg = { id: (Date.now() + 1).toString(), text: text, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg = { id: (Date.now() + 1).toString(), text: "[Error communicating with server] API key may be invalid or expired. Please check your credentials.", sender: 'bot' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) }}>
        
        <View className="px-6 py-4 flex-row items-center border-b border-gray-800 bg-gray-900">
          <View className="bg-emerald-500/10 p-2 rounded-full mr-3 border border-emerald-500/20">
            <Ionicons name="hardware-chip" size={24} color="#10B981" />
          </View>
          <Text className="text-xl font-black text-white tracking-tight">CityGuard AI</Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4 py-4" 
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View key={msg.id} className={`mb-4 max-w-[80%] rounded-2xl p-4 border ${msg.sender === 'user' ? 'bg-emerald-600 border-emerald-500 self-end rounded-tr-none' : 'bg-gray-900 border-gray-800 self-start rounded-tl-none'}`}>
              <Text className={`text-base ${msg.sender === 'user' ? 'text-white' : 'text-gray-300 font-mono'}`}>{msg.text}</Text>
            </View>
          ))}
          {isLoading && <TypingIndicator />}
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