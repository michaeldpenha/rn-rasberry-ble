/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {EventRegister} from 'react-native-event-listeners';
import Rassberry from './src/components/rassberry';
import {useEffect} from 'react';

const App: () => React$Node = () => {
  const [text, setText] = useState('');
  const [display, setDisplay] = useState(false);
  const [chars, setCharacters] = useState('');
  const [showActivity, setActiivity] = useState(false);
  const [device, setDeviceName] = useState('');

  const onBLEDeviceConnection = () => {
    EventRegister.emit('connect_device', text);
    setDeviceName(text);
    setActiivity(true);
    setText('');
    // setDisplay(true);
  };

  const sendToBLE = () => {
    EventRegister.emit('led_val', chars);
  };

  useEffect(() => {
    EventRegister.addEventListener('rassberry_connect', () => {
      console.log('Show Activity')
      setActiivity(false);
      setDisplay(true);
    });

    return () => EventRegister.removeEventListener('rassberry_connect');
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      {
      !!device && <Rassberry deviceName={device}/>
      }
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {showActivity ? (
            <View style={[styles.container, styles.horizontal]}>
              <ActivityIndicator size="large" color="#00ff00" />
            </View>
          ) : (
            <View style={styles.body}>
              {!display ? (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Enter Device</Text>
                  <View style={{marginTop: 10, marginBottom: 10}}>
                    <TextInput
                      style={{height: 40, borderWidth: 2}}
                      placeholder="Type Device name"
                      onChangeText={text => setText(text)}
                      defaultValue={text}
                    />
                  </View>
                  <Button
                    title="Enter"
                    onPress={() => onBLEDeviceConnection()}
                  />
                </View>
              ) : (
                <View style={styles.sectionContainer}>
                  <Button
                    title="Back"
                    onPress={() => {
                      setDisplay(false);
                      setCharacters('');
                    }}
                  />
                  <Text style={styles.sectionTitle}>Enter BLE String</Text>
                  <View style={{marginTop: 10, marginBottom: 10}}>
                    <TextInput
                      style={{height: 40, borderWidth: 2}}
                      placeholder="Type Characters"
                      onChangeText={text => setCharacters(text)}
                      defaultValue={chars}
                    />
                  </View>
                  <Button title="Enter" onPress={() => sendToBLE()} />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default App;
