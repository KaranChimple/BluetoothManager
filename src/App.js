import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableHighlight,
    NativeAppEventEmitter,
    Platform,
    PermissionsAndroid,
    ScrollView,
    Dimensions,
    ToastAndroid
} from 'react-native';
import BleManager from 'react-native-ble-manager';

const { height, width } = Dimensions.get('window');

var devices = [];

class App extends Component {

    constructor() {
        super()

        this.state = {
            ble: null,
            scanning: false,
        }
    }

    componentDidMount() {
        BleManager.start({ showAlert: false });
        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);

        NativeAppEventEmitter
            .addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);

        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.checkPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                if (result) {
                    console.log("Permission is OK");
                } else {
                    PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                        if (result) {
                            console.log("User accept");
                        } else {
                            ToastAndroid.show("Please allow access to Location for better performance of App", ToastAndroid.LONG);
                            console.log("User refuse");
                        }
                    });
                }
            });
        }
    }

    handleScan() {
        BleManager.scan([], 120, true)
            .then((results) => { console.log('Scanning...'); });
    }

    toggleScanning(bool) {
        if (bool) {
            this.setState({ scanning: true })
            this.scanning = setInterval(() => this.handleScan(), 3000);
        } else {
            this.setState({ scanning: false, ble: null })
            clearInterval(this.scanning);
        }
    }

    handleDiscoverPeripheral(data) {
        console.log('Got ble data', data);
        let device = 'device found: ' + data.name + '(' + data.id + ')';

        if (devices.indexOf(device) == -1) {
            devices.push(device);
        }

        if (devices.length == 1) {
            this.setState({ ble: device });
        } else {
            this.setState({ ble: device });
        }
    }

    render() {
        const { scanning, ble } = this.state;
        const container = {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F5FCFF',
        }

        const bleList = ble
            ? <Text> {ble} </Text>
            : <Text>no devices nearby</Text>

        return (
            <View style={container}>

                <Text style={{ fontSize: 18, position: 'absolute', top: 10 }}>Bluetooth Scanner</Text>

                <TouchableHighlight style={{ padding: 20, backgroundColor: 'blue', borderRadius: 5, marginTop: devices.length > 1 ? 0.38 * height : 0 }} onPress={() => this.toggleScanning(!scanning)}>
                    <Text style={{ color: 'white' }}>Scan Bluetooth</Text>
                </TouchableHighlight>

                {devices.length > 1 ? <ScrollView contentContainerStyle={{ height: '38%' }}>
                    {devices.map((item) => {
                        return (
                            <Text>{item}</Text>
                        )
                    })}
                </ScrollView> : bleList}
            </View>
        );
    }
}

export default App;
