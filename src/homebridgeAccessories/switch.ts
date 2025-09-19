import { CharacteristicEventTypes } from 'hap-nodejs';
import { Characteristic, Service } from '../index';
import { CharacteristicSetCallback, CharacteristicValue, PlatformAccessory } from 'homebridge';

export const switchHelper = (component: any, accessory: PlatformAccessory): boolean => {
    let service = accessory.services.find((service) => service.UUID === Service.Switch.UUID);
    if (!service) {
        service = accessory.addService(new Service.Switch(component.name, ''));
    }

    let currentState = false;

    service
        .getCharacteristic(Characteristic.On)
        ?.on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {

            // toggle switch
            component.state.state = !component.state.state;
            if (component.state.state !== !!currentState) {
                currentState = component.state.state;
                updateEsp();
            }
            callback();
        });

    component.on('state', (state: any) => {
        currentState = state.state as boolean;

        service?.getCharacteristic(Characteristic.On)?.updateValue(state.state);
    });

    function updateEsp() {
        const state = {
            key: component.id,
            state: currentState,
        };

        component.connection.switchCommandService(state);
    }

    return true;
};
