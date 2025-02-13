import React from "react";
import { Text, StyleSheet, View, Button } from "react-native";
import { openDB, getAllActivityData } from "../../../Database/database";

function Setting() {
    const handleLogData = async () => {
        const db = await openDB();
        await getAllActivityData(db);
    };
    return (
        // <>
        //     <View style={styles.container}>
        //         <Text>Trang cài đặt</Text>
        //     </View>

        // </>
        <View>
            <Button title="Hiển thị dữ liệu SQLite" onPress={handleLogData} />
        </View>
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