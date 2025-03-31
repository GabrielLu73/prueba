import { errors } from '@strapi/utils';
const { ApplicationError } = errors;

export default{
    beforeUpdate: async(event) => {
        const { data } = event.params;

        const ctx = strapi.requestContext.get();
        const { params } = ctx;
        const { id } = params;

        const priceMenu = await strapi.documents('api::dailymenu.dailymenu').findOne({
            documentId: id,
            populate:{
                first: {
                    fields: 'price',
                },
                second: {
                    fields: 'price',
                },
                dessert: {
                    fields: 'price',
                }
            }
        });
        
        const { first, second, dessert, documentId } = priceMenu;

        //Validate if the data exists, if not, it is 0.
        const result = (first?.price ?? 0) + (second?.price ?? 0) + (dessert?.price ?? 0);

        data.sum_price = result;

        const menuPriceIva = await strapi.service('api::dailymenu.01-custom-dailymenu').getPriceDishes(documentId);
        data.menuPrice = menuPriceIva;

    },

    //Ensure that a dish is not repeated

    afterUpdate: async( event ) => {
        const { result } = event
        const FIRST_COURSE = "First course"
        const SECOND_COURSE = "Second course"
        const DESSERT_COURSE = "Dessert"

        const sameDish = await strapi.documents('api::dailymenu.dailymenu').findOne({
            documentId : result.documentId,
            populate:{
                first: {
                    fields: ['type'],
                },
                second: {
                    fields: ['type'],
                },
                dessert: {
                    fields: ['type'],
                }
            }
        });

        const { first, second, dessert } = sameDish;

        if (first?.id === second?.id || 
            first?.id === dessert?.id ||
            second?.id === dessert?.id
        ){
            throw new ApplicationError('No se puede asignar el mismo platos en varios campos');
        }

        console.log(second?.type);
        console.log(SECOND_COURSE);
        console.log(second?.type===SECOND_COURSE);

        if(first && first?.type !== FIRST_COURSE ||
            second && second?.type !== SECOND_COURSE ||
            dessert && dessert?.type !== DESSERT_COURSE
        ){
            throw new ApplicationError("No se puede asignar un tipo de plato a otro distinto del menú");
        }

        const menu = await strapi.service('api::dailymenu.01-custom-dailymenu');
    }
}