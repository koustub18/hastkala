import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#b85c38" />
      <Text>Loading Hastkala...</Text>
    </View>
  );
}
