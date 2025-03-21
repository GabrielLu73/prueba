export default{
    beforeUpdate: async(event) => {
        const { data } = event.params;

        console.log("Daily menu :", {
            documentId: event.params.documentId,
            datos: data.data,
        });

        const priceMenu = await strapi.documents('api::dish.dish').findMany({
            filters: {
                
            }
        });
    },
}