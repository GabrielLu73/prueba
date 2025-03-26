export default {
    async findDesserts(ctx){
        try {
            const allDesserts = await strapi.documents('api::dailymenu.dailymenu').findMany({
                fields : 'day',
                populate: {
                    dessert:{
                        fields : ['name','price']
                    }
                }
            });

            return ctx.send({message : "datos de los postres" ,data : allDesserts})

        } catch (error) {
            return ctx.badRequest('No se ha encontrado datos de la consulta')
        }
    },
    async findMenusByRangeOfPrice(ctx){
        try {
            const {min_price, max_price, exclude_allergens} = ctx.request.query;

            if(exclude_allergens){
                const allergensToExclude = exclude_allergens.split(',').map(allergen => allergen.trim());
                const menu = await strapi.documents('api::dailymenu.dailymenu').findMany({
                    populate: {
                        first: {
                            populate: {
                                allergens: {
                                    fields: 'name',
                                }
                            }
                        },
                        second: {
                            populate: {
                                allergens: {
                                    fields: 'name',
                                }
                            }
                        },
                        dessert: {
                            populate: {
                                allergens: {
                                    fields: 'name',
                                }
                            }
                        }
                    }
                });
                console.log(menu)

                const filterss = menu.filter(m =>{
                    const { first, second, dessert } = m

                    const firstAller  = first?.allergens.some(al => allergensToExclude.includes(al.name));
                    const secondAller  = second?.allergens.some(al => allergensToExclude.includes(al.name));
                    const dessertAller  = dessert?.allergens.some(al => allergensToExclude.includes(al.name));

                    return !firstAller && !secondAller && !dessertAller
                })

                return ctx.send({data: filterss})
            }

            const menus = await strapi.documents('api::dailymenu.dailymenu').findMany({
                filters:{
                    menuPrice:{
                        $gte: min_price,
                        $lte: max_price
                    }
                }
            });
            
            return ctx.send({message: "datos de los menus por precios", data: menus})

        } catch (error) {
            return ctx.badRequest('No se ha encontrado datos de la consulta de menus por rango')
        }
    },
    async findMenuWithFor(ctx){
        try {
            const minPrice = ctx.query.minPrice;
            const maxPrice = ctx.query.maxPrice;

            console.log("query -----------", ctx.query)

            const menus = await strapi.documents('api::dailymenu.dailymenu').findMany();
            const menufilter = [];

            for(const menu of menus){
                const { menuPrice } = menu;
                if(menuPrice >= minPrice && menuPrice <= maxPrice){
                    menufilter.push(menu)
                }
            }
            return ctx.send({message: "datos de los menus por precios", data: menufilter})

        } catch (error) {
            return ctx.badRequest('No se ha encontrado datos de la consulta de menus por rango')
        }
    }
}