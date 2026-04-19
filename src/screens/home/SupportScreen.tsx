import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SupportScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I report an immediate emergency?",
      a: "For immediate life-threatening emergencies, always use the red SOS button on your home tab or dial 911/100 directly. This screen is for technical support and general inquiries."
    },
    {
      q: "Is my location data shared with everyone?",
      a: "No. Your location is only transmitted to authorized emergency responders during an active SOS event or when you use the 'SafeWalk' feature. Your privacy is protected by end-to-end security protocols."
    },
    {
      q: "What is an 'Operative ID'?",
      a: "An Operative ID is your unique identifier within the CityGuard network. It allows our AI system to prioritize your reports and coordinate with field units faster."
    },
    {
      q: "How can I update my emergency contact?",
      a: "Go to the Profile section from the side menu and select 'Edit Profile'. Update your ICE (In Case of Emergency) details and click 'Save Changes'."
    }
  ];

  const handleSupportTicket = () => {
    Alert.alert(
      "Direct Support",
      "Would you like to open your email client to contact our technical team?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Email", onPress: () => Linking.openURL('mailto:support@cityguard.gov') }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Tactical Header */}
      <View className="px-6 mb-8 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm">
            <Ionicons name="menu" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <View className="bg-emerald-500/10 p-2 rounded-xl mr-3 border border-emerald-500/20">
            <Ionicons name="help-buoy" size={24} color="#10B981" />
          </View>
          <Text className="text-2xl font-black text-white tracking-tight">Support</Text>
        </View>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        
        {/* Urgent Contact Card */}
        <View className="bg-emerald-600 rounded-3xl p-6 mb-8 shadow-xl shadow-emerald-600/20">
          <Text className="text-white text-xl font-black mb-2">Need Technical Help?</Text>
          <Text className="text-emerald-100 text-sm leading-relaxed mb-6">
            Our technical operatives are available 24/7 to help you with account issues or system malfunctions.
          </Text>
          <TouchableOpacity 
            onPress={handleSupportTicket}
            className="bg-white/20 border border-white/30 py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-black uppercase tracking-widest">Open Support Ticket</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mb-6">Frequently Asked Questions</Text>

        <View className="space-y-4 mb-10">
          {faqs.map((faq, index) => (
            <TouchableOpacity 
              key={index}
              activeOpacity={0.7}
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-bold text-base flex-1 pr-4">{faq.q}</Text>
                <Ionicons 
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#4B5563" 
                />
              </View>
              {expandedIndex === index && (
                <Text className="text-gray-400 text-sm mt-4 leading-relaxed border-t border-gray-800 pt-4 italic">
                  {faq.a}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact info footer */}
        <View className="mb-12 space-y-4">
           <TouchableOpacity className="flex-row items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
             <View className="bg-blue-500/10 p-2 rounded-lg mr-4 border border-blue-500/20">
               <Ionicons name="logo-twitter" size={18} color="#3B82F6" />
             </View>
             <Text className="text-gray-300 font-bold">@CityGuard_HQ</Text>
           </TouchableOpacity>

           <TouchableOpacity className="flex-row items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
             <View className="bg-emerald-500/10 p-2 rounded-lg mr-4 border border-emerald-500/20">
               <Ionicons name="globe-outline" size={18} color="#10B981" />
             </View>
             <Text className="text-gray-300 font-bold">www.cityguard.gov/portal</Text>
           </TouchableOpacity>
        </View>

        <Text className="text-center text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-10">
          CityGuard Support Protocol v1.4.0
        </Text>
      </ScrollView>
    </View>
  );
}
