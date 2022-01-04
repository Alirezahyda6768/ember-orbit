import { Orbit } from '@orbit/core';
import Application from '@ember/application';
import { OrbitConfig } from './ember-orbit-config';
import Store from '../-private/store';
import SchemaFactory from '../-private/factories/schema-factory';
import CoordinatorFactory from '../-private/factories/coordinator-factory';
import KeyMapFactory from '../-private/factories/key-map-factory';
import NormalizerFactory from '../-private/factories/normalizer-factory';
import MemorySourceFactory from '../-private/factories/memory-source-factory';
import ValidatorFactory from '../-private/factories/validator-factory';

const { deprecate } = Orbit;

export function initialize(application: Application) {
  let orbitConfig: OrbitConfig =
    application.resolveRegistration('ember-orbit:config') ?? {};

  if (!orbitConfig.skipKeyMapService) {
    // Register a keyMap service
    application.register(
      `service:${orbitConfig.services.keyMap}`,
      KeyMapFactory
    );

    // Inject keyMap into all sources
    application.inject(
      orbitConfig.types.source,
      'keyMap',
      `service:${orbitConfig.services.keyMap}`
    );
  }

  if (!orbitConfig.skipSchemaService) {
    // Register a schema service
    application.register(
      `service:${orbitConfig.services.schema}`,
      SchemaFactory
    );

    // Inject schema into all sources
    application.inject(
      orbitConfig.types.source,
      'schema',
      `service:${orbitConfig.services.schema}`
    );
  }

  if (!orbitConfig.skipValidatorService) {
    // Register a validator service
    application.register(
      `service:${orbitConfig.services.validator}`,
      ValidatorFactory
    );

    // Inject validator into all sources
    application.inject(
      orbitConfig.types.source,
      'validatorFor',
      `service:${orbitConfig.services.validator}`
    );
  }

  if (!orbitConfig.skipNormalizerService) {
    // Register a normalizer service
    application.register(
      `service:${orbitConfig.services.normalizer}`,
      NormalizerFactory
    );

    // Inject normalizer into all sources
    application.inject(
      orbitConfig.types.source,
      'normalizer',
      `service:${orbitConfig.services.normalizer}`
    );

    // Inject schema into normalizer
    if (!orbitConfig.skipSchemaService) {
      application.inject(
        `service:${orbitConfig.services.normalizer}`,
        'schema',
        `service:${orbitConfig.services.schema}`
      );
    }
    // Inject keyMap into normalizer
    if (!orbitConfig.skipKeyMapService) {
      application.inject(
        `service:${orbitConfig.services.normalizer}`,
        'keyMap',
        `service:${orbitConfig.services.keyMap}`
      );
    }
  }

  if (!orbitConfig.skipCoordinatorService) {
    // Register a coordinator service
    application.register(
      `service:${orbitConfig.services.coordinator}`,
      CoordinatorFactory
    );
  }

  if (!orbitConfig.skipStoreService) {
    application.register(`service:${orbitConfig.services.store}`, Store);

    // Store source (which is injected in store service)
    application.register(
      `${orbitConfig.types.source}:store`,
      MemorySourceFactory
    );
    application.inject(
      `service:${orbitConfig.services.store}`,
      'source',
      `${orbitConfig.types.source}:store`
    );

    if ((orbitConfig as any).skipStoreInjections !== undefined) {
      deprecate(
        'The `skipStoreInjections` configuration option in ember-orbit is deprecated because implicit injection is now deprecated in Ember itself. Please inject the orbit store into routes and controllers using the `@service` decorator as needed.'
      );
    }
  }
}

export default {
  name: 'ember-orbit-services',
  after: 'ember-orbit-config',
  initialize
};
