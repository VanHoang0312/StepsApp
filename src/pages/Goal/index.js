import React, { useState } from 'react';
import { Button, View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView, Switch } from 'react-native';
import SwitchGoal from '../../component/SwitchGoal';
import GoalWeight from './GoalWeight';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

function Goal() {
  const [goalTab, setGoalTab] = useState(1);
  const [steps, setSteps] = useState(6000);
  const [calo, setCalo] = useState(200);
  const [kilomet, setKilomet] = useState(3);
  const [minutes, setMinutes] = useState(30)
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    navigation.navigate('Thông báo');
  };

  const increaseSteps = () => {
    setSteps((prev) => prev + 500);
  };

  const increaseCalo = () => {
    setCalo((prev) => prev + 100);
  };

  const increaseKilomet = () => {
    setKilomet((prev) => prev + 1);
  };

  const increaseMunites = () => {
    setMinutes((prev) => prev + 30);
  };

  const decreaseSteps = () => {
    setSteps((prev) => (prev - 500 > 0 ? prev - 500 : 0));
  };

  const decreaseCalo = () => {
    setCalo((prev) => (prev - 100 > 0 ? prev - 100 : 0));
  };

  const decreaseKilomet = () => {
    setKilomet((prev) => (prev - 1 > 0 ? prev - 1 : 0));
  };

  const decreaseMunites = () => {
    setMinutes((prev) => (prev - 30 > 0 ? prev - 30 : 0));
  };

  const onSelectSwitch = (value) => {
    setGoalTab(value)
  }
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View >
          <SwitchGoal
            selectionMode={1}
            option1="Mục tiêu"
            option2="Cân nặng"
            onSelectSwitch={onSelectSwitch}
          />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}>
          {goalTab === 1 && (
            <View style={{ padding: 16 }}>
              <Text style={styles.header}>Mục tiêu</Text>
              <Text style={styles.subHeader}>Đặt Mục tiêu. Đếm Bước chân. Đốt.</Text>

              <View style={styles.stepCounter}>
                <TouchableOpacity onPress={decreaseSteps} style={styles.iconButton}>
                  <Icon name="remove" size={20} color="#000" />
                </TouchableOpacity>

                <View style={styles.stepDisplay}>
                  <Text style={styles.stepText}>{steps.toLocaleString("vi-VN")}</Text>
                  <Text style={styles.stepUnit}>Bước</Text>
                </View>

                <TouchableOpacity onPress={increaseSteps} style={styles.iconButton}>
                  <Icon name="add" size={20} color="#000" />
                </TouchableOpacity>
              </View>


              <TouchableOpacity
                style={styles.notification}
                onPress={handleNotificationPress}
              >
                <Icon name="notifications" size={25} color="#007BFF" />
                <Text style={styles.notificationText}>Thông báo</Text>
                <Icon name="chevron-right" size={25} color="#6C757D" style={styles.arrowIcon} />

              </TouchableOpacity>

              <View style={styles.moreGoalsContainer}>
                <View style={styles.moreGoalsHeader}>
                  <Icon name="star" size={25} color="#007BFF" />
                  <Text style={styles.moreGoalsText}>Nhiều mục tiêu hơn</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isEnabled ? "#81b0ff" : "#f4f3f4"}
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                  />
                </View>
                {isEnabled && (
                  <View style={styles.extraGoals}>
                    <View style={styles.stepCounter}>
                      <TouchableOpacity onPress={decreaseCalo} style={styles.iconButton}>
                        <Icon name="remove" size={20} color="#000" />
                      </TouchableOpacity>

                      <View style={styles.stepDisplay}>
                        <Text style={styles.stepText}>{calo.toLocaleString("vi-VN")}</Text>
                        <Text style={styles.stepUnit}>Kcal</Text>
                      </View>

                      <TouchableOpacity onPress={increaseCalo} style={styles.iconButton}>
                        <Icon name="add" size={20} color="#000" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.stepCounter}>
                      <TouchableOpacity onPress={decreaseKilomet} style={styles.iconButton}>
                        <Icon name="remove" size={20} color="#000" />
                      </TouchableOpacity>

                      <View style={styles.stepDisplay}>
                        <Text style={styles.stepText}>{kilomet.toLocaleString("vi-VN")}</Text>
                        <Text style={styles.stepUnit}>Km</Text>
                      </View>

                      <TouchableOpacity onPress={increaseKilomet} style={styles.iconButton}>
                        <Icon name="add" size={20} color="#000" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.stepCounter}>
                      <TouchableOpacity onPress={decreaseMunites} style={styles.iconButton}>
                        <Icon name="remove" size={20} color="#000" />
                      </TouchableOpacity>

                      <View style={styles.stepDisplay}>
                        <Text style={styles.stepText}>{minutes.toLocaleString("vi-VN")}</Text>
                        <Text style={styles.stepUnit}>Phút</Text>
                      </View>

                      <TouchableOpacity onPress={increaseMunites} style={styles.iconButton}>
                        <Icon name="add" size={20} color="#000" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {goalTab === 2 && <GoalWeight />}

        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  // safeArea: {
  //   paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  // },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 18,
    color: "#6C757D",
    marginBottom: 20,
  },
  stepCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    padding: 16,
    width: "100%",
    justifyContent: "space-between",
    marginTop: 15
  },
  iconButton: {
    padding: 10,
    backgroundColor: "#F1F3F5",
    borderRadius: 50,
  },
  stepDisplay: {
    alignItems: "center",
  },
  stepText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  stepUnit: {
    fontSize: 14,
    color: "#6C757D",
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    justifyContent: "space-between"
  },
  notificationText: {
    //marginLeft: 8,
    color: "#000000",
    fontSize: 18,
    marginRight: 25
  },
  arrowIcon: {
    marginLeft: 200,
  },
  moreGoalsContainer: {
    marginTop: 20,
  },
  moreGoalsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moreGoalsText: {
    fontSize: 18,
    marginLeft: 8,
    color: "#000",
    flex: 1,
  },
  extraGoals: {
    marginTop: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
  },
  goalItem: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 8,
  },
})

export default Goal;