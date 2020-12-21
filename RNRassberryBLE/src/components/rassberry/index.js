import React, {useEffect, useState} from 'react';
import base64 from 'react-native-base64';
import {Alert, Platform, PermissionsAndroid} from 'react-native';
import {EventRegister} from 'react-native-event-listeners';
import {BleManager} from 'react-native-ble-plx';

const Rassberry = (props) => {
  const {instance} = props;
  
  const [writeCharacteristic, setWriteCharacteristic] = useState({});
  const [caharacteristicId, setCharacteristicId] = useState('');
  const [serviceId, setServiceID] = useState('');
  // const [deviceName, setDeviceScan] = useState('');
  // const [device, setDeviceConnection] = useState({});

  useEffect(() => {
    EventRegister.addEventListener('connect_device', (name) => {
      scanAndConnect(name);
      // setDeviceScan(name);
    });
    (async function () {
      if (Platform.OS === 'ios') {
        instance.onStateChange((state) => {
          if (state === 'PoweredOn') {
            scanAndConnect();
          }
        }, true);
      } else if (Platform.OS === 'android') {
        const isPermissionGrant = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );

        if (isPermissionGrant) {
          scanAndConnect();
        } else {
          const permissionRequest = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
              title: 'Location Permission',
              message: 'QuickPick App needs access to your location.',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          permissionRequest === PermissionsAndroid.RESULTS.GRANTED
            ? scanAndConnect()
            : null;
        }
      }
    })();

    return () => {
      EventRegister.removeEventListener('led_val');
      EventRegister.removeEventListener('rassberry_disconnect');
      EventRegister.removeEventListener('connect_device');
      EventRegister.removeEventListener('rassberry_connect');
    };
  }, []);

  const disconnectRasberry = async (connectedDevice) => {
    if (Object.keys(connectedDevice).length !== 0) {
      await connectedDevice?.cancelConnection();
    }
  };

  const setServicesFromDevice = (device) => {
    device.services().then((services) => {
      if (services && services.length) {
        //set services in state
        let Services = [];
        services.map((val, key) => {
          return (Services[val.uuid] = val);
        });
        //set Characteristics
        setCharacteristicsFromService(device, Services);
      }
    });
  };
  const setCharacteristicsFromService = (device, services) => {
    const promises = [];

    Object.keys(services).map((uuid, key) => {
      promises.push(
        device.characteristicsForService(uuid).then((characteristics) => {
          if (characteristics && characteristics.length) {
            characteristics.map((val, key) => {
              const {
                isWritableWithResponse,
                isWritableWithoutResponse,
                uuid: characteristicId,
              } = val;

              if (isWritableWithResponse || isWritableWithoutResponse) {
                setWriteCharacteristic(characteristics);
                setCharacteristicId(characteristicId);
                setServiceID(uuid);
                EventRegister.addEventListener('led_val', (result) => {
                  console.log()
                  instance.writeCharacteristicWithoutResponseForDevice(
                    device.id,
                    uuid,
                    characteristicId,
                    base64.encode(result),
                  );
                });

                // instance.writeCharacteristicWithoutResponseForDevice(
                //   device.id,
                //   uuid,
                //   characteristicId,
                //   base64.encode(ledVal),
                // );
              }
            });
          }
        }),
      );
    });
    setDevice(device);
  };
  const setDevice = (device) => {
    //setConnectedDevice(device);
    // dispatch({
    //   type: 'rasBleManager',
    //   rasBleManager: {
    //     instance,
    //     device,
    //   },
    // });
    // setDeviceConnection(device);
  };

  const deviceConnection = (device) => {
    device
      .connect()
      .then((device) => {
        return device.discoverAllServicesAndCharacteristics();
      })
      .then((device) => {
       console.log('Rasberry Device connected');
        // Do work on device with services and characteristics
        setServicesFromDevice(device);
        EventRegister.emit('rassberry_connect');
        // EventRegister.addEventListener('led_val', (result: string) => {
        //   writeToDevice(result, device);
        // });
        EventRegister.addEventListener('rassberry_disconnect', () => {
          disconnectRasberry(device);
        });
      })
      .catch((error) => {
        // Handle errors
      });
  };
  const scanAndConnect = async (deviceName) => {
    
    if(!deviceName){
      return;
    }
    // if (Object.keys(device).length !== 0) {
    //   return;
    // }

    instance.startDeviceScan(null, null, (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        return;
      }
      console.log('Rasberry BLE Connection', deviceName);
      console.log('device', device?.name);
      console.log('devicestatus', device?.name?.replace(/\s/g, '').includes(deviceName.trim()))

      if (device?.name?.replace(/\s/g, '').includes(deviceName.trim())) {
        instance.stopDeviceScan();
        deviceConnection(device);
        device.onDisconnected(() => {
          console.log('Disconnected Rasberry');
          setDevice({});
          EventRegister.removeEventListener('led_val');
          EventRegister.removeEventListener('rassberry_disconnect');
        });
      }
    });
  };

  return <></>;
};

export default Rassberry;
