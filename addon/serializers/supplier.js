import ApplicationSerializer from '@fleetbase/ember-core/serializers/application';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class SupplierSerializer extends ApplicationSerializer.extend(EmbeddedRecordsMixin) {}
