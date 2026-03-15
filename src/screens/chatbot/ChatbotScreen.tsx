import { View, Text, TextInput, FlatList } from "react-native";
import { useState } from "react";

export default function ChatbotScreen() {

  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, how can I help with your safety?", bot: true }
  ]);

  return (
    <View className="flex-1 bg-slate-100">

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (

          <View
            className={`m-2 p-3 rounded-xl max-w-[75%] ${
              item.bot
                ? "bg-white self-start"
                : "bg-blue-500 self-end"
            }`}
          >

            <Text
              className={`${item.bot ? "text-black" : "text-white"}`}
            >
              {item.text}
            </Text>

          </View>

        )}
      />

      <View className="flex-row p-3 bg-white">

        <TextInput
          placeholder="Type message..."
          className="flex-1 bg-gray-100 rounded-xl px-4"
        />

      </View>

    </View>
  );
}