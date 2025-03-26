import { createStackNavigator } from "@react-navigation/stack";
import Result from "../../src/pages/Result";
import Gift from "../../src/pages/Result/gift";
import BadgeDetail from "../../src/pages/Result/BadgeDetail";

const Stack = createStackNavigator();

export default function ResultStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Result" component={Result} options={{ title: "Kết quả", headerShown: false }} />
      <Stack.Screen name="Gift" component={Gift} options={{ title: "Phần thưởng" }} />
      <Stack.Screen name="BadgeDetail" component={BadgeDetail} options={{ title: "Chi tiết huy hiệu" }} />
    </Stack.Navigator>
  );
}
