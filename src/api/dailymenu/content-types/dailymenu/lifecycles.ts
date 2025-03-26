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

        const sameDish = await strapi.documents('api::dailymenu.dailymenu').findOne({
            documentId : result.documentId,
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

        const { first, second, dessert } = sameDish;

        if (first && second && first.id === second.id || 
            first && dessert && first.id === dessert.id ||
            second && dessert && second.id === dessert.id
        ){
            throw new ApplicationError('No se puede asiganr el mismo platos en varios campos');
        }
    }
}