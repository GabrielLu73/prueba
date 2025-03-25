import { errors } from '@strapi/utils';
const { ApplicationError } = errors;

export default{
    beforeUpdate: async(event) => {
        const { data } = event.params;

        console.log("Daily menu :", {
            documentId: event.params.documentId,
            datos: event.params.data,
        });

        const priceMenu = await strapi.documents('api::dailymenu.dailymenu').findMany({
            filters: {
                day: event.params.data.day,
            },
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

        const { first, second, dessert } = priceMenu[0];

        const result = (first?.price ?? 0) + (second?.price ?? 0) + (dessert?.price ?? 0);

        data.sum_price = result;

        //Ensure that a dish is not repeated
    },

    afterUpdate: async( event ) => {

        const repit = await strapi.documents('api::dailymenu.dailymenu').findMany({
            filters: {
                day: event.params.data.day,
            },
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

        const { first, second, dessert } = repit[0];

        if (first && second && first.id === second.id || 
            first && dessert && first.id === dessert.id ||
            second && dessert && second.id === dessert.id
        ){
            throw new ApplicationError('El mismo plato no puede ser usado como primero y segundo');
        }
        //service
    }
}