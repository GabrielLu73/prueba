import { factories } from "@strapi/strapi";

export default factories.createCoreService('api::dailymenu.dailymenu', ({ strapi }) => ({

    async getPriceDishes(menuId){
        const priceDishes = await strapi.documents('api::dailymenu.dailymenu').findOne({
            documentId: menuId,
            populate: {
                first : {
                    fields : 'price'
                },
                second: {
                    fields: 'price'
                },
                dessert : {
                    fields : 'price'
                }
            }
        });

        const menuPriceWithIva = await priceWithIVA(priceDishes);
        return menuPriceWithIva;

    },
    async findDishes(id) {
        const dishes = await strapi.documents('api::dish.dish').findOne({
            documentId: id
        });
        return dishes;
    }

}),
);

async function priceWithIVA(menu): Promise<number> {
    const IVA_21 = 1.21;
    const priceMenu = (menu.first?.price ?? 0) + (menu.second?.price ?? 0) + (menu.dessert?.price ?? 0);
    const result = priceMenu * IVA_21;
    return parseFloat(result.toFixed(2));
}