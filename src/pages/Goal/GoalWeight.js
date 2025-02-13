import React from "react";
import { Text, StyleSheet, View } from "react-native";


function GoalWeight() {

    return (
        <>
            <View style={styles.container}>
                <Text>Trang cân nặng</Text>
            </View>

        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default GoalWeight;