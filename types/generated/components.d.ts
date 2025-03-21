import type { Schema, Struct } from '@strapi/strapi';

export interface AllergensAllergens extends Struct.ComponentSchema {
  collectionName: 'components_allergens_allergens';
  info: {
    displayName: 'Allergens';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'allergens.allergens': AllergensAllergens;
    }
  }
}
