import React from "react";
import { Text, StyleSheet, View, Button } from "react-native";
import { openDB } from "../../../Database/database";
import { getAllGoalsData } from "../../../Database/GoalsDatabase";
import { getAllActivityData } from "../../../Database/DailyDatabase"

function Setting() {
    const handleLogData = async () => {
        const db = await openDB();
        await getAllActivityData(db);
    };
    const handleLogDataGoals = async () => {
        const db = await openDB();
        await getAllGoalsData(db);
    };

    return (
        // <>
        //     <View style={styles.container}>
        //         <Text>Trang cài đặt</Text>
        //     </View>

        // </>
        <>
            <View>
                <Button title="Hiển thị dữ liệu SQLite activity" onPress={handleLogData} />
            </View>
            <View>
                <Button title="Hiển thị dữ liệu SQLite goals" onPress={handleLogDataGoals} />
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

export default Setting;