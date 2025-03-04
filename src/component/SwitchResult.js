import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

function SwitchResult({ selectionMode, option1, option2, onSelectSwitch }) {
  const [getSelectionMode, setSelectionMode] = useState(selectionMode);

  const updateSwitchData = (value) => {
    setSelectionMode(value);
    if (onSelectSwitch) {
      onSelectSwitch(value);
    }
  };

  return (
    <View style={styles.container}>
      {[option1, option2].map((option, index) => {
        const value = index + 1;
        const isSelected = getSelectionMode === value;
        return (
          <TouchableOpacity
            key={value}
            activeOpacity={1}
            onPress={() => updateSwitchData(value)}
            style={styles.optionContainer}
          >
            <Text style={[styles.optionText, isSelected && styles.selectedText]}>
              {option}
            </Text>
            {isSelected && <View style={styles.underline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "52%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    height: 44,
  },
  optionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#808080",
    fontWeight: "bold"
  },
  selectedText: {
    color: "black",
  },
  underline: {
    width: "60%",
    height: 2,
    backgroundColor: "#00BFFF",
    marginTop: 4,
  },
});

export default SwitchResult;
